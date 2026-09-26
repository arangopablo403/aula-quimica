import 'server-only';
import type {Item} from './content';
const spaces=[
 {id:'realidad-aumentada',title:'Realidad aumentada',description:'Explora células y moléculas superpuestas sobre tu cámara, con controles de tamaño y orientación.',units:['Estructura celular','Geometría molecular','Actividades de observación']},
 {id:'quimica-computacional',title:'Química computacional',description:'Programas, paquetes y documentación oficial para iniciar cálculos moleculares y analizar resultados.',units:['Instalación y preparación molecular','Métodos y cálculos básicos','Análisis, validación y reproducibilidad']},
 {id:'laboratorios-experimentales',title:'Laboratorios experimentales',description:'Prácticas, protocolos, seguridad e informes de laboratorio.',units:['Seguridad y preparación','Prácticas experimentales','Informes y discusión de resultados']},
 {id:'laboratorios-teoricos',title:'Laboratorios teóricos',description:'Simulaciones, resolución de problemas y preparación conceptual de las prácticas.',units:['Fundamentos y prelaboratorio','Simulaciones y modelos','Talleres e informes']},
 {id:'analisis-instrumental',title:'Análisis de datos instrumentales',description:'Archivos, metodologías e informes de GC-MS, LC-MS y LC-IMS.',units:['GC-MS','LC-MS','LC-IMS']}
];
export const laboratoryContent:Item[]=spaces.flatMap((s,index)=>[
 {id:s.id,kind:'course',status:'published',position:30+index,title:s.title,description:s.description,body:'Espacio editable para guías, archivos de trabajo y recursos del curso. Los datos instrumentales se descargan para procesarlos con el software correspondiente; esta biblioteca no procesa automáticamente los archivos.',objectives:'Consultar materiales, documentar procedimientos y comunicar resultados con criterios de calidad.'},
 ...s.units.flatMap((title,n)=>[
  {id:s.id+'-unidad-'+(n+1),parent:s.id,kind:'unit',status:'published',position:n,title},
  {id:s.id+'-tema-'+(n+1),parent:s.id+'-unidad-'+(n+1),kind:'topic',status:'published',position:0,title:'Guías, archivos y actividades · '+title,description:'Materiales de trabajo pendientes de cargar por el docente.'}
 ])
]);
