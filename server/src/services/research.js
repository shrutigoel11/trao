import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { URL } from 'node:url';

const UA='TraoInterviewPrepKit/1.0 (+https://trao.ai)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function safeUrl(input){
 const u=new URL(input); if(!['http:','https:'].includes(u.protocol)) throw new Error('INVALID_URL');
 const host=u.hostname.toLowerCase(); if(host==='localhost'||host==='127.0.0.1'||host==='0.0.0.0'||host==='::1') return u;
 if(/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) throw new Error('PRIVATE_URL_BLOCKED');
 return u;
}
async function fetchPage(url){
 const u=safeUrl(url); const res=await axios.get(u.href,{timeout:12000,maxContentLength:2_000_000,headers:{'User-Agent':UA,'Accept':'text/html,application/xhtml+xml'}});
 if(!String(res.headers['content-type']||'').includes('text/html')) throw new Error('UNSUPPORTED_CONTENT_TYPE');
 const $=cheerio.load(res.data); $('script,style,noscript,svg').remove(); const text=$('body').text().replace(/\s+/g,' ').trim();
 const links=[]; $('a[href]').each((_,el)=>{try{const href=new URL($(el).attr('href'),u.href); if(href.origin===u.origin) links.push({url:href.href,text:$(el).text().trim()});}catch{}});
 return {url:u.href,title:$('title').text().trim(),text:text.slice(0,30000),links:links.slice(0,150)};
}
export async function crawlCompany(companyUrl){
 const root=safeUrl(companyUrl); let robots=null;
 try { const rr=await axios.get(new URL('/robots.txt',root).href,{timeout:5000,headers:{'User-Agent':UA}}); robots=robotsParser(rr.config.url||new URL('/robots.txt',root).href,rr.data); } catch {}
 const home=await fetchPage(root.href); const candidates=[...home.links].filter(x=>robots?.isAllowed(x.url,UA)!==false).map(x=>({score:scoreLink(x.url,x.text),...x})).sort((a,b)=>b.score-a.score).slice(0,6);
 const pages=[home];
 for(const c of candidates){ if(pages.some(p=>p.url===c.url)) continue; try{await sleep(250); pages.push(await fetchPage(c.url));}catch{} }
 const hiring=pages.filter(p=>/career|hiring|jobs|interview|engineering|handbook|work with us/i.test(p.url+' '+p.title+' '+p.text));
 return {pages,hiring};
}
function scoreLink(url,text){const s=(url+' '+text).toLowerCase(); let n=0; for(const k of ['career','hiring','jobs','interview','engineering','handbook','about']) if(s.includes(k)) n+=3; return n;}
export async function publicInterviewSearch(company){
 try{
  const q=encodeURIComponent(`"${company}" interview process software engineer`);
  const r=await axios.get(`https://html.duckduckgo.com/html/?q=${q}`,{timeout:10000,headers:{'User-Agent':UA}});
  const $=cheerio.load(r.data); const results=[]; $('.result').each((_,el)=>{const a=$(el).find('.result__a'); const sn=$(el).find('.result__snippet').text().trim(); if(a.length) results.push({title:a.text().trim(),url:a.attr('href'),snippet:sn});}); return results.slice(0,8);
 }catch{return []}
}
