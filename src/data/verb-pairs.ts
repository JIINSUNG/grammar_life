// 자동사·타동사 짝은 패턴별로 외우면 하나씩 외우는 것보다 훨씬 수월하다.
// 레거시에 없던 새 콘텐츠라 변환 스크립트를 거치지 않고 이 파일에 직접 둔다.
export interface VerbPair {
  id: string;
  /** あ단+る/え단+る, う단/える, れる/す, 불규칙 중 하나 */
  group: "aru-eru" | "u-eru" | "reru-su" | "irregular";
  intr: { w: string; r: string; m: string };
  tr: { w: string; r: string; m: string };
  example: { intr: string; tr: string };
}

export interface VerbPairGroup {
  id: VerbPair["group"];
  title: string;
  rule: string;
}

export const VERB_PAIR_GROUPS: VerbPairGroup[] = [
  {
    id: "aru-eru",
    title: "〜ある(자동사) / 〜える(타동사)",
    rule: "제일 규칙적인 짝. '아루'는 저절로 '아~' 하고 되는 느낌(자동사), '에루'는 내가 '에잇!' 하고 손대는 느낌(타동사)으로 외우면 헷갈리지 않아요.",
  },
  {
    id: "u-eru",
    title: "〜う/く(자동사, 짧게 끝남) / 〜ける(타동사, ける가 붙음)",
    rule: "자동사는 짧게 톡 끝나고, 타동사는 뒤에 'ける'가 붙어서 길어져요. 'ける'가 붙으면 누가 손을 댄 거예요.",
  },
  {
    id: "reru-su",
    title: "〜れる(자동사) / 〜す(타동사)",
    rule: "'れる'는 저절로 그렇게 '되는'(수동과 비슷한 느낌) 자동사, 'す'는 내가 밖으로 '내보내는'(사역과 비슷한 느낌) 타동사예요.",
  },
  {
    id: "irregular",
    title: "규칙이 없는 짝",
    rule: "패턴이 없어서 그냥 쌍으로 외워야 해요. 그만큼 자주 나오는 기본 동사들이에요.",
  },
];

export const VERB_PAIRS: VerbPair[] = [
  { id: "shimaru", group: "aru-eru", intr: { w: "閉まる", r: "しまる", m: "닫히다" }, tr: { w: "閉める", r: "しめる", m: "닫다" }, example: { intr: "ドアが閉まる。", tr: "ドアを閉める。" } },
  { id: "kimaru", group: "aru-eru", intr: { w: "決まる", r: "きまる", m: "정해지다" }, tr: { w: "決める", r: "きめる", m: "정하다" }, example: { intr: "日程が決まる。", tr: "日程を決める。" } },
  { id: "atsumaru", group: "aru-eru", intr: { w: "集まる", r: "あつまる", m: "모이다" }, tr: { w: "集める", r: "あつめる", m: "모으다" }, example: { intr: "人が集まる。", tr: "人を集める。" } },
  { id: "hajimaru", group: "aru-eru", intr: { w: "始まる", r: "はじまる", m: "시작되다" }, tr: { w: "始める", r: "はじめる", m: "시작하다" }, example: { intr: "セールが始まる。", tr: "セールを始める。" } },
  { id: "tomaru", group: "aru-eru", intr: { w: "止まる", r: "とまる", m: "멈추다" }, tr: { w: "止める", r: "とめる", m: "세우다" }, example: { intr: "車が止まる。", tr: "車を止める。" } },
  { id: "kawaru", group: "aru-eru", intr: { w: "変わる", r: "かわる", m: "바뀌다" }, tr: { w: "変える", r: "かえる", m: "바꾸다" }, example: { intr: "予定が変わる。", tr: "予定を変える。" } },
  { id: "tsutawaru", group: "aru-eru", intr: { w: "伝わる", r: "つたわる", m: "전해지다" }, tr: { w: "伝える", r: "つたえる", m: "전하다" }, example: { intr: "気持ちが伝わる。", tr: "気持ちを伝える。" } },
  { id: "agaru", group: "aru-eru", intr: { w: "上がる", r: "あがる", m: "오르다" }, tr: { w: "上げる", r: "あげる", m: "올리다" }, example: { intr: "値段が上がる。", tr: "値段を上げる。" } },
  { id: "sagaru", group: "aru-eru", intr: { w: "下がる", r: "さがる", m: "내려가다" }, tr: { w: "下げる", r: "さげる", m: "내리다" }, example: { intr: "値段が下がる。", tr: "値段を下げる。" } },
  { id: "aku", group: "u-eru", intr: { w: "開く", r: "あく", m: "열리다" }, tr: { w: "開ける", r: "あける", m: "열다" }, example: { intr: "ドアが開く。", tr: "ドアを開ける。" } },
  { id: "tsuku", group: "u-eru", intr: { w: "付く", r: "つく", m: "붙다·켜지다" }, tr: { w: "付ける", r: "つける", m: "붙이다·켜다" }, example: { intr: "電気が付く。", tr: "電気を付ける。" } },
  { id: "todoku", group: "u-eru", intr: { w: "届く", r: "とどく", m: "도착하다·닿다" }, tr: { w: "届ける", r: "とどける", m: "보내다·전달하다" }, example: { intr: "荷物が届く。", tr: "荷物を届ける。" } },
  { id: "kowareru", group: "reru-su", intr: { w: "壊れる", r: "こわれる", m: "고장나다" }, tr: { w: "壊す", r: "こわす", m: "고장내다" }, example: { intr: "機械が壊れる。", tr: "機械を壊す。" } },
  { id: "taoreru", group: "reru-su", intr: { w: "倒れる", r: "たおれる", m: "쓰러지다" }, tr: { w: "倒す", r: "たおす", m: "쓰러뜨리다" }, example: { intr: "看板が倒れる。", tr: "看板を倒す。" } },
  { id: "yogoreru", group: "reru-su", intr: { w: "汚れる", r: "よごれる", m: "더러워지다" }, tr: { w: "汚す", r: "よごす", m: "더럽히다" }, example: { intr: "服が汚れる。", tr: "服を汚す。" } },
  { id: "nagareru", group: "reru-su", intr: { w: "流れる", r: "ながれる", m: "흐르다" }, tr: { w: "流す", r: "ながす", m: "흘리다" }, example: { intr: "水が流れる。", tr: "水を流す。" } },
  { id: "deru", group: "reru-su", intr: { w: "出る", r: "でる", m: "나가다·나오다" }, tr: { w: "出す", r: "だす", m: "내다·꺼내다" }, example: { intr: "お客様が出る。", tr: "お客様に出す。" } },
  { id: "hairu", group: "irregular", intr: { w: "入る", r: "はいる", m: "들어가다" }, tr: { w: "入れる", r: "いれる", m: "넣다" }, example: { intr: "お客様が入る。", tr: "商品を入れる。" } },
  { id: "kieru", group: "irregular", intr: { w: "消える", r: "きえる", m: "꺼지다·사라지다" }, tr: { w: "消す", r: "けす", m: "끄다·지우다" }, example: { intr: "電気が消える。", tr: "電気を消す。" } },
];
