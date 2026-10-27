const { useState, useEffect, useMemo, useRef } = React;
const h=(t,p,...c)=>{ if(p&&p.class!==undefined){ p={...p,className:p.class}; delete p.class; } return React.createElement(t,p,...c); };
const html = htm.bind(h);

/* ---------- 후리가나: 미리 계산한 사전(RUBY)으로 일본어 문장에 ｜漢字《かな》 표시를 붙임 ---------- */
const RSPLIT=/(\{[^}]+\}|\[|\])/;
const rubify=s=>typeof s==="string"?s.split(RSPLIT).map(x=>RUBY[x]||x).join(""):s;
POINTS.ja.forEach(p=>{ p.tpl.forEach(t=>{ t.s=rubify(t.s); t.o=t.o.map(rubify); }); p.bad=p.bad.map(rubify); });
Object.keys(CQ).filter(k=>k[0]==="J").forEach(k=>{ CQ[k]={...CQ[k],o:CQ[k].o.map(rubify)}; });
EXAM.ja.forEach(e=>{ e.q=rubify(e.q); e.o=e.o.map(rubify); });
JOBS.forEach(j=>{ Object.keys(j.ja).forEach(k=>{ j.ja[k]=rubify(j.ja[k]); }); }); RIDES.forEach(r=>{ r.ja=rubify(r.ja); }); HOBBIES.forEach(h=>{ h.ja=rubify(h.ja); }); PLANS.forEach(p=>{ p.ja=rubify(p.ja); });
const plain=s=>String(s).replace(/｜([^《]+)《[^》]+》/g,"$1");
let FURI=true;
function rb(text){ const t=String(text); if(t.indexOf("《")<0) return t; if(!FURI) return plain(t);
  return t.split(/(｜[^《]+《[^》]+》)/).map((x,i)=>{ const m=x.match(/^｜([^《]+)《([^》]+)》$/); return m?html`<ruby key=${i}>${m[1]}<rt>${m[2]}</rt></ruby>`:x; }); }

/* ---------- 저장 (이 기기 브라우저에만) ---------- */
const KEY="grammar-life:v1";
const load=()=>{ try{ const r=localStorage.getItem(KEY); return r?JSON.parse(r):null; }catch(e){ return null; } };
const save=v=>{ try{ localStorage.setItem(KEY,JSON.stringify(v)); }catch(e){} };
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>ymd(new Date());
const addDays=(s,n)=>{ const [y,m,d]=s.split("-").map(Number); return ymd(new Date(y,m-1,d+n)); };
const INTERVAL=[0,1,2,4,7,15];
const blankState=()=>({profile:null,lang:"en",prog:{en:{},ja:{}},vprog:{en:{},ja:{}},vtrack:{},notes:[],xp:0,days:{},seeds:{},exams:[]});

/* ---------- 한국어 조사 ---------- */
function josa(w,p){ const c=w.charCodeAt(w.length-1); if(c<0xAC00||c>0xD7A3) return w+({"은":"은(는)","이":"이(가)","을":"을(를)","과":"과(와)"}[p]||p);
  const has=(c-0xAC00)%28!==0; const pair={"은":["은","는"],"이":["이","가"],"을":["을","를"],"과":["과","와"]}[p]; return w+(pair?(has?pair[0]:pair[1]):p); }

/* ---------- 예문 틀 채우기 ---------- */
function pick(arr,seed,salt){ if(!arr.length) return null; return arr[Math.abs((seed*31+salt*7)%arr.length)]; }
function slotVals(prof,lang,seed,ti){
  const job=JOBS.find(j=>j.id===prof.job)||JOBS[0], ride=RIDES.find(r=>r.id===prof.ride)||RIDES[0];
  const hob=pick(HOBBIES.filter(h=>prof.hobbies.includes(h.id)),seed,ti)||HOBBIES[0];
  const plan=pick(PLANS.filter(p=>prof.plans.includes(p.id)),seed,ti+3)||PLANS[0];
  if(lang==="ko") return {...job.k,ride:ride.k,hobby:hob.ko,plan:plan.ko};
  if(lang==="ja") return {...job.ja,ride:ride.ja,hobby:hob.ja,plan:plan.ja};
  return {...job.en,ride:ride.en,hobby:hob.en,hobbyB:hob.enB,plan:plan.en};
}
function fill(str,vals){ return str.replace(/\{(\w+)(?:\|(\S))?\}/g,(m,k,j)=>{ const low=k[0].toLowerCase()+k.slice(1); let v=vals[low]; if(v==null) return m;
  if(k[0]!==low[0]) v=v[0].toUpperCase()+v.slice(1); return j?josa(v,j):v; }); }
function build(point,ti,prof,lang,seed){
  const t=point.tpl[ti], v=slotVals(prof,lang,seed,ti), kv=slotVals(prof,"ko",seed,ti);
  const s=fill(t.s,v); const m=s.match(/\[([^\]]+)\]/); const ans=m?m[1]:"";
  const full=s.replace(/\[([^\]]+)\]/,"$1");
  return {pid:point.id,ti,raw:s,ans,full,ko:fill(t.ko,kv),wrong:t.o.map(o=>fill(o,v))};
}
const shuffle=a=>{ const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };
function toQuiz(ex,lang){ const opts=shuffle([ex.ans,...ex.wrong]); return {...ex,opts,a:opts.indexOf(ex.ans),blank:ex.raw.replace(/\[[^\]]+\]/,lang==="ja"?"（　　）":"-------")}; }

/* ---------- 문장 표시 (정답 부분 형광펜) ---------- */
function Sent({raw,lang,big}){ const parts=raw.split(/\[([^\]]+)\]/);
  return html`<span class=${"sent"+(lang==="ja"?" ja":"")+(big?" big":"")}>${parts.length>1?[rb(parts[0]),html`<mark key="m">${rb(parts[1])}</mark>`,rb(parts[2])]:rb(parts[0])}</span>`; }
const canSpeak=typeof window!=="undefined"&&"speechSynthesis" in window;
/* 목소리: 브라우저·기기에 설치된 음성 중 사람 같은 음성(Natural·Neural·Online·Premium·Enhanced·Google)을 우선 고름 → 비용 0원 */
let VOICE_PREF={rate:0.92};
let VOICES=[];
function loadVoices(){ try{ VOICES=speechSynthesis.getVoices()||[]; }catch(e){ VOICES=[]; } return VOICES; }
if(canSpeak){ loadVoices(); try{ speechSynthesis.addEventListener("voiceschanged",()=>{ loadVoices(); window.dispatchEvent(new Event("voices-ready")); }); }catch(e){} }
const langVoices=lang=>VOICES.filter(v=>(v.lang||"").toLowerCase().replace("_","-").startsWith(lang==="ja"?"ja":"en"));
function voiceScore(v,lang){ const n=(v.name||"").toLowerCase(); let s=0;
  if(/natural|neural/.test(n)) s+=60; if(/online/.test(n)) s+=25; if(/premium|enhanced|siri/.test(n)) s+=45; if(/google/.test(n)) s+=30;
  if(lang==="en"&&/en-us/i.test((v.lang||"").replace("_","-"))) s+=8; if(/compact|espeak|novelty|zarvox|whisper|bad news|bells|bubbles|cellos|jester|organ|trinoids|albert|fred/.test(n)) s-=80; if(v.localService===false) s+=5; return s; }
function bestVoice(lang){ const list=langVoices(lang); if(!list.length) return null; const pref=VOICE_PREF[lang]; const chosen=pref&&list.find(v=>v.name===pref); if(chosen) return chosen;
  return [...list].sort((a,b)=>voiceScore(b,lang)-voiceScore(a,lang))[0]; }
function speak(text,lang){ try{ const u=new SpeechSynthesisUtterance(plain(text)); u.lang=lang==="ja"?"ja-JP":"en-US"; const v=bestVoice(lang); if(v) u.voice=v; u.rate=VOICE_PREF.rate||0.92; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} }
function Speak({text,lang}){ if(!canSpeak) return null; return html`<button type="button" class="spk" aria-label="발음 듣기" onClick=${e=>{e.stopPropagation();speak(text,lang);}}><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></button>`; }

/* ---------- 진도 계산 ---------- */
const goalXp=p=>(GOALS.find(g=>g[0]===(p&&p.goal))||GOALS[1])[2];
function streak(days){ let n=0, d=today(); if(!(days[d]>0)) d=addDays(d,-1); while(days[d]>0){ n++; d=addDays(d,-1); } return n; }
function dueList(st,lang){ const t=today(); return POINTS[lang].filter(p=>{ const g=st.prog[lang][p.id]; return g&&g.box>0&&g.due<=t; }); }
const JLV=["입문","N5","N4","N3","N2"];
function nextNew(st,lang){ const start=lang==="ja"?Math.max(0,JLV.indexOf((st.profile&&st.profile.jstart)||"입문")):0;
  return POINTS[lang].find(p=>!st.prog[lang][p.id]&&(lang!=="ja"||JLV.indexOf(p.lv)>=start))||POINTS[lang].find(p=>!st.prog[lang][p.id]); }
const LANG_LABEL={en:"English",ja:"日本語"};

