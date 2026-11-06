import { useState } from "react";
import { Sent } from "../components/Sent";
import { Speak } from "../components/Speak";
import { build } from "../lib/template";
import { today } from "../lib/date";
import { quickPeekPoints } from "../lib/srs";
import type { AppState, Lang } from "../types";

/**
 * 손님 없을 때 문법 1~2개만 가볍게 훑어보는 용도. FlashReview와 달리 채점·확신도가 없고
 * prog를 안 건드린다 — 그냥 넘겨보는 것. 이미 공부한 적 있는 카드만 ⭐로 표시할 수 있다
 * (처음 보는 카드는 아직 prog 항목이 없어서 GrammarList와 같은 이유로 별표를 못 단다).
 */
export function QuickPeekGrammar({ st, lang, up, onExit }: { st: AppState; lang: Lang; up: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const [list] = useState(() => quickPeekPoints(st.prog[lang], lang, today(), 2));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ended, setEnded] = useState(false);

  const next = () => {
    setFlipped(false);
    if (i + 1 >= list.length) setEnded(true);
    else setI(i + 1);
  };

  const toggleStar = (id: string) => {
    up((s) => {
      const g = s.prog[lang][id];
      if (!g) return s;
      return { ...s, prog: { ...s.prog, [lang]: { ...s.prog[lang], [id]: { ...g, starred: !g.starred } } } };
    });
  };

  if (!list.length || ended) {
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">짬짬이 훑어보기</span>
          <h1 style={{ fontSize: 22 }}>{list.length ? "오늘은 여기까지!" : "훑어볼 문법이 없어요."}</h1>
          <p className="sub">{list.length ? `방금 ${list.length}개 훑어봤어요.` : "먼저 문법을 한 번 배워보세요."}</p>
          <button type="button" className="btn pri wide" onClick={onExit}>
            닫기
          </button>
        </section>
      </main>
    );
  }

  const p = list[i];
  const prof = st.profile;
  const seed = (st.seeds[lang + p.id] || 0) + 1;
  const ex = build(p, 0, prof, lang, seed);
  const g = st.prog[lang][p.id];

  return (
    <main className="wrap main sess">
      <div className="sbar">
        <button type="button" className="link" onClick={onExit} aria-label="그만하기">
          ✕
        </button>
        <div className="prog">
          <div style={{ width: (i / list.length) * 100 + "%" }} />
        </div>
        <span className="sub num">
          {i + 1}/{list.length}
        </span>
      </div>
      <section className="card result" style={{ minHeight: 260, justifyContent: "center" }}>
        {!flipped ? (
          <>
            <span className="eyebrow">짬짬이 훑어보기 · {g ? "복습" : "처음 보는 문법"}</span>
            <p className="qtext concept">{p.sum}</p>
            <p className="ko" style={{ fontSize: 14 }}>
              예문 뜻: {ex.ko}
            </p>
            <button type="button" className="btn pri wide" onClick={() => setFlipped(true)}>
              뒤집어서 확인하기
            </button>
          </>
        ) : (
          <>
            <span className="eyebrow">{p.t}</span>
            <div className="form" style={{ alignSelf: "stretch" }}>
              <span className="eyebrow">형태</span>
              <code>{p.form}</code>
            </div>
            <div className="exs">
              <Sent raw={ex.raw} lang={lang} furi={st.furi} />
              <Speak text={ex.full} lang={lang} voice={st.voice} />
            </div>
            <p className="ko">{ex.ko}</p>
            <button type="button" className="btn pri wide" onClick={next}>
              {i + 1 >= list.length ? "끝내기" : "다음"}
            </button>
            {g && (
              <button type="button" className="link sm" onClick={() => toggleStar(p.id)}>
                {g.starred ? "⭐ 어렵다고 표시 해제" : "☆ 어렵다고 표시"}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
