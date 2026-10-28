import { useState } from "react";
import { Sent } from "../components/Sent";
import { Speak } from "../components/Speak";
import { build } from "../lib/template";
import { today } from "../lib/date";
import { gradeFlash, starredPoints } from "../lib/srs";
import { shuffle } from "../lib/util";
import type { AppState, FlashRating, Lang } from "../types";

const RATE_BTN: [FlashRating, string, string][] = [
  ["again", "다시", "conf-guess"],
  ["hard", "어려움", "conf-unsure"],
  ["good", "좋음", "conf-sure"],
  ["easy", "쉬움", "conf-sure"],
];

/** 어렵다고 표시(⭐)해둔 문법만 Anki 카드처럼 돌려보는 집중 복습. */
export function FlashReview({ st, lang, up, onExit }: { st: AppState; lang: Lang; up: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const [list] = useState(() => shuffle(starredPoints(st.prog[lang], lang)));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState<FlashRating[]>([]);
  const [ended, setEnded] = useState(false);

  const rate = (r: FlashRating) => {
    const p = list[i];
    const t = today();
    up((s) => ({ ...s, prog: { ...s.prog, [lang]: { ...s.prog[lang], [p.id]: gradeFlash(s.prog[lang][p.id], r, t) } } }));
    setRated((a) => [...a, r]);
    setFlipped(false);
    if (i + 1 >= list.length) setEnded(true);
    else setI(i + 1);
  };

  const unstar = (id: string) => {
    up((s) => {
      const g = s.prog[lang][id];
      if (!g) return s;
      return { ...s, prog: { ...s.prog, [lang]: { ...s.prog[lang], [id]: { ...g, starred: false } } } };
    });
  };

  if (!list.length || ended) {
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">집중 복습</span>
          <h1>
            {rated.filter((r) => r === "good" || r === "easy").length}
            <small>/ {rated.length}</small>
          </h1>
          <p className="sub">{list.length ? "이번에 쉬움·좋음으로 넘긴 카드" : "⭐ 표시해둔 어려운 문법이 아직 없어요."}</p>
          {!list.length && <p className="hint">문법 목록에서 어렵다고 느끼는 문법 옆 ⭐을 눌러두면 여기서 계속 복습할 수 있어요.</p>}
          <button type="button" className="btn pri wide" onClick={onExit}>
            {list.length ? "완료" : "닫기"}
          </button>
        </section>
      </main>
    );
  }

  const p = list[i];
  const prof = st.profile;
  const seed = (st.seeds[lang + p.id] || 0) + 1;
  const ex = build(p, 0, prof, lang, seed);

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
            <span className="eyebrow">⭐ 어렵다고 표시한 문법</span>
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
            <div className="confs" style={{ gridTemplateColumns: "repeat(4,1fr)", alignSelf: "stretch" }}>
              {RATE_BTN.map(([r, l, c]) => (
                <button type="button" key={r} className={"btn " + c} onClick={() => rate(r)}>
                  {l}
                </button>
              ))}
            </div>
            <button type="button" className="link sm" onClick={() => unstar(p.id)}>
              이제 안 어려워요 (⭐ 해제)
            </button>
          </>
        )}
      </section>
    </main>
  );
}
