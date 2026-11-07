import { useState } from "react";
import { Ruby } from "../components/Ruby";
import { shuffle } from "../lib/util";
import { today } from "../lib/date";
import { quickPeekPoints } from "../lib/srs";
import type { AppState, GrammarPoint, Lang } from "../types";

interface Q {
  p: GrammarPoint;
  opts: string[];
  a: number;
}

function toQ(p: GrammarPoint): Q {
  const opts = shuffle(p.cq.o);
  return { p, opts, a: opts.indexOf(p.cq.o[0]) };
}

/**
 * 손님 없을 때 "형용사는 모양·상태·성질을 설명한다" 같은 문법 개념을 깜지처럼 빠르게 객관식으로
 * 훑는 용도. 각 문법 포인트에 이미 있는 개념 확인(cq)을 그대로 쓴다 — 채점·확신도·간격반복엔
 * 영향 없이(prog를 안 건드림) 그냥 맞혀보고 바로 다음으로 넘어가는 가벼운 연습.
 */
export function CramQuiz({ st, lang, onExit }: { st: AppState; lang: Lang; onExit: () => void }) {
  const [list] = useState(() => quickPeekPoints(st.prog[lang], lang, today(), 5).map(toQ));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [ended, setEnded] = useState(false);

  const next = () => {
    setPick(null);
    if (i + 1 >= list.length) setEnded(true);
    else setI(i + 1);
  };

  const answer = (k: number) => {
    if (pick != null) return;
    setPick(k);
    if (k === list[i].a) setRight((r) => r + 1);
  };

  if (!list.length || ended) {
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">깜지 모드</span>
          <h1 style={{ fontSize: 22 }}>{list.length ? "오늘은 여기까지!" : "풀어볼 문법 개념이 없어요."}</h1>
          <p className="sub">{list.length ? `${list.length}문제 중 ${right}개 맞혔어요.` : "먼저 문법을 한 번 배워보세요."}</p>
          <button type="button" className="btn pri wide" onClick={onExit}>
            닫기
          </button>
        </section>
      </main>
    );
  }

  const { p, opts, a } = list[i];
  const ok = pick != null && pick === a;

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
      <section className="quiz">
        <div className="qtop">
          <span className="eyebrow">깜지 모드 · {p.t}</span>
        </div>
        <p className="qtext concept">{p.cq.q}</p>
        <div className="opts">
          {opts.map((o, k) => (
            <button
              type="button"
              key={k}
              className={"opt" + (pick != null && k === a ? " right" : "") + (pick != null && pick === k && k !== a ? " wrong" : "")}
              disabled={pick != null}
              onClick={() => answer(k)}
            >
              <span className="ol">{k + 1}</span>
              <span className={lang === "ja" ? "ja" : ""}>
                <Ruby text={o} furi={st.furi} />
              </span>
            </button>
          ))}
        </div>
        {pick != null && (
          <div className={"fb " + (ok ? "good" : "badfb")}>
            <b>{ok ? "정확해요!" : "다음엔 맞혀봐요"}</b>
            <p className="why">{p.cq.ex}</p>
          </div>
        )}
      </section>
      {pick != null && (
        <button type="button" className="btn pri wide" onClick={next}>
          {i + 1 >= list.length ? "끝내기" : "다음"}
        </button>
      )}
    </main>
  );
}
