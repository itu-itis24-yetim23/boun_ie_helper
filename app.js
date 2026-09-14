const curriculum = [
  {term:'1. Yıl · Güz',courses:[['MATH 101','Calculus I',4,6],['MATH 201','Matrix Theory',4,5],['PHYS 121','Mechanics & Thermodynamics',4,8],['ENGG 110','Engineering Drawing',3,5],['IE 120','IE: Overview & Orientation',3,5]]},
  {term:'1. Yıl · Bahar',courses:[['MATH 102','Calculus II',4,6],['PHYS 201','Physics III',4,6],['CMPE 150','Introduction to Computing',3,5],['CHEM 105','Fundamentals of Chemistry',4,6],['HSS','Humanities Elective',3,5,'elective']]},
  {term:'2. Yıl · Güz',courses:[['IE 201','Intermediate Programming',3,6],['IE 202','Operations Research I',4,7],['IE 255','Probability for IE',3,6],['AD 216','Financial & Cost Accounting',4,6],['EC 101','Principles of Microeconomics',3,6],['TK 221','Turkish I',2,3]]},
  {term:'2. Yıl · Bahar',courses:[['MATH 202','Differential Equations',4,7],['IE 256','Statistics for IE',3,6],['IE 220','Materials & Processes in Manufacturing',3,5],['IE 203','Operations Research II',4,7],['EC 102','Principles of Macroeconomics',3,6],['TK 222','Turkish II',2,3]]},
  {term:'3. Yıl · Güz',courses:[['IE 341','Engineering Economics',4,7],['IE 306','Systems Simulation',4,7],['IE 312','Facilities Design & Planning',4,7],['HSS','Humanities Elective',3,5,'elective'],['HTR 311','History of Turkish Republic I',2,3]]},
  {term:'3. Yıl · Bahar',courses:[['IE 313','Supply Chain Management',4,7],['IE SPEC','Specialization Course',3,6,'elective'],['IE DEPT','Departmental Elective',3,6,'elective'],['IE DEPT','Departmental Elective',3,6,'elective'],['HSS','Humanities Elective',3,5,'elective'],['HTR 312','History of Turkish Republic II',2,3]]},
  {term:'4. Yıl · Güz',courses:[['IE 423','Quality Engineering',3,6],['IE SPEC','Specialization Course',3,6,'elective'],['IE SPEC','Specialization Course',3,6,'elective'],['IE DEPT','Departmental Elective',3,6,'elective'],['CC','Complementary Elective',3,5,'elective']]},
  {term:'4. Yıl · Bahar',courses:[['IE 492','Senior Project',4,8,'project'],['IE DEPT','Departmental Elective',3,6,'elective'],['FREE','Unrestricted Elective',3,5,'elective'],['CC','Complementary Elective',3,5,'elective'],['HSS','Humanities Elective',3,5,'elective'],['IE 400','Industrial Engineering Internship',0,10,'project']]}
];

const prereqCourses = {
  'CMPE 150':{name:'Introduction to Computing',x:70,y:90},
  'MATH 201':{name:'Matrix Theory',x:270,y:90},
  'IE 255':{name:'Probability for IE',x:470,y:90},
  'PHYS 121':{name:'Mechanics & Thermodynamics',x:680,y:90},
  'CHEM 105':{name:'Fundamentals of Chemistry',x:850,y:90},
  'MATH 202':{name:'Differential Equations',x:1020,y:90},
  'IE 201':{name:'Intermediate Programming',x:70,y:215},
  'IE 202':{name:'Operations Research I',x:270,y:215},
  'IE 256':{name:'Statistics for IE',x:470,y:215},
  'IE 220':{name:'Materials & Processes',x:760,y:215},
  'IE 350':{name:'Systems Science & Engineering',x:1020,y:215},
  'IE 203':{name:'Operations Research II',x:235,y:350},
  'IE 312':{name:'Facilities Design & Planning',x:470,y:350},
  'IE 306':{name:'Systems Simulation',x:650,y:350},
  'IE 423':{name:'Quality Engineering',x:830,y:350},
  'IE 313':{name:'Supply Chain Management',x:470,y:465},
  'IE 414':{name:'Smart Manufacturing Systems',x:650,y:465},
  'IE 420':{name:'OR Modeling Applications',x:100,y:465},
  'IE 441':{name:'Planning for Engineers',x:270,y:465}
};
const prereqEdges = [
  ['CMPE 150','IE 201'],['MATH 201','IE 202'],['IE 202','IE 203'],['IE 255','IE 203'],['IE 255','IE 256'],
  ['PHYS 121','IE 220'],['CHEM 105','IE 220'],['IE 256','IE 306'],['IE 256','IE 312'],['IE 202','IE 312'],
  ['IE 312','IE 313'],['IE 256','IE 423'],['MATH 202','IE 350'],['IE 306','IE 414'],['IE 202','IE 420'],['IE 202','IE 441']
];

