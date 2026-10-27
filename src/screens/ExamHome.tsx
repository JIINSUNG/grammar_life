import type { AppState, Lang } from "../types";

export function ExamHome({ st, lang, start }: { st: AppState; lang: Lang; start: () => void }) {
  const hist = st.exams.filter((e) => e.lang === lang).slice(-8);
  return (
    <>
      <h1 className="ptitle">{lang === "en" ? "TOEIC Part 5 형식" : "JLPT 文法 형식"}</h1>
      <p className="lead">
        {lang === "en"
          ? "비즈니스 문장의 빈칸을 고르는 Part 5 형식으로 10문제를 풀어요. 한 문제 20초 안이 목표예요."
          : "問題1 문법 형식 판단과 問題2 문장 배열(★) 형식으로 10문제를 풀어요."}{" "}
        실제 기출이 아니라 같은 형식으로 새로 만든 연습 문제예요.
      </p>
      <section className="card">
        <button type="button" className="btn pri wide" onClick={start}>
          10문제 시작
        </button>
      </section>
      {hist.length > 0 && (
        <section className="card">
          <span className="eyebrow">최근 기록</span>
          <div className="hbars">
            {hist.map((e, k) => (
              <div key={k} className="hb">
                <div className="hbf" style={{ height: e.score + "%" }} />
                <small className="num">{e.score}</small>
                <small className="sub">{e.date.slice(5).replace("-", "/")}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
