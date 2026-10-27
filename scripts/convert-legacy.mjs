// legacy/src의 데이터 파일을 레거시 build.py와 똑같은 순서로 Node vm에서 실행해서
// POINTS/CQ/EXAM/JOBS/RIDES/HOBBIES/PLANS/GOALS/TOEIC_GOALS/JLPT_GOALS/VOCAB_JA/VOCAB_EN을 꺼내고,
// 언어·종류별 JSON으로 저장한다. 문장·보기·해설은 손으로 바꾸지 않고 이 스크립트로만 옮긴다.
//
// 순서가 중요하다: jp_n2.js는 jp_n3.js가 만든 JP_N3을 참조하고, basics.js는 jp_more1.js가 정의한
// 헬퍼 G()를 그대로 쓴다. 이 순서는 legacy/build.py의 files 배열과 동일해야 한다(ruby_dict.js, app.js 제외 —
// 후리가나 적용 전 원본 데이터를 뽑아야 check-templates.js와 동일한 입력이 된다).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = path.join(ROOT, "legacy", "src");
const OUT = path.join(ROOT, "src", "data");

const FILES = [
  "data.js",
  "more_data.js",
  "jp_n3.js",
  "jp_n2.js",
  "jp_more1.js",
  "jp_more2.js",
  "jp_more3.js",
  "basics.js",
  "en_more.js",
  "vocab_ja.js",
  "vocab_en.js",
  "vocab_more.js",
];

const ctx = {};
vm.createContext(ctx);
const code = FILES.map((f) => readFileSync(path.join(SRC, f), "utf8")).join("\n");
vm.runInContext(
  code +
    `
this.__OUT__ = { POINTS, CQ, EXAM, JOBS, RIDES, HOBBIES, PLANS, GOALS, TOEIC_GOALS, JLPT_GOALS, VOCAB_JA, VOCAB_EN };
`,
  ctx,
  { filename: "legacy-data-bundle.js" }
);

const { POINTS, CQ, EXAM, JOBS, RIDES, HOBBIES, PLANS, GOALS, TOEIC_GOALS, JLPT_GOALS, VOCAB_JA, VOCAB_EN } = ctx.__OUT__;

// --- 검증: CQ를 포인트에 합치기 전에, 모든 포인트가 짝이 맞는 CQ를 갖는지 확인 ---
const missingCq = [];
const mergedPoints = { en: [], ja: [] };
for (const lang of ["en", "ja"]) {
  for (const p of POINTS[lang]) {
    const cq = CQ[p.id];
    if (!cq) missingCq.push(p.id);
    mergedPoints[lang].push({ ...p, cq: cq ?? null });
  }
}
const usedCqIds = new Set(POINTS.en.concat(POINTS.ja).map((p) => p.id));
const unusedCq = Object.keys(CQ).filter((id) => !usedCqIds.has(id));

mkdirSync(OUT, { recursive: true });

const write = (name, data) => writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + "\n");

write("points.en.json", mergedPoints.en);
write("points.ja.json", mergedPoints.ja);
write("exam.en.json", EXAM.en);
write("exam.ja.json", EXAM.ja);
write("vocab.en.json", VOCAB_EN);
write("vocab.ja.json", VOCAB_JA);
write("jobs.json", JOBS);
write("rides.json", RIDES);
write("hobbies.json", HOBBIES);
write("plans.json", PLANS);
write(
  "goals.json",
  GOALS.map(([minutes, label, xp]) => ({ minutes, label, xp }))
);
write("toeic-goals.json", TOEIC_GOALS);
write("jlpt-goals.json", JLPT_GOALS);

console.log("변환 완료 →", path.relative(ROOT, OUT));
console.log({
  "POINTS.en": POINTS.en.length,
  "POINTS.ja": POINTS.ja.length,
  "CQ keys": Object.keys(CQ).length,
  "EXAM.en": EXAM.en.length,
  "EXAM.ja": EXAM.ja.length,
  "VOCAB_JA": VOCAB_JA.length,
  "VOCAB_EN": VOCAB_EN.length,
  JOBS: JOBS.length,
  RIDES: RIDES.length,
  HOBBIES: HOBBIES.length,
  PLANS: PLANS.length,
});

if (missingCq.length) {
  console.error("CQ 없는 포인트:", missingCq);
  process.exitCode = 1;
}
if (unusedCq.length) {
  console.warn("어느 포인트에도 안 쓰인 CQ:", unusedCq);
}

// 콘텐츠를 의도적으로 추가했으면 이 숫자도 같이 갱신한다(README에도 같은 숫자가 적혀 있음).
// 이 값과 달라졌다는 건 "의도한 변경인지" 확인이 필요하다는 신호 — 의도했으면 숫자를 올리고, 아니면 원인을 찾는다.
const EXPECT = { en: 48, ja: 214, cq: 262, vocabJa: 830, vocabEn: 589 };
const actual = { en: POINTS.en.length, ja: POINTS.ja.length, cq: Object.keys(CQ).length, vocabJa: VOCAB_JA.length, vocabEn: VOCAB_EN.length };
const mismatch = Object.keys(EXPECT).filter((k) => EXPECT[k] !== actual[k]);
if (mismatch.length) {
  console.error("기대 개수와 다름 (의도한 변경이면 scripts/convert-legacy.mjs의 EXPECT를 갱신):", mismatch.map((k) => `${k} 기대 ${EXPECT[k]} 실제 ${actual[k]}`));
  process.exitCode = 1;
} else {
  console.log("개수 검증 통과 (EXPECT와 일치)");
}
