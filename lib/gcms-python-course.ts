export const gcmsReader=String.raw`"""Taller GC-MS: TIC y EIC desde mzML MS1 centroidado.
No identifica compuestos ni deconvoluciona picos. No modifica el original.
Demo: python gcms_taller.py --demo --out demo_gcms
Real: python gcms_taller.py muestra.mzML --mz 93 --tol 0.5 --out muestra_01
La tolerancia es absoluta en unidades de m/z; ajustarla al instrumento.
"""
import argparse
import csv
import json
import math
from pathlib import Path

def minutes(value):
    unit = str(getattr(value, "unit_info", "")).lower()
    if unit in ("minute", "minutes", "uo:0000031"):
        return float(value)
    if unit in ("second", "seconds", "uo:0000010"):
        return float(value) / 60
    raise ValueError("Unidad de tiempo ausente o desconocida; revisar el mzML.")

def chromatograms(spectra, target, tolerance):
    rows = []
    for s in spectra:
        if s.get("ms level") != 1:
            continue
        if "centroid spectrum" not in s:
            raise ValueError("Esta plantilla requiere MS1 centroidado, no perfil.")
        rt = minutes(s["scanList"]["scan"][0]["scan start time"])
        masses, intensities = s["m/z array"], s["intensity array"]
        if len(masses) != len(intensities) or not len(masses):
            raise ValueError("Espectro vacío o matrices de distinta longitud.")
        pairs = [(float(m), float(v)) for m, v in zip(masses, intensities)]
        if not math.isfinite(rt) or rt < 0 or any(not math.isfinite(m) or not math.isfinite(v) or v < 0 for m,v in pairs):
            raise ValueError("Datos no finitos, tiempo negativo o intensidad negativa.")
        tic = sum(v for m,v in pairs)
        eic = sum(v for m,v in pairs if abs(m-target) <= tolerance)
        if rows and rt <= rows[-1][0]:
            raise ValueError("Tiempos MS1 repetidos o no crecientes; revisar adquisición.")
        rows.append((rt, tic, eic))
    if len(rows) < 3:
        raise ValueError("Se necesitan al menos tres espectros MS1.")
    return rows

def save(rows, out, provenance):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=False) # No sobrescribir resultados existentes.
    with (out/"cromatogramas.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.writer(f); w.writerow(["rt_min","tic","eic"]); w.writerows(rows)
    (out/"parametros.json").write_text(json.dumps(provenance,indent=2,ensure_ascii=False),encoding="utf-8")
    maximum=max(r[2] for r in rows)
    start,end=rows[0][0],rows[-1][0]
    points=" ".join(f"{50+800*(t-start)/(end-start):.2f},{300-250*v/(maximum or 1):.2f}" for t,_,v in rows)
    title="EIC SIMULADO" if provenance["demo"] else "EIC extraído del mzML"
    (out/"eic.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 360"><rect width="900" height="360" fill="white"/><text x="50" y="25">{title} · m/z {provenance["mz"]}</text><path d="M50 40V300H860" fill="none" stroke="black"/><polyline points="{points}" fill="none" stroke="teal" stroke-width="2"/><text x="50" y="325">{start:.2f} min</text><text x="770" y="325">{end:.2f} min</text><text x="300" y="350">Tiempo de retención · Intensidad relativa</text></svg>',encoding="utf-8")
    print("Resultados:",out.resolve())

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("file",nargs="?")
    p.add_argument("--demo",action="store_true")
    p.add_argument("--mz",type=float,default=93)
    p.add_argument("--tol",type=float,default=.5)
    p.add_argument("--out",required=True)
    a=p.parse_args()
    if not math.isfinite(a.mz) or a.mz<=0 or not math.isfinite(a.tol) or a.tol<=0:
        p.error("m/z y tolerancia deben ser positivos y finitos.")
    if a.demo and a.file:
        p.error("Elige demo o archivo, no ambos.")
    if a.demo:
        rows=[(i/20,100+1200*math.exp(-.5*((i/20-3)/.2)**2),20+600*math.exp(-.5*((i/20-3)/.2)**2)) for i in range(121)]
    else:
        if not a.file:
            p.error("Indica un archivo mzML o --demo.")
        from pyteomics import mzml
        with mzml.MzML(a.file) as reader:
            rows=chromatograms(reader,a.mz,a.tol)
    save(rows,a.out,{"input":a.file,"demo":a.demo,"mz":a.mz,"tolerance_absolute":a.tol,"rt_unit":"min","method":"Suma de intensidades centroidadas MS1; sin deconvolución ni identificación"})

if __name__=="__main__":
    main()
`;
