import 'server-only';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';
import {authConfigured,authEnv,digest} from './student-auth';
export const socialProviders=['google','azure','facebook'] as const;
export function enabledProviders(){return authConfigured()?(authEnv().OAUTH_PROVIDERS||'').split(',').map(s=>s.trim()).filter(s=>socialProviders.includes(s as typeof socialProviders[number])):[];}
export async function socialClient(secure:boolean){const e=authEnv();if(!authConfigured())throw new Error('AUTH_UNAVAILABLE');const jar=await cookies();
 const cookieName=async(key:string)=>'aula_pkce_'+(await digest(key)).slice(0,32);
 return createClient(e.SUPABASE_URL!,e.SUPABASE_PUBLISHABLE_KEY!,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,storage:{
  getItem:async(key)=>key.endsWith('-code-verifier')?jar.get(await cookieName(key))?.value||null:null,
  setItem:async(key,value)=>{if(key.endsWith('-code-verifier'))jar.set(await cookieName(key),value,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:600});},
  removeItem:async(key)=>{if(key.endsWith('-code-verifier'))jar.delete(await cookieName(key));},
 }}});
}
