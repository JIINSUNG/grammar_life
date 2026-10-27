import { useState } from "react";
import { VoiceCard } from "./Me/VoiceCard";
import { Backup } from "./Me/Backup";
import { addDays, today } from "../lib/date";
import { blankState } from "../lib/storage";
import { POINTS, HOBBIES, JOBS, PLANS, RIDES } from "../data";
import { goalXp, streak } from "../lib/srs";
import type { AppState, Lang } from "../types";

export function Me({ st, up, edit }: { st: AppState; up: (fn: (s: AppState) => AppState) => void; edit: () => void }) {
  const [ask, setAsk] = useState(false);
  const p = st.profile!;
  const job = JOBS.find((j) => j.id === p.job)!;
  const ride = RIDES.find((r) => r.id === p.ride)!;
  const t = today();
  const days = [...Array(28)].map((_, k) => addDays(t, k - 27));
  const g = goalXp(p.goal);
  const acc = (l: Lang) => {
    const v = Object.values(st.prog[l]);
    const tot = v.reduce((a, b) => a + b.tot, 0);
    const ok = v.reduce((a, b) => a + b.ok, 0);
    return tot ? Math.round((ok / tot) * 100) : null;
  };
  const luck = () => {
    const v = [...Object.values(st.prog.en), ...Object.values(st.prog.ja)];
    const ok = v.reduce((a, b) => a + b.ok, 0);
    const lk = v.reduce((a, b) => a + (b.lucky || 0), 0);
    return ok + lk ? Math.round((lk / (ok + lk)) * 100) : null;
  };
  const mastered = (l: Lang) => POINTS[l].filter((x) => (st.prog[l][x.id]?.box || 0) >= 4).length;
  const sk = streak(st.days, t);
  const luckPct = luck();
  const badges: [string, boolean][] = [
    ["첫 걸음", st.xp > 0],
    ["3일 연속", sk >= 3],
    ["7일 연속", sk >= 7],
    ["문법 5개 익힘", mastered("en") + mastered("ja") >= 5],
    ["첫 실전", st.exams.length > 0],
    ["실전 90점", st.exams.some((e) => e.score >= 90)],
    ["내 문장 10개 검토", st.notes.filter((n) => n.rv).length >= 10],
    ["단어 50개 익힘", [...Object.values(st.vprog.en), ...Object.values(st.vprog.ja)].filter((g2) => g2.box >= 3).length >= 50],
  ];

  return (
    <>
      <h1 className="ptitle">나의 학습</h1>
      <section className="card">
        <span className="eyebrow">최근 4주</span>
        <div className="heat">
          {days.map((d) => {
            const v = st.days[d] || 0;
            const lv = v === 0 ? 0 : v < g / 2 ? 1 : v < g ? 2 : 3;
            return <i key={d} className={"h" + lv} title={d + " · " + v + " XP"} />;
          })}
        </div>
        <div className="legend">
          <span className="sub">적음</span>
          <i className="h1" />
          <i className="h2" />
          <i className="h3" />
          <span className="sub">목표 달성</span>
        </div>
      </section>
      <section className="stats">
        {(
          [
            ["총 XP", st.xp],
            ["연속", sk + "일"],
            ["영어 확실 정답률", acc("en") == null ? "-" : acc("en") + "%"],
            ["일본어 확실 정답률", acc("ja") == null ? "-" : acc("ja") + "%"],
          ] as const
        ).map(([l, v]) => (
          <div className="card st" key={l}>
            <span className="eyebrow">{l}</span>
            <b className="num">{v}</b>
          </div>
        ))}
      </section>
      {luckPct != null && (
        <section className="card">
          <div className="rh">
            <span className="eyebrow">감으로 맞힌 비율</span>
            <b className="num">{luckPct}%</b>
          </div>
          <div className="bar">
            <div style={{ width: luckPct + "%", background: "var(--lucky)" }} />
          </div>
          <p className="hint">맞힌 문제 중 '애매해요·찍었어요'를 고른 비율이에요. 낮을수록 정확히 알고 맞힌 거예요.</p>
        </section>
      )}
      <section className="card">
        <span className="eyebrow">배지</span>
        <div className="badges">
          {badges.map(([n, on]) => (
            <span key={n} className={"badge" + (on ? " on" : "")}>
              {n}
            </span>
          ))}
        </div>
      </section>
      <VoiceCard st={st} up={up} />
      <section className="card">
        <div className="rh">
          <span className="eyebrow">내 생활 설문</span>
          <button type="button" className="link" onClick={edit}>
            수정
          </button>
        </div>
        <dl className="prof">
          <dt>일하는 곳</dt>
          <dd>{job.ko}</dd>
          <dt>출퇴근</dt>
          <dd>{ride.ko}</dd>
          <dt>쉬는 날</dt>
          <dd>{p.hobbies.map((h) => HOBBIES.find((x) => x.id === h)!.ko).join(", ")}</dd>
          <dt>앞으로 있는 일</dt>
          <dd>{p.plans.map((h) => PLANS.find((x) => x.id === h)!.ko).join(", ")}</dd>
          <dt>목표</dt>
          <dd>
            TOEIC {p.toeic} · JLPT {p.jlpt} · 하루 {p.goal}분
          </dd>
        </dl>
      </section>
      <Backup st={st} up={up} />
      <p className="hint center">학습 기록은 이 기기 브라우저에만 저장돼요.</p>
      {ask ? (
        <div className="card confirm">
          <p>학습 기록과 설문을 모두 지울까요?</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => setAsk(false)}>
              취소
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                up(() => blankState());
                setAsk(false);
              }}
            >
              모두 지우기
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="link center muted" onClick={() => setAsk(true)}>
          기록 초기화
        </button>
      )}
    </>
  );
}
