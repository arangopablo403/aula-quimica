export type Language='R'|'Python'|'MATLAB';
export const alignOpenms=`# Instalar además OpenMS TOPP; los ejecutables deben estar en PATH.
# Guardar featureXML de cada muestra tras la detección.
from pathlib import Path
import subprocess
files=sorted(Path("features").glob("*.featureXML"))
assert len(files)>=3, "Se requieren archivos por muestra"
Path("aligned").mkdir(exist_ok=True)
outputs=[str(Path("aligned")/p.name) for p in files]
# Crear y editar parámetros del método antes de ejecutar.
subprocess.run(["MapAlignerPoseClustering","-write_ini","alignment.ini"],check=True)
subprocess.run(["FeatureLinkerUnlabeledQT","-write_ini","linking.ini"],check=True)
print("Revisar alignment.ini y linking.ini: tolerancias RT/mz según QC.")
input("Cuando estén revisados, pulsa Enter para continuar: ")
subprocess.run(["MapAlignerPoseClustering","-ini","alignment.ini",
 "-in",*[str(p) for p in files],"-out",*outputs],check=True)
subprocess.run(["FeatureLinkerUnlabeledQT","-ini","linking.ini",
 "-in",*outputs,"-out","consensus.consensusXML"],check=True)
# Exportar consenso preservando el vínculo de cada columna a su muestra.
import pyopenms as oms
import pandas as pd
cm=oms.ConsensusMap(); oms.ConsensusXMLFile().load("consensus.consensusXML",cm)
headers=cm.getColumnHeaders()
names={i:Path(h.filename.decode() if isinstance(h.filename,bytes) else h.filename).stem for i,h in headers.items()}
assert len(set(names.values()))==len(names), "Nombres de muestras duplicados"
rows={name:{} for name in names.values()}
for n,feature in enumerate(cm):
 for handle in feature.getFeatureList():
  rows[names[handle.getMapIndex()]][f"F{n+1:05d}"]=handle.getIntensity()
pd.DataFrame.from_dict(rows,orient="index").rename_axis("sample_id").to_csv("features.csv")
# Comprobar nombres frente a metadata.csv; revisar faltantes y alineamiento.
`;
export const contrast:Record<Language,string>={R:`# Dos grupos INDEPENDIENTES; no usar para pareados o medidas repetidas.
f<-read.csv("features.csv",check.names=FALSE); m<-read.csv("metadata.csv")
stopifnot(!anyDuplicated(f$sample_id),!anyDuplicated(m$sample_id),setequal(f$sample_id,m$sample_id))
m<-m[match(f$sample_id,m$sample_id),]; use<-m$type=="sample"
X<-as.matrix(f[use,-1]); g<-factor(m$group[use]); stopifnot(nlevels(g)==2)
stopifnot(all(X>=0,na.rm=TRUE))
p<-apply(X,2,function(v){a<-log1p(v[g==levels(g)[1]]); b<-log1p(v[g==levels(g)[2]])
 a<-a[is.finite(a)]; b<-b[is.finite(b)]
 if(min(length(a),length(b))<3) return(NA_real_)
 tryCatch(t.test(a,b,var.equal=FALSE)$p.value,error=function(e) NA_real_)})
write.csv(data.frame(feature=colnames(X),p=p,q_BH=p.adjust(p,"BH")),
 "welch_BH.csv",row.names=FALSE)
# Definir contrastes y controlar confusores antes de interpretar q.
`,Python:`import numpy as np
import pandas as pd
from scipy.stats import ttest_ind
from statsmodels.stats.multitest import multipletests
f=pd.read_csv("features.csv",index_col="sample_id")
m=pd.read_csv("metadata.csv",index_col="sample_id")
assert f.index.is_unique and m.index.is_unique and set(f.index)==set(m.index)
m=m.loc[f.index]; f=f.loc[m.type=="sample"]; m=m.loc[f.index]
assert (f.fillna(0)>=0).all().all()
groups=sorted(m.group.unique()); assert len(groups)==2
out=[]
for name in f.columns:
 a=np.log1p(f.loc[m.group==groups[0],name].dropna())
 b=np.log1p(f.loc[m.group==groups[1],name].dropna())
 p=ttest_ind(a,b,equal_var=False).pvalue if min(len(a),len(b))>=3 else np.nan
 out.append((name,p))
r=pd.DataFrame(out,columns=["feature","p"]); r["q_BH"]=np.nan
valid=np.isfinite(r.p)
if valid.any(): r.loc[valid,"q_BH"]=multipletests(r.loc[valid,"p"],method="fdr_bh")[1]
r.to_csv("welch_BH.csv",index=False)
# Solo muestras independientes; modelos mixtos para repeticiones.
`,MATLAB:`f=readtable('features.csv','VariableNamingRule','preserve');
m=readtable('metadata.csv','TextType','string');
assert(numel(unique(string(f.sample_id)))==height(f));
assert(numel(unique(m.sample_id))==height(m));
[ok,idx]=ismember(string(f.sample_id),m.sample_id); assert(all(ok)&&height(f)==height(m));
m=m(idx,:); use=m.type=="sample"; X=table2array(f(use,2:end));
g=m.group(use); groups=unique(g); assert(numel(groups)==2);
assert(all(X(~isnan(X))>=0)); p=nan(size(X,2),1);
for j=1:size(X,2)
 a=log1p(X(g==groups(1),j)); b=log1p(X(g==groups(2),j));
 a=a(isfinite(a)); b=b(isfinite(b));
 if min(numel(a),numel(b))>=3, [~,p(j)]=ttest2(a,b,'Vartype','unequal'); end
end
valid=find(isfinite(p)); [sp,order]=sort(p(valid)); n=numel(sp);
q=nan(size(p)); if n>0
 adjusted=min(1,flipud(cummin(flipud(sp.*n./(1:n)'))));
 q(valid(order))=adjusted;
end
writetable(table(string(f.Properties.VariableNames(2:end))',p,q,...
 'VariableNames',{'feature','p','q_BH'}),'welch_BH.csv');
% Prueba de Welch para grupos independientes, no medidas repetidas.
`};
export const retention:Record<Language,string>={R:`# Temperatura programada: índice lineal de retención, SIN extrapolar.
# alkanes.csv: carbon,rt_s; peaks.csv: feature_id,rt_s
a<-read.csv("alkanes.csv"); p<-read.csv("peaks.csv")
a<-a[order(a$carbon),]; stopifnot(all(diff(a$carbon)==1),all(diff(a$rt_s)>0))
p$RI<-approx(a$rt_s,100*a$carbon,xout=p$rt_s,rule=1)$y
write.csv(p,"peaks_RI.csv",row.names=FALSE)
`,Python:`import numpy as np
import pandas as pd
a=pd.read_csv("alkanes.csv").sort_values("carbon"); p=pd.read_csv("peaks.csv")
assert (np.diff(a.carbon)==1).all() and (np.diff(a.rt_s)>0).all()
p["RI"]=np.interp(p.rt_s,a.rt_s,100*a.carbon,left=np.nan,right=np.nan)
p.to_csv("peaks_RI.csv",index=False)
# Índice lineal, programa de temperatura, no Kováts isotérmico.
`,MATLAB:`a=sortrows(readtable('alkanes.csv'),'carbon'); p=readtable('peaks.csv');
assert(all(diff(a.carbon)==1) && all(diff(a.rt_s)>0));
p.RI=interp1(a.rt_s,100*a.carbon,p.rt_s,'linear',NaN);
writetable(p,'peaks_RI.csv');
% Índice lineal para temperatura programada, sin extrapolar.
`};
export const setup:Record<Language,string>={R:`# Instalar R desde https://cran.r-project.org/ y abrir R/RStudio.
install.packages(c("BiocManager", "renv", "ggplot2", "readr"))
BiocManager::install(c("xcms", "MsExperiment", "Spectra"))
# Opcionales, solo según actividad: limma, ropls (Bioconductor).
# MSnbase: solo para protocolos heredados, no mezclar objetos v3/v4.
BiocManager::valid()
sessionInfo()
# En un proyecto dedicado: renv::init(); renv::snapshot()`,Python:`# Crear un entorno nuevo, no modificar el Python del sistema.
python -m venv .venv
# PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install numpy pandas scipy matplotlib scikit-learn statsmodels
# Según técnica: MS / RMN, respectivamente
python -m pip install pyopenms nmrglue
python -m pip freeze > requirements.txt`,MATLAB:`% Instala MATLAB desde tu cuenta MathWorks y activa la licencia.
% Add-Ons / instalador: Statistics and Machine Learning Toolbox (PCA).
% Opcionales: Bioinformatics Toolbox (msbackadj, msalign),
% Signal Processing Toolbox (filtrado), según el protocolo.
ver
assert(exist('pca','file')==2, 'Falta Statistics and Machine Learning Toolbox');
% Guarda la salida de ver junto con tu código y parámetros.`};
export const xcmsCode=`# LC-MS HRMS centroidado, modo MS1, una polaridad por ejecución.
# samples.csv: sample_id,file,group (rutas mzML); mínimo 3 archivos.
library(xcms)
library(MsExperiment)
pd <- read.csv("samples.csv", stringsAsFactors=FALSE)
stopifnot(nrow(pd)>=3, !anyDuplicated(pd$sample_id), all(file.exists(pd$file)))
raw <- readMsExperiment(spectraFiles=pd$file, sampleData=pd)
# EJEMPLO: sustituir ppm y peakwidth por valores medidos en QC.
peaks <- findChromPeaks(raw, param=CentWaveParam(ppm=10,
    peakwidth=c(5,30), snthresh=10))
aligned <- adjustRtime(peaks, param=ObiwarpParam(binSize=0.6))
features <- groupChromPeaks(aligned, param=PeakDensityParam(
    sampleGroups=pd$group, bw=5, minFraction=0.5))
features <- fillChromPeaks(features)
areas <- featureValues(features, value="into")
colnames(areas) <- pd$sample_id
write.csv(data.frame(sample_id=pd$sample_id,t(areas),check.names=FALSE),
          "features.csv",row.names=FALSE)
write.csv(featureDefinitions(features),"feature_definitions.csv")
saveRDS(features,"xcms_result.rds")
writeLines(capture.output(sessionInfo()),"session.txt")
# Inspeccionar cromatogramas, alineamiento, blancos y QC ANTES de estadística.
# No identifica moléculas ni valida automáticamente parámetros.
`;
export const openmsCode=`# LC-MS HRMS centroidado: detección por archivo; parámetros de ejemplo.
# No usar FeatureFinder de péptidos para metabolitos.
import pyopenms as oms
exp = oms.MSExperiment()
reader = oms.MzMLFile()
opts = oms.PeakFileOptions(); opts.setMSLevels([1]); reader.setOptions(opts)
reader.load("sample.mzML", exp)
exp.sortSpectra(True)
detector = oms.MassTraceDetection()
p = detector.getDefaults()
p.setValue("mass_error_ppm", 10.0)
p.setValue("noise_threshold_int", 1000.0) # ajustar con blancos/QC
detector.setParameters(p)
traces = []; detector.run(exp, traces, 0)
split = []; oms.ElutionPeakDetection().detectPeaks(traces, split)
features = oms.FeatureMap(); chromatograms = []
oms.FeatureFindingMetabo().run(split, features, chromatograms)
features.setUniqueIds()
oms.FeatureXMLFile().store("sample.featureXML", features)
# Repetir por muestra; después alinear RT y enlazar features con el
# flujo de OpenMS documentado. Exportar matriz de consenso a features.csv.
# Este archivo individual NO es una tabla comparable entre muestras.
`;
// Deliberately operates on an explicitly exported ROI: not a raw-file reader or deconvolution engine.
export function signalCode(language:Language,technique:string){const axis=technique==='LC-RMN'?'ppm':'rt_s';const intro=`${technique}: una región de señal exportada, sin coelución, por archivo. ${axis} en orden creciente; intensity numérica. Integración dirigida, no detección no dirigida.`;return ({R:`# ${intro}
d <- read.csv("signal.csv")
stopifnot(all(c("${axis}","intensity") %in% names(d)))
d <- d[order(d$${axis}),]; x <- d$${axis}; y <- d$intensity
stopifnot(length(x)>=10, all(is.finite(x)),all(is.finite(y)), all(diff(x)>0))
# Elegir una ROI cuyos extremos estén libres de picos.
n <- max(2,floor(length(x)*0.1))
baseline <- approx(c(mean(head(x,n)),mean(tail(x,n))),
 c(median(head(y,n)),median(tail(y,n))),xout=x,rule=2)$y
corrected <- y-baseline
area <- sum(diff(x)*(head(corrected,-1)+tail(corrected,-1))/2)
write.csv(data.frame(x=x,raw=y,baseline=baseline,corrected=corrected),
 "signal_corrected.csv",row.names=FALSE)
plot(x,y,type="l"); lines(x,baseline,col="red")
print(area)
# Conservar áreas negativas para revisar el fondo; no forzarlas a cero.
# Repetir con ROIs homólogas validadas y construir features.csv.
`,Python:`# ${intro}
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.integrate import trapezoid
d = pd.read_csv("signal.csv").sort_values("${axis}")
x = d["${axis}"].to_numpy(float); y = d["intensity"].to_numpy(float)
assert len(x)>=10 and np.isfinite(x).all() and np.isfinite(y).all()
assert (np.diff(x)>0).all(), "Eje repetido o inválido"
n = max(2,len(x)//10)
baseline = np.interp(x,[x[:n].mean(),x[-n:].mean()],
                    [np.median(y[:n]),np.median(y[-n:])])
corrected = y-baseline
pd.DataFrame(dict(x=x,raw=y,baseline=baseline,corrected=corrected)).to_csv(
    "signal_corrected.csv",index=False)
print("Área dirigida:",trapezoid(corrected,x))
plt.plot(x,y); plt.plot(x,baseline); plt.savefig("baseline.png")
# No truncar negativos. Validar visualmente cada ROI antes de cuantificar.
`,MATLAB:`% ${intro}
d=readtable('signal.csv'); d=sortrows(d,'${axis}');
x=d.${axis}; y=d.intensity;
assert(numel(x)>=10 && all(isfinite(x)) && all(isfinite(y)) && all(diff(x)>0));
n=max(2,floor(numel(x)*0.1));
anchors=[mean(x(1:n)),mean(x(end-n+1:end))];
levels=[median(y(1:n)),median(y(end-n+1:end))];
baseline=interp1(anchors,levels,x,'linear');
baseline(x<anchors(1))=levels(1); baseline(x>anchors(2))=levels(2);
corrected=y-baseline;
writetable(table(x,y,baseline,corrected),'signal_corrected.csv');
plot(x,y,x,baseline); saveas(gcf,'baseline.png');
area=trapz(x,corrected)
% No truncar negativos. Repetir por ROI validada y muestra.
`})[language]}
export const statistics:Record<Language,string>={R:`# features.csv: sample_id,F001,F002,... (filas=muestras, áreas>=0).
# metadata.csv: sample_id,type,group,batch,order
# type: sample, qc o blank. No tratar QC/blank como réplicas biológicas.
f <- read.csv("features.csv",check.names=FALSE)
m <- read.csv("metadata.csv",stringsAsFactors=FALSE)
stopifnot(!anyDuplicated(f$sample_id),!anyDuplicated(m$sample_id),
 setequal(f$sample_id,m$sample_id))
m <- m[match(f$sample_id,m$sample_id),]
X <- as.matrix(f[,-1]); storage.mode(X)<-"double"
stopifnot(all(is.finite(X)|is.na(X)),all(X>=0,na.rm=TRUE))
# Informar QC; decidir umbrales según el método, no aplicar a ciegas.
qc <- m$type=="qc"
if(sum(qc)>=3) write.csv(data.frame(feature=colnames(X),
 rsd=100*apply(X[qc,,drop=FALSE],2,sd,na.rm=TRUE)/
 colMeans(X[qc,,drop=FALSE],na.rm=TRUE)),"qc_rsd.csv",row.names=FALSE)
X <- X[m$type=="sample",,drop=FALSE]; m<-m[m$type=="sample",]
stopifnot(nrow(X)>=3)
X <- X[,colMeans(!is.na(X))>=0.8,drop=FALSE]
# Imputación mediana SOLO para exploración, tras revisar faltantes.
for(j in seq_len(ncol(X))) X[is.na(X[,j]),j]<-median(X[,j],na.rm=TRUE)
X <- X[,apply(X,2,sd)>0,drop=FALSE]; stopifnot(ncol(X)>=2)
# No normalizar por suma automáticamente. Usar estándar/dilución si procede.
Z <- log1p(X); p <- prcomp(Z,center=TRUE,scale.=TRUE)
write.csv(data.frame(sample_id=m$sample_id,p$x),"pca_scores.csv",row.names=FALSE)
write.csv(p$rotation,"pca_loadings.csv")
plot(p$x[,1:2],col=as.integer(factor(m$group)),pch=19)
legend("topright",legend=levels(factor(m$group)),col=seq_along(unique(m$group)),pch=19)
writeLines(capture.output(sessionInfo()),"session.txt")
# PCA exploratoria no demuestra significancia ni capacidad predictiva.
`,Python:`import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
f=pd.read_csv("features.csv",index_col="sample_id")
m=pd.read_csv("metadata.csv",index_col="sample_id")
assert f.index.is_unique and m.index.is_unique and set(f.index)==set(m.index)
m=m.loc[f.index]; f=f.apply(pd.to_numeric,errors="raise")
assert not np.isinf(f.to_numpy()).any() and (f.fillna(0)>=0).all().all()
q=f.loc[m.type=="qc"]
if len(q)>=3: (100*q.std()/q.mean()).to_csv("qc_rsd.csv")
f=f.loc[m.type=="sample"]; m=m.loc[f.index]
assert len(f)>=3
f=f.loc[:,f.notna().mean()>=0.8]
# Mediana solo exploratoria; investigar el mecanismo de datos faltantes.
X=SimpleImputer(strategy="median").fit_transform(f)
keep=X.std(axis=0)>0; X=X[:,keep]; names=f.columns[keep]
assert X.shape[1]>=2
Z=StandardScaler().fit_transform(np.log1p(X))
p=PCA(n_components=2); scores=p.fit_transform(Z)
pd.DataFrame(scores,index=f.index,columns=["PC1","PC2"]).to_csv("pca_scores.csv")
pd.DataFrame(p.components_.T,index=names,columns=["PC1","PC2"]).to_csv("pca_loadings.csv")
print("Fracción de varianza:",p.explained_variance_ratio_)
# No afirmar clasificación a partir de PCA. Modelos predictivos necesitan
# separar sujetos/lotes y ajustar imputación/escalado dentro de cada fold.
`,MATLAB:`f=readtable('features.csv','VariableNamingRule','preserve');
m=readtable('metadata.csv','TextType','string');
assert(numel(unique(string(f.sample_id)))==height(f));
assert(numel(unique(m.sample_id))==height(m));
[ok,idx]=ismember(string(f.sample_id),m.sample_id);
assert(all(ok) && height(f)==height(m)); m=m(idx,:);
X=table2array(f(:,2:end)); assert(isnumeric(X));
assert(all(isfinite(X(:))|isnan(X(:))) && all(X(~isnan(X))>=0));
q=m.type=="qc";
if sum(q)>=3
 rsd=100*std(X(q,:),0,1,'omitnan')./mean(X(q,:),1,'omitnan');
 writetable(table(string(f.Properties.VariableNames(2:end))',rsd',...
 'VariableNames',{'feature','rsd'}),'qc_rsd.csv');
end
use=m.type=="sample"; X=X(use,:); m=m(use,:); assert(size(X,1)>=3);
X=X(:,mean(~isnan(X),1)>=0.8);
for j=1:size(X,2), X(isnan(X(:,j)),j)=median(X(:,j),'omitnan'); end
X=X(:,std(X,0,1)>0); assert(size(X,2)>=2);
Z=zscore(log1p(X)); [coeff,score,~,~,explained]=pca(Z);
writetable(table(m.sample_id,score(:,1),score(:,2),...
 'VariableNames',{'sample_id','PC1','PC2'}),'pca_scores.csv');
writematrix(coeff,'pca_loadings.csv'); disp(explained(1:2));
scatter(score(:,1),score(:,2)); xlabel('PC1'); ylabel('PC2');
% PCA no sustituye validación externa ni pruebas estadísticas.
`};
export const olfactory:Record<Language,string>={R:`# events.csv: sample_id,odor_id,assessor,session,detected,intensity
# Una fila por muestra/olor/evaluador/sesión realmente evaluada.
# detected=0/1; intensidad=0 para no detección, NA para dato perdido.
# Alinear eventos a GC por retardo medido y RI antes de asignar odor_id.
d<-read.csv("events.csv",stringsAsFactors=FALSE)
key<-c("sample_id","odor_id","assessor","session")
stopifnot(!anyDuplicated(d[key]),all(d$detected %in% c(0,1)))
stopifnot(all(is.na(d$intensity)|(is.finite(d$intensity)&d$intensity>=0)))
stopifnot(all(is.na(d$intensity)|d$detected!=0|d$intensity==0))
s<-aggregate(d["detected"],d[c("sample_id","odor_id")],mean)
names(s)[3]<-"detection_fraction"
write.csv(s,"olfactory_frequency.csv",row.names=FALSE)
# No convertir filas ausentes en no detecciones. El denominador exige
# registro de todas las evaluaciones completadas, incluidas negativas.
# Para inferencia repetida: modelo mixto con evaluador/sesión; no t-test
# de cada registro como si fueran personas independientes.
`,Python:`import pandas as pd
d=pd.read_csv("events.csv")
keys=["sample_id","odor_id","assessor","session"]
assert not d.duplicated(keys).any()
assert d.detected.isin([0,1]).all()
assert ((d.intensity>=0)|d.intensity.isna()).all()
assert ((d.detected!=0)|(d.intensity==0)|d.intensity.isna()).all()
s=d.groupby(["sample_id","odor_id"]).agg(
 detection_fraction=("detected","mean"),evaluations=("detected","size"),
 mean_intensity=("intensity","mean"))
s.to_csv("olfactory_summary.csv")
# Se requieren también las evaluaciones negativas; ausencia no es cero.
# Emparejar con GC-MS por RI y retardo medido, no por texto de olor.
`,MATLAB:`d=readtable('events.csv','TextType','string');
keys=d(:,{'sample_id','odor_id','assessor','session'});
assert(height(unique(keys))==height(d));
assert(all(ismember(d.detected,[0 1])));
assert(all(d.intensity>=0 | isnan(d.intensity)));
assert(all(d.detected~=0 | d.intensity==0 | isnan(d.intensity)));
s=groupsummary(d,{'sample_id','odor_id'},'mean',{'detected','intensity'});
writetable(s,'olfactory_summary.csv');
% Las evaluaciones ausentes no son no detecciones.
% Agrupar solo después de armonizar RI, retardo y vocabulario sensorial.
`};
