import { useState } from "react";
import { exportBackup, importBackup } from "../../lib/storage";
import type { AppState } from "../../types";

export function Backup({ st, up }: { st: AppState; up: (fn: (s: AppState) => AppState) => void }) {
  const [mode, setMode] = useState<"out" | "in" | null>(null);
  const [txt, setTxt] = useState("");
  const [msg, setMsg] = useState("");
  const code = exportBackup(st);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setMsg("복사했어요. 새 앱의 '백업 코드 붙여넣기'에 넣으면 돼요.");
    } catch {
      const el = document.getElementById("bk-out") as HTMLTextAreaElement | null;
      el?.focus();
      el?.select();
      setMsg("자동 복사가 막혀 있어요. 선택된 글자를 직접 복사해 주세요.");
    }
  };

  const load = () => {
    try {
      const data = importBackup(txt);
      up(() => data);
      setMsg("가져왔어요!");
      setMode(null);
      setTxt("");
    } catch {
      setMsg("백업 코드가 올바르지 않아요. 처음부터 끝까지 전부 붙여넣었는지 확인해 주세요.");
    }
  };

  return (
    <section className="card">
      <span className="eyebrow">기록 옮기기</span>
      <p className="hint">다른 기기나 새 버전 앱으로 학습 기록을 옮길 때 써요. 백업 코드에 진도·노트·설문이 모두 들어 있어요.</p>
      <div className="row2">
        <button
          type="button"
          className="btn sm"
          aria-pressed={mode === "out"}
          onClick={() => {
            setMode(mode === "out" ? null : "out");
            setMsg("");
          }}
        >
          백업 코드 만들기
        </button>
        <button
          type="button"
          className="btn sm"
          aria-pressed={mode === "in"}
          onClick={() => {
            setMode(mode === "in" ? null : "in");
            setMsg("");
          }}
        >
          백업 코드 붙여넣기
        </button>
      </div>
      {mode === "out" && (
        <>
          <textarea id="bk-out" className="inp ta" rows={4} readOnly value={code} onFocus={(e) => e.target.select()} />
          <button type="button" className="btn pri wide" onClick={copy}>
            복사하기
          </button>
        </>
      )}
      {mode === "in" && (
        <>
          <textarea id="bk-in" className="inp ta" rows={4} placeholder="백업 코드를 붙여넣으세요 (지금 기록은 덮어써져요)" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <button type="button" className="btn pri wide" disabled={!txt.trim()} onClick={load}>
            가져오기
          </button>
        </>
      )}
      {msg && <p className="hint">{msg}</p>}
    </section>
  );
}
