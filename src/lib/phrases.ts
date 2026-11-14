// 여행 멘트 도우미 — {n}(인원) 채우기, 검색, 즐겨찾기 저장.
// 즐겨찾기는 앱 상태(grammar-life:v1)의 구조를 건드리지 않으려고 별도 키에 둔다(CLAUDE.md 원칙 2).
import { PARTY, type PhraseCat, type TravelPhrase } from "../data/travel-phrases";
import { plain } from "./ruby";

export const PARTY_MIN = 1;
export const PARTY_MAX = 6;
const FAV_KEY = "grammar-life-phrase-favs:v1";

export function hasSlot(p: TravelPhrase): boolean {
  return p.ko.includes("{n}") || p.ja.includes("{n}") || p.en.includes("{n}");
}

/** 인원 수를 언어별 표현으로 채운 문장. */
export function fillPhrase(p: TravelPhrase, n: number): { ko: string; ja: string; en: string } {
  const party = PARTY[Math.min(PARTY_MAX, Math.max(PARTY_MIN, Math.round(n)))];
  return { ko: p.ko.replaceAll("{n}", party.ko), ja: p.ja.replaceAll("{n}", party.ja), en: p.en.replaceAll("{n}", party.en) };
}

/** 한국어·일본어(읽기 포함)·영어·요령에서 찾는다. 대소문자 무시. */
export function searchPhrases(list: TravelPhrase[], q: string, cat: PhraseCat | "fav" | "all", favs: string[]): TravelPhrase[] {
  const query = q.trim().toLowerCase();
  return list.filter((p) => {
    if (cat === "fav" && !favs.includes(p.id)) return false;
    if (cat !== "fav" && cat !== "all" && p.cat !== cat) return false;
    if (!query) return true;
    const reading = p.ja.replace(/｜[^《]+《([^》]+)》/g, "$1");
    return [p.ko, plain(p.ja), reading, p.en, p.tip ?? ""].some((t) => t.toLowerCase().includes(query));
  });
}

export function loadFavs(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveFavs(ids: string[]): void {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch {
    // 저장 못 하는 환경(시크릿 모드 등) — 이번 화면에서만 유지
  }
}

export function toggleFav(favs: string[], id: string): string[] {
  return favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
}
