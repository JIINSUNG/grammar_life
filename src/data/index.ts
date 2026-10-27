// 데이터 접근은 전부 이 모듈을 통한다. 일본어 콘텐츠는 여기서 한 번만 ruby.json으로 후리가나를
// 구워서 내보낸다(레거시 app.js가 모듈 로드 시점에 POINTS.ja 등을 한 번 rubify해두던 것과 동일한 타이밍 —
// 렌더마다 다시 계산하지 않음). 화면 쪽 코드는 이 파일의 export만 쓰고 */.json을 직접 import하지 않는다.
import rubyDict from "./ruby.json";
import pointsEnRaw from "./points.en.json";
import pointsJaRaw from "./points.ja.json";
import examEnRaw from "./exam.en.json";
import examJaRaw from "./exam.ja.json";
import vocabEnRaw from "./vocab.en.json";
import vocabJaRaw from "./vocab.ja.json";
import jobsRaw from "./jobs.json";
import ridesRaw from "./rides.json";
import hobbiesRaw from "./hobbies.json";
import plansRaw from "./plans.json";
import goalsRaw from "./goals.json";
import toeicGoalsRaw from "./toeic-goals.json";
import jlptGoalsRaw from "./jlpt-goals.json";
import { rubify, withRuby } from "../lib/ruby";
import type { ByLang, ExamQuestion, GoalOption, GrammarPoint, HobbyOption, JobOption, PlanOption, RideOption, VocabWord } from "../types";

const RUBY = rubyDict as Record<string, string>;
const rb = (s: string) => rubify(s, RUBY);

function rubifyPoint(p: GrammarPoint): GrammarPoint {
  return {
    ...p,
    tpl: p.tpl.map((t) => ({ ...t, s: rb(t.s), o: t.o.map(rb) as [string, string, string] })),
    bad: p.bad.map(rb) as [string, string],
    cq: p.cq ? { ...p.cq, o: p.cq.o.map(rb) as [string, string, string, string] } : p.cq,
  };
}

function rubifyExam(e: ExamQuestion): ExamQuestion {
  return { ...e, q: rb(e.q), o: e.o.map(rb) as [string, string, string, string] };
}

export const POINTS: ByLang<GrammarPoint[]> = {
  en: pointsEnRaw as GrammarPoint[],
  ja: (pointsJaRaw as GrammarPoint[]).map(rubifyPoint),
};

export const EXAM: ByLang<ExamQuestion[]> = {
  en: examEnRaw as ExamQuestion[],
  ja: (examJaRaw as ExamQuestion[]).map(rubifyExam),
};

export type VocabWordRw = VocabWord & { rw: string };
export const VOCAB: ByLang<VocabWordRw[]> = {
  en: withRuby(vocabEnRaw as VocabWord[]),
  ja: withRuby(vocabJaRaw as VocabWord[]),
};

// JOBS/RIDES/HOBBIES/PLANS는 언어별 필드를 한 객체에 같이 들고 있어서, ja 필드만 후리가나를 구워 넣는다.
export const JOBS: JobOption[] = (jobsRaw as JobOption[]).map((j) => ({
  ...j,
  ja: Object.fromEntries(Object.entries(j.ja).map(([k, v]) => [k, rb(v as string)])) as JobOption["ja"],
}));
export const RIDES: RideOption[] = (ridesRaw as RideOption[]).map((r) => ({ ...r, ja: rb(r.ja) }));
export const HOBBIES: HobbyOption[] = (hobbiesRaw as HobbyOption[]).map((h) => ({ ...h, ja: rb(h.ja) }));
export const PLANS: PlanOption[] = (plansRaw as PlanOption[]).map((p) => ({ ...p, ja: rb(p.ja) }));

export const GOALS = goalsRaw as GoalOption[];
export const TOEIC_GOALS = toeicGoalsRaw as string[];
export const JLPT_GOALS = jlptGoalsRaw as string[];
