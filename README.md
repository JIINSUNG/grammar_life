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

현재 기준: 영어 문법 51(토익 빈출 제안동사+that절·a number of vs the number of·비교급 강조 3개 포함) ·
일본어 문법 222(입문 8·N5 20·N4 42·N3 72·N2 72·N1 8) · CQ 273 ·
실전 일본어 57(헷갈리는 문법 비교 12문제, N1 문제 3개 포함) · 영어 55(헷갈리는 문법 비교 16문제, 새 토익 문법 3문제 포함) ·
단어 일본어 888(자주 쓰는 표현 38·N1 시작용 30개 포함) · 영어 625(자주 쓰는 표현 36 포함).

N1은 전체 범위를 담지는 않고(ものの·にほかならない·ずにはいられない·限りだ·なり〜なり·あっての·はおろか·ともなると
8개 시작용), "나" 탭에서 JLPT 목표를 N1로 고를 수 있는데 실제 N1 콘텐츠가 하나도 없던 불일치를 메우기 위해 추가했다.
단어도 같은 이유로 N1 단어 트랙(`VTRACKS`)을 신설하고 시작용 30개를 넣었다.

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
- `src/flows/` — 탭 바가 사라지고 전체화면으로 진행하는 흐름 (Session, VocabSession, NoteEditor, NoteReview, Exam, FlashReview)
- `src/App.tsx` — 레거시 `App()`과 동일하게 profile/tab/run 상태를 들고 화면을 고른다

일본어 콘텐츠(POINTS.ja, EXAM.ja, JOBS/RIDES/HOBBIES/PLANS의 ja 필드)는 `src/data/index.ts`에서 **앱이 뜰 때 한 번만**
`ruby.json`으로 후리가나를 구워서 내보낸다(레거시가 모듈 로드 시점에 한 번 rubify해두던 것과 같은 타이밍 — 화면 쪽은 `src/data/*.json`을
직접 import하지 않고 이 파일의 export만 쓴다).

### 어렵다고 표시한 문법 (Anki 스타일 복습 카드)

문법 탭 각 항목 옆 ☆를 누르면 "어렵다고 표시"되고(진도가 한 번이라도 생긴 문법만 가능), 문법 탭 상단과 오늘 탭에
"집중 복습" 카드가 떠서 Anki 카드처럼 앞면(설명) → 뒤집기 → 뒷면(용어·예문) → 다시/어려움/좋음/쉬움 네 단계로
평가한다. 평가는 기존 복습 상자(`ProgressEntry.box`)를 그대로 쓰되, 퀴즈 정답이 아니라 스스로 평가한 결과로
상자를 조정한다(`lib/srs.ts`의 `gradeFlash`). `starred`는 `ProgressEntry`에 추가한 선택 필드라 기존 저장 데이터와
호환되고 마이그레이션이 필요 없다. 같은 구조(`starredVocab`/`gradeFlash`)로 단어 탭에도 "⭐ 어렵다고 표시한 단어"
집중 복습(`flows/VocabFlashReview.tsx`)이 있다.

### 자동사·타동사, 단어 연상 암기

일본어 단어 탭에는 세 가지가 있다.
- **헷갈리는 자동사·타동사**(`src/data/verb-pairs.ts`): 짝을 하나씩 외우는 대신 어미 패턴(〜ある/〜える 등)으로
  묶어서 규칙으로 외우도록 정리한 참고 카드. 31쌍(あ단/え단 14·う/える 5·れる/す 7·불규칙 5).
- **실전 회화**(`src/data/dialogues.ts`, verb-pairs.ts와 같은 이유로 변환 스크립트를 거치지 않는 새 콘텐츠):
  카페·편의점·길 묻기·전화 예약·미용실·환불 교환 같은 상황별로 A·B가 주고받는 짧은 대화. 단어 하나보다 흐름을
  익히는 게 목적이라 후리가나는 안 붙이고(grammar-pairs.ts와 동일한 이유), 줄마다 발음 듣기(TTS) 버튼으로
  확인한다. 일본어 10개(`DIALOGUES_JA`), 영어 10개(`DIALOGUES_EN`, 같은 10개 상황을 자연스러운 영어 표현으로
  새로 씀 — 직역이 아님) 둘 다 있고, 단어 탭에서 언어에 맞는 쪽이 보인다.
- **연상 암기 힌트**: 소리가 비슷한 한국어로 이미지를 만들어 외우는 방식(예: 猿(さる,원숭이) → "사루"). 몇몇 기초
  단어에는 시작용 추천 힌트(`src/data/mnemonics-seed.ts`의 `MNEMONICS_SEED_JA`/`MNEMONICS_SEED_EN`, 일본어·영어
  둘 다 있음)가 있고, 단어 목록에서 "+ 연상 힌트 적기"로 누구나 자기만의 연상을 직접 적어 저장할 수 있다
  (`AppState.mnemonics`, 사용자가 적은 게 있으면 그게 우선 보임 — 기기에만 저장되고 서버로 안 감).

### 헷갈리는 문법 비교

