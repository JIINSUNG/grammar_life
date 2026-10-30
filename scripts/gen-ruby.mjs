// legacy/tools/gen-ruby.js를 새 데이터(src/data/*.json)를 읽도록 옮긴 버전.
// kuromoji로 일본어 문장 조각을 분석해 ｜漢字《かな》 형식 사전을 만들어 src/data/ruby.json에 저장한다.
// kuromoji는 devDependency — 번들에는 안 들어가고 빌드 전(prebuild)에만 돌아간다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import kuromoji from "kuromoji";

const require = createRequire(import.meta.url);

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DATA = path.join(ROOT, "src", "data");
const readJson = (name) => JSON.parse(readFileSync(path.join(DATA, name), "utf8"));

const POINTS_JA = readJson("points.ja.json");
const EXAM_JA = readJson("exam.ja.json");
const JOBS = readJson("jobs.json");
const RIDES = readJson("rides.json");
const HOBBIES = readJson("hobbies.json");
const PLANS = readJson("plans.json");

const KANJI = /[一-鿿々〆ヵヶ]/;
const SPLIT = /(\{[^}]+\}|\[|\])/;
const segs = new Set();
const addStr = (s) => {
  if (typeof s !== "string") return;
  s.split(SPLIT).forEach((x) => {
    if (x && !SPLIT.test(x) && KANJI.test(x)) segs.add(x);
  });
};

// CQ는 1단계에서 이미 각 포인트의 p.cq로 합쳐둬서, 레거시의 "CQ[id].o" 순회를 p.cq.o로 대체한다.
POINTS_JA.forEach((p) => {
  p.tpl.forEach((t) => {
    addStr(t.s);
    t.o.forEach(addStr);
  });
  p.bad.forEach(addStr);
  if (p.cq) p.cq.o.forEach(addStr);
});
EXAM_JA.forEach((e) => {
  addStr(e.q);
  e.o.forEach(addStr);
});
JOBS.forEach((j) => Object.values(j.ja).forEach(addStr));
RIDES.forEach((r) => addStr(r.ja));
HOBBIES.forEach((h) => addStr(h.ja));
PLANS.forEach((p) => addStr(p.ja));

const kata2hira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const isKana = (c) => /[ぁ-ゖァ-ーー]/.test(c);

// 읽기를 표면형에 맞춰 한자 부분에만 붙임 (앞뒤 오쿠리가나 제거)
function annotate(surface, reading) {
  if (!KANJI.test(surface) || !reading || reading === "*") return surface;
  let r = kata2hira(reading);
  let s = surface;
  let pre = "";
  let post = "";
  while (s.length && r.length && isKana(s[0]) && kata2hira(s[0]) === r[0]) {
    pre += s[0];
    s = s.slice(1);
    r = r.slice(1);
  }
  while (s.length && r.length && isKana(s[s.length - 1]) && kata2hira(s[s.length - 1]) === r[r.length - 1]) {
    post = s[s.length - 1] + post;
    s = s.slice(0, -1);
    r = r.slice(0, -1);
  }
  if (!s || !r) return surface;
  // 중간에 가나가 섞인 경우(取り扱い 등)는 통째로
  return pre + "｜" + s + "《" + r + "》" + post;
}

const FIX = {
  "一日中": "いちにちじゅう",
  "今日": "きょう",
  "明日": "あした",
  "昨日": "きのう",
  "今朝": "けさ",
  "一人": "ひとり",
  "二人": "ふたり",
  "一つ": "__ひと__つ",
  "大人": "おとな",
  "上手": "じょうず",
  "下手": "へた",
  "お土産": "おみやげ",
  "今年": "ことし",
  "一緒": "いっしょ",
  "当日": "とうじつ",
  "本日": "ほんじつ",
  "一度": "いちど",
  "一点": "いってん",
  "二点": "にてん",
  "3人": "さんにん",
  "申し上げ": "もうしあげ",
  "日本": "にほん",
};

kuromoji.builder({ dicPath: path.join(path.dirname(require.resolve("kuromoji")), "..", "dict") }).build((err, tk) => {
  if (err) throw err;
  const out = {};
  for (const seg of segs) {
    const toks = tk.tokenize(seg);
    out[seg] = toks
      .map((t) => {
        const sf = t.surface_form;
        if (FIX[sf]) {
          const f = FIX[sf];
          if (f.startsWith("__")) {
            const m = f.match(/^__(.+)__(.*)$/);
            return "｜" + sf.slice(0, sf.length - m[2].length) + "《" + m[1] + "》" + m[2];
          }
          return "｜" + sf + "《" + f + "》";
        }
        if (sf === "何" && t.reading === "ナン") return "｜何《なん》";
        return annotate(sf, t.reading);
      })
      .join("");
  }
  writeFileSync(path.join(DATA, "ruby.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("ruby.json 생성 완료 · segments", segs.size);
});
