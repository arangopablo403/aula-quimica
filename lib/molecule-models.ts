type Atom=[string,number,number,number];
type Bond=[number,number,number];
export type Molecule={name:string;note:string;atoms:Atom[];bonds:Bond[]};
export const molecules:Record<string,Molecule>={
 water:{name:'Agua · H₂O',note:'Geometría angular, aproximadamente 104,5°.',atoms:[['O',0,0,0],['H',-.79,.61,0],['H',.79,.61,0]],bonds:[[0,1,1],[0,2,1]]},
 carbon:{name:'Dióxido de carbono · CO₂',note:'Geometría lineal; dos enlaces dobles.',atoms:[['C',0,0,0],['O',-1.2,0,0],['O',1.2,0,0]],bonds:[[0,1,2],[0,2,2]]},
 methane:{name:'Metano · CH₄',note:'Geometría tetraédrica, aproximadamente 109,5°.',atoms:[['C',0,0,0],['H',.7,.7,.7],['H',-.7,-.7,.7],['H',-.7,.7,-.7],['H',.7,-.7,-.7]],bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]},
 ammonia:{name:'Amoniaco · NH₃',note:'Geometría piramidal trigonal. El par libre no se representa.',atoms:[['N',0,-.3,0],['H',0,.55,1],['H',-.86,.55,-.5],['H',.86,.55,-.5]],bonds:[[0,1,1],[0,2,1],[0,3,1]]},
 oxygen:{name:'Oxígeno · O₂',note:'Molécula diatómica. Modelo de enlace doble; no muestra orbitales ni electrones desapareados.',atoms:[['O',-.65,0,0],['O',.65,0,0]],bonds:[[0,1,2]]},
 nitrogen:{name:'Nitrógeno · N₂',note:'Molécula diatómica con enlace triple.',atoms:[['N',-.6,0,0],['N',.6,0,0]],bonds:[[0,1,3]]},
 hydrogen:{name:'Hidrógeno · H₂',note:'Molécula diatómica con enlace sencillo.',atoms:[['H',-.5,0,0],['H',.5,0,0]],bonds:[[0,1,1]]},
 hcl:{name:'Cloruro de hidrógeno · HCl',note:'Molécula polar con enlace covalente. No representa su disociación en agua.',atoms:[['H',-.6,0,0],['Cl',.6,0,0]],bonds:[[0,1,1]]},
 ethene:{name:'Eteno · C₂H₄',note:'Molécula plana con enlace doble C=C y geometría trigonal plana en cada carbono.',atoms:[['C',-.6,0,0],['C',.6,0,0],['H',-1.2,-.8,0],['H',-1.2,.8,0],['H',1.2,-.8,0],['H',1.2,.8,0]],bonds:[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]]},
 ethyne:{name:'Etino · C₂H₂',note:'Geometría lineal; enlace triple entre carbonos.',atoms:[['C',-.55,0,0],['C',.55,0,0],['H',-1.5,0,0],['H',1.5,0,0]],bonds:[[0,1,3],[0,2,1],[1,3,1]]},
 ethanol:{name:'Etanol · C₂H₆O',note:'Conformación ilustrativa de un alcohol. Los ángulos son esquemáticos, no una geometría optimizada.',atoms:[['C',-.8,0,0],['C',.4,.25,0],['O',1.35,-.35,0],['H',1.9,.1,0],['H',-1.3,-.6,.5],['H',-1.3,.7,.4],['H',-.85,-.1,-.9],['H',.4,1,.55],['H',.45,.65,-.8]],bonds:[[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1]]},
 benzene:{name:'Benceno · C₆H₆',note:'Anillo plano aromático. Los enlaces alternados son una representación de Kekulé; los electrones π están deslocalizados.',atoms:[...Array.from({length:6},(_,i)=>['C',Math.cos(i*Math.PI/3),Math.sin(i*Math.PI/3),0] as Atom),...Array.from({length:6},(_,i)=>['H',1.65*Math.cos(i*Math.PI/3),1.65*Math.sin(i*Math.PI/3),0] as Atom)],bonds:[...Array.from({length:6},(_,i)=>[i,(i+1)%6,i%2?1:2] as Bond),...Array.from({length:6},(_,i)=>[i,i+6,1] as Bond)]}
};
