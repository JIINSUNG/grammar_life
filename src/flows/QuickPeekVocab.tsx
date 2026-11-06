import { useState } from "react";
import { VWord } from "../components/VWord";
import { Speak } from "../components/Speak";
import { today } from "../lib/date";
import { quickPeekVocab, vTrack } from "../lib/srs";
import { MNEMONICS_SEED_EN, MNEMONICS_SEED_JA } from "../data/mnemonics-seed";
import type { AppState, Lang } from "../types";

/**
 * 손님 없을 때 단어 1~2개만 가볍게 훑어보는 용도. QuickPeekGrammar와 같은 생각 —
 * 채점·확신도 없이 넘겨보기만 하고 vprog를 안 건드린다.
 */
export function QuickPeekVocab({ st, lang, up, onExit }: { st: AppState; lang: Lang; up: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const [list] = useState(() => {
    const track = vTrack(st.vtrack[lang], st.profile?.jstart, lang);
    return quickPeekVocab(st.vprog[lang], lang, track, today(), 2);
  });
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ended, setEnded] = useState(false);

  const next = () => {
    setFlipped(false);
    if (i + 1 >= list.length) setEnded(true);
    else setI(i + 1);
  };

  const toggleStar = (id: string) => {
    up((s) => {
      const g = s.vprog[lang][id];
      if (!g) return s;
      return { ...s, vprog: { ...s.vprog, [lang]: { ...s.vprog[lang], [id]: { ...g, starred: !g.starred } } } };
    });
  };

  if (!list.length || ended) {
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">짬짬이 훑어보기</span>
          <h1 style={{ fontSize: 22 }}>{list.length ? "오늘은 여기까지!" : "훑어볼 단어가 없어요."}</h1>
          <p className="sub">{list.length ? `방금 ${list.length}개 훑어봤어요.` : "먼저 단어를 한 번 공부해보세요."}</p>
          <button type="button" className="btn pri wide" onClick={onExit}>
            닫기
          </button>
        </section>
      </main>
    );
  }

  const w = list[i];
  const g = st.vprog[lang][w.id];
  const mnemonic = st.mnemonics?.[w.id] || (lang === "ja" ? MNEMONICS_SEED_JA[w.id] : MNEMONICS_SEED_EN[w.id]);

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
      <section className="card result" style={{ minHeight: 260, justifyContent: "center" }}>
        {!flipped ? (
          <>
            <span className="eyebrow">짬짬이 훑어보기 · {g ? "복습" : "처음 보는 단어"}</span>
            <p className="vmean big">{w.m}</p>
            <button type="button" className="btn pri wide" onClick={() => setFlipped(true)}>
              뒤집어서 확인하기
            </button>
          </>
        ) : (
          <>
            <div className="vhead">
              <VWord w={w} big furi={st.furi} />
              <Speak text={lang === "ja" ? w.r || w.w : w.w} lang={lang} voice={st.voice} />
            </div>
            {w.r && w.r !== w.w && <p className="vread ja">{w.r}</p>}
            <p className="why">{w.m}</p>
            {mnemonic && (
              <div className="box" style={{ textAlign: "left", background: "var(--field)" }}>
                <span className="eyebrow">💡 연상 힌트</span>
                <p className="hint" style={{ margin: 0 }}>
                  {mnemonic}
                </p>
              </div>
            )}
            <button type="button" className="btn pri wide" onClick={next}>
              {i + 1 >= list.length ? "끝내기" : "다음"}
            </button>
            {g && (
              <button type="button" className="link sm" onClick={() => toggleStar(w.id)}>
                {g.starred ? "⭐ 어렵다고 표시 해제" : "☆ 어렵다고 표시"}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
