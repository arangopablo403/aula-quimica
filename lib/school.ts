import {scienceCurriculum,scienceNotice,scienceTransversal} from './natural-curriculum';
import type {Item} from './content';
export const schoolGrades=[
 {id:'octavo',number:'8',title:'Ciencias Naturales de Octavo',level:'EDUCACIÓN BÁSICA SECUNDARIA',description:'Explora la vida, la materia y los fenómenos de tu entorno.'},
 {id:'noveno',number:'9',title:'Ciencias Naturales de Noveno',level:'EDUCACIÓN BÁSICA SECUNDARIA',description:'Relaciona conceptos y desarrolla tu pensamiento científico.'},
 {id:'decimo',number:'10',title:'Química de Décimo',level:'EDUCACIÓN MEDIA',description:'Construye las bases para comprender la materia.'},
 {id:'once',number:'11',title:'Química de Once',level:'EDUCACIÓN MEDIA',description:'Conecta conceptos y prepárate para nuevos retos.'},
];
export const naturalScienceContent:Item[]=[...schoolGrades.slice(0,2).flatMap(g=>[
 {id:g.id,kind:'course',title:g.title,status:'published',position:Number(g.number),description:g.description,example:true,objectives:scienceTransversal,body:scienceNotice},
 ...[1,2,3,4].map(n=>({id:g.id+'-p'+n,kind:'period',title:'Período '+n,parent:g.id,status:'published',position:n,current:n===1,description:'Unidades y temas pendientes de publicar.'})),
]),...scienceCurriculum];

