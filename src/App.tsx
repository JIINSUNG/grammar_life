import { useEffect, useState } from "react";
import { Survey } from "./screens/Survey";
import { Today } from "./screens/Today";
import { GrammarList } from "./screens/GrammarList";
import { VocabTab } from "./screens/Vocab";
import { NoteTab } from "./screens/Notes";
import { ExamHome } from "./screens/ExamHome";
import { Me } from "./screens/Me";
import { Session, type SessionPlanItem } from "./flows/Session";
import { VocabSession } from "./flows/VocabSession";
import { NoteEditor } from "./flows/NoteEditor";
import { NoteReview } from "./flows/NoteReview";
import { Exam } from "./flows/Exam";
import { FlashReview } from "./flows/FlashReview";
import { VocabFlashReview } from "./flows/VocabFlashReview";
import { QuickPeekGrammar } from "./flows/QuickPeekGrammar";
import { QuickPeekVocab } from "./flows/QuickPeekVocab";
import { CramQuiz } from "./flows/CramQuiz";
import { TabBar } from "./components/TabBar";
import { QuickNote } from "./components/QuickNote";
import { blankState, load, requestPersistentStorage, save } from "./lib/storage";
import { useFirebaseSync } from "./lib/sync";
import { today } from "./lib/date";
import { dueList, nextNew } from "./lib/srs";
import { loadResume } from "./lib/session-resume";
import type { AppState, Profile } from "./types";

type Run =
  | { kind: "session"; key: number; plan: SessionPlanItem[] }
  | { kind: "vocab"; key: number }
  | { kind: "note"; key: number; id: string }
  | { kind: "nreview"; key: number }
  | { kind: "exam"; key: number }
  | { kind: "flash"; key: number }
  | { kind: "vflash"; key: number }
  | { kind: "peek"; key: number }
  | { kind: "vpeek"; key: number }
  | { kind: "cram"; key: number }
  | null;

