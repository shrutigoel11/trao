import { z } from 'zod';
export const createKitSchema=z.object({jd:z.string().min(20),company_url:z.string().url(),days:z.number().int().min(1).max(60)});
export function validateKit(k){
 const required=['source','company_brief','role','questions','flashcards','schedule','coverage'];
 if(!k || required.some(x=>!(x in k))) throw new Error('KIT_STRUCTURE_INVALID');
 if(!Array.isArray(k.role.requirements)||!Array.isArray(k.questions)||!Array.isArray(k.flashcards)) throw new Error('KIT_STRUCTURE_INVALID');
 const qids=new Set(k.questions.map(q=>q.id));
 if(k.questions.some(q=>!q.id || !Array.isArray(q.requirement_ids) || !q.requirement_ids.every(Boolean))) throw new Error('KIT_STRUCTURE_INVALID');
 if(k.schedule.days.length!==k.schedule.days_available) throw new Error('SCHEDULE_DAY_COUNT_INVALID');
 if(k.schedule.days.some(d=>!Number.isInteger(d.minutes)||d.minutes<1||d.question_ids.some(id=>!qids.has(id)))) throw new Error('SCHEDULE_INVALID');
 return true;
}
