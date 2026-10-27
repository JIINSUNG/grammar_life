# VS Code에서 AI에게 처음 보낼 프롬프트

아래 `---` 사이를 그대로 복사해서 Claude Code(또는 Copilot 에이전트 모드) 채팅에 붙여넣으세요.
한 번에 다 시키지 말고, 각 단계가 끝나면 확인한 뒤 "다음 단계 진행해"라고 보내면 됩니다.

---

이 폴더는 영어·일본어 문법 학습 웹앱 "내 생활 문법"이야. 지금은 `legacy/grammar-app.html` 단일 HTML 파일로 돌아가고 있고,
이걸 VS Code에서 계속 키워 나갈 수 있는 정식 프로젝트로 옮기고 싶어.

먼저 `CLAUDE.md`를 끝까지 읽고 규칙을 지켜 줘. 핵심은 **배포 후 비용 0원(서버·AI API 없음), 데이터는 localStorage에만,
기존 백업 코드 호환, 학습 데이터 내용은 손으로 다시 쓰지 말고 스크립트로 옮기기**야.

## 목표 스택
- Vite + React 18 + TypeScript (strict)
- 스타일: `legacy/src/shell.html`의 CSS(토큰·다크 모드 포함)를 그대로 옮겨서 CSS 파일로. Tailwind 등 새 CSS 프레임워크는 쓰지 않음
- 테스트: Vitest (+ 화면 확인은 Playwright)
- PWA: vite-plugin-pwa (휴대폰 홈 화면에 설치, 오프라인 동작)
- 배포: Vercel 또는 Cloudflare Pages 정적 배포
- 라우팅 라이브러리, 상태관리 라이브러리는 꼭 필요하지 않으면 쓰지 않음(지금처럼 useState + localStorage)

## 진행 단계 — 단계마다 멈추고 결과를 보고해 줘

### 0단계: 파악
- `legacy/grammar-app.html`을 브라우저(또는 Playwright)로 열어서 화면 6개(오늘·문법·단어·노트·실전·나)와 학습 세션·단어 루틴·노트 편집·노트 복습·실전 시험 흐름을 확인해.
- `legacy/src/app.js`의 컴포넌트와 함수 목록을 정리하고, 아래 1~5단계 계획에서 빠진 게 있으면 알려 줘.
- 아직 코드는 만들지 마.

### 1단계: 프로젝트 뼈대 + 데이터 이식
- Vite React TS 프로젝트 생성, git init, `.gitignore`.
- `scripts/convert-legacy.mjs`: `legacy/src`의 데이터 파일(data.js ~ vocab_more.js)을 Node `vm`으로 실행해서
  `POINTS, CQ, EXAM, JOBS, RIDES, HOBBIES, PLANS, GOALS, TOEIC_GOALS, JLPT_GOALS, VOCAB_JA, VOCAB_EN`을 꺼내
  `src/data/*.json`(언어·종류별로 나눠서)으로 저장. CQ는 포인트에 합쳐도 됨.
- `src/types.ts`에 위 데이터와 저장 상태(`AppState`: profile, lang, prog, vprog, vtrack, notes, xp, days, seeds, exams, voice, furi)의 타입 정의.
- 검증: 변환 전후 개수(영어 문법 48, 일본어 208, CQ 256, 실전 문제, 단어 일본어 805·영어 589)가 같은지 출력해서 보여 줘.

### 2단계: 로직 이식 + 테스트
`src/lib/`에 화면과 분리해서 옮겨 줘. 동작은 레거시와 똑같이.
- `template.ts`: josa, slotVals, fill, build, toQuiz
- `srs.ts`: INTERVAL, grade(문법 통과 판정), dueList, nextNew(JLV·jstart), 단어 vNew/vDue/vOpts, 노트 nDue
- `ruby.ts`: rubify, plain, vruby, 렌더용 분해 함수
- `speech.ts`: voiceScore, bestVoice, speak
- `storage.ts`: load/save(`grammar-life:v1`), blankState, 백업 코드 export/import, schemaVersion 마이그레이션 자리
- Vitest 테스트:
  - `legacy/tools/check-templates.js`를 테스트로 옮기기: 모든 설문 조합 × 모든 템플릿에서 슬롯 누락 0, 오답 중복 0
  - josa(받침 유무), vruby(乗り換える→｜乗《の》り｜換《か》える, 電気ケトル, お会計), grade 통과 조건, vOpts가 항상 4개·뜻 겹침 없음
  - 레거시 백업 코드 샘플을 import해서 상태가 그대로 복원되는지

