import { useState } from "react";
import { VWord } from "../components/VWord";
import { Speak } from "../components/Speak";
import { today } from "../lib/date";
import { gradeFlash, starredVocab } from "../lib/srs";
import { shuffle } from "../lib/util";
import { MNEMONICS_SEED_JA } from "../data/mnemonics-seed";
import type { AppState, FlashRating, Lang } from "../types";

const RATE_BTN: [FlashRating, string, string][] = [
  ["again", "다시", "conf-guess"],
  ["hard", "어려움", "conf-unsure"],
  ["good", "좋음", "conf-sure"],
  ["easy", "쉬움", "conf-sure"],
];

/** 어렵다고 표시(⭐)해둔 단어만 Anki 카드처럼 돌려보는 집중 복습. */
export function VocabFlashReview({ st, lang, up, onExit }: { st: AppState; lang: Lang; up: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const [list] = useState(() => shuffle(starredVocab(st.vprog[lang], lang)));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState<FlashRating[]>([]);
  const [ended, setEnded] = useState(false);

  const rate = (r: FlashRating) => {
    const w = list[i];
    const t = today();
    up((s) => ({ ...s, vprog: { ...s.vprog, [lang]: { ...s.vprog[lang], [w.id]: gradeFlash(s.vprog[lang][w.id], r, t) } } }));
    setRated((a) => [...a, r]);
    setFlipped(false);
    if (i + 1 >= list.length) setEnded(true);
    else setI(i + 1);
  };

  const unstar = (id: string) => {
    up((s) => {
      const g = s.vprog[lang][id];
      if (!g) return s;
      return { ...s, vprog: { ...s.vprog, [lang]: { ...s.vprog[lang], [id]: { ...g, starred: false } } } };
    });
  };

  if (!list.length || ended) {
    return (
      <main className="wrap main sess">
        <section className="card result">
          <span className="eyebrow">단어 집중 복습</span>
          <h1>
            {rated.filter((r) => r === "good" || r === "easy").length}
            <small>/ {rated.length}</small>
          </h1>
          <p className="sub">{list.length ? "이번에 쉬움·좋음으로 넘긴 카드" : "⭐ 표시해둔 어려운 단어가 아직 없어요."}</p>
          {!list.length && <p className="hint">단어 목록에서 외우기 어려운 단어 옆 ⭐을 눌러두면 여기서 계속 복습할 수 있어요.</p>}
          <button type="button" className="btn pri wide" onClick={onExit}>
            {list.length ? "완료" : "닫기"}
          </button>
        </section>
      </main>
    );
  }

  const w = list[i];
  const mnemonic = st.mnemonics?.[w.id] || (lang === "ja" ? MNEMONICS_SEED_JA[w.id] : undefined);

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
            <span className="eyebrow">⭐ 어렵다고 표시한 단어</span>
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
            <div className="confs" style={{ gridTemplateColumns: "repeat(4,1fr)", alignSelf: "stretch" }}>
              {RATE_BTN.map(([r, l, c]) => (
                <button type="button" key={r} className={"btn " + c} onClick={() => rate(r)}>
                  {l}
                </button>
              ))}
            </div>
            <button type="button" className="link sm" onClick={() => unstar(w.id)}>
              이제 안 어려워요 (⭐ 해제)
            </button>
          </>
        )}
      </section>
    </main>
  );
}