export default function App() {
  // 세션 도중 페이지가 새로고침돼도(모바일에서 앱 전환 후 복귀 시 흔함) 오늘 화면으로 튕기지
  // 않고 풀던 문제 그대로 복귀시킨다 — Session/VocabSession이 각자 진행 상황을 저장해두면,
  // 여기선 그걸 보고 바로 그 화면으로 들어가기만 하면 된다(언어도 그 세션 기준으로 맞춘다).
  const [st, setSt] = useState<AppState>(() => {
    const loaded = load() ?? blankState();
    if (!loaded.profile) return loaded;
    const resumedLang = loadResume("grammar")?.lang ?? loadResume("vocab")?.lang;
    return resumedLang && resumedLang !== loaded.lang ? { ...loaded, lang: resumedLang } : loaded;
  });
  const [run, setRun] = useState<Run>(() => {
    if (loadResume("grammar")) return { kind: "session", key: Date.now(), plan: [] };
    if (loadResume("vocab")) return { kind: "vocab", key: Date.now() };
    return null;
  });
  const up = (fn: (s: AppState) => AppState) =>
    setSt((p) => {
      const n = { ...fn(p), updatedAt: new Date().toISOString() };
      save(n);
      return n;
    });
  const sync = useFirebaseSync(st, (next) => {
    setSt(next);
    save(next);
  });
  const [gq, setGq] = useState("");
  const [tab, setTab] = useState("today");
  const [editProf, setEditProf] = useState(false);
  const lang = st.lang;
  const hasProfile = !!st.profile;

  useEffect(() => {
    window.scrollTo(0, 0);
    // 설문 화면은 길어서 끝까지 스크롤한 채로 "시작하기"를 누르는 경우가 많다. tab/run은
    // 안 바뀌어도(처음엔 둘 다 그대로) 프로필이 생기는 순간은 꼭 맨 위로 되돌려야 한다.
  }, [tab, run, hasProfile]);

  useEffect(() => {
    requestPersistentStorage();
  }, []);

  // 홈 화면 아이콘 꾹 눌러서 쓰는 "순간 메모" PWA 바로가기(/?quick=1)로 들어왔는지 확인
  const [autoQuick] = useState(() => new URLSearchParams(window.location.search).get("quick") === "1");
  useEffect(() => {
    if (autoQuick) window.history.replaceState(null, "", window.location.pathname);
  }, [autoQuick]);

  if (!st.profile || editProf) {
    return (
      <Survey
        init={st.profile}
        onDone={(p: Profile) => {
          up((s) => ({ ...s, profile: p }));
          setEditProf(false);
        }}
        onCancel={st.profile ? () => setEditProf(false) : null}
      />
    );
  }

  if (run?.kind === "session") return <Session key={run.key} st={st} lang={lang} plan={run.plan} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "vocab") return <VocabSession key={run.key} st={st} lang={lang} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "note") return <NoteEditor key={run.key} st={st} lang={lang} id={run.id} up={up} onClose={() => setRun(null)} />;
  if (run?.kind === "nreview") return <NoteReview key={run.key} st={st} lang={lang} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "flash") return <FlashReview key={run.key} st={st} lang={lang} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "vflash") return <VocabFlashReview key={run.key} st={st} lang={lang} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "peek") return <QuickPeekGrammar key={run.key} st={st} lang={lang} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "vpeek") return <QuickPeekVocab key={run.key} st={st} lang={lang} up={up} onExit={() => setRun(null)} />;
  if (run?.kind === "cram") return <CramQuiz key={run.key} st={st} lang={lang} onExit={() => setRun(null)} />;
  if (run?.kind === "exam")
    return (
      <Exam
        key={run.key}
        st={st}
        lang={lang}
        up={up}
        onExit={() => setRun(null)}
        startReview={(ids) => setRun({ kind: "session", key: Date.now(), plan: ids.map((id) => ({ id, mode: "review" })) })}
      />
    );

  const startRoutine = () => {
    const due = dueList(st.prog[lang], lang, today()).slice(0, 4).map((p) => ({ id: p.id, mode: "review" as const }));
    const nw = nextNew(st.prog[lang], lang, st.profile?.jstart);
    const plan = [...(nw ? [{ id: nw.id, mode: "new" as const }] : []), ...due];
    if (plan.length) setRun({ kind: "session", key: Date.now(), plan });
  };
  const openPoint = (id: string) => setRun({ kind: "session", key: Date.now(), plan: [{ id, mode: st.prog[lang][id] ? "study" : "new" }] });

  return (
    <>
      <header className="top">
        <div className="wrap topin">
          <div className="brand">
            내 생활 <b>문법</b>
          </div>
          <div className="langsw" role="group" aria-label="공부할 언어">
            {(["en", "ja"] as const).map((l) => (
              <button type="button" key={l} aria-pressed={lang === l} onClick={() => up((s) => ({ ...s, lang: l }))}>
                {l === "en" ? "EN" : "日本語"}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="wrap main">
        {tab === "today" && (
          <Today
            st={st}
            lang={lang}
            start={startRoutine}
            openPoint={openPoint}
            goExam={() => setRun({ kind: "exam", key: Date.now() })}
            goVocab={() => setRun({ kind: "vocab", key: Date.now() })}
            goNote={() => setTab("note")}
            goFlash={() => setRun({ kind: "flash", key: Date.now() })}
            goPeekGrammar={() => setRun({ kind: "peek", key: Date.now() })}
            goPeekVocab={() => setRun({ kind: "vpeek", key: Date.now() })}
            goCram={() => setRun({ kind: "cram", key: Date.now() })}
          />
        )}
        {tab === "grammar" && (
          <GrammarList key={gq} initQ={gq} st={st} lang={lang} up={up} openPoint={openPoint} startFlash={() => setRun({ kind: "flash", key: Date.now() })} />
        )}
        {tab === "vocab" && (
          <VocabTab st={st} lang={lang} up={up} start={() => setRun({ kind: "vocab", key: Date.now() })} startFlash={() => setRun({ kind: "vflash", key: Date.now() })} />
        )}
        {tab === "note" && (
          <NoteTab
            st={st}
            lang={lang}
            up={up}
            openNote={(id) => setRun({ kind: "note", id, key: Date.now() })}
            startReview={() => setRun({ kind: "nreview", key: Date.now() })}
            openGrammar={(q) => {
              setGq(q);
              setTab("grammar");
            }}
          />
        )}
        {tab === "exam" && <ExamHome st={st} lang={lang} start={() => setRun({ kind: "exam", key: Date.now() })} />}
        {tab === "me" && <Me st={st} up={up} edit={() => setEditProf(true)} sync={sync} />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      <QuickNote st={st} up={up} autoOpen={autoQuick} />
    </>
  );
}
