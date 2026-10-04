import {sendEnrollmentAlert} from '@/lib/enrollment-mail';
import {enabledProviders} from '@/lib/social-auth';
import {z} from 'zod';
import {authClient,authConfigured,authEnv,clearSession,establishSession,isTeacherEmail,managedUser,studentRecord,throttle} from '@/lib/student-auth';
import {authorized,courseOptions,sameOrigin} from '@/lib/server';
const credentials=z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(1).max(128)});
const application=z.object({name:z.string().trim().min(3).max(150),institution:z.string().trim().min(2).max(150),courses:z.array(z.string().max(120)).min(1).max(1),consent:z.literal(true)});
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{const teacher=await authorized();const user=await managedUser();return json({configured:authConfigured(),providers:enabledProviders(),teacher,user:user?{email:user.email}:null,student:user?await studentRecord(user):null,courses:await courseOptions()});}catch{return json({error:'No se pudo consultar el acceso. Intenta de nuevo.'},503);}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return json({error:'Solicitud no permitida.'},403);
 const raw=await req.text();if(raw.length>12000)return json({error:'Solicitud demasiado extensa.'},413);let body;try{body=JSON.parse(raw);}catch{return json({error:'Solicitud inválida.'},400);}
 const action=body.action;
 if(action==='logout'){await clearSession();return json({ok:true});}
 if(!authConfigured())return json({error:'El registro está en preparación. El docente debe terminar la configuración antes de recibir estudiantes.'},503);
 if(action==='login'||action==='register'){
  const parsed=credentials.safeParse(body);if(!parsed.success||(action==='register'&&parsed.data.password.length<12))return json({error:'Revisa el correo y la contraseña. Las cuentas nuevas requieren al menos 12 caracteres.'},400);
  const {email,password}=parsed.data;if(!await throttle(action+':'+email,action==='login'?12:3))return json({error:'Demasiados intentos. Espera 15 minutos antes de volver a intentar.'},429);
  const client=authClient();
  if(action==='register'){const result=await client.auth.signUp({email,password,options:{emailRedirectTo:authEnv().SITE_ORIGIN+'/acceso'}});if(result.error)return json({error:'No se pudo completar el registro. Revisa el correo o inténtalo más tarde.'},400);return json({message:'Revisa tu correo para confirmar la cuenta. Después inicia sesión y completa la solicitud de matrícula.'});}
  const result=await client.auth.signInWithPassword({email,password});if(result.error||!result.data.session||!result.data.user?.email_confirmed_at)return json({error:'No se pudo iniciar sesión. Revisa tus datos y confirma tu correo.'},401);
  if(body.role==='teacher'&&!isTeacherEmail(result.data.user.email))return json({error:'Esta cuenta no tiene autorización docente. Selecciona Estudiante o solicita autorización al administrador.'},403);
  await establishSession(result.data.session,new URL(req.url).protocol==='https:');return json({redirect:body.role==='student'?'/':isTeacherEmail(result.data.user.email)?'/admin':'/'});
 }
 const user=await managedUser();if(!user)return json({error:'Tu sesión terminó. Inicia sesión de nuevo.'},401);
 if(action==='apply'){
  const parsed=application.safeParse(body);if(!parsed.success)return json({error:'Completa nombre, institución, cursos y autorización de uso de datos.'},400);
  const courses=await courseOptions();const selected=[...new Set(parsed.data.courses)];if(selected.some(id=>!courses.some(c=>c.id===id)))return json({error:'Selecciona cursos disponibles.'},400);
  if(await studentRecord(user))return json({error:'Ya tienes una solicitud. El docente puede actualizar tus cursos desde su panel.'},409);
  const now=new Date().toISOString();await authEnv().DB.prepare('INSERT INTO students(id,email,name,institution,requested,approved,status,created,updated) VALUES(?,?,?,?,?,?,?,?,?)').bind(user.id,user.email!,parsed.data.name,parsed.data.institution,JSON.stringify(selected),'[]','pending',now,now).run();const student=await studentRecord(user);if(student)try{await sendEnrollmentAlert(student,courses);}catch{console.error('Enrollment alert could not be recorded');}return json({message:'Solicitud guardada. Solo tendrás acceso al curso que el docente autorice.'});
 }
 return json({error:'Acción no disponible.'},400);
 }catch{return json({error:'No se pudo completar la solicitud. Tus datos guardados se conservan.'},503);}}