const state = { catalogue:[], metadata:null, selectedBase:[], plans:[], planIndex:0 };
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const normalize = s => (s||'').replace(/\s+/g,'').toUpperCase();
const baseCode = code => normalize(code).split('.')[0];
const prettyBase = code => baseCode(code).replace(/^([A-Z]+)(\d)/,'$1 $2');

function route(){
  const id = location.hash.slice(1) || 'home';
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  $$('#nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',route); route();

function renderCurriculum(){
  $('#curriculumGrid').innerHTML = curriculum.map((sem,i)=>{
    const cr=sem.courses.reduce((a,c)=>a+c[2],0);
    return `<article class="semester"><div class="semester-header"><h3>${sem.term}</h3><span>${cr} kredi</span></div><div class="course-list">${sem.courses.map(c=>`<div class="course-card ${c[4]||''}" title="${c[4]==='elective'?'Seçmeli ders':c[4]==='project'?'Proje / staj':'Zorunlu ders'}"><span class="course-code">${c[0]}</span><span class="course-name">${c[1]}</span><span class="course-credits">${c[2]} cr · ${c[3]} ECTS</span></div>`).join('')}</div></article>`
  }).join('');
}
renderCurriculum();

function descendants(code){
  const out=new Set(); let changed=true;
  while(changed){changed=false;for(const [a,b] of prereqEdges) if((a===code||out.has(a))&&!out.has(b)){out.add(b);changed=true}}
  return out;
}
function ancestors(code){
  const out=new Set(); let changed=true;
  while(changed){changed=false;for(const [a,b] of prereqEdges) if((b===code||out.has(b))&&!out.has(a)){out.add(a);changed=true}}
  return out;
}
function drawGraph(selected=''){
  const before=selected?ancestors(selected):new Set(), after=selected?descendants(selected):new Set();
  const W=1100,H=540;
  const lines=prereqEdges.map(([a,b])=>{
    const A=prereqCourses[a],B=prereqCourses[b];
    const cls= selected && (b===selected||before.has(b)) && (a===selected||before.has(a)) ? 'hot-before' : selected && (a===selected||after.has(a)) && (b===selected||after.has(b)) ? 'hot-after' : '';
    return `<line class="graph-line ${cls}" x1="${A.x}" y1="${A.y+28}" x2="${B.x}" y2="${B.y-28}" marker-end="url(#arrow)"/>`
  }).join('');
  const nodes=Object.entries(prereqCourses).map(([code,c])=>{
    let cls=''; if(selected){cls=code===selected?'selected':before.has(code)?'before':after.has(code)?'after':'dim'}
    return `<button class="graph-node ${cls}" data-code="${code}" style="left:${c.x}px;top:${c.y}px"><strong>${code}</strong><span>${c.name}</span></button>`
  }).join('');
  $('#graph').innerHTML=`<div class="graph-inner" style="width:${W}px;height:${H}px"><svg width="${W}" height="${H}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><polygon points="0 0,8 3.5,0 7" fill="#aab7c7"/></marker></defs>${lines}</svg>${nodes}</div>`;
  $$('.graph-node').forEach(n=>n.onclick=()=>selectGraph(n.dataset.code));
}
function selectGraph(code){
  drawGraph(code); const c=prereqCourses[code]; const pre=[...ancestors(code)], next=[...descendants(code)];
  $('#courseDetail').innerHTML=`<strong>${code} — ${c.name}</strong><br><span>${pre.length?`Öncesinde: ${pre.join(', ')}`:'Listelenmiş zorunlu önkoşulu yok.'} ${next.length?` · Sonrasında açtığı zincir: ${next.join(', ')}`:''}</span>`;
}
drawGraph();
$('#resetGraph').onclick=()=>{drawGraph();$('#courseDetail').textContent='Bir ders seçerek zinciri inceleyebilirsin.'};
$('#graphSearch').addEventListener('input',e=>{
  const q=e.target.value.toLocaleLowerCase('tr').trim();
  if(!q){drawGraph();return}
  const hit=Object.entries(prereqCourses).find(([code,c])=>(code+' '+c.name).toLocaleLowerCase('tr').includes(q));
  if(hit) selectGraph(hit[0]);
});

async function loadCatalogue(){
  const sources=['data/courses.json','https://raw.githubusercontent.com/kharo0n/Boun-Toolbox-/main/src/data/allCourses.json'];
  let raw=null,source='';
  for(const url of sources){
    try{const r=await fetch(url,{cache:'no-store'});if(r.ok){const candidate=await r.json();if(candidate && Object.keys(candidate).length){raw=candidate;source=url;break}}}catch(_e){}
  }
  if(raw){
    state.catalogue=Object.entries(raw).map(([key,c])=>({...c,key,sessionType:c.sessionType||(/LAB/i.test(key)?'lab':/P\.S\./i.test(key)?'ps':'lecture')}));
    $('#dataStatus').textContent=`${state.catalogue.length.toLocaleString('tr-TR')} ders kaydı hazır`;
    $('#dataMeta').textContent=source.startsWith('data/')?'Repo veri dosyası':'Geliştirme fallback snapshot';
    $('#plannerMessage').textContent='Ders ara ve ekle. Programlayıcı aynı dersin şubelerini otomatik kombinler.';
  }else{
    $('#dataStatus').textContent='Ders verisi bulunamadı';
    $('#dataMeta').textContent='npm run update:data çalıştır';
    $('#plannerMessage').textContent='Önce BUIS verisini üretmek için README’deki update:data komutunu çalıştır.';
  }
  try{const r=await fetch('data/metadata.json',{cache:'no-store'});if(r.ok){state.metadata=await r.json();$('#plannerSemester').textContent=state.metadata.semester||'BUIS dönemi';}}catch(_e){$('#plannerSemester').textContent='BUIS veri snapshotı'}
}
loadCatalogue();

function lectureSectionsFor(base){return state.catalogue.filter(c=>c.sessionType==='lecture'&&baseCode(c.code)===base)}
function uniqueBases(query){
  const q=normalize(query); if(!q) return [];
  const map=new Map();
  for(const c of state.catalogue){if(c.sessionType!=='lecture') continue; const b=baseCode(c.code); if(!(normalize(c.code).includes(q)||normalize(c.name).includes(q))) continue; if(!map.has(b)) map.set(b,{base:b,name:c.name,count:0}); map.get(b).count++;}
  return [...map.values()].slice(0,12);
}
$('#courseSearch').addEventListener('input',e=>{
  const items=uniqueBases(e.target.value); $('#searchResults').innerHTML=items.map(x=>`<button class="search-result" data-base="${x.base}"><strong>${prettyBase(x.base)}</strong><span>${x.name} · ${x.count} şube</span></button>`).join('');
  $$('.search-result').forEach(b=>b.onclick=()=>addBase(b.dataset.base));
});
function addBase(base){if(!state.selectedBase.includes(base)){state.selectedBase.push(base);renderSelected()}$('#courseSearch').value='';$('#searchResults').innerHTML=''}
function renderSelected(){
  $('#selectedCourses').innerHTML=state.selectedBase.length?state.selectedBase.map(b=>{const x=lectureSectionsFor(b)[0];return `<div class="selected-course"><span><strong>${prettyBase(b)}</strong><br>${x?.name||''}</span><button data-remove="${b}">×</button></div>`}).join(''):'<span class="muted">Henüz ders seçilmedi.</span>';
  $$('[data-remove]').forEach(b=>b.onclick=()=>{state.selectedBase=state.selectedBase.filter(x=>x!==b.dataset.remove);renderSelected()});
  localStorage.setItem('boun-ie-selected',JSON.stringify(state.selectedBase));
}
try{state.selectedBase=JSON.parse(localStorage.getItem('boun-ie-selected')||'[]');renderSelected()}catch(_e){}

function slots(course){
  const days=course.days||[], hours=course.hours||[]; const out=[];
  for(let i=0;i<Math.min(days.length,hours.length);i++){const slot=Number(hours[i]);if(slot>=1&&slot<=14)out.push({day:days[i],hour:slot+8,room:(course.rooms||[])[i]||''})}
  return out;
}
function conflicts(plan,course){const used=new Set(plan.flatMap(c=>slots(c).map(s=>s.day+':'+s.hour)));return slots(course).some(s=>used.has(s.day+':'+s.hour))}
function allowed(course){const ss=slots(course),ear=+$('#earliest').value,late=+$('#latest').value,free=$('#freeDay').value;return ss.every(s=>s.hour>=ear&&s.hour<=late&&(!free||s.day!==free))}
function generatePlans(){
  if(!state.selectedBase.length){message('Önce en az bir ders seç.');return}
  const groups=state.selectedBase.map(b=>lectureSectionsFor(b).filter(allowed));
  if(groups.some(g=>!g.length)){message('Filtrelere uyan şubesi olmayan en az bir ders var.');state.plans=[];renderPlan();return}
  const plans=[]; const LIMIT=5000;
  function walk(i,plan){if(plans.length>=LIMIT)return;if(i===groups.length){plans.push([...plan]);return}for(const c of groups[i]){if(!conflicts(plan,c)){plan.push(c);walk(i+1,plan);plan.pop()}}}
  walk(0,[]); state.plans=plans;state.planIndex=0;message(plans.length?`${plans.length}${plans.length===LIMIT?'+':''} çakışmasız program bulundu.`:'Çakışmasız program bulunamadı.');renderPlan();
}
function message(t){$('#plannerMessage').textContent=t}
$('#generateBtn').onclick=generatePlans; $('#earliest').onchange=()=>state.plans.length&&generatePlans(); $('#latest').onchange=()=>state.plans.length&&generatePlans(); $('#freeDay').onchange=()=>state.plans.length&&generatePlans();
$('#prevPlan').onclick=()=>{if(state.plans.length){state.planIndex=(state.planIndex-1+state.plans.length)%state.plans.length;renderPlan()}};
$('#nextPlan').onclick=()=>{if(state.plans.length){state.planIndex=(state.planIndex+1)%state.plans.length;renderPlan()}};
const days=['M','T','W','Th','F'], dayNames=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma'];
function emptyGrid(){
  let h='<div class="schedule-head"></div>'+dayNames.map(x=>`<div class="schedule-head">${x}</div>`).join('');
  for(let hr=9;hr<=22;hr++){h+=`<div class="schedule-time">${String(hr).padStart(2,'0')}:00</div>`;for(const d of days)h+=`<div class="schedule-cell" data-slot="${d}:${hr}"></div>`} return h;
}
function renderPlan(){
  $('#scheduleGrid').innerHTML=emptyGrid(); const plan=state.plans[state.planIndex]; $('#planCounter').textContent=plan?`Program ${state.planIndex+1} / ${state.plans.length}`:'Program yok'; if(!plan)return;
  for(const course of plan) for(const s of slots(course)){if(!days.includes(s.day))continue;const cell=$(`[data-slot="${s.day}:${s.hour}"]`);if(cell)cell.innerHTML=`<div class="class-block"><strong>${course.code}</strong><br>${course.instructor||''}${s.room?`<br>${s.room}`:''}</div>`}
}
renderPlan();
