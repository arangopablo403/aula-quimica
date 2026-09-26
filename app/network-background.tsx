'use client';
import {useEffect,useRef} from 'react';

export default function NetworkBackground(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx)return;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let w=0,h=0,frame=0,last=0,time=0;
  let points:{x:number;y:number;phase:number}[]=[];
  function draw(now:number){
   if(now-last<40){frame=requestAnimationFrame(draw);return;}last=now;
   if(!media.matches)time+=.008;
   ctx!.clearRect(0,0,w,h);
   const moving=points.map(p=>({x:p.x+Math.sin(time+p.phase)*19,y:p.y+Math.cos(time*.8+p.phase)*16}));
   moving.forEach((p,i)=>{
    for(let j=i+1;j<moving.length;j++){
     const q=moving[j],distance=Math.hypot(p.x-q.x,p.y-q.y);
     if(distance<190){ctx!.strokeStyle=`rgba(16,103,148,${.19*(1-distance/190)})`;ctx!.lineWidth=.9;ctx!.beginPath();ctx!.moveTo(p.x,p.y);ctx!.lineTo(q.x,q.y);ctx!.stroke();}
    }
    ctx!.fillStyle=i%3?'rgba(14,126,138,.35)':'rgba(28,135,195,.43)';ctx!.beginPath();ctx!.arc(p.x,p.y,i%4?2:3.5,0,Math.PI*2);ctx!.fill();
   });
   if(!media.matches&&!document.hidden)frame=requestAnimationFrame(draw);
  }
  function start(){cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(draw);}
  function resize(){w=innerWidth;h=innerHeight;const scale=Math.min(devicePixelRatio||1,1.5);node!.width=w*scale;node!.height=h*scale;ctx!.setTransform(scale,0,0,scale,0,0);points=Array.from({length:Math.min(95,Math.max(30,Math.floor(w*h/14000)))},(_,i)=>({x:((i*0.61803398875)%1)*w,y:((i*0.41421356237+.15)%1)*h,phase:i*1.7}));start();}
  resize();window.addEventListener('resize',resize);media.addEventListener('change',start);document.addEventListener('visibilitychange',start);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);media.removeEventListener('change',start);document.removeEventListener('visibilitychange',start);};
 },[]);
 return <canvas ref={canvas} className="network-background" aria-hidden="true"/>;
}
