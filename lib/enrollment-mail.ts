import 'server-only';
import {env} from 'cloudflare:workers';
import {authEnv,type Student} from './student-auth';
type MailEnv={RESEND_API_KEY?:string;ENROLLMENT_MAIL_FROM?:string;ENROLLMENT_ALERT_EMAIL?:string};
export function enrollmentMailConfigured(){const e=env as unknown as MailEnv;return !!(e.RESEND_API_KEY&&e.ENROLLMENT_MAIL_FROM&&(e.ENROLLMENT_ALERT_EMAIL||authEnv().ADMIN_EMAIL));}
async function table(){await authEnv().DB.prepare('CREATE TABLE IF NOT EXISTS enrollment_alerts (student TEXT PRIMARY KEY, sent TEXT, error TEXT)').run();}
export async function alertStates(){await table();return (await authEnv().DB.prepare('SELECT student,sent,error FROM enrollment_alerts').all<{student:string;sent:string|null;error:string|null}>()).results;}
export async function sendEnrollmentAlert(student:Student,courses:{id:string;title:string}[]){
 await table();const db=authEnv().DB;
 await db.prepare('INSERT OR IGNORE INTO enrollment_alerts(student) VALUES(?)').bind(student.id).run();
 if(await db.prepare('SELECT student FROM enrollment_alerts WHERE student=? AND sent IS NOT NULL').bind(student.id).first())return true;
 const e=env as unknown as MailEnv;
 let error='Configura el servicio de correo en Cloudflare.';
 if(enrollmentMailConfigured())try{
  const requested=JSON.parse(student.requested) as string[];
  const origin=new URL(authEnv().SITE_ORIGIN!).origin;
  const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`enrollment-${student.id}`},body:JSON.stringify({from:e.ENROLLMENT_MAIL_FROM,to:[e.ENROLLMENT_ALERT_EMAIL||authEnv().ADMIN_EMAIL],subject:'AulaQuímica: nueva solicitud de matrícula',text:`Estudiante: ${student.name}\nCorreo: ${student.email}\nInstitución: ${student.institution}\nCursos solicitados:\n${courses.filter(c=>requested.includes(c.id)).map(c=>'- '+c.title).join('\n')}\n\nRevisa y autoriza únicamente los cursos correspondientes:\n${origin}/admin/estudiantes\n\nEsta solicitud no concede acceso. Debes iniciar sesión como docente y guardar los permisos.`})});
  if(response.ok){await db.prepare('UPDATE enrollment_alerts SET sent=?,error=NULL WHERE student=?').bind(new Date().toISOString(),student.id).run();return true;}
  error=`El proveedor rechazó el envío (HTTP ${response.status}). Revisa el remitente y la clave.`;
 }catch{error='No se pudo confirmar el envío. Puedes reintentarlo desde el panel.';}
 await db.prepare('UPDATE enrollment_alerts SET error=? WHERE student=?').bind(error,student.id).run();return false;
}
