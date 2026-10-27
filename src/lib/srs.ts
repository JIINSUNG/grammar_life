import pointsEnData from "../data/points.en.json";
import pointsJaData from "../data/points.ja.json";
import vocabEnData from "../data/vocab.en.json";
import vocabJaData from "../data/vocab.ja.json";
import goalsData from "../data/goals.json";
import { addDays } from "./date";
import { shuffle } from "./util";
import type { ByLang, GoalOption, GrammarPoint, Lang, ProgressEntry, VocabWord } from "../types";

const POINTS: ByLang<GrammarPoint[]> = { en: pointsEnData as GrammarPoint[], ja: pointsJaData as GrammarPoint[] };
const VOCAB: ByLang<VocabWord[]> = { en: vocabEnData as VocabWord[], ja: vocabJaData as VocabWord[] };
const GOALS = goalsData as GoalOption[];

export { POINTS, VOCAB };

/** 복습 상자 0~5 → 다음 복습까지 며칠 (0=즉시, 상자가 오를수록 간격이 늘어남) */
export const INTERVAL = [0, 1, 2, 4, 7, 15];

export const JLV = ["입문", "N5", "N4", "N3", "N2"];
export const LANG_LABEL: Record<Lang, string> = { en: "English", ja: "日本語" };

/* ---------- 문법 복습 상자 ---------- */

export interface GradeInput {
  concept: boolean;
  solid: number;
  tot: number;
  lucky: number;
}

/**
 * 통과 조건: 개념 확인 정답 AND (확실히 맞힌 문제 / 전체) >= 0.75. 감으로 맞힌 건 통과로 안 침.
 * 통과하면 상자 +1(최대 5), 실패하면 상자 1로 리셋.
 */
export function gradePoint(prev: ProgressEntry | undefined, b: GradeInput, todayStr: string): ProgressEntry {
  const g = prev ?? { box: 0, ok: 0, tot: 0, lucky: 0, due: todayStr };
  const pass = b.concept && (b.tot === 0 || b.solid / b.tot >= 0.75);
  const box = pass ? Math.min(5, g.box + 1) : 1;
  return { ...g, box, due: addDays(todayStr, INTERVAL[box]), ok: g.ok + b.solid, tot: g.tot + b.tot, lucky: (g.lucky ?? 0) + b.lucky, lastPass: pass, last: todayStr };
}

export function dueList(prog: Record<string, ProgressEntry>, lang: Lang, todayStr: string): GrammarPoint[] {
  return POINTS[lang].filter((p) => {
    const g = prog[p.id];
    return g && g.box > 0 && g.due <= todayStr;
  });
}

export function nextNew(prog: Record<string, ProgressEntry>, lang: Lang, jstart: string | undefined): GrammarPoint | undefined {
  const start = lang === "ja" ? Math.max(0, JLV.indexOf(jstart || "입문")) : 0;
  return POINTS[lang].find((p) => !prog[p.id] && (lang !== "ja" || JLV.indexOf(p.lv) >= start)) ?? POINTS[lang].find((p) => !prog[p.id]);
}

/* ---------- 진도·목표 ---------- */

export function goalXp(goalMinutes: number | undefined): number {
  return (GOALS.find((g) => g.minutes === goalMinutes) ?? GOALS[1]).xp;
}

/** 오늘 학습했으면 오늘부터, 안 했으면 어제부터 거꾸로 세서 연속일을 구한다. */
export function streak(days: Record<string, number>, todayStr: string): number {
  let n = 0;
  let d = todayStr;
  if (!(days[d] > 0)) d = addDays(d, -1);
  while (days[d] > 0) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/* ---------- 단어 복습 상자 ---------- */

export const VTRACKS: ByLang<string[]> = { en: ["기초", "토익", "여행", "접객"], ja: ["N5", "N4", "N3", "N2", "여행", "접객"] };
export const VNEW = 10;
export const VREV = 20;

export function vTrack(track: string | undefined, jstart: string | undefined, lang: Lang): string {
  if (track) return track;
  if (lang !== "ja") return "기초";
  if (jstart === "N4") return "N4";
  if (jstart === "N3" || jstart === "N2") return "N3";
  return "N5";
}

export function vDue(vprog: Record<string, ProgressEntry>, lang: Lang, todayStr: string): VocabWord[] {
  return VOCAB[lang].filter((w) => {
    const g = vprog[w.id];
    return g && g.due <= todayStr;
  });
}

export function vNew(vprog: Record<string, ProgressEntry>, lang: Lang, track: string): VocabWord[] {
  const fresh = VOCAB[lang].filter((w) => !vprog[w.id]);
  const order = [track, ...VTRACKS[lang].filter((x) => x !== track)];
  return order.flatMap((lv) => fresh.filter((w) => w.lv === lv)).slice(0, VNEW);
}

const meaningTokens = (m: string) =>
  m
    .replace(/\([^)]*\)/g, "")
    .split(/[,;·=]/)
    .map((x) => x.trim().replace(/[.!?]$/, ""))
    .filter(Boolean);

/** 뜻(또는 단어)이 겹치는 단어는 같은 문제의 보기로 나오지 않도록 걸러가며 오답 3개를 고른다. */
export function vOpts(w: VocabWord, lang: Lang, rev: boolean): { opts: VocabWord[]; a: number } {
  const all = VOCAB[lang];
  const key = (x: VocabWord) => (rev ? x.w : x.m);
  const pool = [...shuffle(all.filter((x) => x.c === w.c && x.lv === w.lv)), ...shuffle(all.filter((x) => x.c === w.c && x.lv !== w.lv)), ...shuffle(all)];
  const used = new Set(meaningTokens(w.m));
  const seen = new Set([key(w)]);
  const d: VocabWord[] = [];
  for (const x of pool) {
    if (d.length >= 3) break;
    const tk = meaningTokens(x.m);
    if (seen.has(key(x)) || tk.some((t) => used.has(t))) continue;
    seen.add(key(x));
    tk.forEach((t) => used.add(t));
    d.push(x);
  }
  const opts = shuffle([w, ...d]);
  return { opts, a: opts.indexOf(w) };
}

export interface VocabStep {
  type: "vq";
  w: VocabWord;
  /** 상자 2단계부터는 뜻을 보고 단어를 고르는 거꾸로 문제 */
  rev: boolean;
  retry: number;
  opts: VocabWord[];
  a: number;
}

export function vStep(w: VocabWord, lang: Lang, box: number, retry: number): VocabStep {
  const rev = box >= 2;
  return { type: "vq", w, rev, retry, ...vOpts(w, lang, rev) };
}
