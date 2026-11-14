// 해외여행에서 바로 꺼내 쓰는 멘트 — 한국어·일본어·영어를 한 번에. dialogues.ts처럼 레거시 변환을
// 거치지 않고 이 파일에 직접 둔다. 일본어는 ｜漢字《かな》 표기로 후리가나를 직접 달았다(Ruby 컴포넌트로 렌더,
// TTS엔 plain()으로 읽기를 뺀 문장을 넘긴다).
// {n} 슬롯은 인원 수 — 화면에서 고른 인원(1~6명)이 언어별 표현으로 들어간다(PARTY 참고).

export type PhraseCat = "basic" | "food" | "stay" | "move" | "shop" | "sight" | "help";

export interface TravelPhrase {
  id: string;
  cat: PhraseCat;
  ko: string;
  ja: string;
  en: string;
  /** 쓰는 요령·상황 설명(선택). */
  tip?: string;
}

export const PHRASE_CATS: { id: PhraseCat; icon: string; label: string }[] = [
  { id: "basic", icon: "👋", label: "기본" },
  { id: "food", icon: "🍜", label: "식당" },
  { id: "stay", icon: "🏨", label: "숙소" },
  { id: "move", icon: "🚃", label: "교통" },
  { id: "shop", icon: "🛍️", label: "쇼핑" },
  { id: "sight", icon: "📸", label: "관광" },
  { id: "help", icon: "🚨", label: "긴급" },
];

/** 인원 수 표현. 일본어는 사람 수 세는 말(ひとり・ふたり…)이 따로 있어서 표로 둔다. */
export const PARTY: Record<number, { ko: string; ja: string; en: string }> = {
  1: { ko: "1명", ja: "｜一人《ひとり》", en: "one" },
  2: { ko: "2명", ja: "｜二人《ふたり》", en: "two" },
  3: { ko: "3명", ja: "｜三人《さんにん》", en: "three" },
  4: { ko: "4명", ja: "｜四人《よにん》", en: "four" },
  5: { ko: "5명", ja: "｜五人《ごにん》", en: "five" },
  6: { ko: "6명", ja: "｜六人《ろくにん》", en: "six" },
};

