import { plain } from "./ruby";
import type { Lang } from "../types";

export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

export function loadVoices(): SpeechSynthesisVoice[] {
  if (!canSpeak) return [];
  try {
    return window.speechSynthesis.getVoices() ?? [];
  } catch {
    return [];
  }
}

export function langVoices(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice[] {
  const prefix = lang === "ja" ? "ja" : "en";
  return voices.filter((v) => (v.lang || "").toLowerCase().replace("_", "-").startsWith(prefix));
}

/** 사람 목소리에 가까운 음성(Natural/Neural/Online/Premium/Enhanced/Google)에 높은 점수. */
export function voiceScore(v: SpeechSynthesisVoice, lang: Lang): number {
  const n = (v.name || "").toLowerCase();
  let s = 0;
  if (/natural|neural/.test(n)) s += 60;
  if (/online/.test(n)) s += 25;
  if (/premium|enhanced|siri/.test(n)) s += 45;
  if (/google/.test(n)) s += 30;
  if (lang === "en" && /en-us/i.test((v.lang || "").replace("_", "-"))) s += 8;
  if (/compact|espeak|novelty|zarvox|whisper|bad news|bells|bubbles|cellos|jester|organ|trinoids|albert|fred/.test(n)) s -= 80;
  if (v.localService === false) s += 5;
  return s;
}

export function bestVoice(voices: SpeechSynthesisVoice[], lang: Lang, preferredName?: string): SpeechSynthesisVoice | null {
  const list = langVoices(voices, lang);
  if (!list.length) return null;
  const chosen = preferredName && list.find((v) => v.name === preferredName);
  if (chosen) return chosen;
  return [...list].sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang))[0];
}

export interface SpeakOptions {
  rate?: number;
  voiceName?: string;
}

export function speak(text: string, lang: Lang, opts: SpeakOptions = {}): void {
  if (!canSpeak) return;
  try {
    const u = new SpeechSynthesisUtterance(plain(text));
    u.lang = lang === "ja" ? "ja-JP" : "en-US";
    const v = bestVoice(loadVoices(), lang, opts.voiceName);
    if (v) u.voice = v;
    u.rate = opts.rate ?? 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* 음성 합성 미지원 기기는 조용히 무시 */
  }
}
