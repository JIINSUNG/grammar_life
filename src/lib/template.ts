import jobsData from "../data/jobs.json";
import ridesData from "../data/rides.json";
import hobbiesData from "../data/hobbies.json";
import plansData from "../data/plans.json";
import { pick, shuffle } from "./util";
import type { GrammarPoint, HobbyOption, JobOption, Lang, PlanOption, Profile, RideOption } from "../types";

const JOBS = jobsData as JobOption[];
const RIDES = ridesData as RideOption[];
const HOBBIES = hobbiesData as HobbyOption[];
const PLANS = plansData as PlanOption[];

type SlotLang = "ko" | Lang;

const JOSA_LABEL: Record<string, string> = { 은: "은(는)", 이: "이(가)", 을: "을(를)", 과: "과(와)" };
const JOSA_PAIR: Record<string, [string, string]> = { 은: ["은", "는"], 이: ["이", "가"], 을: ["을", "를"], 과: ["과", "와"] };

/**
 * 한국어 조사. 받침 있으면 pair[0], 없으면 pair[1]. 한글이 아니면 괄호 표기로 대체.
 * "도"처럼 받침에 안 따라 바뀌는 조사는 JOSA_PAIR에 없어서, 그 경우엔 p를 그대로 붙인다(레거시와 동일).
 */
export function josa(w: string, p: string): string {
  const c = w.charCodeAt(w.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return w + (JOSA_LABEL[p] ?? p);
  const hasBatchim = (c - 0xac00) % 28 !== 0;
  const pair = JOSA_PAIR[p];
  return w + (pair ? (hasBatchim ? pair[0] : pair[1]) : p);
}

export function slotVals(prof: Profile, lang: SlotLang, seed: number, ti: number): Record<string, string> {
  const job = JOBS.find((j) => j.id === prof.job) ?? JOBS[0];
  const ride = RIDES.find((r) => r.id === prof.ride) ?? RIDES[0];
  const hob = pick(HOBBIES.filter((h) => prof.hobbies.includes(h.id)), seed, ti) ?? HOBBIES[0];
  const plan = pick(PLANS.filter((p) => prof.plans.includes(p.id)), seed, ti + 3) ?? PLANS[0];
  if (lang === "ko") return { ...job.k, ride: ride.k, hobby: hob.ko, plan: plan.ko };
  if (lang === "ja") return { ...job.ja, ride: ride.ja, hobby: hob.ja, plan: plan.ja };
  return { ...job.en, ride: ride.en, hobby: hob.en, hobbyB: hob.enB, plan: plan.en };
}

/** "{place}" → 값, "{Place}"(첫 글자 대문자) → 값도 대문자로, "{x|은}" → 조사 붙여서. */
export function fill(str: string, vals: Record<string, string>): string {
  return str.replace(/\{(\w+)(?:\|(\S))?\}/g, (m, k: string, j?: string) => {
    const low = k[0].toLowerCase() + k.slice(1);
    let v = vals[low];
    if (v == null) return m;
    if (k[0] !== low[0]) v = v[0].toUpperCase() + v.slice(1);
    return j ? josa(v, j) : v;
  });
}

export interface BuiltExample {
  pid: string;
  ti: number;
  raw: string;
  ans: string;
  full: string;
  ko: string;
  wrong: string[];
}

export function build(point: GrammarPoint, ti: number, prof: Profile, lang: Lang, seed: number): BuiltExample {
  const t = point.tpl[ti];
  const v = slotVals(prof, lang, seed, ti);
  const kv = slotVals(prof, "ko", seed, ti);
  const s = fill(t.s, v);
  const m = s.match(/\[([^\]]+)\]/);
  const ans = m ? m[1] : "";
  const full = s.replace(/\[([^\]]+)\]/, "$1");
  return { pid: point.id, ti, raw: s, ans, full, ko: fill(t.ko, kv), wrong: t.o.map((o) => fill(o, v)) };
}

export interface QuizExample extends BuiltExample {
  opts: string[];
  a: number;
  blank: string;
}

export function toQuiz(ex: BuiltExample, lang: Lang): QuizExample {
  const opts = shuffle([ex.ans, ...ex.wrong]);
  return { ...ex, opts, a: opts.indexOf(ex.ans), blank: ex.raw.replace(/\[[^\]]+\]/, lang === "ja" ? "（　　）" : "-------") };
}
