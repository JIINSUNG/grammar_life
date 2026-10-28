import { useState } from "react";
import { VWord } from "../components/VWord";
import { today } from "../lib/date";
import { canSpeak, speak } from "../lib/speech";
import { VOCAB, VTRACKS, starredVocab, vDue, vNew, vTrack } from "../lib/srs";
import { MNEMONICS_SEED_JA } from "../data/mnemonics-seed";
import { VERB_PAIRS, VERB_PAIR_GROUPS } from "../data/verb-pairs";
import type { AppState, Lang } from "../types";

const TRACK_LABEL: Record<string, string> = { 토익: "토익 빈출", 기초: "기초 생활", 접객: "매장·접객", 여행: "여행 회화" };

function VerbPairs() {
  const [open, setOpen] = useState(false);
  return (
    <section className="card">
      <button type="button" className="rh" style={{ width: "100%", textAlign: "left", background: "none" }} onClick={() => setOpen(!open)}>
        <span className="eyebrow">헷갈리는 자동사·타동사</span>
        <span className="link">{open ? "접기" : "펼치기"}</span>
      </button>
      {open && (
        <>
          <p className="hint" style={{ margin: 0 }}>
            둘 다 외우려 하지 말고, 아래 패턴 규칙부터 기억하면 훨씬 쉬워요.
          </p>
          {VERB_PAIR_GROUPS.map((g) => {
            const pairs = VERB_PAIRS.filter((p) => p.group === g.id);
            return (
              <div key={g.id} className="box" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <b style={{ fontSize: 14 }}>{g.title}</b>
                <p className="hint" style={{ margin: 0 }}>
                  {g.rule}
                </p>
                {pairs.map((p) => (
                  <div key={p.id} className="wk" style={{ gridTemplateColumns: "1fr 1fr", fontSize: 13 }}>
                    <span>
                      <b className="ja">{p.intr.w}</b>({p.intr.r}) <small className="sub">{p.intr.m}</small>
                    </span>
                    <span>
                      <b className="ja">{p.tr.w}</b>({p.tr.r}) <small className="sub">{p.tr.m}</small>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}

export function VocabTab({
  st,
  lang,
  up,
  start,
  startFlash,
}: {
  st: AppState;
  lang: Lang;
  up: (fn: (s: AppState) => AppState) => void;
  start: () => void;
  startFlash: () => void;
}) {
  const pr = st.vprog[lang];
  const tr = vTrack(st.vtrack[lang], st.profile?.jstart, lang);
  const t = today();
  const [lvF, setLvF] = useState("all");
  const [q, setQ] = useState("");
  const [more, setMore] = useState(60);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const vn = vNew(pr, lang, tr).length;
  const vd = vDue(pr, lang, t).length;
  const starred = starredVocab(pr, lang).length;
  const stat = VTRACKS[lang].map((l) => {
    const ws = VOCAB[lang].filter((w) => w.lv === l);
    return [l, ws.filter((w) => (pr[w.id]?.box || 0) >= 3).length, ws.filter((w) => pr[w.id]).length, ws.length] as const;
  });
  const ql = q.trim().toLowerCase();
  const list = VOCAB[lang].filter((w) => (lvF === "all" || w.lv === lvF) && (!ql || (w.w + " " + w.r + " " + w.m).toLowerCase().includes(ql)));
  const vSay = (w: (typeof VOCAB)[Lang][number]) => speak(lang === "ja" ? w.r || w.w : w.w, lang, { rate: st.voice?.rate, voiceName: st.voice?.[lang] });

  const toggleStar = (id: string) =>
    up((s) => {
      const g = s.vprog[lang][id];
      if (!g) return s;
      return { ...s, vprog: { ...s.vprog, [lang]: { ...s.vprog[lang], [id]: { ...g, starred: !g.starred } } } };
    });

  const saveMnemonic = (id: string) => {
    up((s) => ({ ...s, mnemonics: { ...s.mnemonics, [id]: draft.trim() } }));
    setEditingId(null);
    setDraft("");
  };

  return (
    <>
      <h1 className="ptitle">
        {lang === "en" ? "영어" : "일본어"} 자주 쓰는 단어 {VOCAB[lang].length}개
      </h1>
      {starred > 0 && (
        <section className="card routine">
          <div className="rh">
            <div>
              <span className="eyebrow">⭐ 어렵다고 표시한 단어</span>
              <h2>{starred}개 집중 복습</h2>
            </div>
          </div>
          <p className="sub">Anki 카드처럼, 뜻을 떠올려보고 뒤집어서 확인한 뒤 얼마나 기억났는지 평가해요.</p>
          <button type="button" className="btn pri wide" onClick={startFlash}>
            집중 복습 시작
          </button>
        </section>
      )}
      <section className="card routine">
        <div className="rh">
          <div>
            <span className="eyebrow">오늘의 단어 · {lang === "en" ? "English" : "日本語"}</span>
            <h2>{vn || vd ? `새 단어 ${vn}개 · 복습 ${Math.min(vd, 20)}개` : "오늘 단어 공부 끝!"}</h2>
          </div>
        </div>
        <p className="sub">새 단어는 카드로 먼저 보고, 뜻 고르기 → 확신도 체크로 확인해요. 2단계부터는 뜻을 보고 단어를 고르는 거꾸로 문제가 나와요.</p>
        <button type="button" className="btn pri wide" disabled={!vn && !vd} onClick={start}>
          단어 루틴 시작
        </button>
      </section>
      {lang === "ja" && <VerbPairs />}
      <section className="card">
        <span className="eyebrow">새 단어는 어디서 가져올까요</span>
        <div className="chips">
          {VTRACKS[lang].map((l) => (
            <button type="button" key={l} className="chip" aria-pressed={tr === l} onClick={() => up((s) => ({ ...s, vtrack: { ...s.vtrack, [lang]: l } }))}>
              {TRACK_LABEL[l] || l}
            </button>
          ))}
        </div>
        <p className="hint">그 레벨을 다 배우면 다음 레벨에서 이어서 가져와요.</p>
      </section>
      <section className="card lvcard">
        {stat.map(([l, m, , n]) => (
          <div className="lvrow" key={l}>
            <b>{l}</b>
            <div className="bar">
              <div style={{ width: (m / n) * 100 + "%" }} />
            </div>
            <small className="num sub">
              {m}/{n}
            </small>
          </div>
        ))}
        <p className="hint">복습 3단계 이상이면 익힌 단어로 세요.</p>
      </section>
      <div className="chips">
        {[["all", "전체"] as const, ...VTRACKS[lang].map((l) => [l, l] as const)].map(([k, l]) => (
          <button
            type="button"
            key={k}
            className="chip"
            aria-pressed={lvF === k}
            onClick={() => {
              setLvF(k);
              setMore(60);
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <input
        id="v-search"
        className="inp search"
        placeholder={lang === "ja" ? "단어·읽기·뜻 검색 (예: 在庫, ざいこ, 재고)" : "단어·뜻 검색 (예: refund, 환불)"}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setMore(60);
        }}
      />
      <div className="plist">
        {list.slice(0, more).map((w) => {
          const g = pr[w.id];
          const due = g && g.due <= t;
          const mnemonic = st.mnemonics?.[w.id] || (lang === "ja" ? MNEMONICS_SEED_JA[w.id] : undefined);
          const editing = editingId === w.id;
          return (
            <div key={w.id} className="card prow vrowc" style={{ flexWrap: "wrap" }}>
              {g && (
                <button
                  type="button"
                  className="link"
                  style={{ fontSize: 18, flexShrink: 0, background: "none" }}
                  aria-pressed={!!g.starred}
                  aria-label={g.starred ? "어렵다고 표시 해제" : "어렵다고 표시"}
                  onClick={() => toggleStar(w.id)}
                >
                  <span style={{ color: g.starred ? "var(--mark)" : "var(--muted)" }}>{g.starred ? "★" : "☆"}</span>
                </button>
              )}
              <div className="pmain">
                <b>
                  <VWord w={w} furi={st.furi} />
                </b>
                <small className="sub">
                  {w.m}
                  {w.r && !/[一-鿿々]/.test(w.w) ? "" : w.r && st.furi === false ? " · " + w.r : ""}
                </small>
              </div>
              <div className="pside">
                <div className="boxes" aria-label={"복습 " + (g?.box || 0) + "단계"}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className={g && g.box >= i ? "on" : ""} />
                  ))}
                </div>
                <small className={due ? "due" : "sub"}>{!g ? w.lv + " · 새 단어" : due ? "오늘 복습" : g.box >= 5 ? "익힘" : g.due.slice(5).replace("-", "/") + " 복습"}</small>
              </div>
              {canSpeak && (
                <button type="button" className="spk" aria-label="발음 듣기" onClick={() => vSay(w)}>
                  <svg viewBox="0 0 20 20" width={18} height={18} aria-hidden="true">
                    <path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor" />
                    <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {!editing && (
                <div style={{ flexBasis: "100%", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {mnemonic ? (
                    <small className="sub" style={{ flex: 1 }}>
                      💡 {mnemonic}
                    </small>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="link sm"
                    onClick={() => {
                      setEditingId(w.id);
                      setDraft(st.mnemonics?.[w.id] ?? "");
                    }}
                  >
                    {mnemonic ? "수정" : "+ 연상 힌트 적기"}
                  </button>
                </div>
              )}
              {editing && (
                <div style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                  <textarea
                    className="inp ta"
                    rows={2}
                    placeholder="예) 猿(さる,원숭이) → '사루'처럼 들려서, 원숭이가 야구장에서 춤추는 모습을 떠올려요"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" className="btn sm" onClick={() => setEditingId(null)}>
                      취소
                    </button>
                    <button type="button" className="btn pri sm" onClick={() => saveMnemonic(w.id)}>
                      저장
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {list.length > more && (
        <button type="button" className="btn wide" onClick={() => setMore(more + 60)}>
          더 보기 ({list.length - more}개 남음)
        </button>
      )}
      {!list.length && <p className="hint center">찾는 단어가 없어요.</p>}
    </>
  );
}
