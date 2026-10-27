// 데이터의 일본어 문장 조각을 kuromoji로 분석해 ｜漢字《かな》 형식 사전을 만든다
const fs=require('fs'), path=require('path');
const kuromoji=require('kuromoji');
const G=path.join(__dirname,'..','src')+'/';
const files=['data.js','more_data.js','jp_n3.js','jp_n2.js','jp_more1.js','jp_more2.js','jp_more3.js','basics.js','en_more.js','vocab_ja.js','vocab_en.js'];
const ctx={}; const vm=require('vm'); vm.createContext(ctx);
vm.runInContext(files.map(f=>fs.readFileSync(G+f,'utf8')).join('\n')+'\nthis.D={POINTS,EXAM,CQ,JOBS,RIDES,HOBBIES,PLANS};',ctx);
const {POINTS,EXAM,CQ,JOBS,RIDES,HOBBIES,PLANS}=ctx.D;
const KANJI=/[一-鿿々〆ヵヶ]/;
const SPLIT=/(\{[^}]+\}|\[|\])/;
const segs=new Set();
const addStr=s=>{ if(typeof s!=='string') return; s.split(SPLIT).forEach(x=>{ if(x&&!SPLIT.test(x)&&KANJI.test(x)) segs.add(x); }); };
POINTS.ja.forEach(p=>{ p.tpl.forEach(t=>{ addStr(t.s); t.o.forEach(addStr); }); p.bad.forEach(addStr); });
Object.keys(CQ).filter(k=>k[0]==='J').forEach(k=>CQ[k].o.forEach(addStr));
EXAM.ja.forEach(e=>{ addStr(e.q); e.o.forEach(addStr); });
JOBS.forEach(j=>Object.values(j.ja).forEach(addStr)); RIDES.forEach(r=>addStr(r.ja)); HOBBIES.forEach(h=>addStr(h.ja)); PLANS.forEach(p=>addStr(p.ja));
const kata2hira=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const isKana=c=>/[ぁ-ゖァ-ーー]/.test(c);
// 읽기를 표면형에 맞춰 한자 부분에만 붙임 (앞뒤 오쿠리가나 제거)
function annotate(surface,reading){
  if(!KANJI.test(surface)||!reading||reading==='*') return surface;
  let r=kata2hira(reading), s=surface;
  let pre='',post='';
  while(s.length&&r.length&&isKana(s[0])&&kata2hira(s[0])===r[0]){ pre+=s[0]; s=s.slice(1); r=r.slice(1); }
  while(s.length&&r.length&&isKana(s[s.length-1])&&kata2hira(s[s.length-1])===r[r.length-1]){ post=s[s.length-1]+post; s=s.slice(0,-1); r=r.slice(0,-1); }
  if(!s||!r) return surface;
  // 중간에 가나가 섞인 경우(取り扱い 등)는 통째로
  return pre+'｜'+s+'《'+r+'》'+post;
}
const FIX={"一日中":"いちにちじゅう","今日":"きょう","明日":"あした","昨日":"きのう","今朝":"けさ","一人":"ひとり","二人":"ふたり","一つ":"__ひと__つ","大人":"おとな","上手":"じょうず","下手":"へた","お土産":"おみやげ","今年":"ことし","一緒":"いっしょ","当日":"とうじつ","本日":"ほんじつ","一度":"いちど","一点":"いってん","二点":"にてん","3人":"さんにん","申し上げ":"もうしあげ"};
kuromoji.builder({dicPath:path.join(path.dirname(require.resolve('kuromoji')),'..','dict')}).build((err,tk)=>{
  if(err) throw err;
  const out={};
  for(const seg of segs){
    const toks=tk.tokenize(seg);
    out[seg]=toks.map(t=>{ const sf=t.surface_form; if(FIX[sf]){ const f=FIX[sf]; if(f.startsWith('__')){ const m=f.match(/^__(.+)__(.*)$/); return '｜'+sf.slice(0,sf.length-m[2].length)+'《'+m[1]+'》'+m[2]; } return '｜'+sf+'《'+f+'》'; }
      if(sf==='何'&&t.reading==='ナン') return '｜何《なん》';
      return annotate(sf,t.reading); }).join('');
  }
  fs.writeFileSync(G+'ruby_dict.js','/* 후리가나 사전 (kuromoji로 미리 계산 · 서버 불필요) */\nconst RUBY='+JSON.stringify(out)+';\n');
  console.log('segments',segs.size);
  const sample=['家電量販店で','自転車で','少々お待ちください。','今日は{cust}が多いです。'.split(SPLIT)[0],'申し訳ございませんが、こちらではわかり','一年を通じて'];
  sample.forEach(x=>console.log(x,'=>',out[x]));
});