문법 탭 상단에 비교 카드가 있다(verb-pairs.ts와 같은 이유로 변환 스크립트를 거치지 않는 새 콘텐츠).
일본어는 `src/data/grammar-pairs.ts`의 `GRAMMAR_PAIR_GROUPS_JA` — ている/てある, のに/ても, ために/ように,
ようだ/そうだ/らしい, はずだ/べきだ 같은 JLPT N4~N2 단골 혼동 쌍 16묶음(표현 38개). 영어는
`src/data/grammar-pairs-en.ts`의 `GRAMMAR_PAIR_GROUPS_EN` — 현재완료/과거, a few/few/a little/little,
used to/would/be used to/get used to, although/despite, say/tell/talk/speak, bring/take, during/while,
remember/stop + to부정사 vs -ing 같은 토익·일반 영어 혼동 쌍 16묶음. 두 언어 모두 레벨별로 걸러보며 핵심 규칙 →
자주 틀리는 포인트 → 각 표현의 예문까지 한 번에 비교할 수 있다(`GrammarList.tsx`의 `GrammarPairs` 컴포넌트가
`lang`에 맞는 데이터셋을 고른다). 각 언어의 혼동 쌍을 직접 테스트하는 빈칸 문제도 있다 — 일본어는
`legacy/src/jp_more3.js`의 `EXAM.ja`에 추가해(변환 스크립트를 거침) 실전 탭에서 출제되고, 영어는 `exam.en.json`에
직접 추가해(그래머페어와 같은 이유로 변환 스크립트 대상 아님) 실전 탭에서 출제된다. 비교 카드로 익힌 걸 실전
문제로 바로 확인해볼 수 있다.

### 순간 메모

어느 탭에 있든 오른쪽 아래 + 버튼(`QuickNote`)으로 "이거 영어·일본어로 뭐라 하지" 싶은 순간 바로 한국어 문장을 적어둘 수 있다.
저장만 하고 끝 — 영작·일작은 노트 탭에서 나중에 이어서 한다(기존 "적어 두기" 흐름 그대로, 새 데이터 구조 없음). 휴대폰에 설치한
PWA 아이콘을 꾹 누르면 뜨는 "순간 메모" 바로가기(`/?quick=1`)로 들어오면 이 입력창이 바로 열린다.

## 기기 간 동기화 (선택 사항)

기본은 지금처럼 "나 › 기록 옮기기"의 백업 코드(수동 복사-붙여넣기)로만 기기를 옮긴다. Firebase 환경 변수를
넣으면 Google 로그인으로 같은 계정의 여러 기기에서 진도·단어·노트·XP가 자동으로 맞춰진다. 안 넣으면 "나" 탭에
로그인 버튼 자체가 안 보이고, 전부 지금처럼 로컬 전용으로 동작한다(firebase SDK도 번들에 안 실림 — 동적 import).

**설정 순서**

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만듭니다(daily_topic과 같은 프로젝트를
   공유해도 됩니다 — Firestore 경로가 `users/{uid}/grammarLife/...`로 따로 쓰입니다).
2. **Authentication → Sign-in method**에서 Google 로그인을 켭니다.
3. **Firestore Database**를 만듭니다.
4. 프로젝트 설정 → "내 앱"에서 웹 앱을 추가하면 나오는 설정값을 `.env.local`에 넣습니다(`.env.example` 참고):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Firestore 보안 규칙을 배포합니다(자기 uid 아래 문서만 읽고 쓸 수 있게):
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Vercel/Cloudflare Pages에 배포한다면 위 6개 `VITE_*` 값을 그 플랫폼의 환경 변수에도 똑같이 등록하세요.

로그인은 Google 팝업만 지원한다(서버가 없는 정적 사이트라 서버 쪽 로그인은 못 씀). 처음 로그인할 때 이 기기와
클라우드 양쪽에 기록이 있으면 더 최근에 바뀐 쪽을 따른다(`src/lib/sync.ts`).

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

서버·백엔드가 전혀 없는 정적 사이트라 두 곳 다 설정이 거의 필요 없다. 기기 간 동기화(위 섹션)를 켜지 않으면
환경 변수도 필요 없다.

**Vercel**
1. GitHub 저장소를 Vercel에 연결한다.
2. Framework Preset: Vite. Build Command `npm run build`, Output Directory `dist` (기본값 그대로면 자동 인식됨).
3. 환경 변수: 기기 간 동기화를 켤 때만 `VITE_FIREBASE_*` 6개(위 섹션 참고).

**Cloudflare Pages**
1. 저장소 연결 후 Build command `npm run build`, Build output directory `dist`.
2. 환경 변수: 기기 간 동기화를 켤 때만 `VITE_FIREBASE_*` 6개(위 섹션 참고).

배포 전에 로컬에서 `npm run build && npx vite preview`로 한 번 띄워보고, PWA 설치·오프라인 동작까지 확인하는 걸 권장한다.

## 레거시 앱에서 기록 옮기는 법

기존 `legacy/grammar-app.html`(또는 배포돼 있던 이전 버전)을 쓰던 사람이 새 앱으로 넘어올 때:

1. 레거시 앱에서 **나 › 기록 옮기기 › 백업 코드 만들기**를 누르고, 나온 코드를 전부 복사한다.
2. 새 앱에서 설문을 마치고 **나 › 기록 옮기기 › 백업 코드 붙여넣기**에 그대로 붙여넣고 가져오기를 누른다.
3. 진도·단어·노트·XP·설문이 모두 그대로 복원된다. (`{app:"grammar-life",v:1,data}` 래핑 형식과, 레거시 구버전이 만든
   래핑 없는 raw 형식 둘 다 읽을 수 있다 — `src/lib/storage.test.ts`에서 둘 다 테스트함.)
