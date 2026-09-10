import axios from 'axios';
const model=()=>process.env.GEMINI_MODEL||'gemini-2.5-flash';
function extractJson(text){ const cleaned=text.replace(/^```json\s*/,'').replace(/```$/,'').trim(); const a=cleaned.indexOf('{'); const b=cleaned.lastIndexOf('}'); if(a<0||b<0) throw new Error('LLM_INVALID_JSON'); return JSON.parse(cleaned.slice(a,b+1)); }
export async function generateJson(prompt){
 if(!process.env.GEMINI_API_KEY) throw new Error('LLM_API_KEY_MISSING');
 const url=`https://generativelanguage.googleapis.com/v1beta/models/${model()}:generateContent?key=${process.env.GEMINI_API_KEY}`;
 for(let attempt=0;attempt<3;attempt++){
  try{ const r=await axios.post(url,{contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.2,responseMimeType:'application/json'}},{timeout:90000}); return extractJson(r.data.candidates?.[0]?.content?.parts?.map(p=>p.text).join('')||''); }
  catch(e){ if(attempt===2) throw e; await new Promise(r=>setTimeout(r,1000*2**attempt)); }
 }
}
