import type {Item} from './content';
export const curriculumSources=[
 {title:'DBA de Ciencias Naturales · Ministerio de Educación Nacional',url:'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_C.Naturales-min.pdf'},
 {title:'Estándares Básicos de Competencias · Ministerio de Educación Nacional',url:'https://www.mineducacion.gov.co/1621/article-116042.html'},
];
export const curriculumNotice='Propuesta anual editable para educación media en Colombia. La distribución en cuatro períodos es orientativa: debe ajustarse al PEI, la intensidad horaria, los conocimientos previos y el plan institucional. No es un currículo oficial ni una lista obligatoria de temas.';
const item=(id:string,kind:string,title:string,extra:Partial<Item>={}):Item=>({id,kind,title,status:'published',position:0,...extra});
const subbranchData=[
 ['rama-0','estructura-atomica','Estructura atómica','Partículas, modelos del átomo y organización electrónica.'],
 ['rama-0','estequiometria','Estequiometría','Relaciones cuantitativas entre sustancias en una transformación química.'],
 ['rama-0','quimica-nuclear','Química nuclear','Núcleos atómicos, radiactividad y aplicaciones de los isótopos.'],
 ['rama-1','coordinacion','Química de coordinación','Complejos metálicos, ligandos, geometría y propiedades.'],
 ['rama-1','organometalica','Química organometálica','Compuestos con enlaces entre un metal y un átomo de carbono.'],
 ['rama-1','estado-solido','Química del estado sólido','Estructura y propiedades de sólidos, cristales y materiales.'],
 ['rama-2','estereoquimica','Estereoquímica','Organización espacial de las moléculas y sus consecuencias.'],
 ['rama-2','sintesis-organica','Síntesis orgánica','Diseño de rutas para obtener moléculas y transformar grupos funcionales.'],
 ['rama-2','polimeros','Química de polímeros','Macromoléculas, materiales poliméricos y relaciones estructura-propiedad.'],
 ['rama-3','analisis-clasico','Análisis cuantitativo clásico','Determinación de composición mediante gravimetría y volumetría.'],
 ['rama-3','analisis-instrumental','Análisis instrumental','Mediciones espectroscópicas, electroquímicas y otras técnicas instrumentales.'],
 ['rama-3','separaciones','Ciencias de la separación','Cromatografía y otros métodos para separar e identificar componentes.'],
 ['rama-4','termodinamica','Termodinámica química','Intercambios de energía, espontaneidad y equilibrio.'],
 ['rama-4','cinetica','Cinética química','Velocidad de reacción, mecanismos y catálisis.'],
 ['rama-4','electroquimica','Electroquímica','Relaciones entre las reacciones químicas y la energía eléctrica.'],
 ['rama-4','quimica-cuantica','Química cuántica','Modelos cuánticos para comprender átomos, enlaces y moléculas.'],
 ['rama-5','enzimologia','Enzimología','Estructura, actividad y regulación de enzimas.'],
 ['rama-5','metabolismo','Metabolismo y bioenergética','Transformaciones químicas y flujos de energía en los seres vivos.'],
 ['rama-5','bioquimica-estructural','Bioquímica estructural','Estructura y función de proteínas, carbohidratos, lípidos y ácidos nucleicos.'],
 ['rama-6','quimica-agua','Química del agua','Equilibrios, composición, calidad y procesos de tratamiento del agua.'],
 ['rama-6','quimica-atmosferica','Química atmosférica','Composición y transformaciones químicas de la atmósfera.'],
 ['rama-6','quimica-suelos','Química de suelos','Minerales, materia orgánica y transformaciones de sustancias en el suelo.'],
 ['rama-6','quimica-verde','Química verde y sostenible','Diseño de procesos que reduzcan residuos y el uso de sustancias peligrosas.'],
];
export const subbranches:Item[]=subbranchData.map(([parent,id,title,description],position)=>item('sub-'+id,'subbranch',title,{parent,description,position,body:'Esta área forma parte de una organización temática de la biblioteca. Sus conexiones con otras ramas pueden abordarse desde distintas asignaturas. Aquí se publicarán las asignaturas, unidades y recursos relacionados.'}));
// The sequence below is an original teaching proposal, not an official syllabus.
// Tuple: stable identifier, topic title, scope/learning intention.
const plans:{grade:string;period:number;id:string;title:string;description:string;topics:[string,string,string][]}[]=[
 {grade:'decimo',period:1,id:'unidad-materia',title:'Materia, medición e indagación',description:'Reconocer propiedades, registrar observaciones y comunicar resultados con unidades.',topics:[
 ['metodo-cientifico','Preguntas, hipótesis y variables','Diferenciar observación e inferencia; formular preguntas investigables y distinguir variables independientes, dependientes y controladas.'],
 ['seguridad-laboratorio','Seguridad e instrumentos de laboratorio','Interpretar pictogramas, reconocer material de medición y aplicar las normas de protección y manejo de residuos definidas por el docente.'],
 ['medicion','Magnitudes, unidades y análisis dimensional','Convertir unidades de masa, volumen y temperatura; utilizar notación científica, cifras significativas y estimaciones de incertidumbre.'],
 ['materia','Propiedades de la materia','Distinguir propiedades físicas y químicas, intensivas y extensivas; relacionar masa, volumen y densidad.'],
 ['mezclas','Sustancias, mezclas y métodos de separación','Diferenciar elementos, compuestos y mezclas; seleccionar filtración, decantación, destilación u otros métodos a partir de sus propiedades.'],
 ['estados','Estados y transformaciones de la materia','Interpretar cambios de estado mediante el modelo de partículas y distinguir cambios físicos de transformaciones químicas.'],
 ]},
 {grade:'decimo',period:1,id:'d10-atomos',title:'Estructura del átomo',description:'Relacionar los modelos atómicos con las evidencias que intentan explicar.',topics:[
 ['modelos-atomicos','Desarrollo de los modelos atómicos','Comparar los alcances y límites de los modelos de Dalton, Thomson, Rutherford y Bohr, y reconocer el carácter probabilístico del modelo actual.'],
 ['particulas','Partículas, número atómico e isótopos','Determinar protones, neutrones y electrones a partir de Z, A y la carga; distinguir isótopos de iones.'],
 ['masa-atomica','Masa atómica y abundancia isotópica','Interpretar la masa atómica promedio como una media ponderada de las masas y abundancias de los isótopos.'],
 ['configuracion','Orbitales y configuración electrónica','Representar configuraciones electrónicas de átomos sencillos e identificar electrones de valencia.'],
 ]},
 {grade:'decimo',period:2,id:'d10-periodicidad',title:'Tabla periódica y propiedades',description:'Usar la organización de los elementos para comparar su comportamiento.',topics:[
 ['tabla-periodica','Grupos, períodos y bloques','Ubicar elementos en la tabla y relacionar su posición con su configuración electrónica.'],
 ['familias','Metales, no metales y familias químicas','Comparar propiedades de familias representativas y reconocer aplicaciones cotidianas de los elementos.'],
 ['tendencias','Radio atómico, ionización y electronegatividad','Interpretar tendencias periódicas cualitativas y utilizarlas para fundamentar comparaciones entre elementos.'],
 ['iones','Formación de iones y estados de oxidación','Diferenciar carga iónica y número de oxidación; aplicar reglas a especies sencillas.'],
 ]},
 {grade:'decimo',period:2,id:'d10-enlaces',title:'Enlace químico y estructura molecular',description:'Relacionar los enlaces y las interacciones entre partículas con propiedades observables.',topics:[
 ['enlace-ionico','Enlace iónico y redes cristalinas','Explicar la formación de compuestos iónicos y relacionar su estructura con conductividad y puntos de fusión.'],
 ['enlace-covalente','Enlace covalente y estructuras de Lewis','Representar pares enlazantes y no enlazantes en moléculas sencillas; reconocer límites de la regla del octeto.'],
 ['enlace-metalico','Enlace metálico','Relacionar el modelo de electrones deslocalizados con conductividad, maleabilidad y ductilidad.'],
 ['geometria','Geometría y polaridad molecular','Predecir geometrías sencillas a partir de regiones electrónicas y distinguir polaridad del enlace y de la molécula.'],
 ['intermoleculares','Fuerzas intermoleculares','Comparar dispersión, interacciones dipolares y puentes de hidrógeno para interpretar solubilidad y cambios de estado.'],
 ]},
 {grade:'decimo',period:3,id:'d10-inorganica',title:'Formulación y nomenclatura inorgánica',description:'Leer, escribir y nombrar fórmulas de compuestos inorgánicos habituales.',topics:[
 ['formulas','Símbolos, fórmulas y números de oxidación','Distinguir coeficientes y subíndices; construir fórmulas eléctricamente neutras.'],
 ['oxidos','Óxidos y peróxidos','Reconocer estas funciones, formular ejemplos y comparar los criterios de nomenclatura utilizados en clase.'],
 ['hidruros-hidroxidos','Hidruros e hidróxidos','Formular y nombrar compuestos sencillos, identificando los iones o elementos que los constituyen.'],
 ['acidos','Hidrácidos y oxoácidos','Distinguir ácidos sin oxígeno y oxoácidos; interpretar sus fórmulas y nombres.'],
 ['sales','Sales binarias y oxisales','Relacionar cationes y aniones con las fórmulas de sales y practicar nomenclatura sistemática y de Stock.'],
 ]},
 {grade:'decimo',period:3,id:'d10-reacciones',title:'Transformaciones y ecuaciones químicas',description:'Representar y explicar transformaciones respetando la conservación de átomos y carga.',topics:[
 ['ecuaciones','Evidencias y representación de una reacción','Identificar reactivos, productos y estados físicos; interpretar evidencias sin confundirlas con una demostración concluyente.'],
 ['clasificacion','Tipos de reacción','Comparar síntesis, descomposición, sustitución, combustión, precipitación y neutralización.'],
 ['balanceo','Balanceo por inspección y método algebraico','Ajustar coeficientes sin alterar las fórmulas; verificar la conservación de cada elemento.'],
 ['redox','Oxidación, reducción y balanceo redox','Reconocer transferencia de electrones y agentes oxidantes y reductores; balancear ejemplos adecuados al nivel escolar.'],
 ]},
 {grade:'decimo',period:4,id:'d10-estequiometria',title:'Mol y cálculos químicos',description:'Pasar de las representaciones simbólicas a cantidades medibles de sustancias.',topics:[
 ['mol','Mol, constante de Avogadro y masa molar','Relacionar cantidad de sustancia, número de entidades y masa mediante conversiones con unidades.'],
 ['composicion','Composición porcentual y fórmulas','Calcular porcentajes en masa y deducir fórmulas empíricas y moleculares a partir de datos.'],
 ['calculos','Relaciones mol-mol y masa-masa','Utilizar ecuaciones ajustadas para calcular cantidades de reactivos y productos.'],
 ['limitante','Reactivo limitante y reactivo en exceso','Determinar qué reactivo limita la cantidad máxima de producto y cuánto queda en exceso.'],
 ['rendimiento','Pureza y rendimiento porcentual','Distinguir rendimiento teórico y experimental e incorporar la pureza del reactivo a un cálculo.'],
 ]},
 {grade:'decimo',period:4,id:'d10-gases',title:'Gases e integración experimental',description:'Construir modelos de gases y aplicar los aprendizajes del año a un problema contextualizado.',topics:[
 ['modelo-gases','Modelo cinético y variables de un gas','Relacionar presión, volumen y temperatura absoluta con el movimiento de las partículas.'],
 ['leyes-gases','Leyes de Boyle, Charles y Gay-Lussac','Interpretar tablas y gráficas de procesos en los que se mantiene constante una variable.'],
 ['gas-ideal','Ecuación del gas ideal y mezclas','Aplicar PV = nRT con unidades compatibles y usar presiones parciales en mezclas ideales.'],
 ['proyecto','Proyecto de cierre y comunicación científica','Formular un problema, analizar datos proporcionados o experimentales y comunicar resultados, limitaciones y manejo responsable de residuos.'],
 ]},
 {grade:'once',period:1,id:'unidad-soluciones',title:'Soluciones y concentración',description:'Aplicar relaciones cuantitativas a mezclas homogéneas y reconocer sus límites.',topics:[
 ['solubilidad','Soluto, disolvente y solubilidad','Distinguir concentración y solubilidad; interpretar curvas de solubilidad y efectos de temperatura y presión según el sistema.'],
 ['concentracion','Concentración de soluciones','Expresar composición en porcentaje, concentración molar, molalidad y partes por millón, indicando qué magnitudes relaciona cada medida.'],
 ['dilucion','Diluciones y mezcla de soluciones','Resolver diluciones conservando la cantidad de soluto e identificar cuándo puede utilizarse c₁V₁ = c₂V₂.'],
 ['coligativas','Propiedades coligativas y ósmosis','Interpretar cualitativamente cambios en ebullición, congelación y presión osmótica según la cantidad de partículas disueltas.'],
 ]},
 {grade:'once',period:1,id:'d11-equilibrio',title:'Energía, velocidad y equilibrio',description:'Distinguir cuánto cambia un sistema, con qué rapidez lo hace y cuál es su estado de equilibrio.',topics:[
 ['termoquimica','Procesos exotérmicos y endotérmicos','Interpretar diagramas de energía y relacionar el intercambio de calor con la formación y ruptura de enlaces.'],
 ['cinetica','Rapidez de reacción y catalizadores','Interpretar efectos de concentración, temperatura y superficie; explicar que un catalizador modifica la rapidez sin cambiar la constante de equilibrio.'],
 ['equilibrio','Equilibrio dinámico y constante de equilibrio','Distinguir igualdad de velocidades e igualdad de concentraciones; interpretar expresiones sencillas de la constante.'],
 ['le-chatelier','Perturbaciones del equilibrio','Predecir respuestas cualitativas ante cambios de concentración, presión o temperatura y reconocer las condiciones de aplicación.'],
 ['acido-base','Ácidos, bases, pH y neutralización','Comparar fuerza y concentración; interpretar pH y pOH en disoluciones acuosas y relacionarlos con la neutralización.'],
 ['titulacion','Titulaciones y soluciones amortiguadoras','Interpretar curvas sencillas, distinguir punto final y equivalencia, y reconocer cómo un sistema amortiguador limita cambios de pH.'],
 ]},
 {grade:'once',period:2,id:'d11-carbono',title:'Estructura y representación del carbono',description:'Usar modelos estructurales para explicar la diversidad de compuestos orgánicos.',topics:[
 ['carbono','Tetravalencia, hibridación y enlaces σ y π','Relacionar modelos sp³, sp² y sp con geometrías locales y enlaces sencillos, dobles y triples.'],
 ['representaciones','Cadenas y representaciones orgánicas','Interpretar fórmulas moleculares, desarrolladas, condensadas y esqueléticas; identificar cadenas abiertas, cíclicas y ramificadas.'],
 ['grupos-funcionales','Grupos funcionales y series homólogas','Reconocer grupos funcionales y utilizarlos para clasificar moléculas orgánicas.'],
 ['isomeria','Isomería estructural y estereoisomería','Comparar isómeros de cadena, posición y función; introducir isomería geométrica y quiralidad con modelos sencillos.'],
 ]},
 {grade:'once',period:2,id:'d11-hidrocarburos',title:'Hidrocarburos y sus aplicaciones',description:'Relacionar estructura, nomenclatura y propiedades de compuestos formados por carbono e hidrógeno.',topics:[
 ['alcanos','Alcanos y cicloalcanos','Nombrar estructuras sencillas y relacionar tamaño y ramificación con propiedades físicas.'],
 ['alquenos','Alquenos','Identificar el doble enlace, nombrar ejemplos y representar reacciones de adición sencillas.'],
 ['alquinos','Alquinos','Reconocer el triple enlace y comparar estructura, nomenclatura y reactividad básica con otros hidrocarburos.'],
 ['aromaticos','Hidrocarburos aromáticos','Reconocer el anillo bencénico y distinguir aromaticidad de la presencia de olor.'],
 ['combustibles','Petróleo, combustibles y combustión','Analizar fracciones del petróleo, combustión completa e incompleta y consecuencias ambientales de su uso.'],
 ]},
 {grade:'once',period:3,id:'d11-funciones',title:'Funciones orgánicas oxigenadas y nitrogenadas',description:'Clasificar compuestos orgánicos a partir de sus grupos funcionales.',topics:[
 ['alcoholes','Alcoholes y fenoles','Distinguir grupos hidroxilo en diferentes entornos y relacionar estructura, solubilidad y propiedades.'],
 ['eteres','Éteres','Reconocer el enlace C–O–C y comparar propiedades con alcoholes de tamaño similar.'],
 ['carbonilos','Aldehídos y cetonas','Identificar el grupo carbonilo y diferenciar su posición y reactividad en aldehídos y cetonas.'],
 ['carboxilicos','Ácidos carboxílicos y ésteres','Relacionar los grupos carboxilo y éster con sus nombres, propiedades y aplicaciones.'],
 ['nitrogenados','Aminas, amidas y nitrilos','Reconocer funciones nitrogenadas e identificar su presencia en materiales y moléculas de interés biológico.'],
 ]},
 {grade:'once',period:3,id:'d11-reacciones',title:'Reactividad y transformaciones orgánicas',description:'Representar cambios en grupos funcionales y justificar transformaciones mediante modelos.',topics:[
 ['ruptura','Homólisis, heterólisis e intermediarios','Distinguir distribución de electrones durante la ruptura de enlaces e identificar radicales, nucleófilos y electrófilos sencillos.'],
 ['sustitucion','Adición, sustitución y eliminación','Comparar cambios estructurales que caracterizan estas familias de reacciones, sin confundir producto y mecanismo.'],
 ['oxidacion','Oxidación y reducción de compuestos orgánicos','Relacionar transformaciones de alcoholes, aldehídos, cetonas y ácidos con cambios de oxidación.'],
 ['esterificacion','Esterificación, hidrólisis y saponificación','Representar transformaciones de ácidos y ésteres y relacionarlas con grasas y jabones.'],
 ['polimerizacion','Polimerización y panorama de mecanismos','Relacionar monómeros y polímeros; introducir transformaciones concertadas y pericíclicas a nivel conceptual, según el alcance institucional.'],
 ]},
 {grade:'once',period:4,id:'d11-biomoleculas',title:'Biomoléculas y química de la vida',description:'Conectar las funciones orgánicas con la estructura y función de biomoléculas.',topics:[
 ['carbohidratos','Carbohidratos','Distinguir mono-, di- y polisacáridos y relacionar estructura con almacenamiento de energía y función estructural.'],
 ['lipidos','Lípidos','Comparar grasas, aceites y fosfolípidos; interpretar la influencia de la saturación y la organización de membranas.'],
 ['proteinas','Aminoácidos y proteínas','Representar el enlace peptídico y relacionar niveles de estructura con función y desnaturalización.'],
 ['enzimas','Enzimas y metabolismo','Interpretar la acción catalítica de enzimas y reconocer rutas de transformación de materia y energía.'],
 ['acidos-nucleicos','Ácidos nucleicos','Identificar nucleótidos y relacionar la estructura de ADN y ARN con el almacenamiento y la expresión de información biológica.'],
 ]},
 {grade:'once',period:4,id:'d11-ambiente',title:'Química, materiales y ambiente',description:'Evaluar aplicaciones de la química mediante datos y argumentos.',topics:[
 ['electroquimica','Pilas, electrólisis y corrosión','Relacionar reacciones redox con energía eléctrica y comparar procesos espontáneos y forzados.'],
 ['materiales','Polímeros, materiales y ciclo de vida','Analizar propiedades, usos, reciclaje y limitaciones de materiales; distinguir origen renovable, biodegradabilidad y reciclabilidad.'],
 ['agua','Calidad del agua y contaminación','Interpretar indicadores de composición del agua y discutir procesos de tratamiento y fuentes de contaminación.'],
 ['atmosfera','Química atmosférica y cambio climático','Distinguir efecto invernadero, contaminación del aire y afectación de la capa de ozono, atendiendo a sus mecanismos.'],
 ['sostenibilidad','Química verde y proyecto de cierre','Comparar alternativas según uso de recursos, peligros y residuos; sustentar una propuesta con evidencia y reconocer sus limitaciones.'],
 ]},
];
const periods:Record<string,string[]>={decimo:['Materia y estructura atómica','Periodicidad y enlace químico','Lenguaje y transformaciones químicas','Cálculos químicos y gases'],once:['Soluciones y equilibrio','Carbono e hidrocarburos','Funciones y reacciones orgánicas','Biomoléculas, ambiente e integración']};
export const annualContent:Item[]=[...subbranches];
for(const grade of ['decimo','once']){
 annualContent.push(item(grade,'course',grade==='decimo'?'Química de Décimo':'Química de Once',{example:true,description:grade==='decimo'?'Un recorrido anual por la materia, el átomo, los enlaces, las reacciones y los cálculos químicos.':'Un recorrido anual que conecta soluciones, equilibrio, química orgánica, biomoléculas y ambiente.',objectives:grade==='decimo'?'Interpretar propiedades de la materia desde modelos de partículas.\nRepresentar sustancias y transformaciones mediante fórmulas y ecuaciones.\nResolver problemas cuantitativos con unidades, datos y argumentos.\nPlanear indagaciones y comunicar sus resultados responsablemente.':'Relacionar estructura molecular, propiedades y reactividad.\nAplicar modelos de soluciones, energía y equilibrio a situaciones concretas.\nInterpretar funciones orgánicas y biomoléculas.\nEvaluar evidencia y comunicar argumentos sobre aplicaciones e impactos de la química.',body:curriculumNotice}));
 for(let p=1;p<=4;p++)annualContent.push(item(grade+'-p'+p,'period','Período '+p,{parent:grade,position:p,example:true,current:p===1,description:periods[grade][p-1]}));
}
for(const unit of plans){
 annualContent.push(item(unit.id,'unit',unit.title,{parent:unit.grade+'-p'+unit.period,position:plans.filter(p=>p.grade===unit.grade&&p.period===unit.period).indexOf(unit),description:unit.description,example:true}));
 unit.topics.forEach(([slug,title,description],position)=>{const id=['materia','concentracion'].includes(slug)?slug:unit.grade+'-'+slug;
 annualContent.push(item(id,'topic',title,{parent:unit.id,position,description,objectives:description,example:true,...(!['materia','concentracion'].includes(id)?{body:'Alcance del tema\n'+description+'\n\nEste apartado corresponde al temario anual propuesto. La explicación desarrollada, los ejemplos de clase y los materiales del docente se incorporarán aquí.'}:{})}));
 });
}
const review:[string,string,string][]=[
 ['lectura-datos','Lectura de tablas, gráficas y unidades','Interpretar tendencias, escalas, unidades y relaciones entre variables sin asumir causalidad a partir de una correlación.'],
 ['evidencia','Explicación de fenómenos con evidencia','Elegir la explicación que mejor se ajuste a los datos y distinguir una afirmación de la evidencia que la sustenta.'],
 ['diseno-experimental','Diseño experimental y control de variables','Reconocer preguntas investigables, grupos de comparación, controles y limitaciones de un experimento.'],
 ['calculos-integrados','Aplicación de cálculos en contexto','Resolver situaciones integradas de densidad, mol, estequiometría, gases y concentración, revisando unidades y plausibilidad.'],
 ['estructura-propiedad','Relaciones estructura-propiedad','Usar modelos de enlace y grupos funcionales para comparar propiedades de sustancias.'],
 ['repaso-acumulativo','Repaso acumulativo y análisis de errores','Clasificar errores conceptuales y de procedimiento, explicar la elección de una respuesta y planear actividades de refuerzo.'],
];
review.forEach(([id,title,description],position)=>annualContent.push(item('saber-'+id,'topic',title,{parent:'saber',position:position+1,description,example:true,body:'Ruta de preparación\n'+description+'\n\nEste apartado está preparado para ejercicios de práctica y preguntas explicadas. Los materiales que se incorporen deben identificar su procedencia. No contiene preguntas oficiales del ICFES.'})));
export function mergeContent(stored:Item[],defaults:Item[]):Item[]{const records=new Map(defaults.map(i=>[i.id,i]));for(const record of stored)records.set(record.id,record);for(const id of ['decimo','once']){const grade=records.get(id);if(grade)records.set(id,{...grade,parent:undefined});}return [...records.values()].sort((a,b)=>a.position-b.position)}

