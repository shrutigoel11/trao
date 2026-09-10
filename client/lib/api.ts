const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
export async function api(path:string,opts:RequestInit={}){const r=await fetch(API+path,{...opts,credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})}});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`HTTP ${r.status}`);return data;}
export {API};
