import { describe, expect, it } from "vitest";
import { blankState, exportBackup, importBackup } from "./storage";
import type { AppState } from "../types";

function sampleState(): AppState {
  return {
    ...blankState(),
    profile: { job: "elec", ride: "bike", hobbies: ["game", "gym"], plans: ["jptrip"], goal: 10, toeic: "800", jlpt: "N2", jstart: "입문" },
    lang: "ja",
    prog: { en: {}, ja: { J1: { box: 3, ok: 5, tot: 6, due: "2026-02-01", lastPass: true, last: "2026-01-20" } } },
    vprog: { en: {}, ja: {} },
    xp: 240,
    days: { "2026-01-20": 20 },
    notes: [{ id: "n1", lang: "ja", kind: "s", ko: "재고가 다 떨어졌다", dr: "在庫がなくなりました", fx: "", tags: ["particle"], pts: ["J1"], memo: "", made: "2026-01-20", up: "2026-01-20T00:00:00.000Z" }],
  };
}

describe("백업 코드 호환", () => {
  it("내보낸 코드를 다시 가져오면 상태가 그대로 복원된다", () => {
    const st = sampleState();
    const code = exportBackup(st);
    const restored = importBackup(code);
    expect(restored.profile).toEqual(st.profile);
    expect(restored.prog.ja.J1.box).toBe(3);
    expect(restored.notes[0].ko).toBe("재고가 다 떨어졌다");
    expect(restored.xp).toBe(240);
  });

  it("{app, v, data} 래핑 형식(레거시 '기록 옮기기'에서 만든 코드)을 읽는다", () => {
    const st = sampleState();
    const legacyWrapped = JSON.stringify({ app: "grammar-life", v: 1, at: "2026-01-20T00:00:00.000Z", data: st });
    const restored = importBackup(legacyWrapped);
    expect(restored.profile?.job).toBe("elec");
    expect(restored.xp).toBe(240);
  });

  it("래핑 없이 state 객체만 온 옛 형식도 읽는다", () => {
    const st = sampleState();
    const bare = JSON.stringify(st);
    const restored = importBackup(bare);
    expect(restored.profile?.job).toBe("elec");
    expect(restored.notes).toHaveLength(1);
  });

  it("schemaVersion이 없는 레거시 데이터는 마이그레이션 없이 v1로 간주된다", () => {
    const st = sampleState();
    delete (st as Partial<AppState>).schemaVersion;
    const restored = importBackup(JSON.stringify(st));
    expect(restored.schemaVersion).toBe(1);
  });

  it("형식이 잘못된 코드는 에러를 던진다", () => {
    expect(() => importBackup("이건 json이 아니에요")).toThrow();
    expect(() => importBackup(JSON.stringify({ foo: "bar" }))).toThrow();
  });
});
