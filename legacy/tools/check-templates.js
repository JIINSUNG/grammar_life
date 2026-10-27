const fs=require('fs');process.chdir(require('path').join(__dirname,'..','src'));
const files=['data.js','more_data.js','jp_n3.js','jp_n2.js','jp_more1.js','jp_more2.js','jp_more3.js','basics.js','en_more.js','vocab_ja.js','vocab_en.js','vocab_more.js'];
const app=fs.readFileSync('app.js','utf8');
const fns=app.slice(app.indexOf('/* ---------- 한국어 조사'),app.indexOf('/* ---------- 문장 표시'));
eval(files.map(f=>fs.readFileSync(f,'utf8')).join('\n')+fns+`
console.log('en',POINTS.en.length,'ja',POINTS.ja.length,'examJa',EXAM.ja.length,'cq',Object.keys(CQ).length);
const lv={}; POINTS.ja.forEach(p=>lv[p.lv]=(lv[p.lv]||0)+1); console.log(lv);
const ids=POINTS.ja.map(p=>p.id); console.log('dupIds',ids.length-new Set(ids).size);
let bad=0,n=0;
for(const l of ['en','ja']) for(const p of POINTS[l]){ const c=CQ[p.id]; if(!c||c.o.length!==4||new Set(c.o).size!==4){console.log('cq',p.id);bad++;}
 p.tpl.forEach((t,i)=>{ const m=t.s.match(/\\[([^\\]]+)\\]/); if(!m||t.o.length!==3){console.log('fmt',p.id,i);bad++;return;}
  for(const job of JOBS) for(const ride of RIDES) for(const hob of HOBBIES) for(const plan of PLANS){ const b=build(p,i,{job:job.id,ride:ride.id,hobbies:[hob.id],plans:[plan.id]},l,0); n++;
   if(/[{}]/.test(b.raw+b.ko+b.wrong.join())){console.log('slot',p.id,i,b.raw,b.ko);bad++;return;}
   if(b.wrong.includes(b.ans)||new Set(b.wrong).size!==3){console.log('dup',p.id,i,b.ans,b.wrong);bad++;return;} } }); }
for(const e of [...EXAM.en,...EXAM.ja]) if(e.o.length!==4||new Set(e.o).size!==4){console.log('ex',e.q);bad++;}
console.log('built',n,'bad',bad);
`);
