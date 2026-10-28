import { useState } from "react";
import { VWord } from "../components/VWord";
import { canSpeak, speak } from "../lib/speech";
import { today, addDays } from "../lib/date";
import { CONF, INTERVAL, VNEW, VREV, vDue, vNew, vOpts, vStep, vTrack, type VocabStep } from "../lib/srs";
import { shuffle } from "../lib/util";
import { MNEMONICS_SEED_JA } from "../data/mnemonics-seed";
import type { AppState, Lang, ProgressEntry } from "../types";
import type { VocabWordRw } from "../data";

type Step = { type: "card"; w: VocabWordRw } | VocabStep;

export function VocabSession({ st, lang, up, onExit }: { st: AppState; lang: Lang; up: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const [steps, setSteps] = useState<Step[]>(() => {
    const pr = st.vprog[lang];
    const track = vTrack(st.vtrack[lang], st.profile?.jstart, lang);
    const nw = vNew(pr, lang, track, st.profile?.vgoal || VNEW);
    const due = shuffle(vDue(pr, lang, today())).slice(0, VREV);
    const boxOf = (w: VocabWordRw) => pr[w.id]?.box || 0;
    return [...nw.map((w) => ({ type: "card" as const, w })), ...shuffle([...nw, ...due]).map((w) => vStep(w, lang, boxOf(w), 0))];
  });
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [conf, setConf] = useState<string | null>(null);
  const [res, setRes] = useState<Record<number, { ok: boolean; conf: string | null }>>({});
  const [xp, setXp] = useState(0);
  const [ended, setEnded] = useState(false);
  const [editingHint, setEditingHint] = useState(false);
  const [hintDraft, setHintDraft] = useState("");
  const s = steps[i];
  const reveal = pick != null && conf != null;

  const mnemonicOf = (w: VocabWordRw) => st.mnemonics?.[w.id] || (lang === "ja" ? MNEMONICS_SEED_JA[w.id] : undefined);
  const saveHint = (w: VocabWordRw) => {
    up((p) => ({ ...p, mnemonics: { ...p.mnemonics, [w.id]: hintDraft.trim() } }));
    setEditingHint(false);
  };

  const gain = (add: number) => {
    const t = today();
    up((p) => ({ ...p, xp: p.xp + add, days: { ...p.days, [t]: (p.days[t] || 0) + add } }));
  };

  const finish = () => {
    const by: Record<string, boolean> = {};
    steps.forEach((x, k) => {
      if (x.type !== "vq" || x.retry) return;
      const r = res[k];
      if (r) by[x.w.id] = r.ok && r.conf === "sure";
    });
    const t = today();
    up((st0) => {
      const pr = { ...st0.vprog[lang] };
      Object.entries(by).forEach(([id, pass]) => {
        const g: ProgressEntry = pr[id] || { box: 0, ok: 0, tot: 0, due: t };
        const box = pass ? Math.min(5, g.box + 1) : 1;
        pr[id] = { box, due: addDays(t, INTERVAL[box]), ok: g.ok + (pass ? 1 : 0), tot: g.tot + 1, lastPass: pass };
      });
      return { ...st0, vprog: { ...st0.vprog, [lang]: pr } };
    });
    gain(10);
    setXp((x) => x + 10);
    setEnded(true);
  };

  const next = () => {
    setPick(null);
    setConf(null);
    setEditingHint(false);
    if (i + 1 >= steps.length) finish();
    else setI(i + 1);
  };

  const chooseConf = (c: string) => {
    if (conf != null || s.type !== "vq") return;
    setConf(c);
    const ok = pick === s.a;
    const solid = ok && c === "sure";
    setRes((r) => ({ ...r, [i]: { ok, conf: c } }));
    const add = solid ? 3 : ok ? 1 : 0;
    if (add) {
      gain(add);
      setXp((x) => x + add);
    }
    if (!solid && s.retry < 1) {
      const { opts, a } = vOpts(s.w, lang, s.rev);
      setSteps((a2) => [...a2, { ...vStep(s.w, lang, 0, 1), rev: s.rev, opts, a }]);
    }
  };

  const vSay = (w: VocabWordRw) => speak(lang === "ja" ? w.r || w.w : w.w, lang, { rate: st.voice?.rate, voiceName: st.voice?.[lang] });
  const spk = (w: VocabWordRw) =>
    canSpeak && (
      <button type="button" className="spk" aria-label="발음 듣기" onClick={() => vSay(w)}>
        <svg viewBox="0 0 20 20" width={18} height={18} aria-hidden="true">
          <path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor" />
          <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </svg>
      </button>
    );

  if (!s && !ended) {
    return (
      <main className="wrap main sess">
        <section className="card result">
          <h1>오늘 단어 끝!</h1>
          <button type="button" className="btn pri wide" onClick={onExit}>
            닫기
          </button>
        </section>
      </main>
    );
  }

  if (ended) {
    const qs = Object.entries(res)
      .filter(([k]) => !(steps[Number(k)] as VocabStep).retry)
      .map(([, v]) => v);
    const solid = qs.filter((r) => r.ok && r.conf === "sure").length;
    const lucky = qs.filter((r) => r.ok && r.conf !== "sure").length;
    const wrong = qs.filter((r) => !r.ok).length;
    const firsts = steps
      .map((x, k) => [x, res[k]] as const)
      .filter(([x, r]) => x.type === "vq" && !(x as VocabStep).retry && r) as [VocabStep, { ok: boolean; conf: string | null }][];
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">단어 루틴 완료 · +{xp} XP</span>
          <h1>
            {solid}
            <small>/ {qs.length}</small>
          </h1>
          <p className="sub">확실히 알고 맞힌 단어</p>
          <div className="tri">
            <div>
              <b className="num">{solid}</b>
              <small>확실히 맞힘</small>
            </div>
            <div>
              <b className="num">{lucky}</b>
              <small>감으로 맞힘</small>
            </div>
            <div>
              <b className="num">{wrong}</b>
              <small>틀림</small>
            </div>
          </div>
          {lucky + wrong > 0 && <p className="why">감으로 맞혔거나 틀린 단어는 내일 다시 나와요.</p>}
          <ul className="rlist">
            {firsts.map(([x, r]) => {
              const pass = r.ok && r.conf === "sure";
              return (
                <li key={x.w.id}>
                  <span className={"tag " + (pass ? "rev" : "bad")}>{pass ? "통과" : "다시"}</span>
                  <VWord w={x.w} furi={st.furi} />
                  <small className="sub" style={{ marginLeft: "auto" }}>
                    {x.w.m}
                  </small>
                </li>
              );
            })}
          </ul>
          <button type="button" className="btn pri wide" onClick={onExit}>
            완료
          </button>
        </section>
      </main>
    );
  }

  const bar = (
    <div className="sbar">
      <button type="button" className="link" onClick={onExit} aria-label="그만하기">
        ✕
      </button>
      <div className="prog">
        <div style={{ width: (i / steps.length) * 100 + "%" }} />
      </div>
      <span className="sub num">
        {i + 1}/{steps.length}
      </span>
    </div>
  );

  if (s.type === "card") {
    const w = s.w;
    const mnemonic = mnemonicOf(w);
    return (
      <main className="wrap main sess">
        {bar}
        <section className="card vcard">
          <span className="eyebrow">
            새 단어 · {w.lv} · {w.c}
          </span>
          <div className="vhead">
            <VWord w={w} big furi={st.furi} />
            {spk(w)}
          </div>
          {w.r && w.r !== w.w && <p className="vread ja">{w.r}</p>}
          <p className="vmean">{w.m}</p>
          {!editingHint && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              {mnemonic ? (
                <small className="sub" style={{ flex: 1 }}>
                  💡 {mnemonic}
                </small>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="link sm"
                onClick={() => {
                  setHintDraft(st.mnemonics?.[w.id] ?? "");
                  setEditingHint(true);
                }}
              >
                {mnemonic ? "수정" : "+ 연상 힌트 적기"}
              </button>
            </div>
          )}
          {editingHint && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <textarea
                className="inp ta"
                rows={2}
                placeholder="예) 猿(さる,원숭이) → '사루'처럼 들려서, 원숭이가 야구장에서 춤추는 모습을 떠올려요"
                value={hintDraft}
                onChange={(e) => setHintDraft(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn sm" onClick={() => setEditingHint(false)}>
                  취소
                </button>
                <button type="button" className="btn pri sm" onClick={() => saveHint(w)}>
                  저장
                </button>
              </div>
            </div>
          )}
        </section>
        <button type="button" className="btn pri wide" onClick={next}>
          외웠어요, 다음
        </button>
      </main>
    );
  }

  const w = s.w;
  const ok = pick === s.a;
  return (
    <main className="wrap main sess">
      {bar}
      <section className="quiz">
        <div className="qtop">
          {s.retry > 0 && <span className="tag new">다시 확인</span>}
          <span className="eyebrow">{s.rev ? "뜻에 맞는 단어는?" : "이 단어의 뜻은?"}</span>
        </div>
        <div className="vhead">
          {s.rev ? <span className="vmean big">{w.m}</span> : <VWord w={w} big furi={st.furi} />}
          {!s.rev && spk(w)}
        </div>
        <div className="opts">
          {s.opts.map((o, k) => (
            <button
              type="button"
              key={o.id}
              className={"opt" + (reveal && k === s.a ? " right" : "") + (reveal && pick === k && k !== s.a ? " wrong" : "") + (!reveal && pick === k ? " sel" : "")}
              disabled={pick != null}
              onClick={() => setPick(k)}
            >
              <span className="ol">{k + 1}</span>
              <span className={s.rev && lang === "ja" ? "ja" : ""}>{s.rev ? <VWord w={o} furi={st.furi} /> : o.m}</span>
            </button>
          ))}
        </div>
        {pick != null && conf == null && (
          <div className="confbox">
            <b>정답을 보기 전에, 얼마나 확신해요?</b>
            <div className="confs">
              {CONF.map(([k, l]) => (
                <button type="button" key={k} className={"btn conf-" + k} onClick={() => chooseConf(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
        {reveal && (
          <div className={"fb " + (ok && conf === "sure" ? "good" : ok ? "lucky" : "badfb")}>
            <b>{ok && conf === "sure" ? "확실히 맞혔어요 +3 XP" : ok ? "맞았지만 확신이 없었어요 · 끝에서 한 번 더" : "틀렸어요 · 끝에서 한 번 더"}</b>
            <div className="vhead">
              <VWord w={w} furi={st.furi} />
              {spk(w)}
            </div>
            {w.r && w.r !== w.w && <p className="vread ja">{w.r}</p>}
            <p className="why">{w.m}</p>
            {mnemonicOf(w) && <p className="why sub">💡 {mnemonicOf(w)}</p>}
          </div>
        )}
      </section>
      {reveal && (
        <button type="button" className="btn pri wide" onClick={next}>
          {i + 1 >= steps.length ? "결과 보기" : "다음"}
        </button>
      )}
    </main>
  );
}
