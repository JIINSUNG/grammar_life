import { useState } from "react";
import { today } from "../lib/date";
import { nid } from "../lib/notes";
import type { AppState, Lang, Note } from "../types";

/**
 * 일상에서 갑자기 "이거 영어·일본어로 뭐라 하지" 싶을 때, 탭 이동 없이 바로 한국어로 적어두는 버튼.
 * 저장만 하고 끝 — 영작·일작은 노트 탭에서 나중에 해도 된다(이미 있는 "적어 두기" 흐름을 재사용).
 */
export function QuickNote({ st, up, autoOpen }: { st: AppState; up: (fn: (s: AppState) => AppState) => void; autoOpen?: boolean }) {
  const [open, setOpen] = useState(() => !!autoOpen);
  const [ko, setKo] = useState("");
  const [lang, setLang] = useState<Lang>(st.lang);
  const [saved, setSaved] = useState(false);

  const close = () => {
    setOpen(false);
    setKo("");
    setSaved(false);
  };

  const save = () => {
    const text = ko.trim();
    if (!text) return;
    const n: Note = { id: nid(), lang, kind: "s", ko: text, dr: "", fx: "", tags: [], pts: [], memo: "", conf: null, made: today(), up: new Date().toISOString() };
    up((s) => ({ ...s, notes: [...s.notes, n] }));
    setSaved(true);
    setTimeout(close, 700);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="fab"
        aria-label="순간 메모"
        onClick={() => {
          setLang(st.lang);
          setOpen(true);
        }}
      >
        +
      </button>
    );
  }

  return (
    <div className="qn-sheet" onClick={close}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="rh">
          <span className="eyebrow">순간 메모</span>
          <button type="button" className="link" onClick={close}>
            닫기
          </button>
        </div>
        <p className="hint" style={{ margin: 0 }}>
          지금 하고 싶었던 말을 한국어로 먼저 적어두세요. 영작·일작은 노트 탭에서 나중에 해도 돼요.
        </p>
        <div className="seg" role="group" aria-label="언어">
          {(["en", "ja"] as const).map((l) => (
            <button type="button" key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l === "en" ? "영어로" : "일본어로"}
            </button>
          ))}
        </div>
        <textarea
          className="inp ta"
          rows={3}
          autoFocus
          placeholder="예) 이거 혹시 환불 되나요?"
          value={ko}
          onChange={(e) => setKo(e.target.value)}
        />
        <button type="button" className="btn pri wide" disabled={!ko.trim()} onClick={save}>
          {saved ? "저장했어요!" : "적어 두기"}
        </button>
      </div>
    </div>
  );
}
