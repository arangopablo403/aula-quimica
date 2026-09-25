import {authorized} from '@/lib/server';
import {redirect} from 'next/navigation';
import Students from './students';
export const dynamic='force-dynamic';
export default async function Page(){if(!await authorized())redirect('/admin');return <Students/>;}