/* ---------- 앱 ---------- */
function App(){
  const [st,setSt]=useState(()=>{ const v=load(); return v?{...blankState(),...v}:blankState(); });
  const up=fn=>setSt(p=>{ const n=fn(p); save(n); return n; });
  const [gq,setGq]=useState(""); const [tab,setTab]=useState("today"), [run,setRun]=useState(null), [editProf,setEditProf]=useState(false);
  const lang=st.lang; VOICE_PREF={rate:0.92,...(st.voice||{})}; FURI=st.furi!==false;
  useEffect(()=>{ window.scrollTo(0,0); },[tab,run]);
  if(!st.profile||editProf) return html`<${Survey} init=${st.profile} onDone=${p=>{ up(s=>({...s,profile:p})); setEditProf(false); }} onCancel=${st.profile?()=>setEditProf(false):null}/>`;
  const gain=(xp)=>up(s=>({...s,xp:s.xp+xp,days:{...s.days,[today()]:(s.days[today()]||0)+xp}}));
  // 통과 조건: 개념 확인을 맞히고, 빈칸 문제의 75% 이상을 '확실해요'로 맞혀야 함 (감으로 맞힌 건 통과로 안 침)
  const grade=(pid,b)=>up(s=>{ const pr={...s.prog[lang]}; const g=pr[pid]||{box:0,ok:0,tot:0,lucky:0};
    const pass=b.concept&&(b.tot===0||b.solid/b.tot>=0.75); const box=pass?Math.min(5,g.box+1):1;
    pr[pid]={...g,box,due:addDays(today(),INTERVAL[box]),ok:g.ok+b.solid,tot:g.tot+b.tot,lucky:(g.lucky||0)+b.lucky,lastPass:pass,last:today()}; return {...s,prog:{...s.prog,[lang]:pr}}; });
  if(run&&run.kind==="session") return html`<${Session} key=${run.key} st=${st} lang=${lang} plan=${run.plan} up=${up} gain=${gain} grade=${grade} onExit=${()=>setRun(null)}/>`;
  if(run&&run.kind==="vocab") return html`<${VocabSession} key=${run.key} st=${st} lang=${lang} up=${up} gain=${gain} onExit=${()=>setRun(null)}/>`;
  if(run&&run.kind==="note") return html`<${NoteEditor} key=${run.key} st=${st} lang=${lang} id=${run.id} up=${up} gain=${gain} onClose=${()=>setRun(null)}/>`;
  if(run&&run.kind==="nreview") return html`<${NoteReview} key=${run.key} st=${st} lang=${lang} up=${up} gain=${gain} onExit=${()=>setRun(null)}/>`;
  if(run&&run.kind==="exam") return html`<${Exam} key=${run.key} st=${st} lang=${lang} up=${up} gain=${gain} onExit=${()=>setRun(null)} startReview=${ids=>setRun({kind:"session",key:Date.now(),plan:ids.map(id=>({id,mode:"review"}))})}/>`;
  const startRoutine=()=>{ const due=dueList(st,lang).slice(0,4).map(p=>({id:p.id,mode:"review"})); const nw=nextNew(st,lang); const plan=[...(nw?[{id:nw.id,mode:"new"}]:[]),...due]; if(plan.length) setRun({kind:"session",key:Date.now(),plan}); };
  const openPoint=(id)=>setRun({kind:"session",key:Date.now(),plan:[{id,mode:st.prog[lang][id]?"study":"new"}]});
  return html`
    <header class="top"><div class="wrap topin">
      <div class="brand">내 생활 <b>문법</b></div>
      <div class="langsw" role="group" aria-label="공부할 언어">${["en","ja"].map(l=>html`<button type="button" key=${l} aria-pressed=${lang===l} onClick=${()=>up(s=>({...s,lang:l}))}>${l==="en"?"EN":"日本語"}</button>`)}</div>
    </div></header>
    <main class="wrap main">
      ${tab==="today"&&html`<${Today} st=${st} lang=${lang} start=${startRoutine} goVocab=${()=>setRun({kind:"vocab",key:Date.now()})} goNote=${()=>setTab("note")} openPoint=${openPoint} goExam=${()=>setRun({kind:"exam",key:Date.now()})}/>`}
      ${tab==="grammar"&&html`<${GrammarList} key=${gq} initQ=${gq} st=${st} lang=${lang} openPoint=${openPoint}/>`}
      ${tab==="vocab"&&html`<${VocabTab} st=${st} lang=${lang} up=${up} start=${()=>setRun({kind:"vocab",key:Date.now()})}/>`}
      ${tab==="note"&&html`<${NoteTab} st=${st} lang=${lang} up=${up} gain=${gain} openNote=${id=>setRun({kind:"note",id,key:Date.now()})} startReview=${()=>setRun({kind:"nreview",key:Date.now()})} openGrammar=${q=>{ setGq(q); setTab("grammar"); }}/>`}
      ${tab==="exam"&&html`<${ExamHome} st=${st} lang=${lang} start=${()=>setRun({kind:"exam",key:Date.now()})}/>`}
      ${tab==="me"&&html`<${Me} st=${st} up=${up} edit=${()=>setEditProf(true)}/>`}
    </main>
    <nav class="tabbar" aria-label="메뉴"><div class="wrap tabin">${[["today","오늘"],["grammar","문법"],["vocab","단어"],["note","노트"],["exam","실전"],["me","나"]].map(([k,l])=>html`<button type="button" key=${k} aria-current=${tab===k?"page":null} onClick=${()=>setTab(k)}><${Icon} n=${k}/><span>${l}</span></button>`)}</div></nav>`;
}
function Icon({n}){ const p={today:"M4 11l6-6 6 6v6H4z",grammar:"M4 4h9a3 3 0 0 1 3 3v9H7a3 3 0 0 1-3-3z M7 8h6 M7 11h4",exam:"M5 3h10v14H5z M8 7h4 M8 10h4 M8 13h2",vocab:"M5 3h10v14l-5-3.2L5 17z M8 7h4",note:"M4 16.5l.8-3.6L13 4.7l2.8 2.8-8.2 8.2z M11.5 6.2l2.8 2.8",me:"M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4 17c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5"}[n];
  return html`<svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true"><path d=${p} fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`; }

/* ---------- 설문 ---------- */
function Survey({init,onDone,onCancel}){
  const [p,setP]=useState(()=>init||{job:"elec",ride:"bike",hobbies:["game","gym"],plans:["jptrip"],goal:10,toeic:"800",jlpt:"N2",jstart:"입문"});
  const set=k=>v=>setP({...p,[k]:v});
  const tog=k=>id=>setP({...p,[k]:p[k].includes(id)?p[k].filter(x=>x!==id):[...p[k],id]});
  const ok=p.hobbies.length&&p.plans.length;
  const prev=build(POINTS.en[0],0,p,"en",0), prevJ=build(POINTS.ja[0],0,p,"ja",0);
  const Q=({n,t,sub,children})=>html`<section class="q"><div class="qh"><span class="qn">${n}</span><div><h3>${t}</h3>${sub&&html`<p>${sub}</p>`}</div></div>${children}</section>`;
  const Chips=({list,val,on,multi})=>html`<div class="chips">${list.map(o=>{ const id=o.id||o; const sel=multi?val.includes(id):val===id; return html`<button type="button" key=${id} class="chip" aria-pressed=${sel} onClick=${()=>on(id)}>${o.ko||o}</button>`; })}</div>`;
  return html`<main class="wrap main survey">
    <div class="sv-head"><div class="brand">내 생활 <b>문법</b></div>${onCancel&&html`<button type="button" class="link" onClick=${onCancel}>닫기</button>`}</div>
    <h1 class="sv-title">내 하루로 문법 예문을 만들어요</h1>
    <p class="lead">고른 내용이 영어·일본어 예문과 문제에 들어가요. 처음엔 예시로 골라 뒀으니 내 생활에 맞게 바꿔 주세요.</p>
    <${Q} n="1" t="어디서 일해요?"><${Chips} list=${JOBS} val=${p.job} on=${set("job")}/><//>
    <${Q} n="2" t="출퇴근은 어떻게 해요?"><${Chips} list=${RIDES} val=${p.ride} on=${set("ride")}/><//>
    <${Q} n="3" t="쉬는 날 뭐 해요?" sub="여러 개 고를 수 있어요"><${Chips} list=${HOBBIES} val=${p.hobbies} on=${tog("hobbies")} multi/><//>
    <${Q} n="4" t="앞으로 있는 일은요?" sub="여러 개 고를 수 있어요"><${Chips} list=${PLANS} val=${p.plans} on=${tog("plans")} multi/><//>
    <${Q} n="5" t="목표 점수·급수"><div class="goalrow"><span>TOEIC</span><${Chips} list=${TOEIC_GOALS} val=${p.toeic} on=${set("toeic")}/></div><div class="goalrow"><span>JLPT</span><${Chips} list=${JLPT_GOALS} val=${p.jlpt} on=${set("jlpt")}/></div><//>
    <${Q} n="6" t="일본어 문법은 어디서부터 시작할까요?" sub="품사·문장 순서부터 배우려면 입문, 이미 아는 레벨은 건너뛰고, 필요하면 문법 탭에서 언제든 골라 볼 수 있어요"><${Chips} list=${JLV} val=${p.jstart||"입문"} on=${set("jstart")}/><//>
    <${Q} n="7" t="하루에 얼마나 공부할까요?"><div class="chips">${GOALS.map(([m,l])=>html`<button type="button" key=${m} class="chip" aria-pressed=${p.goal===m} onClick=${()=>setP({...p,goal:m})}>${l}</button>`)}</div><//>
    <div class="preview"><span class="eyebrow">이런 예문이 나와요</span>
      <p><${Sent} raw=${prev.raw} lang="en"/></p><p class="ko">${prev.ko}</p>
      <p><${Sent} raw=${prevJ.raw} lang="ja"/></p><p class="ko">${prevJ.ko}</p></div>
    <button type="button" class="btn pri wide" disabled=${!ok} onClick=${()=>onDone(p)}>${init?"저장":"시작하기"}</button>
    ${!ok&&html`<p class="hint center">취미와 앞으로 있는 일을 하나 이상 골라 주세요.</p>`}
  </main>`;
}

/* ---------- 오늘 ---------- */
function Today({st,lang,start,openPoint,goExam,goVocab,goNote}){
  const nTodo=notesOf(st,lang).filter(n=>nStatus(n)!=="done").length, nD=nDue(st,lang).length;
  const vn=vNew(st,lang).length, vd=vDue(st,lang).length;
  const g=goalXp(st.profile), tx=st.days[today()]||0, sk=streak(st.days);
  const due=dueList(st,lang), nw=nextNew(st,lang);
  const mins=Math.max(3,(nw?4:0)+due.slice(0,4).length*1.5|0);
  const p=nw||due[0]||POINTS[lang][0];
  const ex=build(p,0,st.profile,lang,st.seeds[lang+p.id]||0);
  const lvl=Math.floor(st.xp/200)+1, lp=st.xp%200;
  const r=34, C=2*Math.PI*r, pct=Math.min(1,tx/g);
  const mastered=POINTS[lang].filter(x=>(st.prog[lang][x.id]||{}).box>=4).length;
  return html`
    <section class="hero">
      <div class="ring"><svg viewBox="0 0 80 80" width="88" height="88" aria-hidden="true"><circle cx="40" cy="40" r=${r} class="rbg"/><circle cx="40" cy="40" r=${r} class="rfg" stroke-dasharray=${C} stroke-dashoffset=${C*(1-pct)} transform="rotate(-90 40 40)"/></svg>
        <div class="rtxt"><b>${tx}</b><small>/ ${g} XP</small></div></div>
      <div class="hstats">
        <div><span class="eyebrow">연속 학습</span><b class="num">${sk}<small>일</small></b></div>
        <div><span class="eyebrow">레벨 ${lvl}</span><div class="bar"><div style=${{width:lp/2+"%"}}></div></div><small class="sub">다음 레벨까지 ${200-lp} XP</small></div>
        <div><span class="eyebrow">목표</span><b class="goal">${lang==="en"?"TOEIC "+st.profile.toeic:"JLPT "+st.profile.jlpt}</b></div>
      </div>
    </section>
    <section class="card routine">
      <div class="rh"><div><span class="eyebrow">오늘의 루틴 · ${LANG_LABEL[lang]}</span><h2>${tx>=g?"오늘 목표 달성! 더 해볼까요?":"약 "+mins+"분이면 끝나요"}</h2></div></div>
      <ul class="rlist">
        ${nw&&html`<li><span class="tag new">새 문법</span>${nw.t}</li>`}
        ${due.length>0&&html`<li><span class="tag rev">복습</span>${due.slice(0,4).map(d=>d.t).join(" · ")}${due.length>4?` 외 ${due.length-4}개`:""}</li>`}
        ${!nw&&!due.length&&html`<li class="sub">새 문법을 모두 배웠고 오늘 복습할 것도 없어요. 실전 문제를 풀어 보세요.</li>`}
      </ul>
      ${(nw||due.length>0)?html`<button type="button" class="btn pri wide" onClick=${start}>루틴 시작</button>`:html`<button type="button" class="btn pri wide" onClick=${goExam}>실전 문제 풀기</button>`}
    </section>
    <section class="card daily">
      <div class="rh"><span class="eyebrow">내 하루로 만든 예문 · ${p.t}</span><${Speak} text=${ex.full} lang=${lang}/></div>
      <p class="dsent"><${Sent} raw=${ex.raw} lang=${lang} big/></p>
      <p class="ko">${ex.ko}</p>
      <button type="button" class="link" onClick=${()=>openPoint(p.id)}>이 문법 자세히 보기 ›</button>
    </section>
    <section class="card vtoday"><div class="rh"><div><span class="eyebrow">오늘의 단어 · ${VOCAB[lang].length}개 중</span><h2>${vn?"새 단어 "+vn+"개":""}${vn&&vd?" · ":""}${vd?"복습 "+Math.min(vd,VREV)+"개":""}${!vn&&!vd?"오늘 단어 공부 끝!":""}</h2></div>
      <button type="button" class="btn sm" disabled=${!vn&&!vd} onClick=${goVocab}>단어 공부</button></div></section>
    <section class="card vtoday"><div class="rh"><div><span class="eyebrow">내 문장 노트</span><h2>${nTodo||nD?[nTodo?"번역·검토 기다리는 문장 "+nTodo+"개":"",nD?"복습 "+nD+"개":""].filter(Boolean).join(" · "):"오늘 하고 싶었던 말을 적어 볼까요?"}</h2></div>
      <button type="button" class="btn sm" onClick=${goNote}>노트</button></div></section>
    <section class="mini">
      <button type="button" class="card minic" onClick=${goExam}><span class="eyebrow">${lang==="en"?"TOEIC Part 5 형식":"JLPT 文法 형식"}</span><b>실전 10문제</b><small class="sub">${st.exams.filter(e=>e.lang===lang).length}회 풀었어요</small></button>
      <div class="card minic"><span class="eyebrow">익힌 문법</span><b>${mastered} / ${POINTS[lang].length}</b><small class="sub">복습 4단계 이상</small></div>
    </section>`;
}

