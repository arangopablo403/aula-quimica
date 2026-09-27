import type {Language} from './omics-code';
export const pathwayDownload=`# Opcional: obtener membresías de rutas KEGG previamente elegidas.
# Revisar condiciones de uso de KEGG antes de ejecutar; no descarga imágenes.
# route_ids.txt: un ID de ruta por línea, de UNA especie, sin prefijo path:.
# Define el organismo real del estudio; no asumir humano por defecto.
from urllib.request import urlopen
from datetime import datetime,timezone
import csv,re,time
organism="REEMPLAZAR"
assert organism!="REEMPLAZAR", "Configura el organismo según la base"
routes=[s.strip() for s in open("route_ids.txt") if s.strip()]
assert routes and all(re.fullmatch(re.escape(organism)+r"\\d{5}",s) for s in routes)
rows=[]
for route in sorted(set(routes)):
 url="https://rest.kegg.jp/link/compound/"+route
 with urlopen(url,timeout=30) as response: lines=response.read().decode().splitlines()
 for line in lines:
  pathway,compound=line.split("\\t")
  rows.append([pathway.removeprefix("path:"),compound.removeprefix("cpd:")])
 time.sleep(0.5)
assert rows, "Sin membresías: revisar organismo, IDs y soporte de la base"
with open("pathways.csv","w",newline="") as f:
 w=csv.writer(f);w.writerow(["pathway_id","compound_id"]);w.writerows(rows)
open("pathway_source.txt","w").write("KEGG REST; organismo="+organism+
 "; consulta UTC="+datetime.now(timezone.utc).isoformat())
# Retener la lista completa predefinida de rutas examinadas, no solo hits.
`;
export const mapping:Record<Language,string>={Python:`# annotations.csv: feature_id,compound_id,approved,selected
# approved y selected: 0/1. Solo UN ID aprobado por feature.
# pathways.csv: pathway_id,compound_id, para UNA especie y versión.
import pandas as pd
a=pd.read_csv("annotations.csv",dtype={"feature_id":str,"compound_id":str})
p=pd.read_csv("pathways.csv",dtype=str)
assert a.approved.isin([0,1]).all() and a.selected.isin([0,1]).all()
a=a.loc[a.approved==1].copy()
assert not a.feature_id.duplicated().any(), "Resolver identificaciones ambiguas"
assert a.compound_id.notna().all() and a.compound_id.str.strip().ne("").all()
p=p[["pathway_id","compound_id"]].dropna().drop_duplicates()
linked=a.merge(p,on="compound_id",how="left",validate="many_to_many")
linked.to_csv("features_pathways.csv",index=False)
pd.DataFrame({"compound_id":sorted(set(a.compound_id))}).to_csv("measured_ids.csv",index=False)
pd.DataFrame({"compound_id":sorted(set(a.loc[a.selected==1,"compound_id"]))}).to_csv("selected_ids.csv",index=False)
print("Metabolitos aprobados:",a.compound_id.nunique())
print("Sin ruta:",len(set(a.compound_id)-set(p.compound_id)))
# Adductos/fragmentos del mismo compuesto no cuentan varias veces.
# El código cruza IDs: NO identifica compuestos a partir de m/z.
`,R:`a<-read.csv("annotations.csv",colClasses=c(feature_id="character",compound_id="character"))
p<-read.csv("pathways.csv",colClasses="character")
stopifnot(all(a$approved %in% 0:1),all(a$selected %in% 0:1))
a<-a[a$approved==1,]; stopifnot(!anyDuplicated(a$feature_id),
 all(!is.na(a$compound_id)&nzchar(trimws(a$compound_id))))
p<-unique(na.omit(p[c("pathway_id","compound_id")]))
write.csv(merge(a,p,by="compound_id",all.x=TRUE),"features_pathways.csv",row.names=FALSE)
write.csv(data.frame(compound_id=unique(a$compound_id)),"measured_ids.csv",row.names=FALSE)
write.csv(data.frame(compound_id=unique(a$compound_id[a$selected==1])),"selected_ids.csv",row.names=FALSE)
cat("Sin ruta:",length(setdiff(a$compound_id,p$compound_id)),"\\n")
# Revisar especie, IDs y versión antes de interpretar la unión.
`,MATLAB:`a=readtable('annotations.csv','TextType','string');
p=readtable('pathways.csv','TextType','string');
assert(all(ismember(a.approved,[0 1])) && all(ismember(a.selected,[0 1])));
a=a(a.approved==1,:);
assert(numel(unique(a.feature_id))==height(a));
assert(all(~ismissing(a.compound_id) & strlength(strtrim(a.compound_id))>0));
p=unique(rmmissing(p(:,{'pathway_id','compound_id'})));
linked=outerjoin(a,p,'Keys','compound_id','MergeKeys',true,'Type','left');
writetable(linked,'features_pathways.csv');
writetable(table(unique(a.compound_id),'VariableNames',{'compound_id'}),'measured_ids.csv');
writetable(table(unique(a.compound_id(a.selected==1)),'VariableNames',{'compound_id'}),'selected_ids.csv');
disp('IDs aprobados sin ruta:'); disp(setdiff(a.compound_id,p.compound_id));
`};
export const enrichment:Record<Language,string>={Python:`# ORA hipergeométrica unilateral. No prueba activación de una ruta.
import pandas as pd
from scipy.stats import hypergeom
from statsmodels.stats.multitest import multipletests
U=set(pd.read_csv("measured_ids.csv",dtype=str).compound_id.dropna())
S=set(pd.read_csv("selected_ids.csv",dtype=str).compound_id.dropna())
P=pd.read_csv("pathways.csv",dtype=str).dropna().drop_duplicates()
assert S<=U and 0<len(S)<len(U), "Selección debe ser subconjunto propio del universo"
rows=[]
for route,g in P.groupby("pathway_id"):
 members=set(g.compound_id)&U
 K=len(members); k=len(members&S)
 if 3<=K<=500: # ejemplo, fijar límites antes de ver resultados
  expected=len(S)*K/len(U)
  rows.append([route,K,k,expected,k/expected,
               hypergeom.sf(k-1,len(U),K,len(S)),";".join(sorted(members&S))])
assert rows, "Ninguna ruta cumple los límites de cobertura"
out=pd.DataFrame(rows,columns=["pathway","K","k","expected","fold_enrichment","p","hits"])
out["q_BH"]=multipletests(out.p,method="fdr_bh")[1]
out.sort_values("q_BH").to_csv("enrichment.csv",index=False)
# Incluye rutas con cero hits en la corrección múltiple.
`,R:`U<-unique(na.omit(read.csv("measured_ids.csv",colClasses="character")$compound_id))
S<-unique(na.omit(read.csv("selected_ids.csv",colClasses="character")$compound_id))
P<-unique(na.omit(read.csv("pathways.csv",colClasses="character")))
stopifnot(all(S %in% U),length(S)>0,length(S)<length(U))
rows<-lapply(split(P$compound_id,P$pathway_id),function(ids){
 ids<-intersect(ids,U); K<-length(ids); k<-length(intersect(ids,S))
 if(K<3||K>500) return(NULL)
 expected<-length(S)*K/length(U)
 data.frame(K=K,k=k,expected=expected,fold_enrichment=k/expected,
 p=phyper(k-1,K,length(U)-K,length(S),lower.tail=FALSE))})
rows<-rows[!vapply(rows,is.null,logical(1))]; stopifnot(length(rows)>0)
out<-do.call(rbind,rows); out$pathway<-rownames(out)
out$q_BH<-p.adjust(out$p,"BH")
write.csv(out[order(out$q_BH),],"enrichment.csv",row.names=FALSE)
`,MATLAB:`u=readtable('measured_ids.csv','TextType','string');
s=readtable('selected_ids.csv','TextType','string');
p=unique(rmmissing(readtable('pathways.csv','TextType','string')));
U=unique(rmmissing(u.compound_id)); S=unique(rmmissing(s.compound_id));
assert(all(ismember(S,U)) && numel(S)>0 && numel(S)<numel(U));
routes=unique(p.pathway_id); out=table();
for i=1:numel(routes)
 members=intersect(p.compound_id(p.pathway_id==routes(i)),U);
 K=numel(members); k=numel(intersect(members,S));
 if K<3 || K>500, continue; end
 expected=numel(S)*K/numel(U); fold_enrichment=k/expected;
 pv=hygecdf(k-1,numel(U),K,numel(S),'upper');
 out=[out;table(routes(i),K,k,expected,fold_enrichment,pv,...
 'VariableNames',{'pathway','K','k','expected','fold_enrichment','p'})];
end
assert(height(out)>0,'No hay rutas elegibles');
[sp,idx]=sort(out.p); n=numel(sp);
q=min(1,flipud(cummin(flipud(sp.*n./(1:n)'))));
out.q_BH=zeros(n,1); out.q_BH(idx)=q;
writetable(sortrows(out,'q_BH'),'enrichment.csv');
`};
export const biomarkers:Record<Language,string>={Python:`# features.csv: sample_id,F001,...; biomarker_metadata.csv:
# sample_id,subject_id,label (0=referencia, 1=condición).
# Solo muestras biológicas independientes; retirar blancos/QC previamente.
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold,GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler,FunctionTransformer
from sklearn.feature_selection import VarianceThreshold
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
X=pd.read_csv("features.csv",index_col="sample_id")
m=pd.read_csv("biomarker_metadata.csv",index_col="sample_id")
assert X.index.is_unique and m.index.is_unique and set(X.index)==set(m.index)
m=m.loc[X.index]; y=m.label.to_numpy()
assert m.subject_id.notna().all() and m.subject_id.is_unique, "Usar CV agrupada para medidas repetidas"
assert set(y)=={0,1} and min(np.bincount(y))>=10
assert not np.isinf(X.to_numpy()).any() and (X.fillna(0)>=0).all().all()
pipe=Pipeline([
 ("impute",SimpleImputer(strategy="median",keep_empty_features=True)),
 ("vary",VarianceThreshold()),("log",FunctionTransformer(np.log1p)),
 ("scale",StandardScaler()),
 ("model",LogisticRegression(solver="liblinear",penalty="l1",max_iter=5000,random_state=8))])
outer=StratifiedKFold(5,shuffle=True,random_state=8)
pred=np.zeros(len(y)); counts=pd.Series(0,index=X.columns); metrics=[]
for fold,(train,test) in enumerate(outer.split(X,y)):
 inner=StratifiedKFold(3,shuffle=True,random_state=fold+20)
 search=GridSearchCV(pipe,{"model__C":[0.01,0.1,1,10]},cv=inner,scoring="roc_auc",error_score="raise")
 search.fit(X.iloc[train],y[train])
 pred[test]=search.predict_proba(X.iloc[test])[:,1]
 best=search.best_estimator_
 names=X.columns[best.named_steps["vary"].get_support()]
 selected=names[np.abs(best.named_steps["model"].coef_[0])>1e-8]
 counts.loc[selected]+=1
 metrics.append([fold+1,roc_auc_score(y[test],pred[test]),search.best_params_["model__C"]])
pd.DataFrame(metrics,columns=["fold","auc","C"]).to_csv("nested_cv.csv",index=False)
pd.DataFrame({"label":y,"out_of_fold_probability":pred},index=X.index).to_csv("oof_predictions.csv")
(counts/5).rename("selection_frequency").sort_values(ascending=False).to_csv("candidate_stability.csv")
# Frecuencia de selección: señal de estabilidad, NO p-valor.
# No escoger umbral ni reajustar hiperparámetros mirando estos tests.
# Para lotes/confusores: diseño agrupado y ajuste dentro de cada fold.
# Confirmar candidatos con estándares y cohorte externa independiente.
`,R:`# Cribado univariado con reserva estratificada; dos grupos independientes.
f<-read.csv("features.csv",check.names=FALSE)
m<-read.csv("biomarker_metadata.csv",stringsAsFactors=FALSE)
stopifnot(!anyDuplicated(f$sample_id),!anyDuplicated(m$sample_id),setequal(f$sample_id,m$sample_id))
m<-m[match(f$sample_id,m$sample_id),]
stopifnot(!anyNA(m$subject_id),!anyDuplicated(m$subject_id),setequal(m$label,0:1),min(table(m$label))>=10)
X<-as.matrix(f[,-1]); stopifnot(all(is.finite(X)|is.na(X)),all(X>=0,na.rm=TRUE))
set.seed(8)
train<-unlist(lapply(split(seq_len(nrow(m)),m$label),function(i) sample(i,floor(.7*length(i)))))
test<-setdiff(seq_len(nrow(m)),train); y<-m$label
Z<-log1p(X)
p<-apply(Z[train,,drop=FALSE],2,function(v){
 a<-v[y[train]==0]; b<-v[y[train]==1]
 if(sum(is.finite(a))<3||sum(is.finite(b))<3) return(NA_real_)
 tryCatch(t.test(a,b)$p.value,error=function(e) NA_real_)})
q<-p.adjust(p,"BH")
write.csv(data.frame(feature=colnames(X),p=p,q_BH=q),"training_candidates.csv",row.names=FALSE)
eligible<-which(is.finite(q)&q<.05)
if(!length(eligible)) stop("No hay candidatos con el criterio prefijado; no explorar el test")
j<-eligible[which.min(q[eligible])]
med<-median(Z[train,j],na.rm=TRUE)
direction<-sign(mean(Z[train[y[train]==1],j],na.rm=TRUE)-mean(Z[train[y[train]==0],j],na.rm=TRUE))
score<-Z[test,j]; score[is.na(score)]<-med; score<-direction*score
positive<-score[y[test]==1]; negative<-score[y[test]==0]
auc<-mean(outer(positive,negative,">")+0.5*outer(positive,negative,"=="))
write.csv(data.frame(feature=colnames(X)[j],held_out_auc=auc),"marker_holdout.csv",row.names=FALSE)
# No cambiar candidato, dirección o criterio tras mirar el AUC.
# Esta reserva interna NO es validación externa ni diagnóstico.
`,MATLAB:`% Cribado univariado; una observación por sujeto, dos grupos.
f=readtable('features.csv','VariableNamingRule','preserve');
m=readtable('biomarker_metadata.csv','TextType','string');
assert(numel(unique(string(f.sample_id)))==height(f) && numel(unique(m.sample_id))==height(m));
[ok,idx]=ismember(string(f.sample_id),m.sample_id); assert(all(ok)&&height(f)==height(m)); m=m(idx,:);
assert(all(~ismissing(m.subject_id)) && numel(unique(m.subject_id))==height(m));
y=m.label; assert(isequal(sort(unique(y)),[0;1]) && min([sum(y==0),sum(y==1)])>=10);
X=table2array(f(:,2:end)); assert(all(isfinite(X(:))|isnan(X(:))) && all(X(~isnan(X))>=0));
Z=log1p(X); rng(8); train=[];
for label=0:1
 ids=find(y==label); ids=ids(randperm(numel(ids)));
 train=[train;ids(1:floor(.7*numel(ids)))];
end
test=setdiff((1:height(m))',train); p=nan(size(Z,2),1);
for j=1:size(Z,2)
 a=Z(train(y(train)==0),j); b=Z(train(y(train)==1),j);
 a=a(isfinite(a)); b=b(isfinite(b));
 if min(numel(a),numel(b))>=3, [~,p(j)]=ttest2(a,b,'Vartype','unequal'); end
end
valid=find(isfinite(p)); q=nan(size(p)); [sp,ord]=sort(p(valid)); n=numel(sp);
if n>0, q(valid(ord))=min(1,flipud(cummin(flipud(sp.*n./(1:n)')))); end
names=string(f.Properties.VariableNames(2:end))';
writetable(table(names,p,q),'training_candidates.csv');
eligible=find(q<.05); assert(~isempty(eligible),'No hay candidatos; no explorar el test');
[~,k]=min(q(eligible)); j=eligible(k);
med=median(Z(train,j),'omitnan');
direction=sign(mean(Z(train(y(train)==1),j),'omitnan')-mean(Z(train(y(train)==0),j),'omitnan'));
score=Z(test,j); score(isnan(score))=med; score=direction*score;
a=score(y(test)==1); b=score(y(test)==0);
auc=mean((a>b')+0.5*(a==b'),'all');
writetable(table(names(j),auc,'VariableNames',{'feature','held_out_auc'}),'marker_holdout.csv');
% No reajustar después de ver AUC. Validar en otro conjunto independiente.
`};
