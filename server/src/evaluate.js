import 'dotenv/config';
import fs from 'node:fs/promises';
import { buildKit } from './services/pipeline.js';
const args=process.argv.slice(2); const input=args[args.indexOf('--input')+1]; const output=args[args.indexOf('--output')+1];
if(!input||!output){console.error('Usage: npm run evaluate -- --input cases.json --output kits.json');process.exit(2);}
const cases=JSON.parse(await fs.readFile(input,'utf8')); const kits=[];
for(const c of cases){try{const kit=await buildKit({jd:c.jd,company_url:c.company_url,days:c.days}); kits.push({id:c.id,status:'ok',kit,error:null});}catch(e){kits.push({id:c.id,status:'failed',kit:null,error:{code:e.code||e.message||'PIPELINE_FAILED',message:e.message||String(e)}});}}
await fs.writeFile(output,JSON.stringify({version:'1.0',generated_at:new Date().toISOString(),kits},null,2));
