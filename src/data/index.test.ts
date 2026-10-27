import { describe, expect, it } from "vitest";
import { JOBS, POINTS, VOCAB } from "./index";

describe("일본어 데이터 후리가나 굽기", () => {
  it("POINTS.ja 템플릿에 ruby 표기(｜《》)가 들어가 있다", () => {
    const hasRuby = POINTS.ja.some((p) => p.tpl.some((t) => t.s.includes("《")));
    expect(hasRuby).toBe(true);
  });

  it("POINTS.en에는 ruby 표기가 들어가지 않는다", () => {
    const hasRuby = POINTS.en.some((p) => p.tpl.some((t) => t.s.includes("《")));
    expect(hasRuby).toBe(false);
  });

  it("JOBS.ja 필드도 후리가나가 구워져 있다 (설문 슬롯 값)", () => {
    const hasRuby = JOBS.some((j) => Object.values(j.ja).some((v) => String(v).includes("《")));
    expect(hasRuby).toBe(true);
  });

  it("VOCAB_JA 단어는 rw(후리가나 표기)를 갖는다", () => {
    const sample = VOCAB.ja.find((w) => w.w === "私");
    expect(sample?.rw).toBe("｜私《わたし》");
  });
});
