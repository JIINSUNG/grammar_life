import { useState } from "react";
import { Sent } from "../components/Sent";
import { Speak } from "../components/Speak";
import { Ruby } from "../components/Ruby";
import { build, toQuiz, type QuizExample } from "../lib/template";
import { shuffle } from "../lib/util";
import { today } from "../lib/date";
import { CONF, LANG_LABEL, POINTS, gradePoint, type GradeInput } from "../lib/srs";
import type { AppState, GrammarPoint, Lang } from "../types";

export interface SessionPlanItem {
  id: string;
  mode: "new" | "study" | "review";
}

interface LearnStep {
  type: "learn";
  p: GrammarPoint;
}
interface ConceptStep {
  type: "concept";
  p: GrammarPoint;
  retry: number;
  q: { text: string; opts: string[]; a: number; ex: string };
}
interface QuizStep {
  type: "quiz";
  p: GrammarPoint;
  retry: number;
  q: QuizExample;
}
type Step = LearnStep | ConceptStep | QuizStep;

function cqStep(p: GrammarPoint, retry: number): ConceptStep {
  const c = p.cq;
  const opts = shuffle(c.o);
  return { type: "concept", p, retry, q: { text: c.q, opts, a: opts.indexOf(c.o[0]), ex: c.ex } };
}

function quizStep(p: GrammarPoint, ti: number, prof: AppState["profile"], lang: Lang, seed: number, retry: number): QuizStep {
  return { type: "quiz", p, retry, q: toQuiz(build(p, ti, prof!, lang, seed), lang) };
}

/** 틀렸을 때 재시도용으로, 방금 본 것과 다른 템플릿 index를 무작위로 고른다. */
function anotherTemplateIndex(exclude: number, len: number): number {
  return (exclude + 1 + Math.floor(Math.random() * (len - 1))) % len;
}

