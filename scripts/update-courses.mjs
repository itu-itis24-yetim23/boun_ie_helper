import { load } from 'cheerio';
import { writeFile, mkdir } from 'node:fs/promises';

const ORIGIN='https://registration.bogazici.edu.tr';
const TERM_PAGE=`${ORIGIN}/buis/General/schedule.aspx?p=semester`;
const clean=s=>(s||'').replace(/\s+/g,' ').trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function text(url,options={}){
  const r=await fetch(url,{...options,headers:{'User-Agent':'BOUN-IE-Helper/0.1 educational open-source tool',...(options.headers||{})}});
  if(!r.ok) throw new Error(`${r.status} ${url}`);
  const buf=await r.arrayBuffer();
  try{return new TextDecoder('windows-1254').decode(buf)}catch{return new TextDecoder('utf-8').decode(buf)}
}
function parseDays(raw){
  const s=clean(raw).replace(/\s/g,''); if(!s)return[]; const m=s.match(/Th|St|Su|M|T|W|F/g)||[];
  if(m.join('')!==s) throw new Error(`Unknown day code: ${raw}`); return m;
}
function parseHours(raw,days){
  const s=clean(raw).replace(/\s/g,''); if(!s&&!days.length)return[];
  if(s.length===days.length&&/^[1-9A-E]+$/i.test(s))return [...s.toUpperCase()].map(c=>/[A-E]/.test(c)?c.charCodeAt(0)-55:Number(c));
  const separated=clean(raw).split(/[^0-9A-E]+/i).filter(Boolean);
  if(separated.length===days.length){
    const parsed=separated.map(t=>/^[A-E]$/i.test(t)?t.toUpperCase().charCodeAt(0)-55:Number(t));
    if(parsed.every(n=>Number.isInteger(n)&&n>=1&&n<=14))return parsed;
  }
  if(/^[0-9]+$/.test(s)){
    const solutions=[];
    function walk(pos,arr){
      if(arr.length===days.length){if(pos===s.length)solutions.push(arr);return}
      for(const width of [1,2]){const t=s.slice(pos,pos+width);if(!t||t[0]==='0')continue;const n=Number(t);if(n>=1&&n<=14)walk(pos+width,[...arr,n])}
    }
    walk(0,[]); if(solutions.length===1)return solutions[0];
  }
  throw new Error(`Cannot parse hours '${raw}' for ${days.length} meetings`);
}
function parseDepartment(html,semester){
  const $=load(html); const table=$('tr.schtitle').first().closest('table');
  const headers=table.find('tr.schtitle').first().children('td,th').map((_,e)=>clean($(e).text())).get();
  const idx=n=>headers.indexOf(n); const required=['Code.Sec','Name','Cr.','Ects','Instr.','Days','Hours','Rooms'];
  if(required.some(h=>idx(h)<0))throw new Error('BUIS table headers changed');
  const out=[]; let parent=''; let auxCount={};
  table.find('tr.schtd,tr.schtd2').each((_,tr)=>{
    const cells=$(tr).children('td'); const val=n=>clean(cells.eq(idx(n)).text()); const listed=val('Code.Sec').replace(/\s/g,'');
    const aux=$(tr).hasClass('labps'); if(listed)parent=listed; if(!parent)return;
    const type=aux?(/LAB/i.test(val('Name'))?'lab':'ps'):'lecture'; const displayCode=parent.replace(/^([A-Z$]+)(\d)/,'$1 $2');
    let days=[],hours=[],rooms=[]; try{days=parseDays(val('Days'));hours=parseHours(val('Hours'),days);rooms=val('Rooms')?val('Rooms').split('|').map(clean):days.map(()=>"")}catch{days=[];hours=[];rooms=[]}
    const base=parent.replace(/\s/g,''); const suffix=type==='lecture'?'':type==='lab'?' LAB':' P.S.'; const group=base+suffix; auxCount[group]=(auxCount[group]||0)+1;
    const key=type==='lecture'?base:`${group} ${auxCount[group]}`;
    out.push([key,{code:displayCode,name:val('Name'),credits:type==='lecture'?(Number(val('Cr.').replace(',','.'))||0):null,ects:type==='lecture'?(Number(val('Ects').replace(',','.'))||0):null,instructor:val('Instr.'),sessionType:type,days,hours,rooms,semester}]);
  });
  return out;
}

async function main(){
  const termHtml=await text(TERM_PAGE); const $=load(termHtml); const semester=$('select[id$="ddlSemester"] option').map((_,e)=>$(e).attr('value')).get().find(Boolean);
  if(!semester)throw new Error('No semester found on BUIS');
  const depHtml=await text(`${ORIGIN}/scripts/schdepsel.asp`,{method:'POST',body:new URLSearchParams({semester})});
  const d=load(depHtml); const links=[];
  d('a[href*="/scripts/sch.asp"]').each((_,a)=>{const href=d(a).attr('href');const url=new URL(href,ORIGIN);if(url.searchParams.get('donem')===semester)links.push(url.href)});
  if(!links.length)throw new Error('No department schedule links found');
  const data={}; let rows=0;
  for(const url of [...new Set(links)]){
    const entries=parseDepartment(await text(url),semester); rows+=entries.length;
    for(const [k,v] of entries){let key=k,n=2;while(data[key])key=`${k} #${n++}`;data[key]=v}
    await sleep(120);
  }
  await mkdir(new URL('../data/',import.meta.url),{recursive:true});
  await writeFile(new URL('../data/courses.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
  await writeFile(new URL('../data/metadata.json',import.meta.url),JSON.stringify({semester,fetchedAt:new Date().toISOString(),source:TERM_PAGE,records:Object.keys(data).length,rawRows:rows},null,2)+'\n');
  console.log(`Updated ${semester}: ${Object.keys(data).length} records`);
}
main().catch(e=>{console.error(e);process.exit(1)});