/* ---------- 문법 목록 ---------- */
function GrammarList({st,lang,openPoint,initQ}){
  const t=today(); const groups=[...new Set(POINTS[lang].map(p=>p.lv))];
  const [lvF,setLvF]=useState("all"), [q,setQ]=useState(initQ||"");
  const match=p=>(lvF==="all"||p.lv===lvF)&&(!q||(p.t+" "+p.form+" "+p.sum).toLowerCase().includes(q.toLowerCase()));
  const lvStat=groups.map(g=>{ const ps=POINTS[lang].filter(p=>p.lv===g); return [g,ps.filter(p=>(st.prog[lang][p.id]||{}).box>=4).length,ps.length]; });
  return html`<h1 class="ptitle">${lang==="en"?"영어":"일본어"} 문법 ${POINTS[lang].length}개</h1>
    <section class="card lvcard">${lvStat.map(([g,m,n])=>html`<div class="lvrow" key=${g}><b>${g}</b><div class="bar"><div style=${{width:(m/n*100)+"%"}}></div></div><small class="num sub">${m}/${n}</small></div>`)}</section>
    <div class="chips">${[["all","전체"],...groups.map(g=>[g,g])].map(([k,l])=>html`<button type="button" key=${k} class="chip" aria-pressed=${lvF===k} onClick=${()=>setLvF(k)}>${l}</button>`)}</div>
    <input id="g-search" class="inp search" placeholder="문법 검색 (예: ように, 수동태)" value=${q} onInput=${e=>setQ(e.target.value)}/>
    <p class="lead">5칸이 다 차면 익힌 문법이에요. 맞히면 한 칸씩 오르고, 복습 간격이 1→2→4→7→15일로 늘어나요.</p>
    ${groups.filter(g=>POINTS[lang].some(p=>p.lv===g&&match(p))).map(gname=>html`<section key=${gname}><h2 class="grp">${gname} · ${POINTS[lang].filter(p=>p.lv===gname&&match(p)).length}개</h2><div class="plist">
      ${POINTS[lang].filter(p=>p.lv===gname&&match(p)).map(p=>{ const g=st.prog[lang][p.id]; const due=g&&g.due<=t;
        return html`<button type="button" key=${p.id} class="card prow" onClick=${()=>openPoint(p.id)}>
          <div class="pmain"><b>${p.t}</b><small class="sub">${p.form}</small></div>
          <div class="pside"><div class="boxes" aria-label=${"복습 "+((g&&g.box)||0)+"단계"}>${[1,2,3,4,5].map(i=>html`<i key=${i} class=${g&&g.box>=i?"on":""}></i>`)}</div>
            <small class=${due?"due":"sub"}>${!g?"새 문법":due?"오늘 복습":g.box>=5?"익힘":g.due.slice(5).replace("-","/")+" 복습"}</small></div></button>`; })}</div></section>`)}`;
}

/* ---------- 학습 세션: 설명 → 예문 → 개념 확인 → 문제(+확신도) → 틀리거나 감으로 맞힌 건 다시 ---------- */
const CONF=[["sure","확실해요"],["unsure","애매해요"],["guess","찍었어요"]];
function cqStep(p,retry){ const c=CQ[p.id]; const opts=shuffle(c.o); return {type:"concept",p,retry,q:{text:c.q,opts,a:opts.indexOf(c.o[0]),ex:c.ex}}; }
function quizStep(p,ti,prof,lang,seed,retry){ return {type:"quiz",p,retry,q:toQuiz(build(p,ti,prof,lang,seed),lang)}; }
function Session({st,lang,plan,up,gain,grade,onExit}){
  const prof=st.profile;
  const [steps,setSteps]=useState(()=>{ const out=[]; plan.forEach(({id,mode})=>{ const p=POINTS[lang].find(x=>x.id===id); if(!p) return;
      const seed=(st.seeds[lang+id]||0)+1;
      if(mode!=="review") out.push({type:"learn",p});
      out.push(cqStep(p,0));
      const idx=shuffle(p.tpl.map((_,k)=>k));
      (mode==="review"?idx.slice(0,2):idx).forEach(ti=>out.push(quizStep(p,ti,prof,lang,seed,0))); });
    return out; });
  const [i,setI]=useState(0), [pick,setPick]=useState(null), [conf,setConf]=useState(null), [res,setRes]=useState({}), [xp,setXp]=useState(0), [ended,setEnded]=useState(false);
  const [seedBump,setSeedBump]=useState({});
  const s=steps[i];
  const reveal=s&&s.type==="concept"?pick!=null:(pick!=null&&conf!=null);
  const finish=()=>{ const byP={};
    steps.forEach((x,k)=>{ if(x.type==="learn"||x.retry) return; const r=res[k]; if(!r) return; const b=(byP[x.p.id]=byP[x.p.id]||{solid:0,tot:0,concept:true,lucky:0,sure:0});
      if(x.type==="concept"){ if(!r.ok) b.concept=false; } else { b.tot++; if(r.ok&&r.conf==="sure") b.solid++; if(r.ok&&r.conf!=="sure") b.lucky++; } });
    Object.entries(byP).forEach(([pid,b])=>grade(pid,b)); gain(20); setXp(x=>x+20); setEnded(true); };
  const next=()=>{ setPick(null); setConf(null); if(i+1>=steps.length) finish(); else setI(i+1); };
  const answer=k=>{ if(pick!=null) return; setPick(k); if(s.type==="concept") record(k,null); };
  const record=(k,c)=>{ const ok=k===s.q.a; const solid=s.type==="concept"?ok:(ok&&c==="sure");
    setRes(r=>({...r,[i]:{ok,conf:c}}));
    const add=s.type==="concept"?(ok?5:0):(solid?10:ok?4:0); if(add){ gain(add); setXp(x=>x+add); }
    if(!solid&&s.retry<2){ // 다시 확인: 같은 문법을 다른 문장으로 세션 끝에 한 번 더
      const nx=s.type==="concept"?cqStep(s.p,s.retry+1):quizStep(s.p,(s.q.ti+1+Math.floor(Math.random()*(s.p.tpl.length-1)))%s.p.tpl.length,prof,lang,(st.seeds[lang+s.p.id]||0)+2+s.retry,s.retry+1);
      setSteps(a=>[...a,nx]); } };
  const chooseConf=c=>{ if(conf!=null) return; setConf(c); record(pick,c); };

  if(ended){ const qs=Object.entries(res).filter(([k])=>steps[k].type==="quiz").map(([,v])=>v);
    const solid=qs.filter(r=>r.ok&&r.conf==="sure").length, lucky=qs.filter(r=>r.ok&&r.conf!=="sure").length, wrong=qs.filter(r=>!r.ok).length;
    const ps=[...new Set(steps.map(x=>x.p.id))].map(id=>POINTS[lang].find(p=>p.id===id));
    return html`<main class="wrap main sess"><section class="card result">
      <span class="eyebrow">루틴 완료 · +${xp} XP</span><h1>${solid}<small>/ ${qs.length}</small></h1><p class="sub">확실히 이해하고 맞힌 문제</p>
      <div class="tri"><div><b class="num">${solid}</b><small>확실히 맞힘</small></div><div><b class="num">${lucky}</b><small>감으로 맞힘</small></div><div><b class="num">${wrong}</b><small>틀림</small></div></div>
      ${lucky>0&&html`<p class="why">감으로 맞힌 문제는 '아는 것'으로 치지 않아요. 그 문법은 단계가 오르지 않고 내일 다시 나와요.</p>`}
      <ul class="rlist">${ps.map(p=>{ const g=st.prog[lang][p.id]||{}; const pass=g.lastPass; return html`<li key=${p.id}><span class=${"tag "+(pass?"rev":"bad")}>${pass?"통과":"다시"}</span>${p.t}<small class="sub" style=${{marginLeft:"auto"}}>${g.box||0}단계 · ${g.due?g.due.slice(5).replace("-","/"):"-"} 복습</small></li>`; })}</ul>
      <button type="button" class="btn pri wide" onClick=${onExit}>완료</button></section></main>`; }

  const bar=html`<div class="sbar"><button type="button" class="link" onClick=${onExit} aria-label="그만하기">✕</button><div class="prog"><div style=${{width:(i/steps.length*100)+"%"}}></div></div><span class="sub num">${i+1}/${steps.length}</span></div>`;
  if(s.type==="learn"){ const p=s.p; const seed=(st.seeds[lang+p.id]||0)+(seedBump[p.id]||0);
    const exs=p.tpl.map((_,ti)=>build(p,ti,prof,lang,seed));
    return html`<main class="wrap main sess">${bar}
      <section class="learn"><span class="eyebrow">${p.lv} · ${LANG_LABEL[lang]}</span><h1>${p.t}</h1><p class="sum">${p.sum}</p>
        <div class="form"><span class="eyebrow">형태</span><code>${p.form}</code></div>
        <ul class="tips">${p.tips.map(t=>html`<li key=${t}>${t}</li>`)}</ul>
        <div class="bad"><div><span class="x">✕</span><s>${rb(p.bad[0])}</s></div><div><span class="o">○</span>${rb(p.bad[1])}</div></div></section>
      <section class="card exlist"><div class="rh"><span class="eyebrow">내 하루로 만든 예문</span><button type="button" class="link" onClick=${()=>{ setSeedBump({...seedBump,[p.id]:(seedBump[p.id]||0)+1}); up(x=>({...x,seeds:{...x.seeds,[lang+p.id]:(x.seeds[lang+p.id]||0)+1}})); }}>다른 예문</button></div>
        ${exs.map((e,k)=>html`<div class="ex" key=${k}><div class="exs"><${Sent} raw=${e.raw} lang=${lang}/><${Speak} text=${e.full} lang=${lang}/></div><p class="ko">${e.ko}</p></div>`)}</section>
      <button type="button" class="btn pri wide" onClick=${next}>이해했는지 확인하기</button></main>`; }

  const q=s.q, ok=pick!=null&&pick===q.a;
  const retryNote=s.retry>0&&html`<span class="tag new">다시 확인</span>`;
  if(s.type==="concept") return html`<main class="wrap main sess">${bar}
    <section class="quiz"><div class="qtop">${retryNote}<span class="eyebrow">개념 확인 · ${s.p.t}</span></div>
      <p class="qtext concept">${q.text}</p>
      <div class="opts">${q.opts.map((o,k)=>html`<button type="button" key=${k} class=${"opt"+(pick!=null&&k===q.a?" right":"")+(pick===k&&k!==q.a?" wrong":"")} disabled=${pick!=null} onClick=${()=>answer(k)}><span class="ol">${k+1}</span><span class=${lang==="ja"?"ja":""}>${rb(o)}</span></button>`)}</div>
      ${reveal&&html`<div class=${"fb "+(ok?"good":"badfb")}><b>${ok?"정확해요 +5 XP":"규칙을 다시 볼게요"}</b><p class="why">${q.ex}</p>${!ok&&html`<p class="why sub">이 개념 문제는 끝에 한 번 더 나와요.</p>`}</div>`}
    </section>${reveal&&html`<button type="button" class="btn pri wide" onClick=${next}>다음</button>`}</main>`;
  return html`<main class="wrap main sess">${bar}
    <section class="quiz"><div class="qtop">${retryNote}<span class="eyebrow">${s.p.t} · 빈칸에 알맞은 것</span></div>
      <p class="qtext"><span class=${"sent big"+(lang==="ja"?" ja":"")}>${rb(q.blank)}</span></p>
      <div class="opts">${q.opts.map((o,k)=>html`<button type="button" key=${k} class=${"opt"+(reveal&&k===q.a?" right":"")+(reveal&&pick===k&&k!==q.a?" wrong":"")+(!reveal&&pick===k?" sel":"")} disabled=${pick!=null} onClick=${()=>answer(k)}><span class="ol">${lang==="ja"?k+1:"ABCD"[k]}</span><span class=${lang==="ja"?"ja":""}>${rb(o)}</span></button>`)}</div>
      ${pick!=null&&conf==null&&html`<div class="confbox"><b>정답을 보기 전에, 얼마나 확신해요?</b><p class="sub">감으로 맞힌 건 아는 걸로 치지 않고 다시 물어볼게요.</p>
        <div class="confs">${CONF.map(([k,l])=>html`<button type="button" key=${k} class=${"btn conf-"+k} onClick=${()=>chooseConf(k)}>${l}</button>`)}</div></div>`}
      ${reveal&&html`<div class=${"fb "+(ok&&conf==="sure"?"good":ok?"lucky":"badfb")}><b>${ok&&conf==="sure"?"확실히 맞혔어요 +10 XP":ok?"맞았지만 확신이 없었어요 +4 XP · 끝에서 다른 문장으로 한 번 더":"틀렸어요 · 끝에서 다른 문장으로 한 번 더"}</b>
        <div class="exs"><${Sent} raw=${q.raw} lang=${lang}/><${Speak} text=${q.full} lang=${lang}/></div><p class="ko">${q.ko}</p>
        <p class="why"><b>왜?</b> ${s.p.sum}</p><p class="why sub">형태: ${s.p.form}</p></div>`}
    </section>
    ${reveal&&html`<button type="button" class="btn pri wide" onClick=${next}>${i+1>=steps.length?"결과 보기":"다음"}</button>`}</main>`;
}

