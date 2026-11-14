import { describe, expect, it } from "vitest";
import { PARTY, PHRASE_CATS, TRAVEL_PHRASES } from "../data/travel-phrases";
import { fillPhrase, hasSlot, searchPhrases, toggleFav } from "./phrases";
import { plain, splitRuby } from "./ruby";

describe("여행 멘트 데이터", () => {
  it("id가 겹치지 않고, 모든 멘트에 한·일·영이 다 있다", () => {
    const ids = TRAVEL_PHRASES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of TRAVEL_PHRASES) {
      expect(p.ko.trim(), p.id).not.toBe("");
      expect(p.ja.trim(), p.id).not.toBe("");
      expect(p.en.trim(), p.id).not.toBe("");
      expect(PHRASE_CATS.some((c) => c.id === p.cat), p.id).toBe(true);
    }
  });

  it("후리가나 표기가 깨진 데 없이 짝이 맞고, 한자에는 전부 읽기가 달려 있다", () => {
    for (const p of [...TRAVEL_PHRASES.map((x) => x.ja), ...Object.values(PARTY).map((x) => x.ja)]) {
      expect((p.match(/｜/g) ?? []).length, p).toBe((p.match(/《/g) ?? []).length);
      expect((p.match(/《/g) ?? []).length, p).toBe((p.match(/》/g) ?? []).length);
      // 루비 밖에 남은 한자가 없어야 한다(읽기를 빠뜨리지 않았는지)
      const outside = splitRuby(p)
        .filter((x) => !x.reading)
        .map((x) => x.text)
        .join("");
      expect(outside, p).not.toMatch(/[一-鿿々]/);
      // 읽기는 히라가나만
      for (const part of splitRuby(p)) if (part.reading) expect(part.reading, p).toMatch(/^[ぁ-ゖー]+$/);
    }
  });

  it("{n} 슬롯은 세 언어에 모두 있거나 모두 없다", () => {
    for (const p of TRAVEL_PHRASES) {
      const has = [p.ko, p.ja, p.en].map((s) => s.includes("{n}"));
      expect(new Set(has).size, p.id).toBe(1);
    }
  });
});

describe("fillPhrase", () => {
  it("인원 수가 언어별 표현으로 들어간다", () => {
    const p = TRAVEL_PHRASES.find((x) => x.id === "f1")!;
    expect(hasSlot(p)).toBe(true);
    const f = fillPhrase(p, 2);
    expect(f.ko).toBe("2명인데 식사 가능해요?");
    expect(plain(f.ja)).toBe("二人ですが、入れますか。");
    expect(f.en).toBe("Do you have a table for two?");
    expect(plain(fillPhrase(p, 4).ja)).toContain("四人");
    expect(fillPhrase(p, 99).en).toContain("six"); // 범위 밖은 끝으로 맞춘다
  });
});

describe("searchPhrases", () => {
  it("한국어·일본어 읽기·영어로 찾고, 카테고리·즐겨찾기로 거른다", () => {
    expect(searchPhrases(TRAVEL_PHRASES, "숙박세", "all", []).map((p) => p.id)).toEqual(["s2", "s3"]);
    expect(searchPhrases(TRAVEL_PHRASES, "しゅくはくぜい", "all", []).length).toBe(2);
    expect(searchPhrases(TRAVEL_PHRASES, "TAX", "all", []).map((p) => p.id)).toEqual(expect.arrayContaining(["s2", "p2"]));
    expect(searchPhrases(TRAVEL_PHRASES, "", "help", []).every((p) => p.cat === "help")).toBe(true);
    expect(searchPhrases(TRAVEL_PHRASES, "", "fav", ["b1", "f1"]).map((p) => p.id)).toEqual(["b1", "f1"]);
  });

  it("toggleFav", () => {
    expect(toggleFav(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleFav(["a", "b"], "a")).toEqual(["b"]);
  });
});
