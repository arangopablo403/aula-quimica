export type ReactomeEntity={dbId?:number;stId?:string;displayName:string;schemaClass?:string;name?:string[]};
export type ReactomeRecord=ReactomeEntity&{speciesName?:string;stIdVersion?:string;isInferred?:boolean;hasEvent?:ReactomeEntity[];input?:ReactomeEntity[];output?:ReactomeEntity[];catalystActivity?:ReactomeEntity[];compartment?:ReactomeEntity[]};
export const glycolysisSteps=[
 ['R-HSA-70420','Activación de la glucosa','Hexoquinasas / glucoquinasa','La glucosa recibe un fosfato; participa ATP.'],
 ['R-HSA-70471','Reorganización de la glucosa-6-fosfato','Fosfoglucosa isomerasa','Se forma fructosa-6-fosfato sin cambiar el número de carbonos.'],
 ['R-HSA-70467','Segunda fosforilación','Fosfofructoquinasa','Participa ATP y se forma fructosa-1,6-bisfosfato.'],
 ['R-HSA-71496','División en dos triosas','Aldolasa','La molécula de seis carbonos se divide en dos de tres.'],
 ['R-HSA-70454','Interconversión de triosas','Triosa-fosfato isomerasa','La dihidroxiacetona-fosfato puede convertirse en gliceraldehído-3-fosfato.'],
 ['R-HSA-70449','Oxidación del gliceraldehído','Gliceraldehído-3-fosfato deshidrogenasa','Participan NAD⁺ y fosfato; se genera NADH.'],
 ['R-HSA-71850','Primera formación de ATP','Fosfoglicerato quinasa','Un fosfato se transfiere al ADP para formar ATP.'],
 ['R-HSA-71654','Reubicación del fosfato','Fosfoglicerato mutasa','El 3-fosfoglicerato se transforma en 2-fosfoglicerato.'],
 ['R-HSA-71660','Formación de fosfoenolpiruvato','Enolasa','Se elimina agua del 2-fosfoglicerato.'],
 ['R-HSA-71670','Formación de piruvato y ATP','Piruvato quinasa','El fosfoenolpiruvato transfiere un fosfato al ADP.'],
];
export function stepInfo(id?:string){return glycolysisSteps.find(s=>s[0]===id)}
export function entityLabel(entity:ReactomeEntity){
 const match=/^(.*?)\s*\[([^\]]+)\]$/.exec(entity.displayName);
 const original=match?.[1]||entity.displayName;
 const names:Record<string,string>={Glc:'Glucosa',G6P:'Glucosa-6-fosfato','Fru(6)P':'Fructosa-6-fosfato',F6P:'Fructosa-6-fosfato','F1,6PP':'Fructosa-1,6-bisfosfato',DHAP:'Dihidroxiacetona-fosfato',GA3P:'Gliceraldehído-3-fosfato','1,3BPG':'1,3-bisfosfoglicerato','3PG':'3-fosfoglicerato','2PG':'2-fosfoglicerato',PEP:'Fosfoenolpiruvato',PYR:'Piruvato',Pi:'Fosfato inorgánico','H2O':'Agua','H+':'Protón (H⁺)','NAD+':'NAD⁺',ATP:'ATP',ADP:'ADP',NADH:'NADH'};
 return {label:names[original]||original,original,compartment:match?.[2]==='cytosol'?'Citosol':match?.[2]};
}
export function equationName(record:ReactomeRecord){return record.name?.find(n=>/(<=>|=>|<->|->|⇌|→)/.test(n))}