/* ---------- 실전 ---------- */
function ExamHome({st,lang,start}){
  const hist=st.exams.filter(e=>e.lang===lang).slice(-8);
  return html`<h1 class="ptitle">${lang==="en"?"TOEIC Part 5 형식":"JLPT 文法 형식"}</h1>
    <p class="lead">${lang==="en"?"비즈니스 문장의 빈칸을 고르는 Part 5 형식으로 10문제를 풀어요. 한 문제 20초 안이 목표예요.":"問題1 문법 형식 판단과 問題2 문장 배열(★) 형식으로 10문제를 풀어요."} 실제 기출이 아니라 같은 형식으로 새로 만든 연습 문제예요.</p>
    <section class="card"><button type="button" class="btn pri wide" onClick=${start}>10문제 시작</button></section>
    ${hist.length>0&&html`<section class="card"><span class="eyebrow">최근 기록</span>
      <div class="hbars">${hist.map((e,k)=>html`<div key=${k} class="hb"><div class="hbf" style=${{height:e.score+"%"}}></div><small class="num">${e.score}</small><small class="sub">${e.date.slice(5).replace("-","/")}</small></div>`)}</div></section>`}`;
}
function Exam({st,lang,up,gain,onExit,startReview}){
  const qs=useMemo(()=>shuffle(EXAM[lang]).slice(0,10),[]);
  const [ans,setAns]=useState({}), [i,setI]=useState(0), [done,setDone]=useState(false), [t0]=useState(Date.now()), [now,setNow]=useState(Date.now());
  useEffect(()=>{ if(done) return; const h=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(h); },[done]);
  const sec=Math.floor((now-t0)/1000);
  const submit=()=>{ const ok=qs.filter((q,k)=>ans[k]===q.a).length; const score=Math.round(ok/qs.length*100);
    up(s=>({...s,exams:[...s.exams,{lang,date:today(),score,sec}]})); gain(ok*10+30); setDone(true); };
  if(done){ const ok=qs.filter((q,k)=>ans[k]===q.a).length; const weak=[...new Set(qs.filter((q,k)=>ans[k]!==q.a&&q.p).map(q=>q.p))];
    return html`<main class="wrap main sess"><section class="card result"><span class="eyebrow">${lang==="en"?"TOEIC Part 5 형식":"JLPT 文法 형식"} 결과</span>
      <h1>${ok*10}<small>점</small></h1><p class="sub">${ok} / ${qs.length} 정답 · ${Math.floor(sec/60)}분 ${sec%60}초 · +${ok*10+30} XP</p>
      ${weak.length>0&&html`<button type="button" class="btn pri wide" onClick=${()=>startReview(weak)}>틀린 문법 ${weak.length}개 바로 복습</button>`}
      <button type="button" class="btn wide" onClick=${onExit}>닫기</button></section>
      ${qs.map((q,k)=>html`<section class="card rv" key=${k}><div class="rvh"><span class=${"tag "+(ans[k]===q.a?"rev":"bad")}>${ans[k]===q.a?"정답":"오답"}</span><span class="sub">${k+1}번${q.p?" · "+POINTS[lang].find(p=>p.id===q.p).t:""}</span></div>
        <p class=${"qtext"+(lang==="ja"?" ja":"")}>${rb(q.q)}</p><p><b>정답 ${lang==="ja"?q.a+1:"("+"ABCD"[q.a]+")"} ${rb(q.o[q.a])}</b>${ans[k]!=null&&ans[k]!==q.a?html` <span class="sub">· 내 답 ${rb(q.o[ans[k]])}</span>`:""}</p><p class="why">${q.ex}</p></section>`)}</main>`; }
  const q=qs[i];
  return html`<main class="wrap main sess">
    <div class="sbar"><button type="button" class="link" onClick=${onExit} aria-label="그만하기">✕</button><div class="prog"><div style=${{width:(Object.keys(ans).length/qs.length*100)+"%"}}></div></div><span class="sub num">${Math.floor(sec/60)}:${pad(sec%60)}</span></div>
    <section class="quiz exam">
      <p class="inst">${lang==="en"?"Part 5 · Select the best answer to complete the sentence.":q.star?"問題2　つぎの文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。":"問題1　つぎの文の（　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。"}</p>
      <p class=${"qtext"+(lang==="ja"?" ja":"")}><span class="qno num">${lang==="en"?101+i:i+1}.</span> ${rb(q.q)}</p>
      <div class="opts">${q.o.map((o,k)=>html`<button type="button" key=${k} class=${"opt"+(ans[i]===k?" sel":"")} onClick=${()=>{ setAns({...ans,[i]:k}); if(i<qs.length-1) setTimeout(()=>setI(i+1),180); }}><span class="ol">${lang==="ja"?k+1:"("+"ABCD"[k]+")"}</span><span class=${lang==="ja"?"ja":""}>${rb(o)}</span></button>`)}</div>
    </section>
    <div class="exnav"><button type="button" class="btn" disabled=${i===0} onClick=${()=>setI(i-1)}>이전</button>
      ${i<qs.length-1?html`<button type="button" class="btn" onClick=${()=>setI(i+1)}>다음</button>`:html`<button type="button" class="btn pri" disabled=${Object.keys(ans).length<qs.length} onClick=${submit}>채점하기</button>`}</div>
    <div class="dots">${qs.map((_,k)=>html`<button type="button" key=${k} aria-label=${(k+1)+"번"} class=${(ans[k]!=null?"on":"")+(k===i?" cur":"")} onClick=${()=>setI(k)}></button>`)}</div></main>`;
}

/* ---------- 단어 ---------- */
const VOCAB={en:VOCAB_EN,ja:VOCAB_JA};
const VTRACKS={en:["기초","토익","여행","접객"],ja:["N5","N4","N3","N2","여행","접객"]};
const VNEW=10, VREV=20;
const kataToHira=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const KJ=/[一-鿿々]/;
/* 단어+읽기 → ｜漢字《かな》 (오쿠리가나는 빼고 한자 위에만) */
function vruby(w,r){ if(!r||!KJ.test(w)) return w;
  const parts=w.match(/[一-鿿々]+|[^一-鿿々]+/g);
  const re=new RegExp("^"+parts.map(p=>KJ.test(p)?"(.+?)":kataToHira(p).replace(/[.*+?^$(){}|[\]\\]/g,"\\$&")).join("")+"$");
  const m=kataToHira(r).match(re); if(!m) return "｜"+w+"《"+r+"》";
  let gi=1; return parts.map(p=>KJ.test(p)?"｜"+p+"《"+m[gi++]+"》":p).join(""); }
