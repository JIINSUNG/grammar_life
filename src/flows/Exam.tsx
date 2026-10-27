import { useEffect, useMemo, useState } from "react";
import { Ruby } from "../components/Ruby";
import { today, pad } from "../lib/date";
import { EXAM, POINTS } from "../data";
import { shuffle } from "../lib/util";
import type { AppState, Lang } from "../types";

export function Exam({
  st,
  lang,
  up,
  onExit,
  startReview,
}: {
  st: AppState;
  lang: Lang;
  up: (fn: (s: AppState) => AppState) => void;
  onExit: () => void;
  startReview: (ids: string[]) => void;
}) {
  const qs = useMemo(() => shuffle(EXAM[lang]).slice(0, 10), [lang]);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (done) return;
    const h = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(h);
  }, [done]);

  const sec = Math.floor((now - t0) / 1000);

  const gain = (add: number) => {
    const t = today();
    up((p) => ({ ...p, xp: p.xp + add, days: { ...p.days, [t]: (p.days[t] || 0) + add } }));
  };

  const submit = () => {
    const ok = qs.filter((q, k) => ans[k] === q.a).length;
    const score = Math.round((ok / qs.length) * 100);
    up((s) => ({ ...s, exams: [...s.exams, { lang, date: today(), score, sec }] }));
    gain(ok * 10 + 30);
    setDone(true);
  };

  if (done) {
    const ok = qs.filter((q, k) => ans[k] === q.a).length;
    const weak = [...new Set(qs.filter((q, k) => ans[k] !== q.a && q.p).map((q) => q.p!))];
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">{lang === "en" ? "TOEIC Part 5 형식" : "JLPT 文法 형식"} 결과</span>
          <h1>
            {ok * 10}
            <small>점</small>
          </h1>
          <p className="sub">
            {ok} / {qs.length} 정답 · {Math.floor(sec / 60)}분 {sec % 60}초 · +{ok * 10 + 30} XP
          </p>
          {weak.length > 0 && (
            <button type="button" className="btn pri wide" onClick={() => startReview(weak)}>
              틀린 문법 {weak.length}개 바로 복습
            </button>
          )}
          <button type="button" className="btn wide" onClick={onExit}>
            닫기
          </button>
        </section>
        {qs.map((q, k) => (
          <section className="card rv" key={k}>
            <div className="rvh">
              <span className={"tag " + (ans[k] === q.a ? "rev" : "bad")}>{ans[k] === q.a ? "정답" : "오답"}</span>
              <span className="sub">
                {k + 1}번{q.p ? " · " + POINTS[lang].find((p) => p.id === q.p)!.t : ""}
              </span>
            </div>
            <p className={"qtext" + (lang === "ja" ? " ja" : "")}>
              <Ruby text={q.q} furi={st.furi} />
            </p>
            <p>
              <b>
                정답 {lang === "ja" ? q.a + 1 : "(" + "ABCD"[q.a] + ")"} <Ruby text={q.o[q.a]} furi={st.furi} />
              </b>
              {ans[k] != null && ans[k] !== q.a && (
                <span className="sub">
                  {" "}
                  · 내 답 <Ruby text={q.o[ans[k]]} furi={st.furi} />
                </span>
              )}
            </p>
            <p className="why">{q.ex}</p>
          </section>
        ))}
      </main>
    );
  }

  const q = qs[i];
  return (
    <main className="wrap main sess">
      <div className="sbar">
        <button type="button" className="link" onClick={onExit} aria-label="그만하기">
          ✕
        </button>
        <div className="prog">
          <div style={{ width: (Object.keys(ans).length / qs.length) * 100 + "%" }} />
        </div>
        <span className="sub num">
          {Math.floor(sec / 60)}:{pad(sec % 60)}
        </span>
      </div>
      <section className="quiz exam">
        <p className="inst">
          {lang === "en"
            ? "Part 5 · Select the best answer to complete the sentence."
            : q.star
              ? "問題2　つぎの文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。"
              : "問題1　つぎの文の（　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。"}
        </p>
        <p className={"qtext" + (lang === "ja" ? " ja" : "")}>
          <span className="qno num">{lang === "en" ? 101 + i : i + 1}.</span> <Ruby text={q.q} furi={st.furi} />
        </p>
        <div className="opts">
          {q.o.map((o, k) => (
            <button
              type="button"
              key={k}
              className={"opt" + (ans[i] === k ? " sel" : "")}
              onClick={() => {
                setAns({ ...ans, [i]: k });
                if (i < qs.length - 1) setTimeout(() => setI(i + 1), 180);
              }}
            >
              <span className="ol">{lang === "ja" ? k + 1 : "(" + "ABCD"[k] + ")"}</span>
              <span className={lang === "ja" ? "ja" : ""}>
                <Ruby text={o} furi={st.furi} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <div className="exnav">
        <button type="button" className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
          이전
        </button>
        {i < qs.length - 1 ? (
          <button type="button" className="btn" onClick={() => setI(i + 1)}>
            다음
          </button>
        ) : (
          <button type="button" className="btn pri" disabled={Object.keys(ans).length < qs.length} onClick={submit}>
            채점하기
          </button>
        )}
      </div>
      <div className="dots">
        {qs.map((_, k) => (
          <button type="button" key={k} aria-label={k + 1 + "번"} className={(ans[k] != null ? "on" : "") + (k === i ? " cur" : "")} onClick={() => setI(k)} />
        ))}
      </div>
    </main>
  );
}
