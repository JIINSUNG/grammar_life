export type Lang = "en" | "ja";

/* ===== 설문 선택지 ===== */
export interface JobOption {
  id: string;
  ko: string;
  en: { place: string; wp: string; cust: string; prod: string; prodS?: string };
  ja: { place: string; wp: string; cust: string; prod: string };
  k: { place: string; wp: string; cust: string; prod: string };
}

export interface RideOption {
  id: string;
  ko: string;
  en: string;
  ja: string;
  k: string;
}

export interface HobbyOption {
  id: string;
  ko: string;
  en: string;
  enB: string;
  ja: string;
}

export interface PlanOption {
  id: string;
  ko: string;
  en: string;
  ja: string;
}

export interface GoalOption {
  minutes: number;
  label: string;
  xp: number;
}

/* ===== 문법 포인트 ===== */
export interface Template {
  /** [정답]이 빈칸. {slot} 자리는 설문 값으로 채움. */
  s: string;
  /** 한국어 해석. {slot|은} 식으로 조사가 붙음. */
  ko: string;
  /** 오답 3개. */
  o: [string, string, string];
}

export interface ConceptCheck {
  q: string;
  /** o[0]이 정답, 화면에서 섞어서 보여줌. */
  o: [string, string, string, string];
  ex: string;
}

export interface GrammarPoint {
  id: string;
  lv: string;
  t: string;
  sum: string;
  form: string;
  tips: string[];
  /** [틀린 예, 맞는 예] */
  bad: [string, string];
  tpl: Template[];
  cq: ConceptCheck;
}

/* ===== 실전 문제 ===== */
export interface ExamQuestion {
  q: string;
  o: [string, string, string, string];
  /** 정답 index */
  a: number;
  /** 관련 문법 포인트 id, 없으면 null */
  p: string | null;
  ex: string;
  /** JLPT 문장 배열(★) 문제 여부 */
  star?: boolean;
}

/* ===== 단어 ===== */
export interface VocabWord {
  id: string;
  w: string;
  /** 일본어 읽기. 영어 단어는 "" */
  r: string;
  m: string;
  lv: string;
  c: string;
}

/* ===== 저장 상태 (grammar-life:v1) ===== */
export interface Profile {
  job: string;
  ride: string;
  hobbies: string[];
  plans: string[];
  goal: number;
  toeic: string;
  jlpt: string;
  /** 일본어 문법 시작 레벨. 기본값 "입문" */
  jstart?: string;
}

export interface ProgressEntry {
  /** 복습 상자 0~5 */
  box: number;
  due: string;
  ok: number;
  tot: number;
  lucky?: number;
  lastPass?: boolean;
  last?: string;
}

export type ByLang<T> = { en: T; ja: T };

export type NoteConfidence = "good" | "mid" | "low";
export type ReviewRating = "good" | "mid" | "bad";

export interface Note {
  id: string;
  lang: Lang;
  /** s: 문장, w: 단어·표현 */
  kind: "s" | "w";
  /** 한국어 원문 */
  ko: string;
  /** 내가 쓴 초안 */
  dr: string;
  /** 비교 후 고친 최종 문장 (복습 때 정답으로 나옴) */
  fx: string;
  tags: string[];
  /** 연결한 문법 포인트 id (최대 4개) */
  pts: string[];
  memo: string;
  conf?: NoteConfidence | null;
  made: string;
  up: string;
  /** 검토 완료한 날짜 (있으면 복습 대상) */
  rv?: string;
  box?: number;
  due?: string;
  last?: string;
}

export interface ExamRecord {
  lang: Lang;
  date: string;
  score: number;
  sec: number;
}

export interface VoicePref {
  rate?: number;
  en?: string;
  ja?: string;
}

export interface AppState {
  /** 레거시 데이터에는 없던 필드. 없으면(undefined) v1로 간주하고 마이그레이션. */
  schemaVersion?: number;
  profile: Profile | null;
  lang: Lang;
  prog: ByLang<Record<string, ProgressEntry>>;
  vprog: ByLang<Record<string, ProgressEntry>>;
  vtrack: Partial<ByLang<string>>;
  notes: Note[];
  xp: number;
  /** 날짜(YYYY-MM-DD) → 그날 번 XP */
  days: Record<string, number>;
  /** 문법 포인트별 예문 시드(다른 예문 보기 카운터) */
  seeds: Record<string, number>;
  exams: ExamRecord[];
  voice?: VoicePref;
  /** 후리가나 표시 여부. 기본값 true */
  furi?: boolean;
}

/** 백업 코드 포맷: {app:"grammar-life", v:1, at, data:<AppState>} */
export interface BackupPayload {
  app: "grammar-life";
  v: 1;
  at: string;
  data: AppState;
}
