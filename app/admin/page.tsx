import {redirect} from 'next/navigation';
import {authorized,allItems} from '@/lib/server';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function Page(){if(!await authorized())redirect('/acceso?docente=1');if(!await authorized())return <main className="wrap narrow"><h1>Acceso restringido</h1><p>Inicia sesión con el correo autorizado para administrar este sitio.</p><a className="button" href="/signout-with-chatgpt?return_to=/admin">Cambiar de cuenta</a><a href="/">Volver al inicio</a></main>;try{return <Admin initial={await allItems(true)}/> }catch{return <main className="wrap"><h1>No se pudo abrir el panel</h1><p>Intenta recargar. Tus contenidos guardados se conservan.</p></main>}}
