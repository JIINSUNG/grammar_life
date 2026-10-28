import { GOALS, POINTS, VOCAB } from "../data";
import { addDays } from "./date";
import { shuffle } from "./util";
import type { ByLang, FlashRating, GrammarPoint, Lang, ProgressEntry } from "../types";
import type { VocabWordRw } from "../data";

export { POINTS, VOCAB };

/** 복습 상자 0~5 → 다음 복습까지 며칠 (0=즉시, 상자가 오를수록 간격이 늘어남) */
export const INTERVAL = [0, 1, 2, 4, 7, 15];

export const JLV = ["입문", "N5", "N4", "N3", "N2"];
export const ELV = ["입문", "기초", "중급", "토익 빈출"];
export const LEVELS: ByLang<string[]> = { en: ELV, ja: JLV };
export const LANG_LABEL: Record<Lang, string> = { en: "English", ja: "日本語" };

/** 문법·단어 퀴즈에서 묻는 확신도. 노트 자기평가의 CONF_N(자신 있어요/반반/자신 없어요)과는 다른 척도. */
export const CONF: [string, string][] = [
  ["sure", "확실해요"],
  ["unsure", "애매해요"],
  ["guess", "찍었어요"],
];

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

export interface LevelProgress {
  /** 다음으로 채워야 할 레벨(예: "N5"). 이미 전부 익혔으면 없음(null 반환). */
  level: string;
  /** 그 레벨에서 아직 복습 4단계 이상(익힘)에 못 미친 문법 개수. */
  remaining: number;
  total: number;
  mastered: number;
}

/**
 * "N5까지 N개 남음"처럼 보여주기 위해, JLV/ELV 순서대로 아직 다 안 익힌 첫 레벨과
 * 그 레벨에서 남은 개수를 찾는다. 전부 익혔으면 null.
 */
export function nextLevelProgress(prog: Record<string, ProgressEntry>, lang: Lang): LevelProgress | null {
  for (const level of LEVELS[lang]) {
    const ps = POINTS[lang].filter((p) => p.lv === level);
    if (ps.length === 0) continue;
    const mastered = ps.filter((p) => (prog[p.id]?.box || 0) >= 4).length;
    if (mastered < ps.length) return { level, remaining: ps.length - mastered, total: ps.length, mastered };
  }
  return null;
}

/* ---------- 어렵다고 표시한 문법 (Anki 스타일 복습 카드) ---------- */

/** 어렵다고 표시(⭐)한 문법 전부, 복습 예정일이 빠른 순으로. */
export function starredPoints(prog: Record<string, ProgressEntry>, lang: Lang): GrammarPoint[] {
  return POINTS[lang].filter((p) => prog[p.id]?.starred).sort((a, b) => (prog[a.id]?.due ?? "").localeCompare(prog[b.id]?.due ?? ""));
}

/** 어렵다고 표시한 것 중 오늘 복습할 차례인 것만. */
export function dueStarredPoints(prog: Record<string, ProgressEntry>, lang: Lang, todayStr: string): GrammarPoint[] {
  return starredPoints(prog, lang).filter((p) => (prog[p.id]?.due ?? todayStr) <= todayStr);
}

/**
 * Anki 카드처럼 "다시/어려움/좋음/쉬움" 넷 중 하나로 평가해서 다음 복습일을 정한다.
 * gradePoint(퀴즈 정답 기반)와 달리, 카드를 떠올려본 스스로의 평가만으로 상자를 조정한다.
 */
export function gradeFlash(prev: ProgressEntry | undefined, rating: FlashRating, todayStr: string): ProgressEntry {
  const g = prev ?? { box: 0, ok: 0, tot: 0, due: todayStr, starred: true };
  const box = rating === "again" ? 1 : rating === "hard" ? Math.max(1, g.box) : rating === "good" ? Math.min(5, g.box + 1) : Math.min(5, g.box + 2);
  const due = rating === "again" ? todayStr : addDays(todayStr, INTERVAL[box]);
  return { ...g, box, due, tot: g.tot + 1, ok: g.ok + (rating === "again" ? 0 : 1), last: todayStr };
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

export function vDue(vprog: Record<string, ProgressEntry>, lang: Lang, todayStr: string): VocabWordRw[] {
  return VOCAB[lang].filter((w) => {
    const g = vprog[w.id];
    return g && g.due <= todayStr;
  });
}

export function vNew(vprog: Record<string, ProgressEntry>, lang: Lang, track: string): VocabWordRw[] {
  const fresh = VOCAB[lang].filter((w) => !vprog[w.id]);
  const order = [track, ...VTRACKS[lang].filter((x) => x !== track)];
  return order.flatMap((lv) => fresh.filter((w) => w.lv === lv)).slice(0, VNEW);
}

/** 어렵다고 표시(⭐)한 단어 전부, 복습 예정일이 빠른 순으로. 문법의 starredPoints와 같은 구조. */
export function starredVocab(vprog: Record<string, ProgressEntry>, lang: Lang): VocabWordRw[] {
  return VOCAB[lang].filter((w) => vprog[w.id]?.starred).sort((a, b) => (vprog[a.id]?.due ?? "").localeCompare(vprog[b.id]?.due ?? ""));
}

/** 어렵다고 표시한 단어 중 오늘 복습할 차례인 것만. */
export function dueStarredVocab(vprog: Record<string, ProgressEntry>, lang: Lang, todayStr: string): VocabWordRw[] {
  return starredVocab(vprog, lang).filter((w) => (vprog[w.id]?.due ?? todayStr) <= todayStr);
}

const meaningTokens = (m: string) =>
  m
    .replace(/\([^)]*\)/g, "")
    .split(/[,;·=]/)
    .map((x) => x.trim().replace(/[.!?]$/, ""))
    .filter(Boolean);

/** 뜻(또는 단어)이 겹치는 단어는 같은 문제의 보기로 나오지 않도록 걸러가며 오답 3개를 고른다. */
export function vOpts(w: VocabWordRw, lang: Lang, rev: boolean): { opts: VocabWordRw[]; a: number } {
  const all = VOCAB[lang];
  const key = (x: VocabWordRw) => (rev ? x.w : x.m);
  const pool = [...shuffle(all.filter((x) => x.c === w.c && x.lv === w.lv)), ...shuffle(all.filter((x) => x.c === w.c && x.lv !== w.lv)), ...shuffle(all)];
  const used = new Set(meaningTokens(w.m));
  const seen = new Set([key(w)]);
  const d: VocabWordRw[] = [];
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
  w: VocabWordRw;
  /** 상자 2단계부터는 뜻을 보고 단어를 고르는 거꾸로 문제 */
  rev: boolean;
  retry: number;
  opts: VocabWordRw[];
  a: number;
}

export function vStep(w: VocabWordRw, lang: Lang, box: number, retry: number): VocabStep {
  const rev = box >= 2;
  return { type: "vq", w, rev, retry, ...vOpts(w, lang, rev) };
}