VOCAB_JA.forEach(v=>{ v.rw=vruby(v.w,v.r); }); VOCAB_EN.forEach(v=>{ v.rw=v.w; });
const vTrack=(st,lang)=>(st.vtrack&&st.vtrack[lang])||(lang==="ja"?((st.profile&&st.profile.jstart)==="N4"?"N4":(st.profile&&["N3","N2"].includes(st.profile.jstart))?"N3":"N5"):"기초");
const vp=(st,lang)=>(st.vprog&&st.vprog[lang])||{};
function vDue(st,lang){ const t=today(), pr=vp(st,lang); return VOCAB[lang].filter(w=>{ const g=pr[w.id]; return g&&g.due<=t; }); }
function vNew(st,lang){ const pr=vp(st,lang), tr=vTrack(st,lang); const fresh=VOCAB[lang].filter(w=>!pr[w.id]);
  const order=[tr,...VTRACKS[lang].filter(x=>x!==tr)]; return order.flatMap(l=>fresh.filter(w=>w.lv===l)).slice(0,VNEW); }
function vSay(w,lang){ speak(lang==="ja"?w.r||w.w:w.w,lang); }
function vOpts(w,lang,rev){ const all=VOCAB[lang]; const key=x=>rev?x.w:x.m;
  const pool=[...shuffle(all.filter(x=>x.c===w.c&&x.lv===w.lv)),...shuffle(all.filter(x=>x.c===w.c&&x.lv!==w.lv)),...shuffle(all)];
  const toks=m=>m.replace(/\([^)]*\)/g,"").split(/[,;·=]/).map(x=>x.trim().replace(/[.!?]$/,"")).filter(Boolean);
  const used=new Set(toks(w.m)), seen=new Set([key(w)]), d=[]; for(const x of pool){ if(d.length>=3) break; const tk=toks(x.m); if(seen.has(key(x))||tk.some(t=>used.has(t))) continue; seen.add(key(x)); tk.forEach(t=>used.add(t)); d.push(x); }
  const opts=shuffle([w,...d]); return {opts,a:opts.indexOf(w)}; }
function vStep(w,lang,st,retry){ const rev=((vp(st,lang)[w.id]||{}).box||0)>=2; return {type:"vq",w,rev,retry,...vOpts(w,lang,rev)}; }
const VWord=({w,big})=>html`<span class=${"vw"+(big?" big":"")+(w.r?" ja":"")}>${rb(w.rw)}</span>`;

function VocabTab({st,lang,up,start}){
  const pr=vp(st,lang), tr=vTrack(st,lang), t=today();
  const [lvF,setLvF]=useState("all"), [q,setQ]=useState(""), [more,setMore]=useState(60);
  const vn=vNew(st,lang).length, vd=vDue(st,lang).length;
  const stat=VTRACKS[lang].map(l=>{ const ws=VOCAB[lang].filter(w=>w.lv===l); return [l,ws.filter(w=>(pr[w.id]||{}).box>=3).length,ws.filter(w=>pr[w.id]).length,ws.length]; });
  const ql=q.trim().toLowerCase();
  const list=VOCAB[lang].filter(w=>(lvF==="all"||w.lv===lvF)&&(!ql||(w.w+" "+w.r+" "+w.m).toLowerCase().includes(ql)));
  return html`<h1 class="ptitle">${lang==="en"?"영어":"일본어"} 자주 쓰는 단어 ${VOCAB[lang].length}개</h1>
    <section class="card routine"><div class="rh"><div><span class="eyebrow">오늘의 단어 · ${LANG_LABEL[lang]}</span><h2>${vn||vd?`새 단어 ${vn}개 · 복습 ${Math.min(vd,VREV)}개`:"오늘 단어 공부 끝!"}</h2></div></div>
      <p class="sub">새 단어는 카드로 먼저 보고, 뜻 고르기 → 확신도 체크로 확인해요. 2단계부터는 뜻을 보고 단어를 고르는 거꾸로 문제가 나와요.</p>
      <button type="button" class="btn pri wide" disabled=${!vn&&!vd} onClick=${start}>단어 루틴 시작</button></section>
    <section class="card"><span class="eyebrow">새 단어는 어디서 가져올까요</span>
      <div class="chips">${VTRACKS[lang].map(l=>html`<button type="button" key=${l} class="chip" aria-pressed=${tr===l} onClick=${()=>up(s=>({...s,vtrack:{...(s.vtrack||{}),[lang]:l}}))}>${l==="토익"?"토익 빈출":l==="기초"?"기초 생활":l==="접객"?"매장·접객":l==="여행"?"여행 회화":l}</button>`)}</div>
      <p class="hint">그 레벨을 다 배우면 다음 레벨에서 이어서 가져와요.</p></section>
    <section class="card lvcard">${stat.map(([l,m,s,n])=>html`<div class="lvrow" key=${l}><b>${l}</b><div class="bar"><div style=${{width:(m/n*100)+"%"}}></div></div><small class="num sub">${m}/${n}</small></div>`)}
      <p class="hint">복습 3단계 이상이면 익힌 단어로 세요.</p></section>
    <div class="chips">${[["all","전체"],...VTRACKS[lang].map(l=>[l,l])].map(([k,l])=>html`<button type="button" key=${k} class="chip" aria-pressed=${lvF===k} onClick=${()=>{ setLvF(k); setMore(60); }}>${l}</button>`)}</div>
    <input id="v-search" class="inp search" placeholder=${lang==="ja"?"단어·읽기·뜻 검색 (예: 在庫, ざいこ, 재고)":"단어·뜻 검색 (예: refund, 환불)"} value=${q} onInput=${e=>{ setQ(e.target.value); setMore(60); }}/>
    <div class="plist">${list.slice(0,more).map(w=>{ const g=pr[w.id]; const due=g&&g.due<=t;
      return html`<div key=${w.id} class="card prow vrowc">
        <div class="pmain"><b><${VWord} w=${w}/></b><small class="sub">${w.m}${w.r&&!KJ.test(w.w)?"":w.r&&!FURI?" · "+w.r:""}</small></div>
        <div class="pside"><div class="boxes" aria-label=${"복습 "+((g&&g.box)||0)+"단계"}>${[1,2,3,4,5].map(i=>html`<i key=${i} class=${g&&g.box>=i?"on":""}></i>`)}</div>
          <small class=${due?"due":"sub"}>${!g?w.lv+" · 새 단어":due?"오늘 복습":g.box>=5?"익힘":g.due.slice(5).replace("-","/")+" 복습"}</small></div>
        ${canSpeak&&html`<button type="button" class="spk" aria-label="발음 듣기" onClick=${()=>vSay(w,lang)}><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></button>`}</div>`; })}</div>
    ${list.length>more&&html`<button type="button" class="btn wide" onClick=${()=>setMore(more+60)}>더 보기 (${list.length-more}개 남음)</button>`}
    ${!list.length&&html`<p class="hint center">찾는 단어가 없어요.</p>`}`;
}

function VocabSession({st,lang,up,gain,onExit}){
  const [steps,setSteps]=useState(()=>{ const nw=vNew(st,lang), due=shuffle(vDue(st,lang)).slice(0,VREV);
    return [...nw.map(w=>({type:"card",w})),...shuffle([...nw,...due]).map(w=>vStep(w,lang,st,0))]; });
  const [i,setI]=useState(0), [pick,setPick]=useState(null), [conf,setConf]=useState(null), [res,setRes]=useState({}), [xp,setXp]=useState(0), [ended,setEnded]=useState(false);
  const s=steps[i]; const reveal=pick!=null&&conf!=null;
  const finish=()=>{ const by={}; steps.forEach((x,k)=>{ if(x.type!=="vq"||x.retry) return; const r=res[k]; if(r) by[x.w.id]=r.ok&&r.conf==="sure"; });
    up(st0=>{ const all={...(st0.vprog||{en:{},ja:{}})}; const pr={...(all[lang]||{})};
      Object.entries(by).forEach(([id,pass])=>{ const g=pr[id]||{box:0,ok:0,tot:0}; const box=pass?Math.min(5,g.box+1):1; pr[id]={box,due:addDays(today(),INTERVAL[box]),ok:g.ok+(pass?1:0),tot:g.tot+1,lastPass:pass}; });
      return {...st0,vprog:{...all,[lang]:pr}}; });
    gain(10); setXp(x=>x+10); setEnded(true); };
  const next=()=>{ setPick(null); setConf(null); if(i+1>=steps.length) finish(); else setI(i+1); };
  const chooseConf=c=>{ if(conf!=null) return; setConf(c); const ok=pick===s.a, solid=ok&&c==="sure";
    setRes(r=>({...r,[i]:{ok,conf:c}})); const add=solid?3:ok?1:0; if(add){ gain(add); setXp(x=>x+add); }
    if(!solid&&s.retry<1) setSteps(a=>[...a,{...vStep(s.w,lang,st,1),rev:s.rev,...vOpts(s.w,lang,s.rev)}]); };
  if(!s&&!ended) return html`<main class="wrap main sess"><section class="card result"><h1>오늘 단어 끝!</h1><button type="button" class="btn pri wide" onClick=${onExit}>닫기</button></section></main>`;
  if(ended){ const qs=Object.entries(res).filter(([k])=>!steps[k].retry).map(([,v])=>v);
    const solid=qs.filter(r=>r.ok&&r.conf==="sure").length, lucky=qs.filter(r=>r.ok&&r.conf!=="sure").length, wrong=qs.filter(r=>!r.ok).length;
    const firsts=steps.map((x,k)=>[x,res[k]]).filter(([x,r])=>x.type==="vq"&&!x.retry&&r);
    return html`<main class="wrap main sess"><section class="card result">
      <span class="eyebrow">단어 루틴 완료 · +${xp} XP</span><h1>${solid}<small>/ ${qs.length}</small></h1><p class="sub">확실히 알고 맞힌 단어</p>
      <div class="tri"><div><b class="num">${solid}</b><small>확실히 맞힘</small></div><div><b class="num">${lucky}</b><small>감으로 맞힘</small></div><div><b class="num">${wrong}</b><small>틀림</small></div></div>
      ${lucky+wrong>0&&html`<p class="why">감으로 맞혔거나 틀린 단어는 내일 다시 나와요.</p>`}
      <ul class="rlist">${firsts.map(([x,r])=>{ const pass=r.ok&&r.conf==="sure"; return html`<li key=${x.w.id}><span class=${"tag "+(pass?"rev":"bad")}>${pass?"통과":"다시"}</span><${VWord} w=${x.w}/><small class="sub" style=${{marginLeft:"auto"}}>${x.w.m}</small></li>`; })}</ul>
      <button type="button" class="btn pri wide" onClick=${onExit}>완료</button></section></main>`; }
  const bar=html`<div class="sbar"><button type="button" class="link" onClick=${onExit} aria-label="그만하기">✕</button><div class="prog"><div style=${{width:(i/steps.length*100)+"%"}}></div></div><span class="sub num">${i+1}/${steps.length}</span></div>`;
  const spk=w=>canSpeak&&html`<button type="button" class="spk" aria-label="발음 듣기" onClick=${()=>vSay(w,lang)}><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></button>`;
  const w=s.w;
  if(s.type==="card") return html`<main class="wrap main sess">${bar}
    <section class="card vcard"><span class="eyebrow">새 단어 · ${w.lv} · ${w.c}</span>
      <div class="vhead"><${VWord} w=${w} big/>${spk(w)}</div>
      ${w.r&&w.r!==w.w&&html`<p class="vread ja">${w.r}</p>`}
      <p class="vmean">${w.m}</p></section>
    <button type="button" class="btn pri wide" onClick=${next}>외웠어요, 다음</button></main>`;
  const ok=pick===s.a;
  return html`<main class="wrap main sess">${bar}
    <section class="quiz"><div class="qtop">${s.retry>0&&html`<span class="tag new">다시 확인</span>`}<span class="eyebrow">${s.rev?"뜻에 맞는 단어는?":"이 단어의 뜻은?"}</span></div>
      <div class="vhead">${s.rev?html`<span class="vmean big">${w.m}</span>`:html`<${VWord} w=${w} big/>`}${!s.rev&&spk(w)}</div>
      <div class="opts">${s.opts.map((o,k)=>html`<button type="button" key=${o.id} class=${"opt"+(reveal&&k===s.a?" right":"")+(reveal&&pick===k&&k!==s.a?" wrong":"")+(!reveal&&pick===k?" sel":"")} disabled=${pick!=null} onClick=${()=>setPick(k)}><span class="ol">${k+1}</span><span class=${s.rev&&lang==="ja"?"ja":""}>${s.rev?rb(o.rw):o.m}</span></button>`)}</div>
      ${pick!=null&&conf==null&&html`<div class="confbox"><b>정답을 보기 전에, 얼마나 확신해요?</b>
        <div class="confs">${CONF.map(([k,l])=>html`<button type="button" key=${k} class=${"btn conf-"+k} onClick=${()=>chooseConf(k)}>${l}</button>`)}</div></div>`}
      ${reveal&&html`<div class=${"fb "+(ok&&conf==="sure"?"good":ok?"lucky":"badfb")}><b>${ok&&conf==="sure"?"확실히 맞혔어요 +3 XP":ok?"맞았지만 확신이 없었어요 · 끝에서 한 번 더":"틀렸어요 · 끝에서 한 번 더"}</b>
        <div class="vhead"><${VWord} w=${w}/>${spk(w)}</div>${w.r&&w.r!==w.w&&html`<p class="vread ja">${w.r}</p>`}<p class="why">${w.m}</p></div>`}
    </section>
    ${reveal&&html`<button type="button" class="btn pri wide" onClick=${next}>${i+1>=steps.length?"결과 보기":"다음"}</button>`}</main>`;
}

