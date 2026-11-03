import type { SyncState } from "../../lib/sync";

/** Firebase가 꺼져 있으면(env 없음) 아무것도 보여주지 않는다 — 지금처럼 로컬 전용 사용자에겐 그대로. */
export function SyncCard({ sync }: { sync: SyncState }) {
  if (!sync.enabled) return null;

  return (
    <section className="card">
      <span className="eyebrow">기기 간 동기화</span>
      {sync.loading ? (
        <p className="hint">동기화 확인 중…</p>
      ) : sync.user ? (
        <>
          <p className="hint">
            {sync.user.displayName ?? sync.user.email}로 로그인됨 · 다른 기기와 자동으로 맞춰져요.
          </p>
          <button type="button" className="btn sm" onClick={sync.signOutUser}>
            로그아웃
          </button>
        </>
      ) : (
        <>
          <p className="hint">Google로 로그인하면 같은 계정의 다른 기기와 학습 기록을 맞출 수 있어요.</p>
          <button type="button" className="btn sm" onClick={sync.signIn}>
            Google로 로그인
          </button>
          {sync.error && <p className="hint">{sync.error}</p>}
        </>
      )}
    </section>
  );
}
