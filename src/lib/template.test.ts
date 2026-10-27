import { describe, expect, it } from "vitest";
import { josa, build } from "./template";
import { HOBBIES, JOBS, PLANS, POINTS, RIDES } from "../data";
import type { Profile } from "../types";

describe("josa", () => {
  it("받침 있는 단어는 첫 번째 조사(은/이/을/과)", () => {
    expect(josa("손님", "은")).toBe("손님은");
    expect(josa("점장", "이")).toBe("점장이");
    expect(josa("질문", "을")).toBe("질문을");
    expect(josa("매장", "과")).toBe("매장과");
  });

  it("받침 없는 단어는 두 번째 조사(는/가/를/와)", () => {
    expect(josa("카페", "은")).toBe("카페는");
    expect(josa("라테", "이")).toBe("라테가");
    expect(josa("서비스", "을")).toBe("서비스를");
    expect(josa("기차", "과")).toBe("기차와");
  });

  it("한글이 아닌 단어는 괄호 표기로 대체", () => {
    expect(josa("Apple", "은")).toBe("Apple은(는)");
  });

  it("받침 여부로 안 바뀌는 조사(도)는 그대로 붙인다", () => {
    expect(josa("손님", "도")).toBe("손님도");
    expect(josa("카페", "도")).toBe("카페도");
  });
});

/**
 * legacy/tools/check-templates.js 포팅: 모든 설문 조합 × 모든 템플릿에서
 * {slot} 누락(채워지지 않은 중괄호), 오답 3개 서로 다름·정답과도 다름을 확인한다.
 * 설문 선택지(JOBS/HOBBIES 등)가 늘어나면 조합 수도 같이 늘어나므로, 기대 개수는 고정값이 아니라
 * 현재 데이터 기준으로 계산한다 — 중요한 건 bad가 항상 0이라는 것.
 */
describe("check-templates (설문 조합 전수검사)", () => {
  it("모든 설문 조합에서 슬롯 누락·오답 중복이 없다", () => {
    let built = 0;
    const bad: string[] = [];
    for (const lang of ["en", "ja"] as const) {
      for (const p of POINTS[lang]) {
        p.tpl.forEach((_, ti) => {
          for (const job of JOBS)
            for (const ride of RIDES)
              for (const hob of HOBBIES)
                for (const plan of PLANS) {
                  const prof: Profile = { job: job.id, ride: ride.id, hobbies: [hob.id], plans: [plan.id], goal: 10, toeic: "800", jlpt: "N2" };
                  const b = build(p, ti, prof, lang, 0);
                  built++;
                  if (/[{}]/.test(b.raw + b.ko + b.wrong.join(""))) {
                    bad.push(`slot ${p.id} ${ti} ${b.raw} ${b.ko}`);
                    return;
                  }
                  if (b.wrong.includes(b.ans) || new Set(b.wrong).size !== 3) {
                    bad.push(`dup ${p.id} ${ti} ${b.ans} ${b.wrong.join(",")}`);
                  }
                }
        });
      }
    }
    const templateCount = (["en", "ja"] as const).reduce((sum, lang) => sum + POINTS[lang].reduce((s, p) => s + p.tpl.length, 0), 0);
    const expected = templateCount * JOBS.length * RIDES.length * HOBBIES.length * PLANS.length;
    expect(bad.slice(0, 10)).toEqual([]);
    expect(built).toBe(expected);
  });
});