/* ---------- 내 문장 노트: 한국어로 먼저 적고 → 나중에 영작·일작 → 스스로 검토·평가 → 복습 ---------- */
const NOTE_TAGS={
  common:[["word","단어를 몰랐어요"],["order","어순이 헷갈렸어요"],["tense","시제가 헷갈렸어요"],["form","문법 형태·활용"],["natural","자연스러운 표현인지 모르겠어요"]],
  en:[["article","관사 a / the"],["plural","단수·복수"],["prep","전치사"],["verbform","-ing / to / p.p. 고르기"],["agree","주어-동사 수 일치"]],
  ja:[["particle","조사 は·が·を·に"],["conj","동사 활용"],["keigo","존댓말·정중체"],["kanji","한자 읽기·쓰기"],["adj","형용사 활용"]]};
const TAG_Q={en:{tense:"과거",article:"관사",plural:"복수",prep:"전치사",verbform:"부정사",agree:"be동사",order:"순서"},ja:{tense:"과거",particle:"조사",conj:"て형",keigo:"존경",adj:"형용사",order:"순서"}};
const tagLabel=(lang,k)=>{ const t=[...NOTE_TAGS.common,...NOTE_TAGS[lang]].find(x=>x[0]===k); return t?t[1]:k; };
const gMatch=(lang,q)=>q?POINTS[lang].filter(p=>(p.t+" "+p.form+" "+p.sum).includes(q)):[];
const CONF_N=[["good","자신 있어요"],["mid","반반이에요"],["low","자신 없어요"]];
const notesOf=(st,lang)=>(st.notes||[]).filter(n=>n.lang===lang);
const nStatus=n=>!n.dr?"todo":!n.rv?"check":"done";
const N_LABEL={todo:"번역 전",check:"검토 전",done:"검토 완료"};
const nDue=(st,lang)=>notesOf(st,lang).filter(n=>n.rv&&n.due&&n.due<=today());
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function weakStats(st,lang){ const c={}; notesOf(st,lang).filter(n=>n.rv).forEach(n=>(n.tags||[]).forEach(t=>{ c[t]=(c[t]||0)+1; })); return Object.entries(c).sort((a,b)=>b[1]-a[1]); }
/* 한국어 문장에 들어 있는 뜻으로 단어 힌트 찾기 */
function vocabHints(ko,lang){ if(!ko) return []; const toks=m=>m.replace(/\([^)]*\)/g,"").split(/[,;·]/).map(x=>x.trim().replace(/(하다|다|함|임|한|인|의|적인|요\.|\.|\?|!)$/,"")).filter(x=>x.length>=2);
  return VOCAB[lang].filter(w=>w.c!=="인사"&&w.c!=="표현"&&toks(w.m).some(t=>ko.includes(t))).slice(0,10); }
const trUrl=(svc,lang,text)=>svc==="papago"?`https://papago.naver.com/?sk=ko&tk=${lang}&st=${encodeURIComponent(text)}`:`https://translate.google.com/?sl=ko&tl=${lang}&text=${encodeURIComponent(text)}&op=translate`;

function NoteTab({st,lang,up,gain,openNote,startReview,openGrammar}){
  const [ko,setKo]=useState(""), [kind,setKind]=useState("s"), [f,setF]=useState("all");
  const ns=notesOf(st,lang).slice().sort((a,b)=>(b.up||"").localeCompare(a.up||""));
  const cnt=k=>ns.filter(n=>nStatus(n)===k).length;
  const due=nDue(st,lang), weak=weakStats(st,lang), rv=ns.filter(n=>n.rv);
  const add=(thenOpen)=>{ const t=ko.trim(); if(!t) return; const n={id:nid(),lang,kind,ko:t,dr:"",fx:"",tags:[],pts:[],memo:"",conf:null,made:today(),up:new Date().toISOString()};
    up(s=>({...s,notes:[...(s.notes||[]),n]})); gain(2); setKo(""); if(thenOpen) openNote(n.id); };
  const lname=lang==="en"?"영작":"일작";
  return html`<h1 class="ptitle">내 문장 노트</h1>
    <p class="lead">${lang==="en"?"영어":"일본어"}로 말해 보고 싶은 문장이나 단어를 한국어로 먼저 적어 두세요. ${lname}은 나중에 생각날 때 해도 돼요. 써 본 뒤엔 번역기와 비교하고, 뭐가 부족했는지 스스로 체크해요.</p>
    <section class="card"><div class="seg" role="group" aria-label="종류">${[["s","문장"],["w","단어·표현"]].map(([k,l])=>html`<button type="button" key=${k} aria-pressed=${kind===k} onClick=${()=>setKind(k)}>${l}</button>`)}</div>
      <textarea id="n-ko" class="inp ta" rows="3" placeholder=${kind==="s"?"예) 이 청소기는 지난주에 새로 나온 모델이에요.":"예) 재고가 다 떨어졌다"} value=${ko} onInput=${e=>setKo(e.target.value)}></textarea>
      <div class="row2"><button type="button" class="btn" disabled=${!ko.trim()} onClick=${()=>add(false)}>적어 두기</button><button type="button" class="btn pri" disabled=${!ko.trim()} onClick=${()=>add(true)}>지금 ${lname}해 보기</button></div></section>
    ${due.length>0&&html`<section class="card routine"><div class="rh"><div><span class="eyebrow">내 문장 복습</span><h2>오늘 다시 말해 볼 문장 ${due.length}개</h2></div></div>
      <p class="sub">한국어를 보고 내가 고친 문장을 떠올려 봐요.</p><button type="button" class="btn pri wide" onClick=${startReview}>복습 시작</button></section>`}
    ${rv.length>0&&html`<section class="card"><div class="rh"><span class="eyebrow">내가 자주 놓친 점 · 검토한 ${rv.length}개 기준</span></div>
      ${weak.length?weak.slice(0,6).map(([t,c])=>{ const q=(TAG_Q[lang]||{})[t]; const has=gMatch(lang,q).length>0;
        return html`<div class="wk" key=${t}><span class="wkl">${tagLabel(lang,t)}</span><div class="bar"><div style=${{width:(c/rv.length*100)+"%",background:"var(--lucky)"}}></div></div><small class="num sub">${c}</small>
          ${has?html`<button type="button" class="link sm" onClick=${()=>openGrammar(q)}>관련 문법</button>`:t==="word"?html`<span class="sub sm">단어 탭에서 보충</span>`:html`<span></span>`}</div>`; })
        :html`<p class="hint">아직 체크한 약점이 없어요. 잘하고 있어요!</p>`}
      ${(()=>{ const c={good:0,mid:0,low:0}; rv.forEach(n=>{ if(n.conf) c[n.conf]++; }); return html`<p class="hint">스스로 평가: 자신 있음 ${c.good} · 반반 ${c.mid} · 자신 없음 ${c.low}</p>`; })()}</section>`}
    <div class="chips">${[["all","전체 "+ns.length],["todo","번역 전 "+cnt("todo")],["check","검토 전 "+cnt("check")],["done","완료 "+cnt("done")]].map(([k,l])=>html`<button type="button" key=${k} class="chip" aria-pressed=${f===k} onClick=${()=>setF(k)}>${l}</button>`)}</div>
    <div class="plist">${ns.filter(n=>f==="all"||nStatus(n)===f).map(n=>{ const s=nStatus(n);
      return html`<button type="button" key=${n.id} class="card prow nrow" onClick=${()=>openNote(n.id)}>
        <div class="pmain"><b>${n.ko}</b>${(n.fx||n.dr)&&html`<small class=${"sub"+(lang==="ja"?" ja":"")}>${n.fx||n.dr}</small>`}</div>
        <div class="pside"><span class=${"tag "+(s==="done"?"rev":s==="check"?"new":"todo")}>${N_LABEL[s]}</span><small class="sub">${n.kind==="w"?"단어":"문장"} · ${n.made.slice(5).replace("-","/")}</small></div></button>`; })}</div>
    ${!ns.length&&html`<p class="hint center">아직 적은 문장이 없어요. 오늘 손님에게 하고 싶었던 말부터 적어 볼까요?</p>`}`;
}

