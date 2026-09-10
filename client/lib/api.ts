const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
export async function api(path:string,opts:RequestInit={}){
  let response:Response;
  try {
    response=await fetch(API+path,{...opts,credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json',...(opts.headers||{})}});
  } catch {
    throw new Error('API_UNAVAILABLE: Start the server and check NEXT_PUBLIC_API_URL.');
  }
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||`HTTP_${response.status}`);
  return data;
}
export {API};
