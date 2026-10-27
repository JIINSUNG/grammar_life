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

실행하면 개수를 출력하고, `scripts/convert-legacy.mjs`의 `EXPECT`에 적힌 기대 개수와 다르면 에러로 종료한다.
콘텐츠(문법·단어·실전 문제 등)를 의도적으로 추가·수정했으면 이 스크립트를 다시 돌려 `src/data/*.json`을 갱신하고,
`EXPECT`도 새 개수로 맞춰야 한다(의도하지 않은 변경이면 반대로 원인을 찾아야 함).

현재 기준: 영어 문법 48 · 일본어 문법 214(입문 8·N5 20·N4 42·N3 72·N2 72) · CQ 262 · 실전 일본어 42·영어 36 ·
단어 일본어 830 · 영어 589.

## 후리가나

```
npm run gen-ruby
```

`src/data/*.json`의 일본어 문장 조각을 kuromoji로 분석해 `src/data/ruby.json`(｜漢字《かな》 사전)을 만든다.
`npm run build` 전에 자동으로 실행된다(`prebuild`). kuromoji는 devDependency라 빌드 결과물엔 안 들어간다.
일본어 문법·단어를 추가했으면 이 스크립트를 다시 돌려 `ruby.json`을 갱신해야 한다.

## 화면 구조

- `src/components/` — Sent, Ruby, Speak, VWord, TabBar, Icon, QuickNote 같은 공용 조각
- `src/screens/` — 탭 하나에 해당하는 화면 (Today, GrammarList, Vocab, Notes, ExamHome, Me, Survey)
- `src/flows/` — 탭 바가 사라지고 전체화면으로 진행하는 흐름 (Session, VocabSession, NoteEditor, NoteReview, Exam)
- `src/App.tsx` — 레거시 `App()`과 동일하게 profile/tab/run 상태를 들고 화면을 고른다

일본어 콘텐츠(POINTS.ja, EXAM.ja, JOBS/RIDES/HOBBIES/PLANS의 ja 필드)는 `src/data/index.ts`에서 **앱이 뜰 때 한 번만**
`ruby.json`으로 후리가나를 구워서 내보낸다(레거시가 모듈 로드 시점에 한 번 rubify해두던 것과 같은 타이밍 — 화면 쪽은 `src/data/*.json`을
직접 import하지 않고 이 파일의 export만 쓴다).

### 순간 메모

어느 탭에 있든 오른쪽 아래 + 버튼(`QuickNote`)으로 "이거 영어·일본어로 뭐라 하지" 싶은 순간 바로 한국어 문장을 적어둘 수 있다.
저장만 하고 끝 — 영작·일작은 노트 탭에서 나중에 이어서 한다(기존 "적어 두기" 흐름 그대로, 새 데이터 구조 없음). 휴대폰에 설치한
PWA 아이콘을 꾹 누르면 뜨는 "순간 메모" 바로가기(`/?quick=1`)로 들어오면 이 입력창이 바로 열린다.

## 테스트

```
npm test          # Vitest (로직 단위 테스트)
npm run e2e        # Playwright (설문 → 오늘 루틴 → 단어 루틴 → 노트 → 실전 → 백업 코드, 핵심 흐름 E2E)
```

## 개발

```
npm install
npm run dev
npm run build
```

## PWA

`npm run build`가 매니페스트(이름 "내 생활 문법", 아이콘, theme color)와 오프라인 캐시(서비스 워커)를 같이 만든다
(`vite-plugin-pwa`, `registerType: "autoUpdate"`). 문법·단어 데이터(JSON)까지 전부 미리 캐시하므로, 한 번 접속한
뒤에는 오프라인에서도 설문·학습·실전·노트가 그대로 동작한다(`npx vite preview`로 빌드 후 오프라인 전환해서 확인함).
휴대폰에서 "홈 화면에 추가"로 앱처럼 설치할 수 있다.

아이콘은 `public/icon.svg` 하나가 원본이고, `node scripts/gen-icons.mjs`로 PNG(192/512/마스커블/favicon/apple-touch-icon)를
한 번 구워서 `public/`에 커밋해 둔다. 아이콘을 바꾸면 `icon.svg`를 고치고 스크립트를 다시 돌리면 된다. 저장 공간이 기기
정리로 날아가지 않도록 `navigator.storage.persist()`도 앱 시작 시 요청한다(지원 안 하면 조용히 무시됨).

## 배포 (Vercel 또는 Cloudflare Pages)

서버·환경 변수·백엔드가 전혀 없는 정적 사이트라 두 곳 다 설정이 거의 필요 없다.

**Vercel**
1. GitHub 저장소를 Vercel에 연결한다.
2. Framework Preset: Vite. Build Command `npm run build`, Output Directory `dist` (기본값 그대로면 자동 인식됨).
3. 환경 변수: 없음.

**Cloudflare Pages**
1. 저장소 연결 후 Build command `npm run build`, Build output directory `dist`.
2. 환경 변수: 없음.

배포 전에 로컬에서 `npm run build && npx vite preview`로 한 번 띄워보고, PWA 설치·오프라인 동작까지 확인하는 걸 권장한다.

## 레거시 앱에서 기록 옮기는 법

기존 `legacy/grammar-app.html`(또는 배포돼 있던 이전 버전)을 쓰던 사람이 새 앱으로 넘어올 때:

1. 레거시 앱에서 **나 › 기록 옮기기 › 백업 코드 만들기**를 누르고, 나온 코드를 전부 복사한다.
2. 새 앱에서 설문을 마치고 **나 › 기록 옮기기 › 백업 코드 붙여넣기**에 그대로 붙여넣고 가져오기를 누른다.
3. 진도·단어·노트·XP·설문이 모두 그대로 복원된다. (`{app:"grammar-life",v:1,data}` 래핑 형식과, 레거시 구버전이 만든
   래핑 없는 raw 형식 둘 다 읽을 수 있다 — `src/lib/storage.test.ts`에서 둘 다 테스트함.)
