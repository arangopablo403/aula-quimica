import {redirect} from 'next/navigation';
import {authorized} from '@/lib/server';
import AdminLoader from './loader';
export const dynamic='force-dynamic';
export default async function Page(){if(!await authorized())redirect('/acceso?docente=1');return <AdminLoader/>;}
