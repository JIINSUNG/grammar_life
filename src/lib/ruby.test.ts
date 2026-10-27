import { describe, expect, it } from "vitest";
import { plain, rubify, vruby } from "./ruby";

describe("vruby", () => {
  it("오쿠리가나를 뺀 한자 부분에만 후리가나를 붙인다", () => {
    expect(vruby("乗り換える", "のりかえる")).toBe("｜乗《の》り｜換《か》える");
  });

  it("가타카나가 섞인 단어는 한자 부분만 처리", () => {
    expect(vruby("電気ケトル", "でんきけとる")).toBe("｜電気《でんき》ケトル");
  });

  it("앞에 오쿠리가나(접두 가나)가 있는 단어", () => {
    expect(vruby("お会計", "おかいけい")).toBe("お｜会計《かいけい》");
  });

  it("읽기가 없거나 한자가 없으면 그대로 반환", () => {
    expect(vruby("カフェ", "")).toBe("カフェ");
    expect(vruby("refund", "")).toBe("refund");
  });
});

describe("rubify / plain", () => {
  it("사전에 있는 조각만 치환하고, {}/[] 토큰은 그대로 둔다", () => {
    const dict = { "店で": "｜店《みせ》で" };
    expect(rubify("[店で]{cust}", dict)).toBe("[｜店《みせ》で]{cust}");
  });

  it("plain은 후리가나 표기를 읽기 없는 평문으로 되돌린다", () => {
    expect(plain("｜乗《の》り｜換《か》える")).toBe("乗り換える");
    expect(plain("お｜会計《かいけい》")).toBe("お会計");
  });
});
