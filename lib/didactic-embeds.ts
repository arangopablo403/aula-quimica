export function didacticEmbed(value?:string):{src:string;label:string}|undefined{
 try{
  const u=new URL(value||'');if(u.protocol!=='https:'||u.username||u.password)return;
  if(['youtube.com','www.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname)){
   const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.split('/').pop();
   if(id&&/^[\w-]{11}$/.test(id))return {src:'https://www.youtube-nocookie.com/embed/'+id,label:'video explicativo'};
  }
  if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)){
   const match=u.pathname.match(/^\/(?:video\/)?(\d+)$/);if(match)return {src:'https://player.vimeo.com/video/'+match[1],label:'video explicativo'};
  }
  if(['sketchfab.com','www.sketchfab.com'].includes(u.hostname)){
   const match=u.pathname.match(/^\/(?:3d-models\/(?:[\w-]+-)?|models\/)([a-f0-9]{32})(?:\/embed)?\/?$/i);
   if(match)return {src:'https://sketchfab.com/models/'+match[1]+'/embed',label:'modelo 3D'};
  }
  if(u.hostname==='phet.colorado.edu'&&/^\/sims\/html\/[a-z0-9-]+\/(?:latest|[\d.]+)\/[a-z0-9_-]+\.html$/i.test(u.pathname))return {src:u.origin+u.pathname,label:'simulación interactiva'};
 }catch{}
}
