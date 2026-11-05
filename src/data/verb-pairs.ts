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
  { id: "owaru", group: "aru-eru", intr: { w: "終わる", r: "おわる", m: "끝나다" }, tr: { w: "終える", r: "おえる", m: "끝내다" }, example: { intr: "仕事が終わる。", tr: "仕事を終える。" } },
  { id: "mitsukaru", group: "aru-eru", intr: { w: "見つかる", r: "みつかる", m: "발견되다" }, tr: { w: "見つける", r: "みつける", m: "발견하다" }, example: { intr: "財布が見つかる。", tr: "財布を見つける。" } },
  { id: "kuwawaru", group: "aru-eru", intr: { w: "加わる", r: "くわわる", m: "더해지다" }, tr: { w: "加える", r: "くわえる", m: "더하다" }, example: { intr: "メンバーが加わる。", tr: "メンバーを加える。" } },
  { id: "takamaru", group: "aru-eru", intr: { w: "高まる", r: "たかまる", m: "높아지다" }, tr: { w: "高める", r: "たかめる", m: "높이다" }, example: { intr: "人気が高まる。", tr: "人気を高める。" } },
  { id: "aku", group: "u-eru", intr: { w: "開く", r: "あく", m: "열리다" }, tr: { w: "開ける", r: "あける", m: "열다" }, example: { intr: "ドアが開く。", tr: "ドアを開ける。" } },
  { id: "tsuku", group: "u-eru", intr: { w: "付く", r: "つく", m: "붙다·켜지다" }, tr: { w: "付ける", r: "つける", m: "붙이다·켜다" }, example: { intr: "電気が付く。", tr: "電気を付ける。" } },
  { id: "todoku", group: "u-eru", intr: { w: "届く", r: "とどく", m: "도착하다·닿다" }, tr: { w: "届ける", r: "とどける", m: "보내다·전달하다" }, example: { intr: "荷物が届く。", tr: "荷物を届ける。" } },
  { id: "katazuku", group: "u-eru", intr: { w: "片付く", r: "かたづく", m: "정리되다" }, tr: { w: "片付ける", r: "かたづける", m: "정리하다" }, example: { intr: "棚が片付く。", tr: "棚を片付ける。" } },
  { id: "tsuzuku", group: "u-eru", intr: { w: "続く", r: "つづく", m: "계속되다" }, tr: { w: "続ける", r: "つづける", m: "계속하다" }, example: { intr: "セールが続く。", tr: "セールを続ける。" } },
  { id: "kowareru", group: "reru-su", intr: { w: "壊れる", r: "こわれる", m: "고장나다" }, tr: { w: "壊す", r: "こわす", m: "고장내다" }, example: { intr: "機械が壊れる。", tr: "機械を壊す。" } },
  { id: "taoreru", group: "reru-su", intr: { w: "倒れる", r: "たおれる", m: "쓰러지다" }, tr: { w: "倒す", r: "たおす", m: "쓰러뜨리다" }, example: { intr: "看板が倒れる。", tr: "看板を倒す。" } },
  { id: "yogoreru", group: "reru-su", intr: { w: "汚れる", r: "よごれる", m: "더러워지다" }, tr: { w: "汚す", r: "よごす", m: "더럽히다" }, example: { intr: "服が汚れる。", tr: "服を汚す。" } },
  { id: "nagareru", group: "reru-su", intr: { w: "流れる", r: "ながれる", m: "흐르다" }, tr: { w: "流す", r: "ながす", m: "흘리다" }, example: { intr: "水が流れる。", tr: "水を流す。" } },
  { id: "deru", group: "reru-su", intr: { w: "出る", r: "でる", m: "나가다·나오다" }, tr: { w: "出す", r: "だす", m: "내다·꺼내다" }, example: { intr: "お客様が出る。", tr: "お客様に出す。" } },
  { id: "naoru", group: "reru-su", intr: { w: "直る", r: "なおる", m: "고쳐지다" }, tr: { w: "直す", r: "なおす", m: "고치다" }, example: { intr: "時計が直る。", tr: "時計を直す。" } },
  { id: "ochiru", group: "reru-su", intr: { w: "落ちる", r: "おちる", m: "떨어지다" }, tr: { w: "落とす", r: "おとす", m: "떨어뜨리다" }, example: { intr: "商品が落ちる。", tr: "商品を落とす。" } },
  { id: "hairu", group: "irregular", intr: { w: "入る", r: "はいる", m: "들어가다" }, tr: { w: "入れる", r: "いれる", m: "넣다" }, example: { intr: "お客様が入る。", tr: "商品を入れる。" } },
  { id: "kieru", group: "irregular", intr: { w: "消える", r: "きえる", m: "꺼지다·사라지다" }, tr: { w: "消す", r: "けす", m: "끄다·지우다" }, example: { intr: "電気が消える。", tr: "電気を消す。" } },
  { id: "noru", group: "irregular", intr: { w: "乗る", r: "のる", m: "타다" }, tr: { w: "乗せる", r: "のせる", m: "태우다" }, example: { intr: "お客様が乗る。", tr: "お客様を乗せる。" } },
  { id: "fueru", group: "irregular", intr: { w: "増える", r: "ふえる", m: "늘다" }, tr: { w: "増やす", r: "ふやす", m: "늘리다" }, example: { intr: "お客様が増える。", tr: "在庫を増やす。" } },
  { id: "heru", group: "irregular", intr: { w: "減る", r: "へる", m: "줄다" }, tr: { w: "減らす", r: "へらす", m: "줄이다" }, example: { intr: "在庫が減る。", tr: "在庫を減らす。" } },
];
