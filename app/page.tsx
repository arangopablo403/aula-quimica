import PortalLoader from './portal-loader';
import {managedUser,studentRecord,isTeacherEmail} from '@/lib/student-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){const user=await managedUser();if(!user)redirect('/acceso');const student=isTeacherEmail(user.email)?null:await studentRecord(user);return <>{student?.status!=='approved'&&!isTeacherEmail(user.email)&&<aside className="notice">Bienvenido al aula. Tus cursos requieren autorización docente. <a href="/acceso">Consultar o solicitar acceso a cursos</a></aside>}<PortalLoader/></>;}
