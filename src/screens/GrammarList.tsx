import { useState } from "react";
import { today } from "../lib/date";
import { POINTS } from "../data";
import type { AppState, Lang } from "../types";

export function GrammarList({ st, lang, openPoint, initQ }: { st: AppState; lang: Lang; openPoint: (id: string) => void; initQ?: string }) {
  const t = today();
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
                    <button type="button" key={p.id} className="card prow" onClick={() => openPoint(p.id)}>
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
                  );
                })}
            </div>
          </section>
        ))}
    </>
  );
}
