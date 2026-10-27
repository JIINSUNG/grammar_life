import { useState } from "react";
import { today } from "../lib/date";
import { nDue, nStatus, nid, notesOf, tagLabel, weakStats, TAG_Q, gMatch } from "../lib/notes";
import type { AppState, Lang, Note } from "../types";

export function NoteTab({
  st,
  lang,
  up,
  openNote,
  startReview,
  openGrammar,
}: {
  st: AppState;
  lang: Lang;
  up: (fn: (s: AppState) => AppState) => void;
  openNote: (id: string) => void;
  startReview: () => void;
  openGrammar: (q: string) => void;
}) {
  const [ko, setKo] = useState("");
  const [kind, setKind] = useState<"s" | "w">("s");
  const [f, setF] = useState<"all" | "todo" | "check" | "done">("all");
  const ns = notesOf(st.notes, lang)
    .slice()
    .sort((a, b) => (b.up || "").localeCompare(a.up || ""));
  const cnt = (k: "todo" | "check" | "done") => ns.filter((n) => nStatus(n) === k).length;
  const t = today();
  const due = nDue(st.notes, lang, t);
  const weak = weakStats(st.notes, lang);
  const rv = ns.filter((n) => n.rv);

  const gain = (add: number) => up((p) => ({ ...p, xp: p.xp + add, days: { ...p.days, [t]: (p.days[t] || 0) + add } }));

  const add = (thenOpen: boolean) => {
    const text = ko.trim();
    if (!text) return;
    const n: Note = { id: nid(), lang, kind, ko: text, dr: "", fx: "", tags: [], pts: [], memo: "", conf: null, made: t, up: new Date().toISOString() };
    up((s) => ({ ...s, notes: [...s.notes, n] }));
    gain(2);
    setKo("");
    if (thenOpen) openNote(n.id);
  };

  const lname = lang === "en" ? "영작" : "일작";

  return (
    <>
      <h1 className="ptitle">내 문장 노트</h1>
      <p className="lead">
        {lang === "en" ? "영어" : "일본어"}로 말해 보고 싶은 문장이나 단어를 한국어로 먼저 적어 두세요. {lname}은 나중에 생각날 때 해도 돼요. 써 본 뒤엔 번역기와
        비교하고, 뭐가 부족했는지 스스로 체크해요.
      </p>
      <section className="card">
        <div className="seg" role="group" aria-label="종류">
          {(
            [
              ["s", "문장"],
              ["w", "단어·표현"],
            ] as const
          ).map(([k, l]) => (
            <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {l}
            </button>
          ))}
        </div>
        <textarea
          id="n-ko"
          className="inp ta"
          rows={3}
          placeholder={kind === "s" ? "예) 이 청소기는 지난주에 새로 나온 모델이에요." : "예) 재고가 다 떨어졌다"}
          value={ko}
          onChange={(e) => setKo(e.target.value)}
        />
        <div className="row2">
          <button type="button" className="btn" disabled={!ko.trim()} onClick={() => add(false)}>
            적어 두기
          </button>
          <button type="button" className="btn pri" disabled={!ko.trim()} onClick={() => add(true)}>
            지금 {lname}해 보기
          </button>
        </div>
      </section>
      {due.length > 0 && (
        <section className="card routine">
          <div className="rh">
            <div>
              <span className="eyebrow">내 문장 복습</span>
              <h2>오늘 다시 말해 볼 문장 {due.length}개</h2>
            </div>
          </div>
          <p className="sub">한국어를 보고 내가 고친 문장을 떠올려 봐요.</p>
          <button type="button" className="btn pri wide" onClick={startReview}>
            복습 시작
          </button>
        </section>
      )}
      {rv.length > 0 && (
        <section className="card">
          <div className="rh">
            <span className="eyebrow">내가 자주 놓친 점 · 검토한 {rv.length}개 기준</span>
          </div>
          {weak.length ? (
            weak.slice(0, 6).map(([tg, c]) => {
              const qq = TAG_Q[lang]?.[tg];
              const has = gMatch(lang, qq).length > 0;
              return (
                <div className="wk" key={tg}>
                  <span className="wkl">{tagLabel(lang, tg)}</span>
                  <div className="bar">
                    <div style={{ width: (c / rv.length) * 100 + "%", background: "var(--lucky)" }} />
                  </div>
                  <small className="num sub">{c}</small>
                  {has ? (
                    <button type="button" className="link sm" onClick={() => openGrammar(qq)}>
                      관련 문법
                    </button>
                  ) : tg === "word" ? (
                    <span className="sub sm">단어 탭에서 보충</span>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })
          ) : (
            <p className="hint">아직 체크한 약점이 없어요. 잘하고 있어요!</p>
          )}
          <p className="hint">
            스스로 평가: 자신 있음 {rv.filter((n) => n.conf === "good").length} · 반반 {rv.filter((n) => n.conf === "mid").length} · 자신 없음{" "}
            {rv.filter((n) => n.conf === "low").length}
          </p>
        </section>
      )}
      <div className="chips">
        {(
          [
            ["all", "전체 " + ns.length],
            ["todo", "번역 전 " + cnt("todo")],
            ["check", "검토 전 " + cnt("check")],
            ["done", "완료 " + cnt("done")],
          ] as const
        ).map(([k, l]) => (
          <button type="button" key={k} className="chip" aria-pressed={f === k} onClick={() => setF(k)}>
            {l}
          </button>
        ))}
      </div>
      <div className="plist">
        {ns
          .filter((n) => f === "all" || nStatus(n) === f)
          .map((n) => {
            const s = nStatus(n);
            return (
              <button type="button" key={n.id} className="card prow nrow" onClick={() => openNote(n.id)}>
                <div className="pmain">
                  <b>{n.ko}</b>
                  {(n.fx || n.dr) && <small className={"sub" + (lang === "ja" ? " ja" : "")}>{n.fx || n.dr}</small>}
                </div>
                <div className="pside">
                  <span className={"tag " + (s === "done" ? "rev" : s === "check" ? "new" : "todo")}>{{ todo: "번역 전", check: "검토 전", done: "검토 완료" }[s]}</span>
                  <small className="sub">
                    {n.kind === "w" ? "단어" : "문장"} · {n.made.slice(5).replace("-", "/")}
                  </small>
                </div>
              </button>
            );
          })}
      </div>
      {!ns.length && <p className="hint center">아직 적은 문장이 없어요. 오늘 손님에게 하고 싶었던 말부터 적어 볼까요?</p>}
    </>
  );
}
