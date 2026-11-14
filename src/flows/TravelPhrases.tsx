// 여행 회화 멘트 — 한국어·일본어·영어를 한 화면에서. 인원 수를 고르면 "2명인데…"같은 문장이 바로 바뀌고,
// "크게 보기"로 점원에게 화면을 그대로 보여줄 수 있다. 즐겨찾기는 이 기기에만(별도 키) 저장.
import { useState } from "react";
import { PHRASE_CATS, TRAVEL_PHRASES, type PhraseCat, type TravelPhrase } from "../data/travel-phrases";
import { fillPhrase, hasSlot, loadFavs, PARTY_MAX, PARTY_MIN, saveFavs, searchPhrases, toggleFav } from "../lib/phrases";
import { plain } from "../lib/ruby";
import { Ruby } from "../components/Ruby";
import { Speak } from "../components/Speak";
import type { AppState } from "../types";

type Filter = PhraseCat | "fav" | "all";
const PARTY_KEY = "grammar-life-phrase-party:v1";

function loadParty(): number {
  try {
    const n = Number(localStorage.getItem(PARTY_KEY));
    return n >= PARTY_MIN && n <= PARTY_MAX ? n : 2;
  } catch {
    return 2;
  }
}

export function TravelPhrases({ st, onExit }: { st: AppState; onExit: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>(() => loadFavs());
  const [party, setPartyRaw] = useState(loadParty);
  const [big, setBig] = useState<{ p: TravelPhrase; lang: "ja" | "en" } | null>(null);
  const furi = st.furi !== false;

  const setParty = (n: number) => {
    const v = Math.min(PARTY_MAX, Math.max(PARTY_MIN, n));
    setPartyRaw(v);
    try {
      localStorage.setItem(PARTY_KEY, String(v));
    } catch {
      /* 저장 못 해도 이번 화면에선 유지 */
    }
  };
  const fav = (id: string) => {
    const next = toggleFav(favs, id);
    setFavs(next);
    saveFavs(next);
  };

  const list = searchPhrases(TRAVEL_PHRASES, q, filter, favs);
  const tabs: [Filter, string][] = [["all", "전체"], ...(favs.length ? [["fav", `⭐ ${favs.length}`] as [Filter, string]] : []), ...PHRASE_CATS.map((c) => [c.id, `${c.icon} ${c.label}`] as [Filter, string])];

  if (big) {
    const f = fillPhrase(big.p, party);
    const text = big.lang === "ja" ? f.ja : f.en;
    return (
      <main className="wrap main sess" style={{ minHeight: "100dvh", justifyContent: "center" }}>
        <section className="card" style={{ gap: 18, padding: "28px 20px", textAlign: "center", alignItems: "center" }}>
          <span className="eyebrow">{f.ko}</span>
          <p className={big.lang === "ja" ? "ja" : undefined} style={{ margin: 0, fontSize: big.lang === "ja" ? 30 : 28, lineHeight: 1.7, fontWeight: 700, wordBreak: "keep-all", overflowWrap: "anywhere" }}>
            {big.lang === "ja" ? <Ruby text={text} furi={furi} /> : text}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Speak text={plain(text)} lang={big.lang} voice={st.voice} />
            <button type="button" className="btn sm" onClick={() => setBig({ ...big, lang: big.lang === "ja" ? "en" : "ja" })}>
              {big.lang === "ja" ? "English로 보기" : "日本語로 보기"}
            </button>
          </div>
        </section>
        <button type="button" className="btn wide" onClick={() => setBig(null)}>
          돌아가기
        </button>
      </main>
    );
  }

  return (
    <main className="wrap main sess">
      <div className="sbar">
        <button type="button" className="link" onClick={onExit} aria-label="닫기">
          ✕
        </button>
        <b style={{ flex: 1, fontSize: 16 }}>✈️ 여행 회화 멘트</b>
        <span className="sub">{TRAVEL_PHRASES.length}개</span>
      </div>

      <section className="card" style={{ gap: 8, padding: "12px 14px" }}>
        <div className="rh">
          <span style={{ fontSize: 14, fontWeight: 600 }}>몇 명이서 가요?</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" className="btn sm" onClick={() => setParty(party - 1)} disabled={party <= PARTY_MIN} aria-label="인원 줄이기">
              −
            </button>
            <b style={{ minWidth: 36, textAlign: "center", fontSize: 16 }} aria-live="polite">
              {party}명
            </b>
            <button type="button" className="btn sm" onClick={() => setParty(party + 1)} disabled={party >= PARTY_MAX} aria-label="인원 늘리기">
              +
            </button>
          </div>
        </div>
        <p className="hint" style={{ fontSize: 12.5 }}>
          &ldquo;{fillPhrase(TRAVEL_PHRASES.find((p) => p.id === "f1")!, party).ko}&rdquo;처럼 인원이 들어간 멘트가 바로 바뀌어요.
        </p>
      </section>

      <input className="inp search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 숙박세, 계산, tax, いくら…" aria-label="멘트 검색" />

      <div className="chips" style={{ flexWrap: "nowrap", overflowX: "auto", paddingBottom: 2, marginInline: -2 }}>
        {tabs.map(([k, l]) => (
          <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)} style={{ flexShrink: 0 }}>
            {l}
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="hint center">{filter === "fav" ? "⭐를 눌러 자주 쓸 멘트를 모아두세요." : "찾는 멘트가 없어요."}</p>}

      {list.map((p) => {
        const f = fillPhrase(p, party);
        const isFav = favs.includes(p.id);
        return (
          <section key={p.id} className="card" style={{ gap: 8, padding: "14px" }}>
            <div className="rh" style={{ alignItems: "flex-start" }}>
              <b style={{ fontSize: 15.5, lineHeight: 1.4 }}>
                {f.ko}
                {hasSlot(p) && (
                  <span className="sub" style={{ fontWeight: 400, fontSize: 11.5 }}>
                    {" "}
                    · 인원 반영
                  </span>
                )}
              </b>
              <button
                type="button"
                onClick={() => fav(p.id)}
                aria-pressed={isFav}
                aria-label={isFav ? "즐겨찾기 빼기" : "즐겨찾기"}
                style={{ background: "none", border: 0, fontSize: 20, lineHeight: 1, padding: 2, opacity: isFav ? 1 : 0.35, flexShrink: 0 }}
              >
                ⭐
              </button>
            </div>
            <PhraseLine flag="🇯🇵" text={f.ja} lang="ja" st={st} furi={furi} onBig={() => setBig({ p, lang: "ja" })} />
            <PhraseLine flag="🇺🇸" text={f.en} lang="en" st={st} furi={furi} onBig={() => setBig({ p, lang: "en" })} />
            {p.tip && (
              <p className="hint" style={{ fontSize: 12.5 }}>
                💡 {p.tip}
              </p>
            )}
          </section>
        );
      })}
    </main>
  );
}

function PhraseLine({ flag, text, lang, st, furi, onBig }: { flag: string; text: string; lang: "ja" | "en"; st: AppState; furi: boolean; onBig: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--field)", borderRadius: 12, padding: "8px 10px" }}>
      <span aria-hidden style={{ fontSize: 15 }}>
        {flag}
      </span>
      <button
        type="button"
        onClick={onBig}
        aria-label={`크게 보기: ${plain(text)}`}
        className={lang === "ja" ? "ja" : undefined}
        style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: 0, padding: 0, fontSize: 15, lineHeight: lang === "ja" && furi ? 2 : 1.5, color: "var(--ink)" }}
      >
        {lang === "ja" ? <Ruby text={text} furi={furi} /> : text}
      </button>
      <Speak text={plain(text)} lang={lang} voice={st.voice} />
    </div>
  );
}