function NoteEditor({st,lang,id,up,gain,onClose}){
  const orig=(st.notes||[]).find(n=>n.id===id)||{id,lang,kind:"s",ko:"",dr:"",fx:"",tags:[],pts:[],memo:"",made:today()};
  const [n,setN]=useState(()=>({...orig,tags:[...(orig.tags||[])],pts:[...(orig.pts||[])]}));
  const [hint,setHint]=useState(false), [gq,setGq]=useState(""), [ask,setAsk]=useState(false), [saved,setSaved]=useState(null);
  const set=k=>v=>setN(x=>({...x,[k]:v}));
  const lname=lang==="en"?"영작":"일작", tl=lang==="en"?"영어":"일본어";
  const hints=useMemo(()=>vocabHints(n.ko,lang),[n.ko,lang]);
  const tog=t=>setN(x=>({...x,tags:x.tags.includes(t)?x.tags.filter(y=>y!==t):[...x.tags,t]}));
  const togP=pid=>setN(x=>({...x,pts:x.pts.includes(pid)?x.pts.filter(y=>y!==pid):[...x.pts,pid].slice(-4)}));
  const gl=gq.trim()?POINTS[lang].filter(p=>(p.t+" "+p.form).toLowerCase().includes(gq.trim().toLowerCase())).slice(0,6):[];
  const write=(review)=>{ let xp=0; const now=new Date().toISOString();
    const out={...n,fx:(n.fx||"").trim()?n.fx:n.dr,up:now}; if(n.dr&&!orig.dr) xp+=5;
    if(review){ if(!orig.rv){ xp+=15; out.rv=today(); out.box=1; out.due=addDays(today(),1); } else { out.rv=today(); } }
    up(s=>{ const notes=(s.notes||[]).map(x=>x.id===id?out:x); let prog=s.prog;
      if(review&&out.pts.length){ const pr={...s.prog[lang]}; out.pts.forEach(pid=>{ if(pr[pid]) pr[pid]={...pr[pid],due:today()}; }); prog={...s.prog,[lang]:pr}; }
      return {...s,notes,prog}; });
    if(xp) gain(xp); setSaved(review?"done":"draft"); };
  const del=()=>{ up(s=>({...s,notes:(s.notes||[]).filter(x=>x.id!==id)})); onClose(); };
  if(saved==="done"){ const learned=n.pts.filter(pid=>st.prog[lang][pid]);
    return html`<main class="wrap main sess"><section class="card result"><span class="eyebrow">검토 완료</span><h1 style=${{fontSize:"26px"}}>잘했어요!</h1>
      <p class="sub">이 문장은 내일 복습에 나와요. 한국어를 보고 고친 문장을 다시 떠올려 볼 거예요.</p>
      ${n.tags.length>0&&html`<p class="why">이번에 체크한 점: ${n.tags.map(t=>tagLabel(lang,t)).join(", ")}</p>`}
      ${learned.length>0&&html`<p class="why">연결한 문법 ${learned.length}개를 오늘 복습 목록에 올렸어요.</p>`}
      <button type="button" class="btn pri wide" onClick=${onClose}>노트로 돌아가기</button></section></main>`; }
  return html`<main class="wrap main sess note">
    <div class="sbar"><button type="button" class="link" onClick=${onClose} aria-label="닫기">✕</button><b class="sbt">${n.kind==="w"?"단어·표현":"문장"} ${lname}</b><span class=${"tag "+(nStatus(orig)==="done"?"rev":"new")}>${N_LABEL[nStatus(orig)]}</span></div>
    <section class="card"><span class="eyebrow">한국어</span><textarea id="ne-ko" class="inp ta" rows="2" value=${n.ko} onInput=${e=>set("ko")(e.target.value)}></textarea></section>
    <section class="card"><div class="rh"><span class="eyebrow">1 · 내가 쓴 ${lname}</span>${hints.length>0&&html`<button type="button" class="link sm" onClick=${()=>setHint(!hint)}>${hint?"힌트 숨기기":"힌트 단어 "+hints.length+"개"}</button>`}</div>
      <textarea id="ne-dr" class=${"inp ta"+(lang==="ja"?" ja":"")} rows="3" placeholder=${"먼저 보지 말고 "+tl+"로 직접 써 보세요"} value=${n.dr} onInput=${e=>set("dr")(e.target.value)}></textarea>
      ${hint&&html`<div class="hints">${hints.map(w=>html`<button type="button" key=${w.id} class="hchip" onClick=${()=>vSay(w,lang)}><b class=${lang==="ja"?"ja":""}>${rb(w.rw)}</b><small>${w.m}</small></button>`)}</div>`}
      ${n.dr&&canSpeak&&html`<button type="button" class="link sm" style=${{alignSelf:"flex-start"}} onClick=${()=>speak(n.dr,lang)}>내 문장 소리로 듣기</button>`}</section>
    <section class=${"card"+(n.dr?"":" dim")}><span class="eyebrow">2 · 비교해 보기</span>
      <p class="hint">번역기 답이 정답은 아니에요. 내 문장과 어디가 다른지만 보고, 왜 다른지 생각해 봐요.</p>
      <div class="row2"><a class="btn sm" href=${trUrl("papago",lang,n.ko)} target="_blank" rel="noopener">파파고로 비교</a><a class="btn sm" href=${trUrl("google",lang,n.ko)} target="_blank" rel="noopener">구글 번역으로 비교</a></div></section>
    <section class=${"card"+(n.dr?"":" dim")}><span class="eyebrow">3 · 스스로 평가</span>
      <b class="qh2">얼마나 자신 있게 썼어요?</b>
      <div class="chips">${CONF_N.map(([k,l])=>html`<button type="button" key=${k} class="chip" aria-pressed=${n.conf===k} onClick=${()=>set("conf")(k)}>${l}</button>`)}</div>
      <b class="qh2">부족했던 점 (여러 개)</b>
      <div class="chips">${[...NOTE_TAGS.common,...NOTE_TAGS[lang]].map(([k,l])=>html`<button type="button" key=${k} class="chip" aria-pressed=${n.tags.includes(k)} onClick=${()=>tog(k)}>${l}</button>`)}</div>
      <div class="rh"><b class="qh2">고친 문장</b>${n.dr&&!n.fx&&html`<button type="button" class="link sm" onClick=${()=>set("fx")(n.dr)}>내 문장 가져오기</button>`}</div>
      <textarea id="ne-fx" class=${"inp ta"+(lang==="ja"?" ja":"")} rows="3" placeholder="비교해 보고 최종으로 정한 문장 (복습 때 정답으로 나와요)" value=${n.fx} onInput=${e=>set("fx")(e.target.value)}></textarea>
      <b class="qh2">메모 · 왜 틀렸는지</b>
      <textarea id="ne-memo" class="inp ta" rows="2" placeholder="예) '지난주에 나온'은 過去形으로. 新しく出た보다 発売された가 자연스러움" value=${n.memo} onInput=${e=>set("memo")(e.target.value)}></textarea>
      <b class="qh2">쓴 문법 연결하기 <small class="sub">(배운 문법이면 오늘 복습에 올라가요)</small></b>
      ${n.pts.length>0&&html`<div class="chips">${n.pts.map(pid=>{ const p=POINTS[lang].find(x=>x.id===pid); return p&&html`<button type="button" key=${pid} class="chip" aria-pressed=${true} onClick=${()=>togP(pid)}>${p.t} ✕</button>`; })}</div>`}
      <input id="ne-g" class="inp search" placeholder=${lang==="en"?"문법 찾기 (예: 현재완료, 관계대명사)":"문법 찾기 (예: ように, て형)"} value=${gq} onInput=${e=>setGq(e.target.value)}/>
      ${gl.length>0&&html`<div class="glist">${gl.map(p=>html`<button type="button" key=${p.id} class=${"gopt"+(n.pts.includes(p.id)?" on":"")} onClick=${()=>togP(p.id)}><b>${p.t}</b><small class="sub">${p.lv} · ${p.form}</small></button>`)}</div>`}
    </section>
    <div class="row2"><button type="button" class="btn" onClick=${()=>{ write(false); onClose(); }}>임시 저장</button><button type="button" class="btn pri" disabled=${!n.dr.trim()||!(n.fx||n.dr).trim()} onClick=${()=>write(true)}>검토 완료</button></div>
    ${!n.dr.trim()&&html`<p class="hint center">${lname}을 써야 검토를 완료할 수 있어요. 지금 생각이 안 나면 임시 저장해 두세요.</p>`}
    ${ask?html`<div class="card confirm"><p>이 문장을 지울까요?</p><div class="row"><button type="button" class="btn" onClick=${()=>setAsk(false)}>취소</button><button type="button" class="btn danger" onClick=${del}>지우기</button></div></div>`
      :html`<button type="button" class="link center muted" onClick=${()=>setAsk(true)}>이 문장 지우기</button>`}
  </main>`;
}

function NoteReview({st,lang,up,gain,onExit}){
  const [list]=useState(()=>shuffle(nDue(st,lang)).slice(0,15));
  const [i,setI]=useState(0), [show,setShow]=useState(false), [mine,setMine]=useState(""), [rs,setRs]=useState({}), [ended,setEnded]=useState(false);
  const rate=r=>{ const n=list[i]; setRs(x=>({...x,[n.id]:r}));
    up(s=>({...s,notes:(s.notes||[]).map(x=>{ if(x.id!==n.id) return x; const box=r==="good"?Math.min(5,(x.box||1)+1):r==="mid"?Math.max(1,x.box||1):1; return {...x,box,due:addDays(today(),INTERVAL[box]),last:today()}; })}));
    gain(r==="good"?4:2); setShow(false); setMine(""); if(i+1>=list.length) setEnded(true); else setI(i+1); };
  if(!list.length||ended){ const v=Object.values(rs);
    return html`<main class="wrap main sess"><section class="card result"><span class="eyebrow">내 문장 복습</span><h1>${v.filter(r=>r==="good").length}<small>/ ${v.length}</small></h1><p class="sub">바로 떠올린 문장</p>
      <div class="tri"><div><b class="num">${v.filter(r=>r==="good").length}</b><small>기억났어요</small></div><div><b class="num">${v.filter(r=>r==="mid").length}</b><small>애매해요</small></div><div><b class="num">${v.filter(r=>r==="bad").length}</b><small>생각 안 났어요</small></div></div>
      <button type="button" class="btn pri wide" onClick=${onExit}>완료</button></section></main>`; }
  const n=list[i], ans=n.fx||n.dr;
  return html`<main class="wrap main sess">
    <div class="sbar"><button type="button" class="link" onClick=${onExit} aria-label="그만하기">✕</button><div class="prog"><div style=${{width:(i/list.length*100)+"%"}}></div></div><span class="sub num">${i+1}/${list.length}</span></div>
    <section class="quiz"><span class="eyebrow">${lang==="en"?"영어":"일본어"}로 말해 보세요</span>
      <p class="qtext concept">${n.ko}</p>
      <textarea id="nr-mine" class=${"inp ta"+(lang==="ja"?" ja":"")} rows="2" placeholder="떠올린 문장을 적어 봐도 좋아요 (선택)" value=${mine} onInput=${e=>setMine(e.target.value)} disabled=${show}></textarea>
      ${!show?html`<button type="button" class="btn pri wide" onClick=${()=>setShow(true)}>내가 고친 문장 보기</button>`
      :html`<div class="fb good"><b>내가 정한 문장</b><div class="exs"><span class=${"sent big"+(lang==="ja"?" ja":"")}>${ans}</span>${canSpeak&&html`<button type="button" class="spk" aria-label="발음 듣기" onClick=${()=>speak(ans,lang)}><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></button>`}</div>
          ${n.memo&&html`<p class="why">메모: ${n.memo}</p>`}${(n.tags||[]).length>0&&html`<p class="why sub">그때 놓친 점: ${n.tags.map(t=>tagLabel(lang,t)).join(", ")}</p>`}</div>
        <div class="confs">${[["good","기억났어요","conf-sure"],["mid","애매해요","conf-unsure"],["bad","생각 안 났어요","conf-guess"]].map(([k,l,c])=>html`<button type="button" key=${k} class=${"btn "+c} onClick=${()=>rate(k)}>${l}</button>`)}</div>`}
    </section></main>`;
}

