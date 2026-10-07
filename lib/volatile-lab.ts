export const headspace=(k:number,beta:number)=>1/(k+beta);
export const uptake=(time:number,tau:number)=>100*(1-Math.exp(-time/tau));
export const linearRI=(time:number,lower=8,upper=10,carbon=10)=>100*(carbon+(time-lower)/(upper-lower));
export const calibrated=(area:number,slope:number,intercept:number)=>(area-intercept)/slope;
export const qcSeries=(drift:number)=>Array.from({length:10},(_,i)=>100*(1+drift/100*i/9));
export function rsd(values:number[]){const mean=values.reduce((a,b)=>a+b,0)/values.length;return 100*Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/(values.length-1))/mean;}
