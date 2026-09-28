import {cookies} from 'next/headers';
import {z} from 'zod';
import {authClient,authConfigured,authEnv,clearSession,throttle} from '@/lib/student-auth';
import {socialClient} from '@/lib/social-auth';
import {sameOrigin} from '@/lib/server';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const redirect=(path:string)=>new Response(null,{status:303,headers:{Location:path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
const accessCookie='aula_recovery_access',refreshCookie='aula_recovery_refresh';

export async function GET(req:Request) {
 try {
  const url=new URL(req.url),code=url.searchParams.get('code');
  if(!code||code.length>2048||url.searchParams.has('error'))throw Error('INVALID_LINK');
  const client=await socialClient(url.protocol==='https:');
  const result=await client.auth.exchangeCodeForSession(code);
  if(result.error||!result.data.session)throw Error('INVALID_LINK');
  const session=result.data.session,verified=await client.auth.getUser(session.access_token);
  if(verified.error||!verified.data.user?.email_confirmed_at)throw Error('INVALID_LINK');
  const jar=await cookies(),options={httpOnly:true,secure:url.protocol==='https:',sameSite:'strict' as const,path:'/api/password',maxAge:600};
  jar.set(accessCookie,session.access_token,options);jar.set(refreshCookie,session.refresh_token,options);
  return redirect('/recuperar?ready=1');
 }catch{return redirect('/recuperar?error=expired');}
}

export async function POST(req:Request) {
 try {
  if(!sameOrigin(req))return json({error:'Solicitud no permitida.'},403);
  if(!authConfigured())return json({error:'El servicio de recuperación aún no está disponible.'},503);
  const raw=await req.text();if(raw.length>3000)return json({error:'Solicitud demasiado extensa.'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Solicitud inválida.'},400);}
  if(body.action==='request') {
   const email=z.string().trim().email().max(254).transform(v=>v.toLowerCase()).safeParse(body.email);
   if(!email.success)return json({error:'Escribe un correo válido.'},400);
   const message='Si el correo tiene una cuenta, recibirás un enlace de recuperación. Revisa también el correo no deseado. Abre el enlace en este navegador.';
   const ip=req.headers.get('cf-connecting-ip')||'unknown';
   if(!await throttle('recovery-ip:'+ip,10)||!await throttle('recovery:'+email.data,3))return json({message});
   const client=await socialClient(new URL(req.url).protocol==='https:');
   const result=await client.auth.resetPasswordForEmail(email.data,{redirectTo:new URL('/api/password',authEnv().SITE_ORIGIN!).href});
   if(result.error)return json({error:'No pudimos enviar el enlace. Espera unos minutos y vuelve a intentarlo.'},503);
   return json({message});
  }
  if(body.action==='update') {
   const password=z.string().min(12).max(128).safeParse(body.password);
   if(!password.success||body.password!==body.confirm)return json({error:'Usa al menos 12 caracteres y confirma la misma contraseña.'},400);
   const jar=await cookies(),access_token=jar.get(accessCookie)?.value,refresh_token=jar.get(refreshCookie)?.value;
   if(!access_token||!refresh_token)return json({error:'El enlace venció. Solicita otro enlace de recuperación.'},401);
   const client=authClient(),verified=await client.auth.getUser(access_token);
   if(verified.error||!verified.data.user)return json({error:'El enlace ya no es válido. Solicita uno nuevo.'},401);
   const session=await client.auth.setSession({access_token,refresh_token});
   if(session.error)return json({error:'El enlace ya no es válido. Solicita uno nuevo.'},401);
   const result=await client.auth.updateUser({password:password.data});
   if(result.error)return json({error:'No se pudo guardar. Usa una contraseña diferente y de al menos 12 caracteres.'},400);
   await authEnv().DB.prepare('DELETE FROM login_sessions WHERE user=?').bind(verified.data.user.id).run();
   await client.auth.signOut({scope:'global'});
   jar.set(accessCookie,'',{path:'/api/password',maxAge:0});jar.set(refreshCookie,'',{path:'/api/password',maxAge:0});
   await clearSession();return json({message:'Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.'});
  }
  return json({error:'Acción no disponible.'},400);
 }catch{return json({error:'No se pudo completar la recuperación. Vuelve a intentarlo.'},503);}
}
