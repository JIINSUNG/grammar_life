import { describe, expect, it } from "vitest";
import { INTERVAL, VOCAB, gradePoint, vOpts } from "./srs";

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
