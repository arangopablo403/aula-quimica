'use client';
import {useEffect,useState} from 'react';

export default function RecoveryForm() {
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 const [message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{const q=new URLSearchParams(location.search);setReady(q.get('ready')==='1');if(q.has('error'))setError('El enlace venció o no es válido. Solicita uno nuevo y ábrelo en este mismo navegador.');history.replaceState(null,'',location.pathname);},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault();setBusy(true);setError('');setMessage('');
  const form=e.currentTarget,fd=new FormData(form);
  try {
   if(ready&&fd.get('password')!==fd.get('confirm'))throw Error('Las contraseñas no coinciden.');
   const response=await fetch('/api/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(fd),action:ready?'update':'request'})});
   const data=await response.json() as {error?:string;message?:string};if(!response.ok)throw Error(data.error||'No se pudo completar la solicitud.');
   setMessage(data.message||'Solicitud completada.');form.reset();if(ready)setDone(true);
  } catch(error){setError(error instanceof Error?error.message:'No se pudo completar la solicitud.');}finally{setBusy(false);}
 }
 return <main className="access-layout"><section className="access-intro"><a className="access-brand" href="/acceso">AulaQuímica</a><h1>Recupera tu acceso.</h1><p>Restablece tu contraseña mediante un enlace enviado a tu correo.</p></section><section className="access-panel"><h2>{ready?'Nueva contraseña':'Olvidé mi contraseña'}</h2>{!done&&<><p>{ready?'Escribe una contraseña nueva de al menos 12 caracteres.':'Escribe el correo de tu cuenta. Abre el enlace en este mismo navegador y dispositivo. Revisa también la carpeta de correo no deseado.'}</p><form onSubmit={submit}>{ready?<><label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><label>Confirma la contraseña<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label></>:<label>Correo electrónico<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>}<button className="button" disabled={busy}>{busy?'Procesando…':ready?'Guardar nueva contraseña':'Enviar enlace de recuperación'}</button></form></>}{message&&<p role="status" className="notice">{message}</p>}{error&&<p role="alert" className="access-error">{error}</p>}<p><a href="/acceso">Volver a iniciar sesión</a></p>{ready&&!done&&<p><a href="/recuperar">Solicitar otro enlace</a></p>}</section></main>;
}
