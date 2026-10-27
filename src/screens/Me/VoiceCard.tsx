import { useEffect, useState } from "react";
import { bestVoice, canSpeak, langVoices, loadVoices, speak, voiceScore } from "../../lib/speech";
import type { AppState, Lang } from "../../types";

const SAMPLE: Record<Lang, string> = { en: "I have worked at this store for six months.", ja: "少々お待ちください。すぐにご案内いたします。" };

export function VoiceCard({ st, up }: { st: AppState; up: (fn: (s: AppState) => AppState) => void }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!canSpeak) return;
    const f = () => {
      loadVoices();
      force((x) => x + 1);
    };
    window.speechSynthesis.addEventListener("voiceschanged", f);
    const t = setTimeout(f, 600);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", f);
      clearTimeout(t);
    };
  }, []);

  if (!canSpeak) return null;
  const pref = { rate: 0.92, ...st.voice };
  const set = (p: Partial<NonNullable<AppState["voice"]>>) => up((s) => ({ ...s, voice: { ...s.voice, ...p } }));

  const row = (lang: Lang) => {
    const list = [...langVoices(loadVoices(), lang)].sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang));
    const cur = bestVoice(loadVoices(), lang, pref[lang]);
    return (
      <div className="vrow" key={lang}>
        <span className="vl">{lang === "en" ? "영어" : "일본어"}</span>
        {list.length ? (
          <select id={"voice-" + lang} className="sel" value={cur ? cur.name : ""} onChange={(e) => set({ [lang]: e.target.value })}>
            {list.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name.replace(/Microsoft |Google /, "")}
                {voiceScore(v, lang) >= 40 ? " ★" : ""}
              </option>
            ))}
          </select>
        ) : (
          <span className="sub" style={{ flex: 1 }}>
            이 기기에 {lang === "en" ? "영어" : "일본어"} 음성이 없어요
          </span>
        )}
        <button type="button" className="btn sm" disabled={!list.length} onClick={() => speak(SAMPLE[lang], lang, { rate: pref.rate, voiceName: pref[lang] })}>
          듣기
        </button>
      </div>
    );
  };

  return (
    <section className="card">
      <span className="eyebrow">발음 · 표시</span>
      {row("en")}
      {row("ja")}
      <div className="vrow">
        <span className="vl">후리가나</span>
        <div className="chips">
          {(
            [
              [true, "한자 위에 표시"],
              [false, "숨기기"],
            ] as const
          ).map(([v, l]) => (
            <button type="button" key={l} className="chip" aria-pressed={(st.furi !== false) === v} onClick={() => up((s) => ({ ...s, furi: v }))}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="vrow">
        <span className="vl">속도</span>
        <div className="chips">
          {(
            [
              [0.8, "느리게"],
              [0.92, "보통"],
              [1.05, "빠르게"],
            ] as const
          ).map(([r, l]) => (
            <button type="button" key={r} className="chip" aria-pressed={pref.rate === r} onClick={() => set({ rate: r })}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <p className="hint">
        ★는 사람 목소리에 가까운 고품질 음성이에요. 목소리는 쓰는 기기·브라우저에 설치된 것만 나와요. 가장 자연스러운 건 <b>Edge</b>의 'Natural' 음성, <b>아이폰·맥</b>은 설정
        › 손쉬운 사용 › 읽기 및 말하기에서 '향상된/고품질' 음성을 내려받으면 여기에 나타나요.
      </p>
    </section>
  );
}
