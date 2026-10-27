import pointsEn from "./data/points.en.json";
import pointsJa from "./data/points.ja.json";
import examEn from "./data/exam.en.json";
import examJa from "./data/exam.ja.json";
import vocabEn from "./data/vocab.en.json";
import vocabJa from "./data/vocab.ja.json";
import jobs from "./data/jobs.json";
import rides from "./data/rides.json";
import hobbies from "./data/hobbies.json";
import plans from "./data/plans.json";
import goals from "./data/goals.json";
import type { GrammarPoint, ExamQuestion, VocabWord, JobOption, RideOption, HobbyOption, PlanOption, GoalOption } from "./types";

// 1단계 임시 확인용 화면. 실제 화면은 4단계에서 만든다.
const points = { en: pointsEn as GrammarPoint[], ja: pointsJa as GrammarPoint[] };
const exam = { en: examEn as ExamQuestion[], ja: examJa as ExamQuestion[] };
const vocab = { en: vocabEn as VocabWord[], ja: vocabJa as VocabWord[] };
const survey = {
  jobs: jobs as JobOption[],
  rides: rides as RideOption[],
  hobbies: hobbies as HobbyOption[],
  plans: plans as PlanOption[],
  goals: goals as GoalOption[],
};

function App() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 20, lineHeight: 1.8 }}>
      <h1>내 생활 문법 — 1단계 데이터 확인</h1>
      <ul>
        <li>문법 포인트: 영어 {points.en.length}개 · 일본어 {points.ja.length}개</li>
        <li>실전 문제: 영어 {exam.en.length}개 · 일본어 {exam.ja.length}개</li>
        <li>단어: 영어 {vocab.en.length}개 · 일본어 {vocab.ja.length}개</li>
        <li>
          설문 선택지: 직업 {survey.jobs.length} · 출퇴근 {survey.rides.length} · 취미 {survey.hobbies.length} · 예정 {survey.plans.length} ·
          목표 {survey.goals.length}
        </li>
      </ul>
      <p>화면은 4단계에서 만듭니다. 지금은 JSON 데이터가 빌드에 정상적으로 들어오는지만 확인하는 중입니다.</p>
    </main>
  );
}

export default App;
