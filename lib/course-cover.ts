import type {Item} from './content';
export function courseCover(course?:Item){
 if(!course)return '';
 if(course.image===undefined&&course.id==='pregrado-volatilomica')return '/course-covers/volatilomica-2026.jpeg';
 const value=course.image||'';
 return /^https:\/\//.test(value)||/^\/api\/files\/[\w-]+$/.test(value)?value:'';
}
