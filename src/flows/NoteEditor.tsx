import { useMemo, useState } from "react";
import { today, addDays } from "../lib/date";
import { canSpeak, speak } from "../lib/speech";
import { nStatus, tagLabel, trUrl, vocabHints, N_LABEL, NOTE_TAGS, CONF_N } from "../lib/notes";
import { POINTS } from "../data";
import type { AppState, Lang, Note } from "../types";

export function NoteEditor({ st, lang, id, up, onClose }: { st: AppState; lang: Lang; id: string; up: (fn: (s: AppState) => AppState) => void; onClose: () => void }) {
  const orig = useMemo<Note>(
    () => st.notes.find((n) => n.id === id) || { id, lang, kind: "s", ko: "", dr: "", fx: "", tags: [], pts: [], memo: "", made: today(), up: "" },
    [st.notes, id, lang]
  );
  const [n, setN] = useState<Note>(() => ({ ...orig, tags: [...orig.tags], pts: [...orig.pts] }));
  const [hint, setHint] = useState(false);
  const [gq, setGq] = useState("");
  const [ask, setAsk] = useState(false);
  const [saved, setSaved] = useState<"done" | "draft" | null>(null);
  const set = <K extends keyof Note>(k: K) => (v: Note[K]) => setN((x) => ({ ...x, [k]: v }));
  const lname = lang === "en" ? "영작" : "일작";
  const tl = lang === "en" ? "영어" : "일본어";
  const hints = useMemo(() => vocabHints(n.ko, lang), [n.ko, lang]);
  const tog = (t: string) => setN((x) => ({ ...x, tags: x.tags.includes(t) ? x.tags.filter((y) => y !== t) : [...x.tags, t] }));
  const togP = (pid: string) => setN((x) => ({ ...x, pts: x.pts.includes(pid) ? x.pts.filter((y) => y !== pid) : [...x.pts, pid].slice(-4) }));
  const gl = gq.trim() ? POINTS[lang].filter((p) => (p.t + " " + p.form).toLowerCase().includes(gq.trim().toLowerCase())).slice(0, 6) : [];

  const gain = (add: number) => {
    const t = today();
    up((p) => ({ ...p, xp: p.xp + add, days: { ...p.days, [t]: (p.days[t] || 0) + add } }));
  };

  const write = (review: boolean) => {
    let xp = 0;
    const now = new Date().toISOString();
    const out: Note = { ...n, fx: (n.fx || "").trim() ? n.fx : n.dr, up: now };
    if (n.dr && !orig.dr) xp += 5;
    if (review) {
      if (!orig.rv) {
        xp += 15;
        out.rv = today();
        out.box = 1;
        out.due = addDays(today(), 1);
      } else {
        out.rv = today();
      }
    }
    up((s) => {
      const notes = s.notes.map((x) => (x.id === id ? out : x));
      let prog = s.prog;
      if (review && out.pts.length) {
        const pr = { ...s.prog[lang] };
        out.pts.forEach((pid) => {
          if (pr[pid]) pr[pid] = { ...pr[pid], due: today() };
        });
        prog = { ...s.prog, [lang]: pr };
      }
      return { ...s, notes, prog };
    });
    if (xp) gain(xp);
    setSaved(review ? "done" : "draft");
  };

  const del = () => {
    up((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== id) }));
    onClose();
  };

  if (saved === "done") {
    const learned = n.pts.filter((pid) => st.prog[lang][pid]);
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">검토 완료</span>
          <h1 style={{ fontSize: 26 }}>잘했어요!</h1>
          <p className="sub">이 문장은 내일 복습에 나와요. 한국어를 보고 고친 문장을 다시 떠올려 볼 거예요.</p>
          {n.tags.length > 0 && <p className="why">이번에 체크한 점: {n.tags.map((t) => tagLabel(lang, t)).join(", ")}</p>}
          {learned.length > 0 && <p className="why">연결한 문법 {learned.length}개를 오늘 복습 목록에 올렸어요.</p>}
          <button type="button" className="btn pri wide" onClick={onClose}>
            노트로 돌아가기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap main sess note">
      <div className="sbar">
        <button type="button" className="link" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <b className="sbt">
          {n.kind === "w" ? "단어·표현" : "문장"} {lname}
        </b>
        <span className={"tag " + (nStatus(orig) === "done" ? "rev" : "new")}>{N_LABEL[nStatus(orig)]}</span>
      </div>
      <section className="card">
        <span className="eyebrow">한국어</span>
        <textarea id="ne-ko" className="inp ta" rows={2} value={n.ko} onChange={(e) => set("ko")(e.target.value)} />
      </section>
      <section className="card">
        <div className="rh">
          <span className="eyebrow">1 · 내가 쓴 {lname}</span>
          {hints.length > 0 && (
            <button type="button" className="link sm" onClick={() => setHint(!hint)}>
              {hint ? "힌트 숨기기" : "힌트 단어 " + hints.length + "개"}
            </button>
          )}
        </div>
        <textarea
          id="ne-dr"
          className={"inp ta" + (lang === "ja" ? " ja" : "")}
          rows={3}
          placeholder={"먼저 보지 말고 " + tl + "로 직접 써 보세요"}
          value={n.dr}
          onChange={(e) => set("dr")(e.target.value)}
        />
        {hint && (
          <div className="hints">
            {hints.map((w) => (
              <button type="button" key={w.id} className="hchip" onClick={() => speak(lang === "ja" ? w.r || w.w : w.w, lang, { rate: st.voice?.rate, voiceName: st.voice?.[lang] })}>
                <b className={lang === "ja" ? "ja" : ""}>{w.rw}</b>
                <small>{w.m}</small>
              </button>
            ))}
          </div>
        )}
        {n.dr && canSpeak && (
          <button type="button" className="link sm" style={{ alignSelf: "flex-start" }} onClick={() => speak(n.dr, lang, { rate: st.voice?.rate, voiceName: st.voice?.[lang] })}>
            내 문장 소리로 듣기
          </button>
        )}
      </section>
      <section className={"card" + (n.dr ? "" : " dim")}>
        <span className="eyebrow">2 · 비교해 보기</span>
        <p className="hint">번역기 답이 정답은 아니에요. 내 문장과 어디가 다른지만 보고, 왜 다른지 생각해 봐요.</p>
        <div className="row2">
          <a className="btn sm" href={trUrl("papago", lang, n.ko)} target="_blank" rel="noopener">
            파파고로 비교
          </a>
          <a className="btn sm" href={trUrl("google", lang, n.ko)} target="_blank" rel="noopener">
            구글 번역으로 비교
          </a>
        </div>
      </section>
      <section className={"card" + (n.dr ? "" : " dim")}>
        <span className="eyebrow">3 · 스스로 평가</span>
        <b className="qh2">얼마나 자신 있게 썼어요?</b>
        <div className="chips">
          {CONF_N.map(([k, l]) => (
            <button type="button" key={k} className="chip" aria-pressed={n.conf === k} onClick={() => set("conf")(k as Note["conf"])}>
              {l}
            </button>
          ))}
        </div>
        <b className="qh2">부족했던 점 (여러 개)</b>
        <div className="chips">
          {[...NOTE_TAGS.common, ...NOTE_TAGS[lang]].map(([k, l]) => (
            <button type="button" key={k} className="chip" aria-pressed={n.tags.includes(k)} onClick={() => tog(k)}>
              {l}
            </button>
          ))}
        </div>
        <div className="rh">
          <b className="qh2">고친 문장</b>
          {n.dr && !n.fx && (
            <button type="button" className="link sm" onClick={() => set("fx")(n.dr)}>
              내 문장 가져오기
            </button>
          )}
        </div>
        <textarea
          id="ne-fx"
          className={"inp ta" + (lang === "ja" ? " ja" : "")}
          rows={3}
          placeholder="비교해 보고 최종으로 정한 문장 (복습 때 정답으로 나와요)"
          value={n.fx}
          onChange={(e) => set("fx")(e.target.value)}
        />
        <b className="qh2">메모 · 왜 틀렸는지</b>
        <textarea
          id="ne-memo"
          className="inp ta"
          rows={2}
          placeholder="예) '지난주에 나온'은 過去形으로. 新しく出た보다 発売された가 자연스러움"
          value={n.memo}
          onChange={(e) => set("memo")(e.target.value)}
        />
        <b className="qh2">
          쓴 문법 연결하기 <small className="sub">(배운 문법이면 오늘 복습에 올라가요)</small>
        </b>
        {n.pts.length > 0 && (
          <div className="chips">
            {n.pts.map((pid) => {
              const p = POINTS[lang].find((x) => x.id === pid);
              return (
                p && (
                  <button type="button" key={pid} className="chip" aria-pressed={true} onClick={() => togP(pid)}>
                    {p.t} ✕
                  </button>
                )
              );
            })}
          </div>
        )}
        <input
          id="ne-g"
          className="inp search"
          placeholder={lang === "en" ? "문법 찾기 (예: 현재완료, 관계대명사)" : "문법 찾기 (예: ように, て형)"}
          value={gq}
          onChange={(e) => setGq(e.target.value)}
        />
        {gl.length > 0 && (
          <div className="glist">
            {gl.map((p) => (
              <button type="button" key={p.id} className={"gopt" + (n.pts.includes(p.id) ? " on" : "")} onClick={() => togP(p.id)}>
                <b>{p.t}</b>
                <small className="sub">
                  {p.lv} · {p.form}
                </small>
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="row2">
        <button
          type="button"
          className="btn"
          onClick={() => {
            write(false);
            onClose();
          }}
        >
          임시 저장
        </button>
        <button type="button" className="btn pri" disabled={!n.dr.trim() || !(n.fx || n.dr).trim()} onClick={() => write(true)}>
          검토 완료
        </button>
      </div>
      {!n.dr.trim() && <p className="hint center">{lname}을 써야 검토를 완료할 수 있어요. 지금 생각이 안 나면 임시 저장해 두세요.</p>}
      {ask ? (
        <div className="card confirm">
          <p>이 문장을 지울까요?</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => setAsk(false)}>
              취소
            </button>
            <button type="button" className="btn danger" onClick={del}>
              지우기
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="link center muted" onClick={() => setAsk(true)}>
          이 문장 지우기
        </button>
      )}
    </main>
  );
}
