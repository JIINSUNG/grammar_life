import type { VocabWord } from "../types";

const RSPLIT = /(\{[^}]+\}|\[|\])/;

/** POINTS.ja 등의 문장에서 {}/[] 조각은 그대로 두고, 나머지 조각만 ruby 사전으로 치환한다. */
export function rubify(s: string, ruby: Record<string, string>): string {
  if (typeof s !== "string") return s;
  return s
    .split(RSPLIT)
    .map((x) => ruby[x] ?? x)
    .join("");
}

/** ｜漢字《かな》 표기를 읽기 없는 평문으로 되돌린다 (TTS에 넘길 때 씀). */
export function plain(s: string): string {
  return String(s).replace(/｜([^《]+)《[^》]+》/g, "$1");
}

export interface RubyPart {
  text: string;
  reading?: string;
}

/** 렌더용 분해: "안｜乗《の》る다" 같은 문자열을 일반 텍스트/루비 조각으로 쪼갠다. */
export function splitRuby(text: string): RubyPart[] {
  const t = String(text);
  if (t.indexOf("《") < 0) return [{ text: t }];
  return t.split(/(｜[^《]+《[^》]+》)/).map((x) => {
    const m = x.match(/^｜([^《]+)《([^》]+)》$/);
    return m ? { text: m[1], reading: m[2] } : { text: x };
  });
}

const kataToHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const KJ = /[一-鿿々]/;

/** 단어+읽기 → ｜漢字《かな》 (오쿠리가나는 한자 뒤에 남겨두고, 한자 부분에만 붙임). r/w에 한자가 없으면 그대로 반환. */
export function vruby(w: string, r: string): string {
  if (!r || !KJ.test(w)) return w;
  const parts = w.match(/[一-鿿々]+|[^一-鿿々]+/g);
  if (!parts) return w;
  const re = new RegExp("^" + parts.map((p) => (KJ.test(p) ? "(.+?)" : kataToHira(p).replace(/[.*+?^$(){}|[\]\\]/g, "\\$&"))).join("") + "$");
  const m = kataToHira(r).match(re);
  if (!m) return "｜" + w + "《" + r + "》";
  let gi = 1;
  return parts.map((p) => (KJ.test(p) ? "｜" + p + "《" + m[gi++] + "》" : p)).join("");
}

/** VOCAB_JA/VOCAB_EN 둘 다에 써도 안전 (영어 단어는 r이 "" 라서 vruby가 그대로 w를 돌려줌). */
export function withRuby<T extends VocabWord>(words: T[]): (T & { rw: string })[] {
  return words.map((w) => ({ ...w, rw: vruby(w.w, w.r) }));
}