export function Session({
  st,
  lang,
  plan,
  up,
  onExit,
}: {
  st: AppState;
  lang: Lang;
  plan: SessionPlanItem[];
  up: (fn: (s: AppState) => AppState) => void;
  onExit: () => void;
}) {
  const prof = st.profile;
  const [steps, setSteps] = useState<Step[]>(() => {
    const out: Step[] = [];
    plan.forEach(({ id, mode }) => {
      const p = POINTS[lang].find((x) => x.id === id);
      if (!p) return;
      const seed = (st.seeds[lang + id] || 0) + 1;
      if (mode !== "review") out.push({ type: "learn", p });
      out.push(cqStep(p, 0));
      const idx = shuffle(p.tpl.map((_, k) => k));
      (mode === "review" ? idx.slice(0, 2) : idx).forEach((ti) => out.push(quizStep(p, ti, prof, lang, seed, 0)));
    });
    return out;
  });
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [conf, setConf] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [res, setRes] = useState<Record<number, { ok: boolean; conf: string | null; pick: number }>>({});
  const [xp, setXp] = useState(0);
  const [ended, setEnded] = useState(false);
  const [seedBump, setSeedBump] = useState<Record<string, number>>({});
  const s = steps[i];
  const reveal = s && s.type === "concept" ? pick != null && submitted : pick != null && conf != null;

  const gain = (add: number) => {
    const t = today();
    up((p) => ({ ...p, xp: p.xp + add, days: { ...p.days, [t]: (p.days[t] || 0) + add } }));
  };

  const grade = (pid: string, b: GradeInput) => {
    const t = today();
    up((p) => {
      const g = gradePoint(p.prog[lang][pid], b, t);
      return { ...p, prog: { ...p.prog, [lang]: { ...p.prog[lang], [pid]: g } } };
    });
  };

  const finish = () => {
    const byP: Record<string, GradeInput> = {};
    steps.forEach((x, k) => {
      if (x.type === "learn" || x.retry) return;
      const r = res[k];
      if (!r) return;
      const b = (byP[x.p.id] = byP[x.p.id] || { solid: 0, tot: 0, concept: true, lucky: 0 });
      if (x.type === "concept") {
        if (!r.ok) b.concept = false;
      } else {
        b.tot++;
        if (r.ok && r.conf === "sure") b.solid++;
        if (r.ok && r.conf !== "sure") b.lucky++;
      }
    });
    Object.entries(byP).forEach(([pid, b]) => grade(pid, b));
    gain(20);
    setXp((x) => x + 20);
    setEnded(true);
  };

  const loadStep = (idx: number) => {
    const r = res[idx];
    setPick(r ? r.pick : null);
    setConf(r ? r.conf : null);
    setSubmitted(!!r);
  };

  const next = () => {
    if (i + 1 >= steps.length) {
      finish();
      return;
    }
    loadStep(i + 1);
    setI(i + 1);
  };

  const goBack = () => {
    if (i === 0) return;
    loadStep(i - 1);
    setI(i - 1);
  };

  const record = (k: number, c: string | null) => {
    if (s.type === "learn") return;
    const ok = k === s.q.a;
    const solid = s.type === "concept" ? ok : ok && c === "sure";
    setRes((r) => ({ ...r, [i]: { ok, conf: c, pick: k } }));
    const add = s.type === "concept" ? (ok ? 5 : 0) : solid ? 10 : ok ? 4 : 0;
    if (add) {
      gain(add);
      setXp((x) => x + add);
    }
    if (!solid && s.retry < 2) {
      const nx: Step =
        s.type === "concept"
          ? cqStep(s.p, s.retry + 1)
          : quizStep(s.p, anotherTemplateIndex(s.q.ti, s.p.tpl.length), prof, lang, (st.seeds[lang + s.p.id] || 0) + 2 + s.retry, s.retry + 1);
      setSteps((a) => [...a, nx]);
    }
  };

  const answer = (k: number) => {
    if (reveal) return;
    setPick(k);
  };

  const confirmConcept = () => {
    if (pick == null || submitted) return;
    setSubmitted(true);
    record(pick, null);
  };

  const chooseConf = (c: string) => {
    if (conf != null) return;
    setConf(c);
    record(pick!, c);
  };

  if (ended) {
    const qs = Object.entries(res)
      .filter(([k]) => steps[Number(k)].type === "quiz")
      .map(([, v]) => v);
    const solid = qs.filter((r) => r.ok && r.conf === "sure").length;
    const lucky = qs.filter((r) => r.ok && r.conf !== "sure").length;
    const wrong = qs.filter((r) => !r.ok).length;
    const ps = [...new Set(steps.map((x) => x.p.id))].map((id) => POINTS[lang].find((p) => p.id === id)!);
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">루틴 완료 · +{xp} XP</span>
          <h1>
            {solid}
            <small>/ {qs.length}</small>
          </h1>
          <p className="sub">확실히 이해하고 맞힌 문제</p>
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
          {lucky > 0 && <p className="why">감으로 맞힌 문제는 '아는 것'으로 치지 않아요. 그 문법은 단계가 오르지 않고 내일 다시 나와요.</p>}
          <ul className="rlist">
            {ps.map((p) => {
              const g = st.prog[lang][p.id] || ({} as { box?: number; due?: string; lastPass?: boolean });
              const pass = g.lastPass;
              return (
                <li key={p.id}>
                  <span className={"tag " + (pass ? "rev" : "bad")}>{pass ? "통과" : "다시"}</span>
                  {p.t}
                  <small className="sub" style={{ marginLeft: "auto" }}>
                    {g.box || 0}단계 · {g.due ? g.due.slice(5).replace("-", "/") : "-"} 복습
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
      {i > 0 && (
        <button type="button" className="link" onClick={goBack} aria-label="이전 문제">
          ‹ 이전
        </button>
      )}
      <div className="prog">
        <div style={{ width: (i / steps.length) * 100 + "%" }} />
      </div>
      <span className="sub num">
        {i + 1}/{steps.length}
      </span>
    </div>
  );

  if (s.type === "learn") {
    const p = s.p;
    const seed = (st.seeds[lang + p.id] || 0) + (seedBump[p.id] || 0);
    const exs = p.tpl.map((_, ti) => build(p, ti, prof!, lang, seed));
    return (
      <main className="wrap main sess">
        {bar}
        <section className="learn">
          <span className="eyebrow">
            {p.lv} · {LANG_LABEL[lang]}
          </span>
          <h1>{p.t}</h1>
          <p className="sum">{p.sum}</p>
          <div className="form">
            <span className="eyebrow">형태</span>
            <code>{p.form}</code>
          </div>
          <ul className="tips">
            {p.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="bad">
            <div>
              <span className="x">✕</span>
              <s>
                <Ruby text={p.bad[0]} furi={st.furi} />
              </s>
            </div>
            <div>
              <span className="o">○</span>
              <Ruby text={p.bad[1]} furi={st.furi} />
            </div>
          </div>
        </section>
        <section className="card exlist">
          <div className="rh">
            <span className="eyebrow">내 하루로 만든 예문</span>
            <button
              type="button"
              className="link"
              onClick={() => {
                setSeedBump({ ...seedBump, [p.id]: (seedBump[p.id] || 0) + 1 });
                up((x) => ({ ...x, seeds: { ...x.seeds, [lang + p.id]: (x.seeds[lang + p.id] || 0) + 1 } }));
              }}
            >
              다른 예문
            </button>
          </div>
          {exs.map((e, k) => (
            <div className="ex" key={k}>
              <div className="exs">
                <Sent raw={e.raw} lang={lang} furi={st.furi} />
                <Speak text={e.full} lang={lang} voice={st.voice} />
              </div>
              <p className="ko">{e.ko}</p>
            </div>
          ))}
        </section>
        <button type="button" className="btn pri wide" onClick={next}>
          이해했는지 확인하기
        </button>
      </main>
    );
  }

  const retryNote = s.retry > 0 && <span className="tag new">다시 확인</span>;

  if (s.type === "concept") {
    const q = s.q;
    const ok = pick != null && pick === q.a;
    return (
      <main className="wrap main sess">
        {bar}
        <section className="quiz">
          <div className="qtop">
            {retryNote}
            <span className="eyebrow">개념 확인 · {s.p.t}</span>
          </div>
          <p className="qtext concept">{q.text}</p>
          <div className="opts">
            {q.opts.map((o, k) => (
              <button
                type="button"
                key={k}
                className={"opt" + (reveal && k === q.a ? " right" : "") + (reveal && pick === k && k !== q.a ? " wrong" : "") + (!reveal && pick === k ? " sel" : "")}
                disabled={reveal}
                onClick={() => answer(k)}
              >
                <span className="ol">{k + 1}</span>
                <span className={lang === "ja" ? "ja" : ""}>
                  <Ruby text={o} furi={st.furi} />
                </span>
              </button>
            ))}
          </div>
          {reveal && (
            <div className={"fb " + (ok ? "good" : "badfb")}>
              <b>{ok ? "정확해요 +5 XP" : "규칙을 다시 볼게요"}</b>
              <p className="why">{q.ex}</p>
              {!ok && <p className="why sub">이 개념 문제는 끝에 한 번 더 나와요.</p>}
            </div>
          )}
        </section>
        {pick != null && !reveal && (
          <button type="button" className="btn pri wide" onClick={confirmConcept}>
            정답 확인
          </button>
        )}
        {reveal && (
          <button type="button" className="btn pri wide" onClick={next}>
            다음
          </button>
        )}
      </main>
    );
  }

  const q = s.q;
  const ok = pick != null && pick === q.a;
  return (
    <main className="wrap main sess">
      {bar}
      <section className="quiz">
        <div className="qtop">
          {retryNote}
          <span className="eyebrow">{s.p.t} · 빈칸에 알맞은 것</span>
        </div>
        <p className="qtext">
          <span className={"sent big" + (lang === "ja" ? " ja" : "")}>
            <Ruby text={q.blank} furi={st.furi} />
          </span>
        </p>
        <div className="opts">
          {q.opts.map((o, k) => (
            <button
              type="button"
              key={k}
              className={"opt" + (reveal && k === q.a ? " right" : "") + (reveal && pick === k && k !== q.a ? " wrong" : "") + (!reveal && pick === k ? " sel" : "")}
              disabled={reveal}
              onClick={() => answer(k)}
            >
              <span className="ol">{lang === "ja" ? k + 1 : "ABCD"[k]}</span>
              <span className={lang === "ja" ? "ja" : ""}>
                <Ruby text={o} furi={st.furi} />
              </span>
            </button>
          ))}
        </div>
        {pick != null && conf == null && (
          <div className="confbox">
            <b>정답을 보기 전에, 얼마나 확신해요?</b>
            <p className="sub">감으로 맞힌 건 아는 걸로 치지 않고 다시 물어볼게요.</p>
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
            <b>{ok && conf === "sure" ? "확실히 맞혔어요 +10 XP" : ok ? "맞았지만 확신이 없었어요 +4 XP · 끝에서 다른 문장으로 한 번 더" : "틀렸어요 · 끝에서 다른 문장으로 한 번 더"}</b>
            <div className="exs">
              <Sent raw={q.raw} lang={lang} furi={st.furi} />
              <Speak text={q.full} lang={lang} voice={st.voice} />
            </div>
            <p className="ko">{q.ko}</p>
            <p className="why">
              <b>왜?</b> {s.p.sum}
            </p>
            <p className="why sub">형태: {s.p.form}</p>
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
