import type { List } from './types';

export class ApiError extends Error { status:number; constructor(message:string,status:number){super(message);this.status=status} }
export async function api<T>(path:string, init:RequestInit = {}):Promise<T>{
  const headers = new Headers(init.headers);
  if(init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
  const response = await fetch(`/api${path}`,{...init,headers,credentials:'same-origin'});
  const body = response.status===204 ? null : await response.json().catch(()=>null);
  if(!response.ok) throw new ApiError(body?.error || `Request failed (${response.status})`,response.status);
  return body as T;
}
export const get = <T,>(path:string)=>api<T>(path);
export const post = <T,>(path:string,data:unknown)=>api<T>(path,{method:'POST',body:JSON.stringify(data)});
export const put = <T,>(path:string,data:unknown)=>api<T>(path,{method:'PUT',body:JSON.stringify(data)});
export const patch = <T,>(path:string,data:unknown)=>api<T>(path,{method:'PATCH',body:JSON.stringify(data)});
export const del = <T,>(path:string)=>api<T>(path,{method:'DELETE'});
export const list = async <T,>(path:string):Promise<List<T>>=>get<List<T>>(path);
export const upload = async (file:File,kind:'resume'|'aadhaar'|'certificate')=>{const form=new FormData();form.append('file',file);form.append('kind',kind);return api<{url:string;name:string}>('/uploads',{method:'POST',body:form})};
export function toIsoDateTime(value:string,label:string){if(!value.trim())throw new Error(`${label} is required.`);const timestamp=Date.parse(value);if(!Number.isFinite(timestamp))throw new Error(`Enter a valid ${label.toLowerCase()}.`);return new Date(timestamp).toISOString()}
export const qs=(params:Record<string,string|number|boolean|undefined>)=>{const q=new URLSearchParams();Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!=='')q.set(k,String(v))});const s=q.toString();return s?`?${s}`:''};
