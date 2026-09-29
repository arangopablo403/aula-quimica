import Portal from './portal';
import {allItems,authorized} from '@/lib/server';
import {managedUser,studentRecord} from '@/lib/student-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){const user=await managedUser();if(!user)redirect('/acceso');const teacher=await authorized();const student=teacher?null:await studentRecord(user);try{return <>{!teacher&&student?.status!=='approved'&&<aside className="notice">Bienvenido al aula. Tus cursos requieren autorización docente. <a href="/acceso">Consultar o solicitar acceso a cursos</a></aside>}<Portal initial={await allItems()}/></> }catch{return <Portal initial={[]} error="La biblioteca no está disponible temporalmente. Recarga para intentar de nuevo."/>}}
