'use client';
import {lazy,Suspense,useEffect,useState} from 'react';
const Portal=lazy(()=>import('./portal'));
import type {Item} from '@/lib/content';
export default function PortalLoader(){
 const [items,setItems]=useState<Item[]|null>(null),[error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();fetch('/api/content',{cache:'no-store',signal:controller.signal}).then(async response=>{
  if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw Error('No se pudo cargar la biblioteca. Vuelve a intentar en unos momentos.');
  const data=await response.json() as {items?:Item[]};if(!Array.isArray(data.items))throw Error('No se pudo cargar la biblioteca.');setItems(data.items);
 }).catch(e=>{if(!controller.signal.aborted)setError(e.message)});return()=>controller.abort()},[]);
 if(items)return <Suspense fallback={<main className="wrap"><h1>Cargando tu aula…</h1></main>}><Portal initial={items}/></Suspense>;
 return <main className="wrap"><h1>{error?'Biblioteca temporalmente no disponible':'Cargando tu aula…'}</h1>{error&&<><p role="alert">{error}</p><button className="button" onClick={()=>location.reload()}>Volver a intentar</button></>}</main>;
}