/* ---------- 목소리 설정 ---------- */
function VoiceCard({st,up}){
  const [,force]=useState(0);
  useEffect(()=>{ const f=()=>force(x=>x+1); window.addEventListener("voices-ready",f); const t=setTimeout(()=>{ loadVoices(); f(); },600); return ()=>{ window.removeEventListener("voices-ready",f); clearTimeout(t); }; },[]);
  if(!canSpeak) return null;
  const pref={rate:0.92,...(st.voice||{})};
  const set=p=>up(s=>({...s,voice:{...(s.voice||{}),...p}}));
  const SAMPLE={en:"I have worked at this store for six months.",ja:"少々お待ちください。すぐにご案内いたします。"};
  const row=lang=>{ const list=[...langVoices(lang)].sort((a,b)=>voiceScore(b,lang)-voiceScore(a,lang)); const cur=bestVoice(lang);
    return html`<div class="vrow" key=${lang}><span class="vl">${lang==="en"?"영어":"일본어"}</span>
      ${list.length?html`<select id=${"voice-"+lang} class="sel" value=${cur?cur.name:""} onChange=${e=>set({[lang]:e.target.value})}>${list.map(v=>html`<option key=${v.name} value=${v.name}>${v.name.replace(/Microsoft |Google /,"")}${voiceScore(v,lang)>=40?" ★":""}</option>`)}</select>`
        :html`<span class="sub" style=${{flex:1}}>이 기기에 ${lang==="en"?"영어":"일본어"} 음성이 없어요</span>`}
      <button type="button" class="btn sm" disabled=${!list.length} onClick=${()=>speak(SAMPLE[lang],lang)}>듣기</button></div>`; };
  return html`<section class="card"><span class="eyebrow">발음 · 표시</span>
    ${row("en")}${row("ja")}
    <div class="vrow"><span class="vl">후리가나</span><div class="chips">${[[true,"한자 위에 표시"],[false,"숨기기"]].map(([v,l])=>html`<button type="button" key=${l} class="chip" aria-pressed=${(st.furi!==false)===v} onClick=${()=>up(s=>({...s,furi:v}))}>${l}</button>`)}</div></div>
    <div class="vrow"><span class="vl">속도</span><div class="chips">${[[0.8,"느리게"],[0.92,"보통"],[1.05,"빠르게"]].map(([r,l])=>html`<button type="button" key=${r} class="chip" aria-pressed=${pref.rate===r} onClick=${()=>set({rate:r})}>${l}</button>`)}</div></div>
    <p class="hint">★는 사람 목소리에 가까운 고품질 음성이에요. 목소리는 쓰는 기기·브라우저에 설치된 것만 나와요. 가장 자연스러운 건 <b>Edge</b>의 'Natural' 음성, <b>아이폰·맥</b>은 설정 › 손쉬운 사용 › 읽기 및 말하기에서 '향상된/고품질' 음성을 내려받으면 여기에 나타나요.</p>
  </section>`;
}

/* ---------- 기록 옮기기 (다른 기기·새 버전으로) ---------- */
function Backup({st,up}){
  const [mode,setMode]=useState(null), [txt,setTxt]=useState(""), [msg,setMsg]=useState("");
  const code=JSON.stringify({app:"grammar-life",v:1,at:new Date().toISOString(),data:st});
  const copy=async()=>{ try{ await navigator.clipboard.writeText(code); setMsg("복사했어요. 새 앱의 '백업 코드 붙여넣기'에 넣으면 돼요."); }catch(e){ const el=document.getElementById("bk-out"); if(el){ el.focus(); el.select(); } setMsg("자동 복사가 막혀 있어요. 선택된 글자를 직접 복사해 주세요."); } };
  const load=()=>{ try{ const o=JSON.parse(txt.trim()); const d=o&&o.app==="grammar-life"?o.data:o; if(!d||!d.prog||!d.profile) throw 0;
      up(()=>({...blankState(),...d})); setMsg("가져왔어요!"); setMode(null); setTxt(""); }catch(e){ setMsg("백업 코드가 올바르지 않아요. 처음부터 끝까지 전부 붙여넣었는지 확인해 주세요."); } };
  return html`<section class="card"><span class="eyebrow">기록 옮기기</span>
    <p class="hint">다른 기기나 새 버전 앱으로 학습 기록을 옮길 때 써요. 백업 코드에 진도·노트·설문이 모두 들어 있어요.</p>
    <div class="row2"><button type="button" class="btn sm" aria-pressed=${mode==="out"} onClick=${()=>{ setMode(mode==="out"?null:"out"); setMsg(""); }}>백업 코드 만들기</button><button type="button" class="btn sm" aria-pressed=${mode==="in"} onClick=${()=>{ setMode(mode==="in"?null:"in"); setMsg(""); }}>백업 코드 붙여넣기</button></div>
    ${mode==="out"&&html`<textarea id="bk-out" class="inp ta" rows="4" readonly value=${code} onFocus=${e=>e.target.select()}></textarea><button type="button" class="btn pri wide" onClick=${copy}>복사하기</button>`}
    ${mode==="in"&&html`<textarea id="bk-in" class="inp ta" rows="4" placeholder="백업 코드를 붙여넣으세요 (지금 기록은 덮어써져요)" value=${txt} onInput=${e=>setTxt(e.target.value)}></textarea><button type="button" class="btn pri wide" disabled=${!txt.trim()} onClick=${load}>가져오기</button>`}
    ${msg&&html`<p class="hint">${msg}</p>`}</section>`;
}

/* ---------- 나 ---------- */
function Me({st,up,edit}){
  const [ask,setAsk]=useState(false);
  const p=st.profile, job=JOBS.find(j=>j.id===p.job), ride=RIDES.find(r=>r.id===p.ride);
  const days=[...Array(28)].map((_,k)=>addDays(today(),k-27)); const g=goalXp(p);
  const acc=l=>{ const v=Object.values(st.prog[l]); const t=v.reduce((a,b)=>a+b.tot,0), o=v.reduce((a,b)=>a+b.ok,0); return t?Math.round(o/t*100):null; };
  const luck=()=>{ const v=[...Object.values(st.prog.en),...Object.values(st.prog.ja)]; const ok=v.reduce((a,b)=>a+b.ok,0), lk=v.reduce((a,b)=>a+(b.lucky||0),0); return ok+lk?Math.round(lk/(ok+lk)*100):null; };
  const mastered=l=>POINTS[l].filter(x=>(st.prog[l][x.id]||{}).box>=4).length;
  const sk=streak(st.days);
  const badges=[["첫 걸음",st.xp>0],["3일 연속",sk>=3],["7일 연속",sk>=7],["문법 5개 익힘",mastered("en")+mastered("ja")>=5],["첫 실전",st.exams.length>0],["실전 90점",st.exams.some(e=>e.score>=90)],["내 문장 10개 검토",(st.notes||[]).filter(n=>n.rv).length>=10],["단어 50개 익힘",Object.values(vp(st,"en")).concat(Object.values(vp(st,"ja"))).filter(g=>g.box>=3).length>=50]];
  return html`<h1 class="ptitle">나의 학습</h1>
    <section class="card"><span class="eyebrow">최근 4주</span>
      <div class="heat">${days.map(d=>{ const v=st.days[d]||0; const lv=v===0?0:v<g/2?1:v<g?2:3; return html`<i key=${d} class=${"h"+lv} title=${d+" · "+v+" XP"}></i>`; })}</div>
      <div class="legend"><span class="sub">적음</span><i class="h1"></i><i class="h2"></i><i class="h3"></i><span class="sub">목표 달성</span></div></section>
    <section class="stats">${[["총 XP",st.xp],["연속",sk+"일"],["영어 확실 정답률",acc("en")==null?"-":acc("en")+"%"],["일본어 확실 정답률",acc("ja")==null?"-":acc("ja")+"%"]].map(([l,v])=>html`<div class="card st" key=${l}><span class="eyebrow">${l}</span><b class="num">${v}</b></div>`)}</section>
    ${luck()!=null&&html`<section class="card"><div class="rh"><span class="eyebrow">감으로 맞힌 비율</span><b class="num">${luck()}%</b></div><div class="bar"><div style=${{width:luck()+"%",background:"var(--lucky)"}}></div></div><p class="hint">맞힌 문제 중 '애매해요·찍었어요'를 고른 비율이에요. 낮을수록 정확히 알고 맞힌 거예요.</p></section>`}
    <section class="card"><span class="eyebrow">배지</span><div class="badges">${badges.map(([n,on])=>html`<span key=${n} class=${"badge"+(on?" on":"")}>${n}</span>`)}</div></section>
    <${VoiceCard} st=${st} up=${up}/>
    <section class="card"><div class="rh"><span class="eyebrow">내 생활 설문</span><button type="button" class="link" onClick=${edit}>수정</button></div>
      <dl class="prof"><dt>일하는 곳</dt><dd>${job.ko}</dd><dt>출퇴근</dt><dd>${ride.ko}</dd><dt>쉬는 날</dt><dd>${p.hobbies.map(h=>HOBBIES.find(x=>x.id===h).ko).join(", ")}</dd><dt>앞으로 있는 일</dt><dd>${p.plans.map(h=>PLANS.find(x=>x.id===h).ko).join(", ")}</dd><dt>목표</dt><dd>TOEIC ${p.toeic} · JLPT ${p.jlpt} · 하루 ${p.goal}분</dd></dl></section>
    <${Backup} st=${st} up=${up}/>
    <p class="hint center">학습 기록은 이 기기 브라우저에만 저장돼요.</p>
    ${ask?html`<div class="card confirm"><p>학습 기록과 설문을 모두 지울까요?</p><div class="row"><button type="button" class="btn" onClick=${()=>setAsk(false)}>취소</button><button type="button" class="btn danger" onClick=${()=>{ up(()=>blankState()); setAsk(false); }}>모두 지우기</button></div></div>`
      :html`<button type="button" class="link center muted" onClick=${()=>setAsk(true)}>기록 초기화</button>`}`;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);
