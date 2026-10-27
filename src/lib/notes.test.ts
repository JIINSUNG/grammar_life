import { describe, expect, it } from "vitest";
import { mondayOf, weekNoteCount, weakTrend } from "./notes";
import type { Note } from "../types";

function note(partial: Partial<Note>): Note {
  return { id: Math.random().toString(36), lang: "en", kind: "s", ko: "", dr: "", fx: "", tags: [], pts: [], memo: "", made: "2026-01-01", up: "", ...partial };
}

describe("mondayOf", () => {
  it("평일은 그 주의 월요일을 돌려준다", () => {
    expect(mondayOf("2026-01-29")).toBe("2026-01-26"); // 목요일 -> 월요일
  });
  it("일요일은 그 주의 월요일(6일 전)을 돌려준다", () => {
    expect(mondayOf("2026-02-01")).toBe("2026-01-26");
  });
  it("월요일은 자기 자신", () => {
    expect(mondayOf("2026-01-26")).toBe("2026-01-26");
  });
});

describe("weekNoteCount", () => {
  it("이번 주(월~일) made인 노트만 센다", () => {
    const notes = [
      note({ made: "2026-01-26" }), // 월, 이번주
      note({ made: "2026-02-01" }), // 일, 이번주
      note({ made: "2026-01-25" }), // 지난주 일요일 - 제외
      note({ made: "2026-02-02" }), // 다음주 월 - 제외
      note({ made: "2026-01-27", lang: "ja" }), // 언어 다름 - 제외
    ];
    expect(weekNoteCount(notes, "en", "2026-01-29")).toBe(2);
  });
});

describe("weakTrend", () => {
  it("이번 주·지난주 검토 완료 노트의 태그 빈도를 비교한다", () => {
    const notes = [
      note({ rv: "2026-01-27", tags: ["particle", "kanji"], lang: "ja" }), // 이번주
      note({ rv: "2026-01-28", tags: ["particle"], lang: "ja" }), // 이번주
      note({ rv: "2026-01-20", tags: ["particle"], lang: "ja" }), // 지난주
      note({ rv: "2026-01-21", tags: ["kanji"], lang: "ja" }), // 지난주
    ];
    const trend = weakTrend(notes, "ja", "2026-01-29");
    const particle = trend.find((t) => t.tag === "particle")!;
    const kanji = trend.find((t) => t.tag === "kanji")!;
    expect(particle.thisWeek).toBe(2);
    expect(particle.lastWeek).toBe(1);
    expect(particle.delta).toBe(1);
    expect(kanji.thisWeek).toBe(1);
    expect(kanji.lastWeek).toBe(1);
    expect(kanji.delta).toBe(0);
  });
});
