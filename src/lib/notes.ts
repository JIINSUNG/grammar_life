import { POINTS, VOCAB } from "../data";
import type { VocabWordRw } from "../data";
import type { ByLang, GrammarPoint, Lang, Note } from "../types";

export const NOTE_TAGS: { common: [string, string][]; en: [string, string][]; ja: [string, string][] } = {
  common: [
    ["word", "단어를 몰랐어요"],
    ["order", "어순이 헷갈렸어요"],
    ["tense", "시제가 헷갈렸어요"],
    ["form", "문법 형태·활용"],
    ["natural", "자연스러운 표현인지 모르겠어요"],
  ],
  en: [
    ["article", "관사 a / the"],
    ["plural", "단수·복수"],
    ["prep", "전치사"],
    ["verbform", "-ing / to / p.p. 고르기"],
    ["agree", "주어-동사 수 일치"],
  ],
  ja: [
    ["particle", "조사 は·が·を·に"],
    ["conj", "동사 활용"],
    ["keigo", "존댓말·정중체"],
    ["kanji", "한자 읽기·쓰기"],
    ["adj", "형용사 활용"],
  ],
};

export const TAG_Q: ByLang<Record<string, string>> = {
  en: { tense: "과거", article: "관사", plural: "복수", prep: "전치사", verbform: "부정사", agree: "be동사", order: "순서" },
  ja: { tense: "과거", particle: "조사", conj: "て형", keigo: "존경", adj: "형용사", order: "순서" },
};

export const CONF_N: [string, string][] = [
  ["good", "자신 있어요"],
  ["mid", "반반이에요"],
  ["low", "자신 없어요"],
];

export const N_LABEL: Record<"todo" | "check" | "done", string> = { todo: "번역 전", check: "검토 전", done: "검토 완료" };

export function tagLabel(lang: Lang, k: string): string {
  const t = [...NOTE_TAGS.common, ...NOTE_TAGS[lang]].find((x) => x[0] === k);
  return t ? t[1] : k;
}

/** 자기평가에서 체크한 약점 키워드(TAG_Q)와 연결된 문법이 있는지 찾는다. */
export function gMatch(lang: Lang, q: string | undefined): GrammarPoint[] {
  if (!q) return [];
  return POINTS[lang].filter((p) => (p.t + " " + p.form + " " + p.sum).includes(q));
}

export function notesOf(notes: Note[], lang: Lang): Note[] {
  return notes.filter((n) => n.lang === lang);
}

export function nStatus(n: Note): "todo" | "check" | "done" {
  if (!n.dr) return "todo";
  if (!n.rv) return "check";
  return "done";
}

export function nDue(notes: Note[], lang: Lang, todayStr: string): Note[] {
  return notesOf(notes, lang).filter((n) => n.rv && n.due && n.due <= todayStr);
}

export function nid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** 검토 완료한 노트에서 자주 체크된 약점 태그를, 많이 나온 순서로 정렬해서 돌려준다. */
export function weakStats(notes: Note[], lang: Lang): [string, number][] {
  const c: Record<string, number> = {};
  notesOf(notes, lang)
    .filter((n) => n.rv)
    .forEach((n) => (n.tags || []).forEach((t) => (c[t] = (c[t] || 0) + 1)));
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
}

const hintTokens = (m: string) =>
  m
    .replace(/\([^)]*\)/g, "")
    .split(/[,;·]/)
    .map((x) => x.trim().replace(/(하다|다|함|임|한|인|의|적인|요\.|\.|\?|!)$/, ""))
    .filter((x) => x.length >= 2);

/** 한국어 원문에 들어 있는 뜻으로 단어 힌트를 찾는다 (인사말·막연한 "표현" 분류는 제외). */
export function vocabHints(ko: string, lang: Lang): VocabWordRw[] {
  if (!ko) return [];
  return VOCAB[lang].filter((w) => w.c !== "인사" && w.c !== "표현" && hintTokens(w.m).some((t) => ko.includes(t))).slice(0, 10);
}

export function trUrl(svc: "papago" | "google", lang: Lang, text: string): string {
  return svc === "papago"
    ? `https://papago.naver.com/?sk=ko&tk=${lang}&st=${encodeURIComponent(text)}`
    : `https://translate.google.com/?sl=ko&tl=${lang}&text=${encodeURIComponent(text)}&op=translate`;
}
