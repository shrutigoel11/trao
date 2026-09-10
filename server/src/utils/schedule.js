export function allocateSchedule(questions, requirements, days){
 const priority={must:0,nice:1};
 const reqMap=new Map(requirements.map(r=>[r.id,r]));
 const sorted=[...questions].sort((a,b)=>{
   const pa=Math.min(...a.requirement_ids.map(id=>priority[reqMap.get(id)?.priority]??1));
   const pb=Math.min(...b.requirement_ids.map(id=>priority[reqMap.get(id)?.priority]??1));
   return pa-pb || (b.difficulty-a.difficulty);
 });
 const buckets=Array.from({length:days},(_,i)=>({day:i+1,focus:'',question_ids:[],minutes:0}));
 sorted.forEach((q,i)=>{ const idx=Math.min(i,days-1); buckets[idx].question_ids.push(q.id); buckets[idx].minutes+=Math.max(10,q.difficulty*15); });
 buckets.forEach((b,i)=>{ const qs=b.question_ids.map(id=>questions.find(q=>q.id===id)); b.focus=qs.length?`Day ${i+1}: ${[...new Set(qs.map(q=>q.category))].join(', ')}`:'Review & practice'; if(!b.minutes)b.minutes=30; });
 return {days_available:days,days:buckets};
}
