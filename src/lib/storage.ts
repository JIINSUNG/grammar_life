import type { AppState, BackupPayload } from "../types";

export const STORAGE_KEY = "grammar-life:v1";
export const CURRENT_SCHEMA_VERSION = 1;

export function blankState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: null,
    lang: "en",
    prog: { en: {}, ja: {} },
    vprog: { en: {}, ja: {} },
    vtrack: {},
    notes: [],
    xp: 0,
    days: {},
    seeds: {},
    exams: [],
    mnemonics: {},
  };
}

/**
 * 구조가 바뀌면 여기서 schemaVersion별로 분기해서 옛 데이터를 새 구조로 옮긴다.
 * 레거시 데이터는 schemaVersion이 아예 없으므로(undefined → 1로 간주) 지금은 그대로 통과시킨다.
 */
export function migrate(raw: Partial<AppState> & Record<string, unknown>): AppState {
  const version = raw.schemaVersion ?? 1;
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(`알 수 없는 schemaVersion: ${version}`);
  }
  // v1 → 현재: 필드 구조 변경 없음. 다음 마이그레이션이 생기면 여기 단계를 추가한다.
  return { ...blankState(), ...raw, schemaVersion: CURRENT_SCHEMA_VERSION };
}

export function load(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function save(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 저장 공간이 꽉 찼거나 막혀 있으면 조용히 무시 (CLAUDE.md: 저장 실패해도 화면은 정상 동작) */
  }
}

/** localStorage가 기기 저장공간 부족으로 조용히 지워지지 않도록, 가능하면 영구 저장을 요청한다. 실패해도 무해. */
export function requestPersistentStorage(): void {
  try {
    void navigator.storage?.persist?.();
  } catch {
    /* 지원 안 하는 브라우저는 무시 */
  }
}

export function exportBackup(state: AppState): string {
  const payload: BackupPayload = { app: "grammar-life", v: 1, at: new Date().toISOString(), data: state };
  return JSON.stringify(payload);
}

/**
 * 레거시 Backup.load()와 호환: {app:"grammar-life", v:1, data} 래핑 형식과,
 * 래핑 없이 state 객체를 그대로 보낸 옛 백업 코드 둘 다 받아준다.
 */
export function importBackup(text: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error("백업 코드가 올바른 JSON이 아니에요.");
  }
  const obj = parsed as Record<string, unknown>;
  const data = obj && obj.app === "grammar-life" ? (obj as unknown as BackupPayload).data : (parsed as AppState);
  if (!data || typeof data !== "object" || !("prog" in data) || !("profile" in data)) {
    throw new Error("백업 코드가 올바르지 않아요. 처음부터 끝까지 전부 붙여넣었는지 확인해주세요.");
  }
  return migrate(data as Partial<AppState> & Record<string, unknown>);
}
