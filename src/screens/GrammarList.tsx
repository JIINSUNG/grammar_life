import { useState, type MouseEvent } from "react";
import { today } from "../lib/date";
import { POINTS } from "../data";
import { starredPoints } from "../lib/srs";
import type { AppState, Lang } from "../types";

export function GrammarList({
  st,
  lang,
  up,
  openPoint,
  startFlash,
  initQ,
}: {
  st: AppState;
  lang: Lang;
  up: (fn: (s: AppState) => AppState) => void;
  openPoint: (id: string) => void;
  startFlash: () => void;
  initQ?: string;
}) {
  const t = today();
  const starred = starredPoints(st.prog[lang], lang);
  const toggleStar = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    up((s) => {
      const g = s.prog[lang][id];
      if (!g) return s;
      return { ...s, prog: { ...s.prog, [lang]: { ...s.prog[lang], [id]: { ...g, starred: !g.starred } } } };
    });
  };
  const groups = [...new Set(POINTS[lang].map((p) => p.lv))];
  const [lvF, setLvF] = useState("all");
  const [q, setQ] = useState(initQ || "");
  const match = (p: (typeof POINTS)[Lang][number]) =>
    (lvF === "all" || p.lv === lvF) && (!q || (p.t + " " + p.form + " " + p.sum).toLowerCase().includes(q.toLowerCase()));
  const lvStat = groups.map((g) => {
    const ps = POINTS[lang].filter((p) => p.lv === g);
    return [g, ps.filter((p) => (st.prog[lang][p.id]?.box || 0) >= 4).length, ps.length] as const;
  });

  return (
    <>
      <h1 className="ptitle">
        {lang === "en" ? "영어" : "일본어"} 문법 {POINTS[lang].length}개
      </h1>
      {starred.length > 0 && (
        <section className="card routine">
          <div className="rh">
            <div>
              <span className="eyebrow">⭐ 어렵다고 표시한 문법</span>
              <h2>{starred.length}개 집중 복습</h2>
            </div>
          </div>
          <p className="sub">Anki 카드처럼, 떠올려보고 뒤집어서 확인한 뒤 얼마나 기억났는지 평가해요.</p>
          <button type="button" className="btn pri wide" onClick={startFlash}>
            집중 복습 시작
          </button>
        </section>
      )}
      <section className="card lvcard">
        {lvStat.map(([g, m, n]) => (
          <div className="lvrow" key={g}>
            <b>{g}</b>
            <div className="bar">
              <div style={{ width: (m / n) * 100 + "%" }} />
            </div>
            <small className="num sub">
              {m}/{n}
            </small>
          </div>
        ))}
      </section>
      <div className="chips">
        {[["all", "전체"] as const, ...groups.map((g) => [g, g] as const)].map(([k, l]) => (
          <button type="button" key={k} className="chip" aria-pressed={lvF === k} onClick={() => setLvF(k)}>
            {l}
          </button>
        ))}
      </div>
      <input id="g-search" className="inp search" placeholder="문법 검색 (예: ように, 수동태)" value={q} onChange={(e) => setQ(e.target.value)} />
      <p className="lead">5칸이 다 차면 익힌 문법이에요. 맞히면 한 칸씩 오르고, 복습 간격이 1→2→4→7→15일로 늘어나요.</p>
      {groups
        .filter((g) => POINTS[lang].some((p) => p.lv === g && match(p)))
        .map((gname) => (
          <section key={gname}>
            <h2 className="grp">
              {gname} · {POINTS[lang].filter((p) => p.lv === gname && match(p)).length}개
            </h2>
            <div className="plist">
              {POINTS[lang]
                .filter((p) => p.lv === gname && match(p))
                .map((p) => {
                  const g = st.prog[lang][p.id];
                  const due = g && g.due <= t;
                  return (
                    <div key={p.id} className="card prow">
                      {g && (
                        <button
                          type="button"
                          className="link"
                          style={{ fontSize: 18, flexShrink: 0, background: "none" }}
                          aria-pressed={!!g.starred}
                          aria-label={g.starred ? "어렵다고 표시 해제" : "어렵다고 표시"}
                          onClick={(e) => toggleStar(p.id, e)}
                        >
                          <span style={{ color: g.starred ? "var(--mark)" : "var(--muted)" }}>{g.starred ? "★" : "☆"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openPoint(p.id)}
                        style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, background: "none", border: 0, padding: 0, font: "inherit", color: "inherit", textAlign: "left" }}
                      >
                        <div className="pmain">
                          <b>{p.t}</b>
                          <small className="sub">{p.form}</small>
                        </div>
                        <div className="pside">
                          <div className="boxes" aria-label={"복습 " + (g?.box || 0) + "단계"}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <i key={i} className={g && g.box >= i ? "on" : ""} />
                            ))}
                          </div>
                          <small className={due ? "due" : "sub"}>{!g ? "새 문법" : due ? "오늘 복습" : g.box >= 5 ? "익힘" : g.due.slice(5).replace("-", "/") + " 복습"}</small>
                        </div>
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
    </>
  );
}
