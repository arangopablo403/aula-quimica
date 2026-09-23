import Portal from './portal';
import {allItems} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function Page(){try{return <Portal initial={await allItems()}/> }catch(e){console.error(e);return <Portal initial={[]} error="La biblioteca no está disponible temporalmente. Recarga para intentar de nuevo."/>}}
