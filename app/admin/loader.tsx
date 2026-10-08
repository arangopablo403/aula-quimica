'use client';
import {lazy,Suspense,useEffect,useState} from 'react';
import type {Item} from '@/lib/content';
const Admin=lazy(()=>import('./panel'));
export default function AdminLoader(){
 const [items,setItems]=useState<Item[]|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();fetch('/api/content?admin=1',{cache:'no-store',signal:controller.signal}).then(async r=>{
 if(r.status===403)throw Error('Tu sesión docente terminó. Vuelve a iniciar sesión.');
 if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw Error('No se pudo cargar el panel. Intenta de nuevo.');
 const data=await r.json() as {items?:Item[]};if(!Array.isArray(data.items))throw Error('Respuesta de biblioteca inválida.');setItems(data.items);
 }).catch(e=>{if(!controller.signal.aborted)setError(e.message)});return()=>controller.abort()},[attempt]);
 const loading=<main className="wrap"><h1>Cargando el espacio docente…</h1><p>Preparando tus contenidos.</p></main>;
 if(items)return <Suspense fallback={loading}><Admin initial={items}/></Suspense>;
 if(error)return <main className="wrap"><h1>No se pudo cargar el panel</h1><p role="alert">{error}</p><button className="button" onClick={()=>{setError('');setAttempt(n=>n+1)}}>Volver a intentar</button> <a href="/acceso?docente=1">Iniciar sesión</a></main>;
 return loading;
}
