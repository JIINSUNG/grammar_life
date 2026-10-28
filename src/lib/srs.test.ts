import { describe, expect, it } from "vitest";
import { INTERVAL, POINTS, VOCAB, dueStarredPoints, dueStarredVocab, gradeFlash, gradePoint, starredPoints, starredVocab, vOpts } from "./srs";
import { addDays } from "./date";

describe("gradePoint", () => {
  it("개념 확인 통과 + 확실히 맞힌 비율 75% 이상이면 통과, 상자 +1", () => {
    const g = gradePoint({ box: 1, ok: 0, tot: 0, due: "2026-01-01" }, { concept: true, solid: 3, tot: 4, lucky: 0 }, "2026-01-01");
    expect(g.lastPass).toBe(true);
    expect(g.box).toBe(2);
    expect(g.due).toBe("2026-01-03"); // INTERVAL[2] = 2일
  });

  it("개념 확인을 틀리면 확실히 다 맞혀도 통과 안 함, 상자 1로 리셋", () => {
    const g = gradePoint({ box: 4, ok: 0, tot: 0, due: "2026-01-01" }, { concept: false, solid: 4, tot: 4, lucky: 0 }, "2026-01-01");
    expect(g.lastPass).toBe(false);
    expect(g.box).toBe(1);
    expect(g.due).toBe(addExpected());
    function addExpected() {
      return "2026-01-02"; // INTERVAL[1] = 1일
    }
  });

  it("확실히 맞힌 비율이 75% 미만이면(감으로 맞힌 게 섞이면) 통과 안 함", () => {
    const g = gradePoint(undefined, { concept: true, solid: 2, tot: 4, lucky: 2 }, "2026-01-01");
    expect(g.lastPass).toBe(false);
    expect(g.box).toBe(1);
  });

  it("상자는 5를 넘지 않는다", () => {
    const g = gradePoint({ box: 5, ok: 0, tot: 0, due: "2026-01-01" }, { concept: true, solid: 1, tot: 1, lucky: 0 }, "2026-01-01");
    expect(g.box).toBe(5);
    expect(g.due).toBe("2026-01-16"); // INTERVAL[5] = 15일
  });

  it("INTERVAL 기준선", () => {
    expect(INTERVAL).toEqual([0, 1, 2, 4, 7, 15]);
  });
});

describe("gradeFlash (어렵다고 표시한 문법 카드 복습)", () => {
  it("'다시'를 고르면 상자 1로 리셋되고 오늘 바로 다시 나온다", () => {
    const g = gradeFlash({ box: 4, ok: 0, tot: 0, due: "2026-01-01", starred: true }, "again", "2026-01-10");
    expect(g.box).toBe(1);
    expect(g.due).toBe("2026-01-10");
    expect(g.starred).toBe(true);
  });

  it("'어려움'은 상자를 유지한 채 같은 간격으로 다시 보여준다", () => {
    const g = gradeFlash({ box: 3, ok: 0, tot: 0, due: "2026-01-01" }, "hard", "2026-01-10");
    expect(g.box).toBe(3);
    expect(g.due).toBe(addDays("2026-01-10", INTERVAL[3]));
  });

  it("'좋음'은 상자 +1, '쉬움'은 상자 +2 (최대 5)", () => {
    const good = gradeFlash({ box: 2, ok: 0, tot: 0, due: "2026-01-01" }, "good", "2026-01-10");
    expect(good.box).toBe(3);
    const easy = gradeFlash({ box: 2, ok: 0, tot: 0, due: "2026-01-01" }, "easy", "2026-01-10");
    expect(easy.box).toBe(4);
    const easyCap = gradeFlash({ box: 4, ok: 0, tot: 0, due: "2026-01-01" }, "easy", "2026-01-10");
    expect(easyCap.box).toBe(5);
  });
});

describe("starredPoints / dueStarredPoints", () => {
  it("starred만 돌려주고, 복습 예정일이 빠른 순으로 정렬한다", () => {
    const lang = "en";
    const [p1, p2, p3] = POINTS[lang];
    const prog = {
      [p1.id]: { box: 2, ok: 0, tot: 0, due: "2026-01-05", starred: true },
      [p2.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-02", starred: true },
      [p3.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-01" }, // starred 아님
    };
    const list = starredPoints(prog, lang);
    expect(list.map((p) => p.id)).toEqual([p2.id, p1.id]);
  });

  it("오늘 이전까지만 due 목록에 포함된다", () => {
    const lang = "en";
    const [p1, p2] = POINTS[lang];
    const prog = {
      [p1.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-10", starred: true },
      [p2.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-20", starred: true },
    };
    expect(dueStarredPoints(prog, lang, "2026-01-10").map((p) => p.id)).toEqual([p1.id]);
  });
});

describe("vOpts", () => {
  it("항상 보기 4개를 주고, 정답 index가 그 안에 있다", () => {
    for (const lang of ["en", "ja"] as const) {
      for (const w of VOCAB[lang].slice(0, 60)) {
        const { opts, a } = vOpts(w, lang, false);
        expect(opts.length).toBe(4);
        expect(opts[a]).toBe(w);
      }
    }
  });

  it("뜻(토큰)이 겹치는 단어는 보기로 같이 나오지 않는다", () => {
    for (const lang of ["en", "ja"] as const) {
      for (const w of VOCAB[lang].slice(0, 60)) {
        const { opts } = vOpts(w, lang, false);
        const wTokens = w.m
          .replace(/\([^)]*\)/g, "")
          .split(/[,;·=]/)
          .map((x) => x.trim())
          .filter(Boolean);
        for (const o of opts) {
          if (o.id === w.id) continue;
          const oTokens = o.m
            .replace(/\([^)]*\)/g, "")
            .split(/[,;·=]/)
            .map((x) => x.trim())
            .filter(Boolean);
          expect(oTokens.some((t) => wTokens.includes(t))).toBe(false);
        }
      }
    }
  });
});

describe("starredVocab / dueStarredVocab (단어판 Anki 복습, 문법과 같은 구조)", () => {
  it("starred만 돌려주고 due 순으로 정렬, 오늘 이전만 due 목록에 포함된다", () => {
    const lang = "en";
    const [w1, w2, w3] = VOCAB[lang];
    const vprog = {
      [w1.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-10", starred: true },
      [w2.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-02", starred: true },
      [w3.id]: { box: 1, ok: 0, tot: 0, due: "2026-01-01" },
    };
    expect(starredVocab(vprog, lang).map((w) => w.id)).toEqual([w2.id, w1.id]);
    expect(dueStarredVocab(vprog, lang, "2026-01-05").map((w) => w.id)).toEqual([w2.id]);
  });
});
