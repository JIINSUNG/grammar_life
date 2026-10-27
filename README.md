# 내 생활 문법

영어·일본어 문법 학습 웹앱. 설문(직업·출퇴근·취미·예정)으로 내 하루가 들어간 예문을 만들어 공부한다.
서버·DB·로그인·AI API 없이 정적 호스팅(Vercel/Cloudflare Pages)만 쓴다. 규칙은 `CLAUDE.md` 참고.

## 레거시

`legacy/grammar-app.html`이 지금 운영 중인 원본(단일 HTML, 동작 기준)이다. `legacy/src/*.js`가 그걸 만든 조각이고,
`python3 legacy/build.py`로 다시 합칠 수 있다.

## 데이터 이식

`legacy/src`의 데이터 파일을 `legacy/build.py`와 **같은 순서**로 Node `vm`에서 실행해 `src/data/*.json`으로 뽑는다
(순서가 다르면 깨진다 — 파일 간에 서로 참조하는 헬퍼·배열이 있음).

```
node scripts/convert-legacy.mjs
```

실행하면 개수를 출력하고, `CLAUDE.md`에 적힌 기대 개수(영어 문법 48 · 일본어 208 · CQ 256 · 단어 일본어 805 · 영어 589)와
다르면 에러로 종료한다. 레거시 콘텐츠(문법·단어·실전 문제 등)를 추가·수정했으면 이 스크립트를 다시 돌려 `src/data/*.json`을 갱신해야 한다.

## 후리가나

```
npm run gen-ruby
```

`src/data/*.json`의 일본어 문장 조각을 kuromoji로 분석해 `src/data/ruby.json`(｜漢字《かな》 사전)을 만든다.
`npm run build` 전에 자동으로 실행된다(`prebuild`). kuromoji는 devDependency라 빌드 결과물엔 안 들어간다.
일본어 문법·단어를 추가했으면 이 스크립트를 다시 돌려 `ruby.json`을 갱신해야 한다.

## 개발

```
npm install
npm run dev
npm run build
```
