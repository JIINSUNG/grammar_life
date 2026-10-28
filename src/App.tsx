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
import { TabBar } from "./components/TabBar";
import { QuickNote } from "./components/QuickNote";
import { blankState, load, requestPersistentStorage, save } from "./lib/storage";
import { today } from "./lib/date";
import { dueList, nextNew } from "./lib/srs";
import type { AppState, Profile } from "./types";

type Run =
  | { kind: "session"; key: number; plan: SessionPlanItem[] }
  | { kind: "vocab"; key: number }
  | { kind: "note"; key: number; id: string }
  | { kind: "nreview"; key: number }
  | { kind: "exam"; key: number }
  | { kind: "flash"; key: number }
  | { kind: "vflash"; key: number }
  | null;

export default function App() {
  const [st, setSt] = useState<AppState>(() => load() ?? blankState());
  const up = (fn: (s: AppState) => AppState) =>
    setSt((p) => {
      const n = fn(p);
      save(n);
      return n;
    });
  const [gq, setGq] = useState("");
  const [tab, setTab] = useState("today");
  const [run, setRun] = useState<Run>(null);
  const [editProf, setEditProf] = useState(false);
  const lang = st.lang;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, run]);

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
        {tab === "me" && <Me st={st} up={up} edit={() => setEditProf(true)} />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      <QuickNote st={st} up={up} autoOpen={autoQuick} />
    </>
  );
}
