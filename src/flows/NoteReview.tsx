import { useState } from "react";
import { addDays, today } from "../lib/date";
import { canSpeak, speak } from "../lib/speech";
import { INTERVAL } from "../lib/srs";
import { nDue, tagLabel } from "../lib/notes";
import { shuffle } from "../lib/util";
import type { AppState, Lang } from "../types";

type Rating = "good" | "mid" | "bad";

export function NoteReview({ st, lang, up, onExit }: { st: AppState; lang: Lang; up: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const [list] = useState(() => shuffle(nDue(st.notes, lang, today())).slice(0, 15));
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [mine, setMine] = useState("");
  const [rs, setRs] = useState<Record<string, Rating>>({});
  const [ended, setEnded] = useState(false);

  const gain = (add: number) => {
    const t = today();
    up((p) => ({ ...p, xp: p.xp + add, days: { ...p.days, [t]: (p.days[t] || 0) + add } }));
  };

  const rate = (r: Rating) => {
    const n = list[i];
    setRs((x) => ({ ...x, [n.id]: r }));
    const t = today();
    up((s) => ({
      ...s,
      notes: s.notes.map((x) => {
        if (x.id !== n.id) return x;
        const box = r === "good" ? Math.min(5, (x.box || 1) + 1) : r === "mid" ? Math.max(1, x.box || 1) : 1;
        return { ...x, box, due: addDays(t, INTERVAL[box]), last: t };
      }),
    }));
    gain(r === "good" ? 4 : 2);
    setShow(false);
    setMine("");
    if (i + 1 >= list.length) setEnded(true);
    else setI(i + 1);
  };

  if (!list.length || ended) {
    const v = Object.values(rs);
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">내 문장 복습</span>
          <h1>
            {v.filter((r) => r === "good").length}
            <small>/ {v.length}</small>
          </h1>
          <p className="sub">바로 떠올린 문장</p>
          <div className="tri">
            <div>
              <b className="num">{v.filter((r) => r === "good").length}</b>
              <small>기억났어요</small>
            </div>
            <div>
              <b className="num">{v.filter((r) => r === "mid").length}</b>
              <small>애매해요</small>
            </div>
            <div>
              <b className="num">{v.filter((r) => r === "bad").length}</b>
              <small>생각 안 났어요</small>
            </div>
          </div>
          <button type="button" className="btn pri wide" onClick={onExit}>
            완료
          </button>
        </section>
      </main>
    );
  }

  const n = list[i];
  const ans = n.fx || n.dr;
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
        <span className="eyebrow">{lang === "en" ? "영어" : "일본어"}로 말해 보세요</span>
        <p className="qtext concept">{n.ko}</p>
        <textarea
          id="nr-mine"
          className={"inp ta" + (lang === "ja" ? " ja" : "")}
          rows={2}
          placeholder="떠올린 문장을 적어 봐도 좋아요 (선택)"
          value={mine}
          onChange={(e) => setMine(e.target.value)}
          disabled={show}
        />
        {!show ? (
          <button type="button" className="btn pri wide" onClick={() => setShow(true)}>
            내가 고친 문장 보기
          </button>
        ) : (
          <>
            <div className="fb good">
              <b>내가 정한 문장</b>
              <div className="exs">
                <span className={"sent big" + (lang === "ja" ? " ja" : "")}>{ans}</span>
                {canSpeak && (
                  <button type="button" className="spk" aria-label="발음 듣기" onClick={() => speak(ans, lang, { rate: st.voice?.rate, voiceName: st.voice?.[lang] })}>
                    <svg viewBox="0 0 20 20" width={18} height={18} aria-hidden="true">
                      <path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor" />
                      <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
              {n.memo && <p className="why">메모: {n.memo}</p>}
              {(n.tags || []).length > 0 && <p className="why sub">그때 놓친 점: {n.tags.map((t) => tagLabel(lang, t)).join(", ")}</p>}
            </div>
            <div className="confs">
              {(
                [
                  ["good", "기억났어요", "conf-sure"],
                  ["mid", "애매해요", "conf-unsure"],
                  ["bad", "생각 안 났어요", "conf-guess"],
                ] as const
              ).map(([k, l, c]) => (
                <button type="button" key={k} className={"btn " + c} onClick={() => rate(k)}>
                  {l}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
