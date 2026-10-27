import { test, expect, type Page } from "@playwright/test";

/**
 * 설문 → 오늘 루틴 1회 → 단어 루틴 1회 → 노트 작성·검토 → 실전 10문제 → 백업 코드 내보내기/가져오기
 * 가 에러 없이 끝나는지 확인하는 핵심 흐름 E2E 테스트.
 */

async function runSteps(page: Page) {
  for (let n = 0; n < 60; n++) {
    if (await page.locator("button.btn.pri.wide", { hasText: "완료" }).count()) break;
    const nextCard = page.locator("button.btn.pri.wide", { hasText: "외웠어요, 다음" });
    if (await nextCard.count()) {
      await nextCard.click();
      await page.waitForTimeout(80);
      continue;
    }
    const opt = page.locator(".opts button.opt").first();
    if (await opt.count()) {
      await opt.click();
      await page.waitForTimeout(80);
    }
    const conf = page.locator("button.conf-sure, button.btn.conf-sure").first();
    if (await conf.count()) {
      await conf.click();
      await page.waitForTimeout(80);
    }
    const next = page.locator("button.btn.pri.wide", { hasText: /다음|결과 보기/ });
    if (await next.count()) {
      await next.click();
      await page.waitForTimeout(80);
    }
  }
}

test("핵심 학습 흐름이 에러 없이 끝난다", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/");
  await page.getByRole("button", { name: "시작하기" }).click();
  await expect(page.locator("nav.tabbar")).toBeVisible();

  // 오늘 루틴 1회
  await page.getByRole("button", { name: "루틴 시작" }).click();
  await page.getByRole("button", { name: "이해했는지 확인하기" }).click();
  await runSteps(page);
  const sessDone = page.getByRole("button", { name: "완료" });
  if (await sessDone.count()) await sessDone.click();

  // 단어 루틴 1회
  await page.locator("nav.tabbar button", { hasText: "단어" }).click();
  await page.getByRole("button", { name: "단어 루틴 시작" }).click();
  await runSteps(page);
  const vocabDone = page.getByRole("button", { name: "완료" });
  if (await vocabDone.count()) await vocabDone.click();

  // 노트 작성 → 검토 완료
  await page.locator("nav.tabbar button", { hasText: "노트" }).click();
  await page.locator("#n-ko").fill("이 청소기는 지난주에 새로 나온 모델이에요.");
  await page.getByRole("button", { name: "지금 영작해 보기" }).click();
  await page.locator("#ne-dr").fill("This vacuum is a new model that came out last week.");
  await page.getByRole("button", { name: "검토 완료", exact: true }).click();
  await expect(page.getByText("검토 완료")).toBeVisible();
  await page.getByRole("button", { name: "노트로 돌아가기" }).click();

  // 실전 10문제
  await page.locator("nav.tabbar button", { hasText: "실전" }).click();
  await page.getByRole("button", { name: "10문제 시작" }).click();
  for (let n = 0; n < 10; n++) {
    await page.locator(".opts button.opt").first().click();
    await page.waitForTimeout(200);
  }
  await page.getByRole("button", { name: "채점하기" }).click();
  await expect(page.getByText("결과")).toBeVisible();
  await page.getByRole("button", { name: "닫기" }).click();

  // 백업 코드 내보내기/가져오기
  await page.locator("nav.tabbar button", { hasText: "나" }).click();
  await page.getByRole("button", { name: "백업 코드 만들기" }).click();
  const code = await page.locator("#bk-out").inputValue();
  expect(code).toContain('"app":"grammar-life"');

  await page.getByRole("button", { name: "백업 코드 붙여넣기" }).click();
  await page.locator("#bk-in").fill(code);
  await page.getByRole("button", { name: "가져오기" }).click();
  await expect(page.getByText("가져왔어요!")).toBeVisible();

  expect(errors).toEqual([]);
});
