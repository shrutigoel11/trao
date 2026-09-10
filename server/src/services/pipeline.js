import { crawlCompany, publicInterviewSearch } from './research.js';
import { generateJson } from './llm.js';
import { allocateSchedule } from '../utils/schedule.js';
import { validateKit } from '../utils/validation.js';

const clean=s=>String(s||'').slice(0,24000);
export async function buildKit({jd,company_url,days}){
 const url=new URL(company_url); const company=url.hostname.replace(/^www\./,'').split('.')[0];
 const research=await crawlCompany(company_url);
 const discussion=await publicInterviewSearch(company);
 const pagesUsed=research.pages.map(p=>p.url);
 const siteText=clean(research.pages.map(p=>`URL: ${p.url}\nTITLE: ${p.title}\nTEXT: ${p.text}`).join('\n\n'));
 const hiringText=clean(research.hiring.map(p=>`URL: ${p.url}\n${p.text}`).join('\n\n'));

 const role=await generateJson(`Extract ONLY requirements explicitly supported by this job description. Do not invent. Mark priority must when the JD uses required/must/need/essential language; otherwise nice when bonus/preferred/nice-to-have language. Return JSON {title,seniority,responsibilities:string[],requirements:[{id,text,kind,priority}]}. kind must be technical, behavioural, or domain. Stable ids r1,r2... JD:\n${clean(jd)}`);
 const brief=await generateJson(`Create an honest company brief using only the supplied site evidence. If evidence is missing, say so. Return JSON {summary,what_they_do,sources:string[]}. COMPANY ${company}. SITE EVIDENCE:\n${siteText}`);
 const categories=['technical','behavioural','system-design','company-fit']; const questions=[];
 for(const category of categories){
  const reqs=role.requirements.filter(r=>category==='technical'?r.kind==='technical':category==='behavioural'?r.kind==='behavioural':category==='system-design'?r.kind==='technical':true);
  const context=category==='company-fit'?`${brief.summary}\n${brief.what_they_do}\nHiring pages:\n${hiringText}\nPublic discussion:\n${discussion.map(x=>x.title+' '+x.snippet).join('\n')}`:reqs.map(r=>`${r.id}: ${r.text}`).join('\n');
  const out=await generateJson(`Generate interview questions for category ${category}. Every question MUST reference one or more supplied requirement ids, except company-fit may reference a relevant requirement id when possible. Do not invent requirements. Return JSON {questions:[{requirement_ids:string[],prompt,answer_outline,difficulty}]} difficulty 1-3. Create 1-2 questions per relevant must-have and useful nice-to-have. CONTEXT:\n${context}`);
  for(const q of (out.questions||[])) questions.push({id:`q${questions.length+1}`,requirement_ids:q.requirement_ids,category,prompt:q.prompt,answer_outline:q.answer_outline,difficulty:q.difficulty});
 }
 let uncovered=role.requirements.filter(r=>!questions.some(q=>q.requirement_ids.includes(r.id))).map(r=>r.id);
 for(let pass=2; pass<=3 && uncovered.length; pass++){
   const missing=role.requirements.filter(r=>uncovered.includes(r.id));
   const out=await generateJson(`Generate exactly one strong interview question for each uncovered requirement. Return JSON {questions:[{requirement_ids:string[],category,prompt,answer_outline,difficulty}]}. Use only these requirement ids: ${missing.map(r=>r.id+': '+r.text).join('\n')}`);
   for(const q of (out.questions||[])) questions.push({id:`q${questions.length+1}`,requirement_ids:q.requirement_ids,category:q.category||'technical',prompt:q.prompt,answer_outline:q.answer_outline,difficulty:q.difficulty});
   uncovered=role.requirements.filter(r=>!questions.some(q=>q.requirement_ids.includes(r.id))).map(r=>r.id);
 }
 const flash=await generateJson(`Create concise interview flashcards from these questions and requirements. Return JSON {flashcards:[{front,back,requirement_ids:string[]}]}. Use only supplied ids. QUESTIONS:\n${questions.map(q=>q.id+': '+q.prompt).join('\n')}\nREQS:\n${role.requirements.map(r=>r.id+': '+r.text).join('\n')}`);
 const flashcards=(flash.flashcards||[]).map((f,i)=>({id:`f${i+1}`,front:f.front,back:f.back,requirement_ids:f.requirement_ids}));
 const schedule=allocateSchedule(questions,role.requirements,days);
 const kit={source:{company,company_url,role:role.title||'',location:'',jd_chars:jd.length,jd,researched_at:new Date().toISOString(),pages_used:pagesUsed},company_brief:{summary:brief.summary||'',what_they_do:brief.what_they_do||'',sources:(brief.sources||[]).slice(0,10)},role,questions,flashcards,schedule,coverage:{uncovered_requirement_ids:uncovered,passes:Math.min(3,uncovered.length?3:2)}};
 validateKit(kit); return kit;
}
