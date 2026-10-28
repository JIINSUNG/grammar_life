import { useState, type ReactNode } from "react";
import { Sent } from "../components/Sent";
import { build } from "../lib/template";
import { JLV, VGOALS } from "../lib/srs";
import { GOALS, HOBBIES, JLPT_GOALS, JOBS, PLANS, POINTS, RIDES, TOEIC_GOALS } from "../data";
import type { Profile } from "../types";

function Q({ n, t, sub, children }: { n: string; t: string; sub?: string; children: ReactNode }) {
  return (
    <section className="q">
      <div className="qh">
        <span className="qn">{n}</span>
        <div>
          <h3>{t}</h3>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Chips<T extends { id: string; ko: string } | string>({
  list,
  val,
  on,
  multi,
}: {
  list: T[];
  val: string | string[];
  on: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="chips">
      {list.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        const label = typeof o === "string" ? o : o.ko;
        const sel = multi ? (val as string[]).includes(id) : val === id;
        return (
          <button type="button" key={id} className="chip" aria-pressed={sel} onClick={() => on(id)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function Survey({ init, onDone, onCancel }: { init: Profile | null; onDone: (p: Profile) => void; onCancel: (() => void) | null }) {
  const [p, setP] = useState<Profile>(
    () => init || { job: "elec", ride: "bike", hobbies: ["game", "gym"], plans: ["jptrip"], goal: 10, toeic: "800", jlpt: "N2", jstart: "입문", vgoal: VGOALS[0] }
  );
  const set = <K extends keyof Profile>(k: K) => (v: Profile[K]) => setP({ ...p, [k]: v });
  const tog = (k: "hobbies" | "plans") => (id: string) => setP({ ...p, [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] });
  const ok = p.hobbies.length > 0 && p.plans.length > 0;
  const prev = build(POINTS.en[0], 0, p, "en", 0);
  const prevJ = build(POINTS.ja[0], 0, p, "ja", 0);

  return (
    <main className="wrap main survey">
      <div className="sv-head">
        <div className="brand">
          내 생활 <b>문법</b>
        </div>
        {onCancel && (
          <button type="button" className="link" onClick={onCancel}>
            닫기
          </button>
        )}
      </div>
      <h1 className="sv-title">내 하루로 문법 예문을 만들어요</h1>
      <p className="lead">고른 내용이 영어·일본어 예문과 문제에 들어가요. 처음엔 예시로 골라 뒀으니 내 생활에 맞게 바꿔 주세요.</p>

      <Q n="1" t="어디서 일해요?">
        <Chips list={JOBS} val={p.job} on={set("job")} />
      </Q>
      <Q n="2" t="출퇴근은 어떻게 해요?">
        <Chips list={RIDES} val={p.ride} on={set("ride")} />
      </Q>
      <Q n="3" t="쉬는 날 뭐 해요?" sub="여러 개 고를 수 있어요">
        <Chips list={HOBBIES} val={p.hobbies} on={tog("hobbies")} multi />
      </Q>
      <Q n="4" t="앞으로 있는 일은요?" sub="여러 개 고를 수 있어요">
        <Chips list={PLANS} val={p.plans} on={tog("plans")} multi />
      </Q>
      <Q n="5" t="목표 점수·급수">
        <div className="goalrow">
          <span>TOEIC</span>
          <Chips list={TOEIC_GOALS} val={p.toeic} on={set("toeic")} />
        </div>
        <div className="goalrow">
          <span>JLPT</span>
          <Chips list={JLPT_GOALS} val={p.jlpt} on={set("jlpt")} />
        </div>
      </Q>
      <Q n="6" t="일본어 문법은 어디서부터 시작할까요?" sub="품사·문장 순서부터 배우려면 입문, 이미 아는 레벨은 건너뛰고, 필요하면 문법 탭에서 언제든 골라 볼 수 있어요">
        <Chips list={JLV} val={p.jstart || "입문"} on={set("jstart")} />
      </Q>
      <Q n="7" t="하루에 얼마나 공부할까요?">
        <div className="chips">
          {GOALS.map(({ minutes, label }) => (
            <button type="button" key={minutes} className="chip" aria-pressed={p.goal === minutes} onClick={() => setP({ ...p, goal: minutes })}>
              {label}
            </button>
          ))}
        </div>
      </Q>
      <Q n="8" t="하루에 새 단어를 몇 개 외울까요?">
        <div className="chips">
          {VGOALS.map((n) => (
            <button type="button" key={n} className="chip" aria-pressed={(p.vgoal || VGOALS[0]) === n} onClick={() => setP({ ...p, vgoal: n })}>
              {n}개
            </button>
          ))}
        </div>
      </Q>

      <div className="preview">
        <span className="eyebrow">이런 예문이 나와요</span>
        <p>
          <Sent raw={prev.raw} lang="en" />
        </p>
        <p className="ko">{prev.ko}</p>
        <p>
          <Sent raw={prevJ.raw} lang="ja" />
        </p>
        <p className="ko">{prevJ.ko}</p>
      </div>

      <button type="button" className="btn pri wide" disabled={!ok} onClick={() => onDone(p)}>
        {init ? "저장" : "시작하기"}
      </button>
      {!ok && <p className="hint center">취미와 앞으로 있는 일을 하나 이상 골라 주세요.</p>}
    </main>
  );
}
