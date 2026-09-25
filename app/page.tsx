import Portal from './portal';
import {allItems,authorized} from '@/lib/server';
import {managedUser,studentRecord} from '@/lib/student-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){if(!await authorized()){const user=await managedUser();const record=user&&await studentRecord(user);if(!record||record.status!=='approved')redirect('/acceso');}try{return <Portal initial={await allItems()}/> }catch{return <Portal initial={[]} error="La biblioteca no está disponible temporalmente. Recarga para intentar de nuevo."/>}}
