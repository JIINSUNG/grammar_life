import { canSpeak, speak } from "../lib/speech";
import type { Lang, VoicePref } from "../types";

export function Speak({ text, lang, voice }: { text: string; lang: Lang; voice?: VoicePref }) {
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className="spk"
      aria-label="발음 듣기"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, lang, { rate: voice?.rate, voiceName: voice?.[lang] });
      }}
    >
      <svg viewBox="0 0 20 20" width={18} height={18} aria-hidden="true">
        <path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor" />
        <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