export const TRAVEL_PHRASES: TravelPhrase[] = [
  // 기본
  { id: "b1", cat: "basic", ko: "저기요 / 실례합니다", ja: "すみません。", en: "Excuse me.", tip: "점원을 부를 때, 길을 물을 때, 지나갈 때 다 쓸 수 있어요." },
  { id: "b2", cat: "basic", ko: "감사합니다", ja: "ありがとうございます。", en: "Thank you." },
  { id: "b3", cat: "basic", ko: "(그 나라 말을) 잘 못해요", ja: "｜日本語《にほんご》があまり｜話《はな》せません。", en: "My English isn't very good." },
  { id: "b4", cat: "basic", ko: "조금만 천천히 말해 주실 수 있나요?", ja: "もう｜少《すこ》しゆっくり｜話《はな》していただけますか。", en: "Could you speak a little more slowly?" },
  { id: "b5", cat: "basic", ko: "한 번만 더 말씀해 주세요", ja: "もう｜一度《いちど》お｜願《ねが》いします。", en: "Could you say that again, please?" },
  { id: "b6", cat: "basic", ko: "여기에 적어 주실 수 있나요?", ja: "ここに｜書《か》いていただけますか。", en: "Could you write it down here?", tip: "숫자·지명은 적어 달라고 하면 확실해요." },
  { id: "b7", cat: "basic", ko: "이거 뭐예요?", ja: "これは｜何《なん》ですか。", en: "What is this?" },
  { id: "b8", cat: "basic", ko: "화장실이 어디예요?", ja: "トイレはどこですか。", en: "Where is the restroom?" },
  { id: "b9", cat: "basic", ko: "와이파이 비밀번호 알려 주세요", ja: "Wi-Fiのパスワードを｜教《おし》えてください。", en: "What's the Wi-Fi password?" },
  { id: "b10", cat: "basic", ko: "사진 좀 찍어 주실 수 있나요?", ja: "｜写真《しゃしん》を｜撮《と》っていただけますか。", en: "Could you take a picture of us?" },

  // 식당
  { id: "f1", cat: "food", ko: "{n}인데 식사 가능해요?", ja: "{n}ですが、｜入《はい》れますか。", en: "Do you have a table for {n}?", tip: "가게 입구에서 손가락으로 인원을 같이 보여주면 더 빨라요." },
  { id: "f2", cat: "food", ko: "예약은 안 했는데 괜찮나요?", ja: "｜予約《よやく》していないんですが、｜大丈夫《だいじょうぶ》ですか。", en: "We don't have a reservation. Is that okay?" },
  { id: "f3", cat: "food", ko: "예약했어요", ja: "｜予約《よやく》しています。", en: "I have a reservation.", tip: "이어서 예약자 이름을 말하면 돼요." },
  { id: "f4", cat: "food", ko: "얼마나 기다려야 해요?", ja: "どのくらい｜待《ま》ちますか。", en: "How long is the wait?" },
  { id: "f5", cat: "food", ko: "금연석으로 부탁해요", ja: "｜禁煙席《きんえんせき》でお｜願《ねが》いします。", en: "Non-smoking, please." },
  { id: "f6", cat: "food", ko: "한국어 메뉴 있나요?", ja: "｜韓国語《かんこくご》のメニューはありますか。", en: "Do you have a menu in Korean?" },
  { id: "f7", cat: "food", ko: "추천 메뉴가 뭐예요?", ja: "おすすめは｜何《なん》ですか。", en: "What do you recommend?" },
  { id: "f8", cat: "food", ko: "이걸로 주세요", ja: "これをお｜願《ねが》いします。", en: "I'll have this, please.", tip: "메뉴판을 가리키면서 말하면 끝." },
  { id: "f9", cat: "food", ko: "같은 걸로 주세요", ja: "｜同《おな》じものをお｜願《ねが》いします。", en: "The same, please." },
  { id: "f10", cat: "food", ko: "새우 알레르기가 있어요", ja: "エビアレルギーがあります。", en: "I'm allergic to shrimp.", tip: "다른 재료로 바꿔 쓰세요 — 땅콩 ピーナッツ(peanuts), 우유 ぎゅうにゅう(milk), 밀 こむぎ(wheat)." },
  { id: "f11", cat: "food", ko: "덜 맵게 해 주세요", ja: "｜辛《から》さ｜控《ひか》えめでお｜願《ねが》いします。", en: "Not too spicy, please." },
  { id: "f12", cat: "food", ko: "물 좀 주세요", ja: "お｜水《みず》をください。", en: "Could I have some water?" },
  { id: "f13", cat: "food", ko: "앞접시 좀 주실 수 있나요?", ja: "｜取《と》り｜皿《ざら》をいただけますか。", en: "Could we get some small plates?" },
  { id: "f14", cat: "food", ko: "라스트 오더가 몇 시예요?", ja: "ラストオーダーは｜何時《なんじ》ですか。", en: "What time is last order?" },
  { id: "f15", cat: "food", ko: "포장 되나요?", ja: "｜持《も》ち｜帰《かえ》りできますか。", en: "Can I get this to go?" },
  { id: "f16", cat: "food", ko: "계산해 주세요", ja: "お｜会計《かいけい》お｜願《ねが》いします。", en: "Check, please." },
  { id: "f17", cat: "food", ko: "따로 계산할게요", ja: "｜別々《べつべつ》でお｜願《ねが》いします。", en: "Separate checks, please." },
  { id: "f18", cat: "food", ko: "카드 되나요?", ja: "カードは｜使《つか》えますか。", en: "Do you take credit cards?" },

  // 숙소
  { id: "s1", cat: "stay", ko: "체크인 할게요", ja: "チェックインをお｜願《ねが》いします。", en: "I'd like to check in, please.", tip: "이어서 예약자 이름을 말하고 여권을 보여주면 돼요." },
  { id: "s2", cat: "stay", ko: "숙박세는 얼마예요?", ja: "｜宿泊税《しゅくはくぜい》はいくらですか。", en: "How much is the accommodation tax?", tip: "일본 일부 도시(도쿄·오사카·교토 등)는 1인 1박마다 따로 받아요." },
  { id: "s3", cat: "stay", ko: "숙박세는 현금으로만 내야 하나요?", ja: "｜宿泊税《しゅくはくぜい》は｜現金《げんきん》だけですか。", en: "Is the accommodation tax cash only?" },
  { id: "s4", cat: "stay", ko: "오늘 밤 {n} 묵을 방 있나요?", ja: "｜今晩《こんばん》、{n}で｜泊《と》まれる｜部屋《へや》はありますか。", en: "Do you have a room for {n} tonight?" },
  { id: "s5", cat: "stay", ko: "체크인 전에 짐 맡길 수 있나요?", ja: "チェックインの｜前《まえ》に｜荷物《にもつ》を｜預《あず》かってもらえますか。", en: "Can you hold my luggage before check-in?" },
  { id: "s6", cat: "stay", ko: "체크아웃 후에 짐 맡길 수 있나요?", ja: "チェックアウトの｜後《あと》、｜荷物《にもつ》を｜預《あず》かってもらえますか。", en: "Can you keep my luggage after check-out?" },
  { id: "s7", cat: "stay", ko: "체크아웃은 몇 시예요?", ja: "チェックアウトは｜何時《なんじ》ですか。", en: "What time is check-out?" },
  { id: "s8", cat: "stay", ko: "조식은 몇 시부터예요?", ja: "｜朝食《ちょうしょく》は｜何時《なんじ》からですか。", en: "What time does breakfast start?" },
  { id: "s9", cat: "stay", ko: "대욕장은 몇 시까지예요?", ja: "｜大浴場《だいよくじょう》は｜何時《なんじ》までですか。", en: "Until what time is the public bath open?" },
  { id: "s10", cat: "stay", ko: "수건 좀 더 주실 수 있나요?", ja: "タオルをもう｜少《すこ》しいただけますか。", en: "Could I get some more towels?" },
  { id: "s11", cat: "stay", ko: "에어컨이 안 돼요", ja: "エアコンが｜動《うご》きません。", en: "The air conditioner isn't working." },
  { id: "s12", cat: "stay", ko: "방 열쇠를 잃어버렸어요", ja: "｜部屋《へや》の｜鍵《かぎ》をなくしてしまいました。", en: "I lost my room key." },
  { id: "s13", cat: "stay", ko: "택시 좀 불러 주실 수 있나요?", ja: "タクシーを｜呼《よ》んでいただけますか。", en: "Could you call a taxi for me?" },
  { id: "s14", cat: "stay", ko: "이 근처에 편의점 있나요?", ja: "この｜近《ちか》くにコンビニはありますか。", en: "Is there a convenience store nearby?" },

  // 교통
  { id: "m1", cat: "move", ko: "이 주소로 가 주세요", ja: "この｜住所《じゅうしょ》までお｜願《ねが》いします。", en: "Please take me to this address.", tip: "택시에서 지도·주소 화면을 보여주면서." },
  { id: "m2", cat: "move", ko: "역까지 얼마나 걸려요?", ja: "｜駅《えき》までどのくらいかかりますか。", en: "How long does it take to get to the station?" },
  { id: "m3", cat: "move", ko: "걸어서 갈 수 있나요?", ja: "｜歩《ある》いて｜行《い》けますか。", en: "Can I walk there?" },
  { id: "m4", cat: "move", ko: "이 전철 오사카 가나요?", ja: "この｜電車《でんしゃ》は｜大阪《おおさか》に｜行《い》きますか。", en: "Does this train go to Osaka?", tip: "지명만 바꿔서 쓰세요." },
  { id: "m5", cat: "move", ko: "어디서 갈아타야 해요?", ja: "どこで｜乗《の》り｜換《か》えればいいですか。", en: "Where should I transfer?" },
  { id: "m6", cat: "move", ko: "몇 번 승강장이에요?", ja: "｜何番線《なんばんせん》ですか。", en: "Which platform is it?" },
  { id: "m7", cat: "move", ko: "표는 어디서 사요?", ja: "｜切符《きっぷ》はどこで｜買《か》えますか。", en: "Where can I buy a ticket?" },
  { id: "m8", cat: "move", ko: "교통카드 충전은 어디서 해요?", ja: "ICカードのチャージはどこでできますか。", en: "Where can I top up my transit card?" },
  { id: "m9", cat: "move", ko: "다음 역은 어디예요?", ja: "｜次《つぎ》の｜駅《えき》はどこですか。", en: "What's the next station?" },
  { id: "m10", cat: "move", ko: "여기서 세워 주세요", ja: "ここで｜止《と》めてください。", en: "Please stop here." },
  { id: "m11", cat: "move", ko: "트렁크 좀 열어 주실 수 있나요?", ja: "トランクを｜開《あ》けていただけますか。", en: "Could you open the trunk?" },
  { id: "m12", cat: "move", ko: "길을 잃었어요", ja: "｜道《みち》に｜迷《まよ》ってしまいました。", en: "I'm lost." },

  // 쇼핑
  { id: "p1", cat: "shop", ko: "이거 얼마예요?", ja: "これはいくらですか。", en: "How much is this?" },
  { id: "p2", cat: "shop", ko: "면세 되나요?", ja: "｜免税《めんぜい》できますか。", en: "Can I buy this tax-free?", tip: "여권이 있어야 해요." },
  { id: "p3", cat: "shop", ko: "입어 봐도 되나요?", ja: "｜試着《しちゃく》してもいいですか。", en: "Can I try this on?" },
  { id: "p4", cat: "shop", ko: "다른 사이즈 있나요?", ja: "ほかのサイズはありますか。", en: "Do you have this in another size?" },
  { id: "p5", cat: "shop", ko: "다른 색 있나요?", ja: "ほかの｜色《いろ》はありますか。", en: "Do you have this in another color?" },
  { id: "p6", cat: "shop", ko: "조금 더 싼 거 있나요?", ja: "もう｜少《すこ》し｜安《やす》いものはありますか。", en: "Do you have anything a bit cheaper?" },
  { id: "p7", cat: "shop", ko: "그냥 구경하는 중이에요", ja: "｜見《み》ているだけです。", en: "I'm just looking." },
  { id: "p8", cat: "shop", ko: "선물용으로 포장해 주실 수 있나요?", ja: "プレゼント｜用《よう》に｜包《つつ》んでいただけますか。", en: "Could you gift-wrap this?" },
  { id: "p9", cat: "shop", ko: "봉투는 괜찮아요", ja: "｜袋《ふくろ》は｜大丈夫《だいじょうぶ》です。", en: "I don't need a bag." },
  { id: "p10", cat: "shop", ko: "영수증 주세요", ja: "レシートをください。", en: "Could I have a receipt?" },

  // 관광
  { id: "t1", cat: "sight", ko: "어른 {n} 표 주세요", ja: "｜大人《おとな》{n}、お｜願《ねが》いします。", en: "Adult tickets for {n}, please." },
  { id: "t2", cat: "sight", ko: "입장료는 얼마예요?", ja: "｜入場料《にゅうじょうりょう》はいくらですか。", en: "How much is the admission?" },
  { id: "t3", cat: "sight", ko: "몇 시까지 열어요?", ja: "｜何時《なんじ》まで｜開《あ》いていますか。", en: "What time do you close?" },
  { id: "t4", cat: "sight", ko: "여기서 사진 찍어도 되나요?", ja: "ここで｜写真《しゃしん》を｜撮《と》ってもいいですか。", en: "Is it okay to take pictures here?" },
  { id: "t5", cat: "sight", ko: "코인로커는 어디예요?", ja: "コインロッカーはどこですか。", en: "Where are the coin lockers?" },

  // 긴급
  { id: "h1", cat: "help", ko: "도와주세요!", ja: "｜助《たす》けてください。", en: "Please help me!" },
  { id: "h2", cat: "help", ko: "경찰 불러 주세요", ja: "｜警察《けいさつ》を｜呼《よ》んでください。", en: "Please call the police." },
  { id: "h3", cat: "help", ko: "구급차 불러 주세요", ja: "｜救急車《きゅうきゅうしゃ》を｜呼《よ》んでください。", en: "Please call an ambulance.", tip: "일본 구급·소방 119, 경찰 110." },
  { id: "h4", cat: "help", ko: "지갑을 잃어버렸어요", ja: "｜財布《さいふ》をなくしてしまいました。", en: "I lost my wallet." },
  { id: "h5", cat: "help", ko: "몸이 안 좋아요", ja: "｜気分《きぶん》が｜悪《わる》いです。", en: "I don't feel well." },
  { id: "h6", cat: "help", ko: "이 근처에 약국 있나요?", ja: "｜近《ちか》くに｜薬局《やっきょく》はありますか。", en: "Is there a pharmacy nearby?" },
  { id: "h7", cat: "help", ko: "두통약 있나요?", ja: "｜頭痛薬《ずつうやく》はありますか。", en: "Do you have any headache medicine?" },
];