### 3단계: 후리가나 빌드 스크립트
- `legacy/tools/gen-ruby.js`를 `scripts/gen-ruby.mjs`로 옮겨서 새 데이터 JSON을 읽게 하고, `src/data/ruby.json` 생성.
- `package.json`에 `"prebuild"`로 연결. kuromoji는 devDependency(빌드할 때만 사용, 번들에 안 들어가게).
- 검증: 생성 결과가 `legacy/src/ruby_dict.js`와 같은지 비교.

### 4단계: 화면 이식
- htm 템플릿을 TSX 컴포넌트로 옮겨 줘. 파일은 화면별로:
  `screens/`(Today, GrammarList, Vocab, Notes, ExamHome, Me, Survey), `flows/`(Session, VocabSession, NoteEditor, NoteReview, Exam), `components/`(Sent, Ruby, Speak, TabBar, Icon …)
- 문구·순서·색·동작은 레거시와 똑같이. 개선하고 싶은 점이 보이면 바꾸지 말고 목록으로 따로 알려 줘.
- 검증: Playwright로 390×844에서 레거시와 새 앱의 각 화면 스크린샷을 찍어서 비교해 보여 주고,
  설문 → 오늘 루틴 1회 → 단어 루틴 1회 → 노트 작성·검토 → 실전 10문제 → 백업 코드 내보내기/가져오기 흐름이 에러 없이 끝나는 E2E 테스트 작성.

### 5단계: PWA + 배포
- vite-plugin-pwa로 manifest(이름 "내 생활 문법", 아이콘, theme color)와 오프라인 캐시.
- 저장소 용량을 위해 `navigator.storage.persist()` 요청.
- Vercel(또는 Cloudflare Pages) 배포 방법을 README에 정리. 환경 변수·서버 없음.
- README에 "레거시 앱에서 기록 옮기는 법"(나 › 기록 옮기기 › 백업 코드 만들기 → 새 앱에서 붙여넣기) 추가.

## 작업 방식
- 단계마다: 무엇을 했는지, 테스트 결과, 남은 문제를 짧게 보고하고 멈춰.
- 단계마다 git 커밋(메시지는 한국어로 짧게).
- 확실하지 않은 건 추측하지 말고 레거시 코드를 확인하거나 나한테 물어봐.

---

## 이후에 쓸 만한 프롬프트 예시

- 일본어 N3 문법 5개 추가:
  > CLAUDE.md의 "콘텐츠를 추가할 때 규칙"을 지켜서 N3 문법 5개(～わけにはいかない, ～に違いない, …)를 추가해 줘. 포인트마다 템플릿 3개 + 개념 확인 1개 + 실전 문제 1개. 오답은 확실히 틀린 것만 쓰고, 후리가나 재생성과 템플릿 테스트까지 통과시켜 줘.
- 단어 추가:
  > 일본어 N2 단어 100개를 `src/data/vocab-ja.json`에 추가해 줘. 기존 단어와 겹치지 않게, 뜻이 같은 단어가 있으면 뜻을 구별되게 써 줘. vruby가 실패하는 단어가 없는지 테스트해 줘.
- 새 기능:
  > 노트 탭에 "이번 주에 쓴 문장 수"와 "자주 놓친 점 변화"를 보여 주는 카드를 추가해 줘. 데이터는 기존 notes만 써서 계산하고, 새 저장 필드가 필요하면 마이그레이션도 같이.
