import {authorized,bindings} from '@/lib/server';
export async function GET(){if(!await authorized())return new Response('No autorizado',{status:403});try{return Response.json({messages:(await bindings().DB.prepare('SELECT * FROM messages ORDER BY created DESC LIMIT 100').all()).results})}catch{return Response.json({error:'No se pudieron cargar los mensajes.'},{status:503})}}
