import { Sent } from "../components/Sent";
import { Speak } from "../components/Speak";
import { build } from "../lib/template";
import { today } from "../lib/date";
import { dueList, goalXp, nextNew, streak, vDue, vNew, vTrack, VREV } from "../lib/srs";
import { nDue, notesOf, nStatus } from "../lib/notes";
import { POINTS, VOCAB } from "../data";
import type { AppState, Lang } from "../types";

const LANG_LABEL: Record<Lang, string> = { en: "English", ja: "日本語" };

export function Today({
  st,
  lang,
  start,
  openPoint,
  goExam,
  goVocab,
  goNote,
}: {
  st: AppState;
  lang: Lang;
  start: () => void;
  openPoint: (id: string) => void;
  goExam: () => void;
  goVocab: () => void;
  goNote: () => void;
}) {
  const t = today();
  const prof = st.profile!;
  const nTodo = notesOf(st.notes, lang).filter((n) => nStatus(n) !== "done").length;
  const nD = nDue(st.notes, lang, t).length;
  const track = vTrack(st.vtrack[lang], prof.jstart, lang);
  const vn = vNew(st.vprog[lang], lang, track).length;
  const vd = vDue(st.vprog[lang], lang, t).length;
  const g = goalXp(prof.goal);
  const tx = st.days[t] || 0;
  const sk = streak(st.days, t);
  const due = dueList(st.prog[lang], lang, t);
  const nw = nextNew(st.prog[lang], lang, prof.jstart);
  const mins = Math.max(3, (nw ? 4 : 0) + Math.floor(due.slice(0, 4).length * 1.5));
  const p = nw || due[0] || POINTS[lang][0];
  const ex = build(p, 0, prof, lang, st.seeds[lang + p.id] || 0);
  const lvl = Math.floor(st.xp / 200) + 1;
  const lp = st.xp % 200;
  const r = 34;
  const C = 2 * Math.PI * r;
  const pct = Math.min(1, tx / g);
  const mastered = POINTS[lang].filter((x) => (st.prog[lang][x.id]?.box || 0) >= 4).length;

  return (
    <>
      <section className="hero">
        <div className="ring">
          <svg viewBox="0 0 80 80" width={88} height={88} aria-hidden="true">
            <circle cx={40} cy={40} r={r} className="rbg" />
            <circle cx={40} cy={40} r={r} className="rfg" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 40 40)" />
          </svg>
          <div className="rtxt">
            <b>{tx}</b>
            <small>/ {g} XP</small>
          </div>
        </div>
        <div className="hstats">
          <div>
            <span className="eyebrow">연속 학습</span>
            <b className="num">
              {sk}
              <small>일</small>
            </b>
          </div>
          <div>
            <span className="eyebrow">레벨 {lvl}</span>
            <div className="bar">
              <div style={{ width: lp / 2 + "%" }} />
            </div>
            <small className="sub">다음 레벨까지 {200 - lp} XP</small>
          </div>
          <div>
            <span className="eyebrow">목표</span>
            <b className="goal">{lang === "en" ? "TOEIC " + prof.toeic : "JLPT " + prof.jlpt}</b>
          </div>
        </div>
      </section>

      <section className="card routine">
        <div className="rh">
          <div>
            <span className="eyebrow">오늘의 루틴 · {LANG_LABEL[lang]}</span>
            <h2>{tx >= g ? "오늘 목표 달성! 더 해볼까요?" : "약 " + mins + "분이면 끝나요"}</h2>
          </div>
        </div>
        <ul className="rlist">
          {nw && (
            <li>
              <span className="tag new">새 문법</span>
              {nw.t}
            </li>
          )}
          {due.length > 0 && (
            <li>
              <span className="tag rev">복습</span>
              {due
                .slice(0, 4)
                .map((d) => d.t)
                .join(" · ")}
              {due.length > 4 ? ` 외 ${due.length - 4}개` : ""}
            </li>
          )}
          {!nw && !due.length && <li className="sub">새 문법을 모두 배웠고 오늘 복습할 것도 없어요. 실전 문제를 풀어 보세요.</li>}
        </ul>
        {nw || due.length > 0 ? (
          <button type="button" className="btn pri wide" onClick={start}>
            루틴 시작
          </button>
        ) : (
          <button type="button" className="btn pri wide" onClick={goExam}>
            실전 문제 풀기
          </button>
        )}
      </section>

      <section className="card daily">
        <div className="rh">
          <span className="eyebrow">내 하루로 만든 예문 · {p.t}</span>
          <Speak text={ex.full} lang={lang} voice={st.voice} />
        </div>
        <p className="dsent">
          <Sent raw={ex.raw} lang={lang} big furi={st.furi} />
        </p>
        <p className="ko">{ex.ko}</p>
        <button type="button" className="link" onClick={() => openPoint(p.id)}>
          이 문법 자세히 보기 ›
        </button>
      </section>

      <section className="card vtoday">
        <div className="rh">
          <div>
            <span className="eyebrow">오늘의 단어 · {VOCAB[lang].length}개 중</span>
            <h2>
              {vn ? "새 단어 " + vn + "개" : ""}
              {vn && vd ? " · " : ""}
              {vd ? "복습 " + Math.min(vd, VREV) + "개" : ""}
              {!vn && !vd ? "오늘 단어 공부 끝!" : ""}
            </h2>
          </div>
          <button type="button" className="btn sm" disabled={!vn && !vd} onClick={goVocab}>
            단어 공부
          </button>
        </div>
      </section>
      <section className="card vtoday">
        <div className="rh">
          <div>
            <span className="eyebrow">내 문장 노트</span>
            <h2>
              {nTodo || nD
                ? [nTodo ? "번역·검토 기다리는 문장 " + nTodo + "개" : "", nD ? "복습 " + nD + "개" : ""].filter(Boolean).join(" · ")
                : "오늘 하고 싶었던 말을 적어 볼까요?"}
            </h2>
          </div>
          <button type="button" className="btn sm" onClick={goNote}>
            노트
          </button>
        </div>
      </section>
      <section className="mini">
        <button type="button" className="card minic" onClick={goExam}>
          <span className="eyebrow">{lang === "en" ? "TOEIC Part 5 형식" : "JLPT 文法 형식"}</span>
          <b>실전 10문제</b>
          <small className="sub">{st.exams.filter((e) => e.lang === lang).length}회 풀었어요</small>
        </button>
        <div className="card minic">
          <span className="eyebrow">익힌 문법</span>
          <b>
            {mastered} / {POINTS[lang].length}
          </b>
          <small className="sub">복습 4단계 이상</small>
        </div>
      </section>
    </>
  );
}
