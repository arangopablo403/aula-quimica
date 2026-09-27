import type {Language} from './omics-code';
export const stages=['Muestra y extracción','Qué instalar','Adquisición y exportación','Preprocesamiento','Control de calidad','Estadística','Biblioteca y ayuda'];
export const stageOutputs=['Ficha de muestras, extracción, blancos y QC.','Entorno instalado y prueba de importación correcta.','Copia de trabajo legible, con unidades y metadatos.','Señales revisadas y matriz de áreas o eventos.','Matriz depurada y registro de decisiones.','Tablas, gráficos y reporte reproducible.','Manuales y alternativas para ampliar el método.'];
export const extractions:Record<string,{name:string;methods:string[];record:string;control:string}>={
 liquid:{name:'Extracción con solvente / precipitación',methods:['LC-MS','LC-RMN','LC-IMS'],record:'Matriz, masa/volumen inicial, solvente, dilución, recuperación y volumen final. En RMN añade solvente deuterado y referencia si corresponde.',control:'Blanco de extracción, estándar interno apropiado y QC representativo. Las áreas deben referirse a una cantidad comparable de muestra.'},
 spe:{name:'Extracción en fase sólida · SPE',methods:['LC-MS','LC-RMN','LC-IMS','GC-MS'],record:'Sorbente, lote, carga, lavado, elución, concentración/reconstitución y fracción analizada.',control:'Evaluar recuperación y efecto de matriz. SPE no exige un paquete informático distinto; sí metadatos y controles distintos.'},
 headspace:{name:'Espacio de cabeza · HS / HS-SPME',methods:['GC-MS','GC-O'],record:'Vial, muestra, fibra/recubrimiento cuando aplique, equilibrio, extracción, temperatura, tiempo y desorción.',control:'Blanco de vial/fibra, arrastre y estabilidad de extracción. No equiparar área de SPME a concentración sin calibración apropiada.'},
 immersion:{name:'SPME por inmersión / SBSE',methods:['GC-MS','GC-O'],record:'Recubrimiento, contacto, agitación, muestra, extracción y modalidad de desorción.',control:'Blancos de dispositivo y recuperación; documentar dilución y la variación entre dispositivos.'},
 solventGC:{name:'Extracto líquido para GC / derivatización',methods:['GC-MS','GC-O'],record:'Solvente, concentración, secado y reactivos/tiempo de derivatización si se utiliza. Separar la identidad original de sus derivados.',control:'Blancos de reactivos y productos secundarios. La derivatización no se asume apropiada para representar el olor original en GC-O.'},
 thermal:{name:'Desorción térmica / purga y trampa',methods:['GC-MS','GC-O'],record:'Sorbente, volumen de muestreo, flujo, humedad, almacenamiento y programa de desorción.',control:'Blancos de tubos, arrastre y recuperación. Conservar volumen de aire o masa muestreada para interpretar resultados.'},
 fractions:{name:'Fracciones cromatográficas / muestra ya preparada',methods:['LC-MS','LC-RMN','LC-IMS','GC-MS','GC-O'],record:'Origen, fracción, ventana RT, solvente, volumen, concentración y relación con la muestra de origen.',control:'No tratar fracciones de la misma muestra como réplicas biológicas independientes.'}
};
type Tool={name:string;why:string;url:string};
export function workflowPlan(tech:string,language:Language){
 const r=language==='R',py=language==='Python',lc=tech==='LC-MS',gc=tech==='GC-MS',nmr=tech==='LC-RMN',ims=tech==='LC-IMS',olf=tech==='GC-O';
 const core:Tool=r?{name:'R estable compatible con Bioconductor',why:'Ejecuta los scripts .R. RStudio es una interfaz opcional.',url:'https://cran.r-project.org/'}:py?{name:'Python estable compatible con los paquetes',why:'Ejecuta los scripts .py dentro de un entorno virtual.',url:'https://www.python.org/downloads/'}:{name:'MATLAB + Statistics and Machine Learning Toolbox',why:'MATLAB ejecuta integración y tablas; Statistics Toolbox proporciona PCA y Welch. Requiere licencia.',url:'https://www.mathworks.com/help/install/ug/install-products-with-internet-connection.html'};
 const required:Tool[]=[core];
 if(lc&&r)required.push({name:'xcms + MsExperiment + Spectra',why:'Lectura de mzML, detección, alineamiento y tabla de features.',url:'https://bioconductor.org/packages/xcms/'});
 if(lc&&py)required.push({name:'pyOpenMS + OpenMS TOPP',why:'pyOpenMS detecta features; los ejecutables TOPP alinean y enlazan las muestras. pip por sí solo no instala necesariamente los ejecutables TOPP.',url:'https://www.openms.org/documentation/html/TOPP_documentation.html'});
 if(gc||ims||(lc&&!r&&!py))required.push({name:gc?'MZmine con flujo GC-EI':ims?'MZmine para LC-IMS-MS compatible':'MZmine con flujo LC-MS',why:gc?'Ruta gráfica principal: deconvolución y alineamiento antes de pasar la tabla al lenguaje elegido.':ims?'Con acoplamiento MS: conservar la movilidad antes de exportar. Para LC-IMS sin MS, usar el procesador del detector; esta ruta MZmine no se aplica.':'Ruta gráfica principal: procesar mzML y exportar tabla; MATLAB recibe la exportación.',url:'https://mzmine.github.io/mzmine_documentation/latest/getting_started.html'});
 if(nmr)required.push({name:'Un procesador RMN compatible: TopSpin, Mnova o Delta',why:'Elegir UNO según archivo y licencia. Fourier, fase y referencia antes de exportar ppm/intensidad.',url:'https://nmrglue.readthedocs.io/en/latest/tutorial.html'});
 if(olf)required.push({name:'Registro de eventos del puerto olfativo / CSV',why:'Exportar todas las evaluaciones completadas, incluso no detecciones. No se necesita xcms para resumir eventos sensoriales.',url:'https://www.gerstel.com/en/products/gco/odp4'});
 if(py)required.push({name:'NumPy, pandas, SciPy, Matplotlib, scikit-learn y statsmodels',why:'Lectura de tablas, integración, gráficos, PCA y ajuste FDR de las plantillas.',url:'https://www.python.org/'});
 const optional:Tool[]=[{name:r?'RStudio y renv':py?'JupyterLab':'Bioinformatics / Signal Processing Toolbox',why:r?'Editor y registro de entorno; no son necesarios para las funciones base de PCA/Welch.':py?'Cuadernos interactivos; los scripts también corren desde terminal.':'Solo si usas funciones adicionales como msbackadj o filtros; no los requieren las plantillas básicas de integración.',url:r?'https://posit.co/download/rstudio-desktop/':py?'https://jupyter.org/install':'https://www.mathworks.com/help/bioinfo/spectrum-and-signal-analysis.html'}];
 if(gc||ims||lc)optional.push({name:'MS-DIAL como alternativa',why:'Sustituye la ruta gráfica principal si admite tu adquisición. No proceses con ambos programas y combines filas sin un criterio de correspondencia.',url:'https://systemsomicslab.github.io/compms/msdial/main.html'});
 if(nmr&&py)optional.push({name:'nmrglue',why:'Para desarrollar un lector/procesador RMN propio; no es obligatorio para los scripts de espectros ya exportados.',url:'https://nmrglue.readthedocs.io/en/latest/tutorial.html'});
 if(!olf&&!nmr)optional.push({name:'ProteoWizard / MSConvert',why:'Solo cuando el formato nativo no se pueda leer directamente. Comprobar conservación de MS/MS y movilidad.',url:'https://proteowizard.sourceforge.io/download.html'});
 const packages=py?`python -m venv .venv
# Activar SOLO según tu sistema:
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install numpy pandas scipy matplotlib scikit-learn statsmodels${lc?' pyopenms':''}
python -c "import numpy,pandas,scipy,matplotlib,sklearn,statsmodels${lc?',pyopenms':''}; print('Entorno listo')"
python -m pip freeze > requirements.txt
${lc?'# Instalar OpenMS TOPP por separado desde su distribución oficial.\n# Verificar en la terminal: MapAlignerPoseClustering -help\n# y FeatureLinkerUnlabeledQT -help':''}`:r?`${lc?'if (!requireNamespace("BiocManager",quietly=TRUE)) install.packages("BiocManager")\nBiocManager::install(c("xcms","MsExperiment","Spectra"))\nlibrary(xcms); library(MsExperiment); library(Spectra)\nBiocManager::valid()':'# Las plantillas de exportaciones y estadística usan R base.\n# No necesitas instalar xcms para esta ruta.\nlibrary(stats)'}
sessionInfo()
writeLines(capture.output(sessionInfo()),"session.txt")`:`% Instalar MATLAB y Statistics and Machine Learning Toolbox
% desde la cuenta MathWorks/licencia institucional.
ver
assert(exist('pca','file')==2,'Falta Statistics and Machine Learning Toolbox');
assert(exist('ttest2','file')==2,'Falta Statistics and Machine Learning Toolbox');
% Las plantillas de integración usan readtable/interp1/trapz del núcleo.
% No necesitas Bioinformatics Toolbox para esa plantilla.`;
 return {required,optional,packages,pre:r&&lc?'R + xcms':py&&lc?'Python + pyOpenMS + TOPP':nmr?'Procesador RMN → espectro exportado':olf?'Registro GC-O → CSV':'MZmine → tabla/señales exportadas',post:language+(py?' + paquetes estadísticos':r?' + stats (incluido)':' + Statistics Toolbox')};
}
