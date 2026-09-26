export const uploadTypes:Record<string,string>={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',vtt:'text/vtt',csv:'text/csv',tsv:'text/tab-separated-values',txt:'text/plain',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',zip:'application/zip',mzml:'application/octet-stream',mzxml:'application/octet-stream',mgf:'text/plain',cdf:'application/octet-stream'};
export const fileAccept=Object.keys(uploadTypes).map(x=>'.'+x).join(',');
export const uploadLimit=50*1024*1024;
export function uploadType(name:string){return uploadTypes[name.split('.').pop()?.toLowerCase()||''];}
