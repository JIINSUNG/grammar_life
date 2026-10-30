// 토익·일반 영어에서 "뜻은 아는데 실전에서 헷갈리는" 문법·어휘 쌍을 모아 직접 비교한다.
// grammar-pairs.ts(일본어)와 같은 이유로 변환 스크립트를 거치지 않고 이 파일에 직접 둔다.
import type { GrammarPairGroup } from "./grammar-pairs";

export const GRAMMAR_PAIR_GROUPS_EN: GrammarPairGroup[] = [
  {
    id: "present-perfect-past",
    lv: "기초",
    title: "현재완료(have done) / 과거(did)",
    rule: "과거(did)는 '언제 끝났는지'가 중요한 특정 시점의 일이고, 현재완료(have done)는 '지금까지의 경험·영향'이 중요해서 정확한 시점은 말하지 않아요.",
    pitfall: "yesterday, last week, in 2020처럼 명확한 과거 시점 표현은 현재완료와 같이 못 써요. 'I have seen him yesterday'는 틀린 문장이고 'I saw him yesterday'가 맞아요.",
    items: [
      { id: "past", form: "did", nuance: "끝난 특정 시점의 일", detail: "언제 일어났는지가 중요하고, 지금과는 단절된 과거의 사실을 말해요. yesterday, last week 같은 과거 시점 표현과 자주 써요.", example: { s: "I saw him yesterday.", ko: "나는 어제 그를 봤다. (어제라는 시점이 중요)" } },
      { id: "perfect", form: "have done", nuance: "지금까지의 경험·영향", detail: "정확히 언제인지는 말하지 않고, 과거의 일이 현재까지 영향을 주거나 경험으로 남아있다는 걸 강조해요.", example: { s: "I have seen this movie before.", ko: "나는 이 영화를 전에 본 적이 있다. (언제인지보다 '본 경험'이 중요)" } },
    ],
  },
  {
    id: "afew-few-alittle-little",
    lv: "기초",
    title: "a few / few / a little / little",
    rule: "a few·few는 셀 수 있는 명사(복수)에, a little·little은 셀 수 없는 명사에 써요. 또 a가 붙으면 '조금 있다'(긍정), a 없이 쓰면 '거의 없다'(부정적 느낌)예요.",
    pitfall: "a few와 few, a little과 little을 그냥 같은 뜻으로 외워서, 긍정·부정의 뉘앙스 차이(있다/거의 없다)를 놓치는 경우가 많아요.",
    items: [
      { id: "afew", form: "a few + 복수명사", nuance: "조금 있다(셀 수 있는 것)", detail: "셀 수 있는 명사가 '약간은 있다'는 긍정적인 느낌.", example: { s: "I have a few friends here.", ko: "나는 여기에 친구가 몇 명 있다. (있어서 다행인 느낌)" } },
      { id: "few", form: "few + 복수명사", nuance: "거의 없다(셀 수 있는 것)", detail: "셀 수 있는 명사가 '거의 없다'는 아쉬운·부정적인 느낌.", example: { s: "I have few friends here.", ko: "나는 여기에 친구가 거의 없다. (외로운 느낌)" } },
      { id: "alittle", form: "a little + 단수명사", nuance: "조금 있다(셀 수 없는 것)", detail: "셀 수 없는 명사가 '약간은 있다'는 긍정적인 느낌.", example: { s: "I have a little money.", ko: "나는 돈이 조금 있다. (있어서 괜찮은 느낌)" } },
      { id: "little", form: "little + 단수명사", nuance: "거의 없다(셀 수 없는 것)", detail: "셀 수 없는 명사가 '거의 없다'는 부정적인 느낌.", example: { s: "I have little money.", ko: "나는 돈이 거의 없다. (곤란한 느낌)" } },
    ],
  },
  {
    id: "make-do",
    lv: "기초",
    title: "make / do",
    rule: "make는 뭔가를 '새로 만들어내는'(결과물이 생기는) 느낌이고, do는 '행위·활동 자체'를 가리켜요. 다만 둘 다 관용적인 짝(collocation)이 많아서 예문으로 통째로 외우는 게 제일 안전해요.",
    pitfall: "make a mistake를 do a mistake로, do homework를 make homework로 바꿔 쓰는 실수가 흔해요. 콜로케이션은 규칙보다 암기가 더 확실해요.",
    items: [
      { id: "make", form: "make", nuance: "결과물을 만들어냄", detail: "make a decision, make a mistake, make a plan, make money처럼 '없던 것이 생기는' 느낌의 동사와 짝을 이뤄요.", example: { s: "I need to make a decision.", ko: "나는 결정을 내려야 한다." } },
      { id: "do", form: "do", nuance: "행위·활동 자체", detail: "do homework, do the dishes, do business, do exercise처럼 '해야 하는 일·활동'을 가리킬 때 써요.", example: { s: "I always do my homework after dinner.", ko: "나는 항상 저녁 먹은 뒤에 숙제를 한다." } },
    ],
  },
  {
    id: "since-for",
    lv: "기초",
    title: "since / for (기간 표현)",
    rule: "since는 '언제부터 시작했는지'(시작 시점)를, for는 '얼마나 지속됐는지'(지속 기간)를 말해요. 둘 다 현재완료와 자주 같이 써요.",
    pitfall: "since 뒤에 기간(three years)을, for 뒤에 시점(2010)을 넣는 실수가 많아요. since는 '시점', for는 '기간'이라고 짝을 지어 외우세요.",
    items: [
      { id: "since", form: "since + 시점", nuance: "시작한 기준 시점", detail: "since 2010, since last year처럼 '그때부터 지금까지'라는 시작점을 말해요.", example: { s: "I have lived here since 2010.", ko: "나는 2010년부터 여기서 살고 있다." } },
      { id: "for", form: "for + 기간", nuance: "지속된 기간의 길이", detail: "for 10 years, for a long time처럼 '얼마나 오래'라는 기간의 길이를 말해요.", example: { s: "I have lived here for 10 years.", ko: "나는 10년 동안 여기서 살고 있다." } },
    ],
  },
  {
    id: "usedto-would-beusedto-getusedto",
    lv: "중급",
    title: "used to / would / be used to / get used to",
    rule: "used to와 would는 둘 다 과거의 습관을 말하지만, would는 '상태'를 나타내는 동사(live, know, like 등)에는 못 써요. be used to는 '익숙한 상태', get used to는 '익숙해지는 과정'이에요.",
    pitfall: "네 표현 다 '~에 익숙하다/하곤 했다'로만 외워서 구분을 포기하는 경우가 많아요. 뒤에 동사원형이 오는지(used to/would), 명사·동명사가 오는지(be/get used to)만 봐도 절반은 구분돼요.",
    items: [
      { id: "usedto", form: "used to + 동사원형", nuance: "과거의 습관·상태(지금은 아님)", detail: "예전엔 그랬지만 지금은 그렇지 않은 습관이나 상태를 말해요. 상태동사에도 쓸 수 있어요.", example: { s: "I used to smoke, but I quit.", ko: "나는 예전에 담배를 피웠지만, 끊었다." } },
      { id: "would", form: "would + 동사원형", nuance: "과거의 반복 행동", detail: "과거에 반복됐던 '행동'을 말할 때 쓰고, live나 know 같은 상태동사에는 쓸 수 없어요.", example: { s: "When I was a kid, I would visit my grandma every summer.", ko: "어릴 때 나는 매년 여름 할머니를 찾아갔다." } },
      { id: "beusedto", form: "be used to + 명사/동명사", nuance: "익숙한 상태", detail: "이미 익숙해진 상태를 말해요. to 뒤에는 명사나 동명사(~ing)가 와요.", example: { s: "I am used to waking up early.", ko: "나는 일찍 일어나는 데 익숙하다." } },
      { id: "getusedto", form: "get used to + 명사/동명사", nuance: "익숙해지는 과정", detail: "아직 안 익숙했다가 점점 익숙해지는 변화의 과정을 말해요.", example: { s: "I am getting used to the new job.", ko: "나는 새 직장에 점점 익숙해지고 있다." } },
    ],
  },
  {
    id: "affect-effect",
    lv: "중급",
    title: "affect / effect",
    rule: "affect는 동사(영향을 주다), effect는 명사(영향, 결과)예요. 품사만 구분하면 거의 틀리지 않아요.",
    pitfall: "'영향을 주다'를 그대로 effect로 쓰는 실수가 아주 흔해요. 문장에서 동사 자리인지 명사 자리인지 먼저 확인하세요.",
    items: [
      { id: "affect", form: "affect (동사)", nuance: "영향을 주다", detail: "뒤에 목적어(명사)가 바로 오는 동사예요.", example: { s: "The weather affects my mood.", ko: "날씨는 내 기분에 영향을 준다." } },
      { id: "effect", form: "effect (명사)", nuance: "영향, 결과", detail: "보통 have an effect on처럼 관사(a/an)나 the와 함께 쓰이는 명사예요.", example: { s: "The weather has an effect on my mood.", ko: "날씨는 내 기분에 영향을 미친다." } },
    ],
  },
  {
    id: "borrow-lend",
    lv: "기초",
    title: "borrow / lend",
    rule: "borrow는 '내가 남에게서 빌려오는' 것이고, lend는 '내가 남에게 빌려주는' 것이에요. 방향이 정반대예요.",
    pitfall: "'빌려주다'라는 뜻으로 borrow를 써버리는 실수가 많아요. 내가 받는 쪽이면 borrow, 내가 주는 쪽이면 lend로 주어를 기준으로 생각하세요.",
    items: [
      { id: "borrow", form: "borrow", nuance: "내가 빌려오다", detail: "borrow A from B: B에게서 A를 빌리다. 빌리는 사람이 주어예요.", example: { s: "Can I borrow your pen?", ko: "네 펜 좀 빌릴 수 있을까?" } },
      { id: "lend", form: "lend", nuance: "내가 빌려주다", detail: "lend A to B: A를 B에게 빌려주다. 빌려주는 사람이 주어예요.", example: { s: "Can you lend me your pen?", ko: "네 펜 좀 빌려줄 수 있어?" } },
    ],
  },
  {
    id: "because-becauseof",
    lv: "기초",
    title: "because / because of",
    rule: "because 뒤에는 '주어+동사'가 있는 완전한 문장이 오고, because of 뒤에는 명사(구)만 와요.",
    pitfall: "because 뒤에 명사만 덜렁 쓰거나(because the rain), because of 뒤에 문장을 통째로 쓰는 실수가 흔해요.",
    items: [
      { id: "because", form: "because + 주어 + 동사", nuance: "완전한 문장이 이유", detail: "because 뒤에는 반드시 주어와 동사를 갖춘 문장이 와요.", example: { s: "I was late because the bus was delayed.", ko: "버스가 지연돼서 나는 늦었다." } },
      { id: "becauseof", form: "because of + 명사", nuance: "명사(구)가 이유", detail: "because of 뒤에는 동사 없이 명사나 명사구만 와요.", example: { s: "I was late because of the delayed bus.", ko: "지연된 버스 때문에 나는 늦었다." } },
    ],
  },
  {
    id: "although-despite",
    lv: "중급",
    title: "although / despite, in spite of",
    rule: "although 뒤에는 '주어+동사'가 있는 문장이, despite·in spite of 뒤에는 명사(구)나 동명사가 와요. 뜻은 둘 다 '~이지만'으로 같지만 뒤에 오는 품사가 달라요.",
    pitfall: "despite 뒤에 문장을 그대로 쓰거나(despite it was raining), although 뒤에 명사만 쓰는 실수가 많아요.",
    items: [
      { id: "although", form: "although + 주어 + 동사", nuance: "문장이 양보의 내용", detail: "although(또는 though) 뒤에는 완전한 문장이 와요.", example: { s: "Although it was raining, we went out.", ko: "비가 오고 있었지만, 우리는 나갔다." } },
      { id: "despite", form: "despite / in spite of + 명사", nuance: "명사(구)가 양보의 내용", detail: "despite와 in spite of는 뜻이 같고, 뒤에 명사나 동명사(~ing)가 와요. despite 뒤에는 of를 붙이지 않아요.", example: { s: "Despite the rain, we went out.", ko: "비가 왔지만, 우리는 나갔다." } },
    ],
  },
  {
    id: "raise-rise",
    lv: "중급",
    title: "raise / rise",
    rule: "raise는 타동사라서 목적어가 꼭 필요하고(누가 무언가를 올리다), rise는 자동사라서 목적어가 없어요(무언가가 스스로 오르다).",
    pitfall: "'물가가 올랐다'를 'Prices raised'로 쓰는 실수가 아주 흔해요. 물가가 스스로 오르는 거라 자동사 rise를 써서 'Prices rose'가 맞아요.",
    items: [
      { id: "raise", form: "raise + 목적어", nuance: "누가 무언가를 올리다(타동사)", detail: "주어가 다른 대상을 끌어올리는 행위예요. 목적어가 꼭 있어야 해요.", example: { s: "The company raised salaries.", ko: "그 회사는 임금을 올렸다." } },
      { id: "rise", form: "rise (자동사)", nuance: "무언가가 스스로 오르다", detail: "목적어 없이, 주어 자신이 오르는 상태 변화를 말해요.", example: { s: "Prices rose last year.", ko: "작년에 물가가 올랐다." } },
    ],
  },
  {
    id: "each-every",
    lv: "중급",
    title: "each / every",
    rule: "each는 '하나하나 개별적으로'를 강조하고, every는 '예외 없이 전부 다'를 강조해요. 둘 다 단수 명사·동사와 쓰지만, each는 each of + 복수대명사도 가능하고 every는 그렇게 못 써요.",
    pitfall: "every of the students처럼 every를 of와 함께 쓰는 실수가 흔해요. '~ 중에서'를 말하고 싶으면 each of만 되고, every는 of 없이 명사를 바로 받아요.",
    items: [
      { id: "each", form: "each (+ of)", nuance: "하나하나 개별적으로", detail: "여러 개 중 하나씩을 따로따로 가리키는 느낌. each of them처럼 of와 함께 쓸 수 있어요.", example: { s: "Each student has a laptop.", ko: "학생 각자가 노트북을 가지고 있다." } },
      { id: "every", form: "every", nuance: "예외 없이 전부", detail: "하나도 빠짐없이 전체를 가리키는 느낌. every of는 쓸 수 없어요.", example: { s: "Every student must attend the meeting.", ko: "모든 학생은 예외 없이 회의에 참석해야 한다." } },
    ],
  },
  {
    id: "neithernor-eitheror",
    lv: "중급",
    title: "neither...nor / either...or",
    rule: "neither...nor는 '둘 다 아니다'(부정), either...or는 '둘 중 하나'(선택)예요. 동사의 수는 보통 or/nor 뒤의 명사에 맞춰요.",
    pitfall: "neither...nor 문장에 또 not을 붙여 이중 부정을 만드는 실수가 흔해요(neither...nor 자체가 이미 부정이에요).",
    items: [
      { id: "neithernor", form: "neither A nor B", nuance: "A도 B도 아니다", detail: "A, B 둘 다를 부정해요. 이미 부정의 의미라 not을 따로 또 쓰지 않아요.", example: { s: "Neither he nor I am wrong.", ko: "그도 나도 틀리지 않았다." } },
      { id: "eitheror", form: "either A or B", nuance: "A 또는 B 중 하나", detail: "A와 B 중 하나를 선택하는 의미예요.", example: { s: "Either he or I am right.", ko: "그나 나, 둘 중 하나가 맞다." } },
    ],
  },
];
