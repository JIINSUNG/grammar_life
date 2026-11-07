// 세션 도중 앱이 백그라운드로 갔다가 모바일 브라우저가 페이지를 통째로 새로고침해버리면(특히
// iOS Safari/PWA에서 흔함), 그동안 푼 문제가 전부 날아가 버리던 문제를 막기 위한 임시 저장소.
// AppState(grammar-life:v1, 백업 코드 호환 대상)와는 별개의 키를 쓴다 — 여긴 그저 "진행 중인 화면"
// 스냅샷일 뿐이라 백업/복원 대상이 아니다. 세션이 끝나거나(결과 화면) 사용자가 직접 나가면 지운다.
import type { Lang } from "../types";

const KEY = "grammar-life:resume-v1";

type ResumeKind = "grammar" | "vocab";

interface ResumeEnvelope<T> {
  kind: ResumeKind;
  lang: Lang;
  data: T;
}

export function saveResume<T>(kind: ResumeKind, lang: Lang, data: T): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ kind, lang, data } satisfies ResumeEnvelope<T>));
  } catch {
    // 저장 공간이 꽉 찼거나 막혀 있으면 조용히 무시 — 재개만 안 될 뿐 화면은 정상 동작한다.
  }
}

export function loadResume<T>(kind: ResumeKind): { lang: Lang; data: T } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as ResumeEnvelope<T>;
    if (env.kind !== kind) return null;
    return { lang: env.lang, data: env.data };
  } catch {
    return null;
  }
}

export function clearResume(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
