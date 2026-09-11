# -*- coding: utf-8 -*-
"""Catalog-vs-JSON cross-check. Splits sections CORRECTLY (2 capture groups -> stride 3,
   body is parts[i+3]) and reports coverage as well as mismatches."""
import re,io,json,sys,math
ADVISE=[]
PAIRS=[('docs/hindsight/uk-fishers-ghost-platform-catalog.md','data/ships/hindsight/uk_fishers_ghost_pack.json'),
       ('docs/hindsight/jp-as-long-as-its-black-platform-catalog.md','data/ships/hindsight/jp_as_long_as_its_black_pack.json'),
       ('docs/hindsight/us-five-term-tillman-platform-catalog.md','data/ships/hindsight/us_five_term_tillman_pack.json'),
       ('docs/hindsight/de-nothing-above-water-platform-catalog.md','data/ships/hindsight/de_nothing_above_water_pack.json')]
def num(x): return float(x.replace(',','').replace('~','').strip())
issues=0; checks=0; covered=0; uncovered=[]
def eq(nm,label,a,b,tol=0.0):
    global issues,checks
    checks+=1
    if abs(float(a)-float(b))>tol:
        print(f"  MISMATCH {nm:22s} {label:22s} catalog {a}  json {b}"); issues+=1
for md,js in PAIRS:
    s=io.open(md,encoding='utf-8').read(); d=json.load(io.open(js,encoding='utf-8'))
    parts=re.split(r'(?m)^### (\d+\.\d+) (.+)$', s)
    secs=[(parts[i+2],parts[i+3]) for i in range(0,len(parts)-3,3)]
    byname={}
    for c in d.get('classes',[]): byname[c['name'].split(' class')[0].lower()]=('ship',c)
    for a in d.get('aircraft',[]):  byname[a['name'].lower()]=('air',a)
    print(f"\n### {md.split('/')[-1]}  ({len(secs)} sections)")
    for title,body in secs:
        nm=re.split(r'[—(]',title)[0].strip(); key=nm.lower().replace(' class','')
        # ⚠ THE AIRCRAFT HEADINGS USE AN EM DASH THE JSON NAMES DO NOT: 'F1 — carrier fighter (1933)'
        # against 'F1 carrier fighter'. Splitting on the dash left key='f1', which matched nothing, so
        # ALL THREE AMERICAN AEROPLANES WERE SILENTLY UNCOVERED and read as a clean bill. Fall back to
        # the whole heading with the dash and the year removed before giving up.
        if key not in byname:
            alt=re.sub(r'\s*\([^)]*\)\s*$','',title).replace('—',' ')
            alt=re.sub(r'\s+',' ',alt).strip().lower().replace(' class','')
            if alt in byname: key=alt
        if key not in byname: uncovered.append(nm); continue
        covered+=1; kind,o=byname[key]
        def cell(l):
            m=re.search(r'(?m)^\| '+re.escape(l)+r' \| (.+?) \|\s*$', body); return m.group(1) if m else None
        if kind=='air':
            r=cell('Weights')
            if r:
                m=re.search(r'([\d,]+) kg empty / ([\d,]+) normal / ([\d,]+) max',r)
                if m:
                    for k,v in zip(('empty_kg','normal_kg','max_kg'),m.groups()): eq(nm,'w.'+k,num(v),o['weights'][k])
            r=cell('Climb / ceiling')
            if r:
                m=re.search(r'([\d.]+) m/s · ([\d,]+) m',r)
                if m:
                    eq(nm,'climb_ms',num(m.group(1)),o['performance']['climb_ms'],0.05)
                    eq(nm,'ceiling_m',num(m.group(2)),o['performance']['ceiling_m'],1)
            for lab in ('Fuel / endurance / range','Fuel / endurance'):
                r=cell(lab)
                if not r: continue
                m=re.search(r'([\d,]+) L internal',r);  eq(nm,'internal_l',num(m.group(1)),o['fuel']['internal_l']) if m else None
                m=re.search(r'~?([\d.]+) h',r);         eq(nm,'endurance_h',num(m.group(1)),o['fuel']['endurance_h'],0.05) if m else None
                m=re.search(r'ferry ([\d,]+) km / combat ([\d,]+) km',r)
                if m:
                    eq(nm,'ferry_km',num(m.group(1)),o['fuel']['ferry_km']); eq(nm,'combat_km',num(m.group(2)),o['fuel']['combat_radius_km'])
                m=re.search(r'ferry ~?([\d,]+) km / combat ~?([\d,]+) km\s*\|?\s*$',r)
                if m and 'with_tank' in o['fuel']:
                    eq(nm,'tank.ferry',num(m.group(1)),o['fuel']['with_tank']['ferry_km']); eq(nm,'tank.combat',num(m.group(2)),o['fuel']['with_tank']['combat_radius_km'])
            r=cell('Cost / durability')
            if r:
                m=re.search(r'([\d,]+) gold · ([\d,]+)',r)
                if m: eq(nm,'cost_gold',num(m.group(1)),o['cost_gold']); eq(nm,'durability',num(m.group(2)),o['durability'])
            r=cell('Dimensions')
            if r:
                m=re.search(r'wing ([\d.]+) m²',r); eq(nm,'wing_m2',num(m.group(1)),o['dimensions']['wing_area_m2'],0.01) if m else None
                m=re.search(r'footprint ([\d,]+) m²',r); eq(nm,'footprint',num(m.group(1)),o['dimensions']['hangar_footprint_m2'],0.01) if m else None
                m=re.search(r'Span ([\d.]+) m',r); eq(nm,'span_m',num(m.group(1)),o['dimensions']['span_m'],0.01) if m else None
                m=re.search(r'folds ([\d.]+)',r)
                if m and 'span_folded_m' in o['dimensions']: eq(nm,'span_folded_m',num(m.group(1)),o['dimensions']['span_folded_m'],0.01)
                m=re.search(r'length ([\d.]+) m',r); eq(nm,'length_m',num(m.group(1)),o['dimensions']['length_m'],0.01) if m else None
            # SPEEDS: every figure printed in the Speed row must appear in the JSON, and vice versa
            r=cell('Speed')
            if r and o.get('performance',{}).get('speed_kmh'):
                cat=sorted(num(x) for x in re.findall(r'(?<![\d.])([\d,]{3,5})(?= km/h| at | with | clean|\b)',r)
                           if 900<=num(x)<=1200 or 100<=num(x)<=900)
                jsn=sorted(float(v) for v in o['performance']['speed_kmh'].values())
                checks+=1
                if cat!=jsn:
                    print(f"  MISMATCH {nm:22s} {'speed_kmh set':22s} catalog {cat}  json {jsn}"); issues+=1
            # APPROACH: printed in the Crew systems row
            r=cell('Crew systems')
            if r and o.get('performance',{}).get('approach_kmh'):
                m=re.search(r'approach ([\d,]+) km/h',r)
                if m: eq(nm,'approach_kmh',num(m.group(1)),o['performance']['approach_kmh'],0.01)
            # ADVISORY: conventions 8 -- approach = 1.15 x the BARE STALL at NORMAL weight,
            # CLmax from the high-lift device the Equipment row names. Drift is reported, not failed.
            pa=o.get('performance',{}).get('approach_kmh'); Sw=o['dimensions'].get('wing_area_m2')
            if pa and Sw:
                txt=((cell('Equipment') or '')+' '+' '.join(o.get('features',[]))).lower()
                if o['dimensions'].get('sweep_deg'): cl=1.9
                elif 'slat' in txt and 'fowler' in txt: cl=2.4
                elif 'fowler' in txt: cl=2.25
                elif 'slat' in txt: cl=1.95
                elif 'slotted' in txt: cl=1.85
                else: cl=1.55
                law=1.15*math.sqrt(2*o['weights']['normal_kg']*9.81/(1.225*Sw*cl))*3.6
                if abs(law-pa)>3: ADVISE.append(f"  ADVISORY {nm:22s} approach {pa} printed vs {law:.0f} by law (CLmax {cl})")
            # THE LAW: combat radius = ferry / 3
            f=o['fuel']
            for blk,lb in ((f,'internal'),(f.get('with_tank'),'with_tank')):
                if blk and blk.get('ferry_km') and blk.get('combat_radius_km'):
                    checks+=1
                    if abs(blk['combat_radius_km']-blk['ferry_km']/3)>max(2.0,blk['ferry_km']/3*0.02):
                        print(f"  MISMATCH {nm:22s} {lb+' ferry/3':22s} {blk['ferry_km']}/3 != {blk['combat_radius_km']}"); issues+=1
        else:
            r=cell('Displacement')
            if r:
                m=re.search(r'([\d,]+) t empty / ([\d,]+) t standard / ([\d,]+) t full',r)
                if m:
                    for k,v in zip(('empty_tons','standard_tons','full_load_tons'),m.groups()): eq(nm,'disp.'+k,num(v),o['displacement'][k])
            r=cell('Dimensions')
            if r:
                m=re.search(r'Length ([\d,.]+) m · beam ([\d.]+) m · draft ([\d.]+) m',r)
                if m:
                    for k,v in zip(('length_m','beam_m','draft_m'),m.groups()): eq(nm,'dim.'+k,num(v),o['dimensions'][k],0.01)
            r=cell('Cost / durability')
            if r:
                m=re.search(r'([\d,]+) gold · ([\d,]+)',r)
                if m: eq(nm,'cost_gold',num(m.group(1)),o['cost_gold']); eq(nm,'durability',num(m.group(2)),o['durability'])
            r=cell('Crew')
            if r:
                m=re.match(r'^([\d,]+)$',r.strip())
                if m and 'complement' in o: eq(nm,'complement',num(m.group(1)),o['complement'])
            r=cell('Machinery')
            if r and 'propulsion' in o:
                m=re.search(r'([\d,]+) shp · ([\d.]+) kt',r)
                if m: eq(nm,'shp',num(m.group(1)),o['propulsion']['shp']); eq(nm,'speed_kn',num(m.group(2)),o['propulsion']['speed_kn'],0.01)
            # ⚠ WHAT A WARSHIP IS ARMED WITH WAS NOT CROSS-CHECKED ON ANY OF 119 CLASSES. Displacement,
            # dimensions, cost, crew and machinery were all compared and the batteries were not, so a
            # carrier could carry twelve mounts in the data and none on her sheet and read as a clean
            # bill -- which is exactly what happened. The mount count, the per-gun allowance and the
            # firing time are printed on the row AND held in the battery entry, so they are checkable.
            # ⚠ A ROW THAT DOES NOT PARSE IS SKIPPED, NEVER GUESSED AT -- a "None as launched" line or
            # an unusual arrangement produces no finding. This check may not invent one.
            # ⚠ A PROVISION IS A FITTING FOR EQUIPMENT THAT IS NOT INSTALLED. The pack models the
            # hull's WHOLE interface list -- the schema says so in as many words, "including the ones
            # with nothing in them" -- and marks each one fitted or not. The catalog's Provisions row
            # was printing the occupied ones too, so the Seeadler advertised barbette rings, director
            # trunnions and a catapult foundation that her own sheet fills three rows higher up.
            # An interface the data reports FULLY FITTED may not appear in that row.
            prov=cell('Provisions')
            if prov and o.get('provisions'):
                occ=[x for x in o['provisions']
                     if x.get('state')=='fitted' and x.get('fitted',0)>=x.get('count',0)]
                # the interface key is snake_case; match its words against the printed row
                for x in occ:
                    words=[w for w in x['interface'].split('_') if len(w)>3]
                    if words and all(w in prov.lower() for w in words):
                        checks+=1
                        print(f"  MISMATCH {nm:22s} {'provision fitted':22s} row prints '{x['interface']}' which the data reports fitted"); issues+=1
            for lab,role in (('Main battery','main'),('Secondary battery','secondary'),
                             ('Light AA','light_aa'),('Torpedoes','torpedo')):
                r=cell(lab)
                bat=next((b for b in o.get('batteries',[]) if b.get('role')==role),None)
                if not r or not bat: continue
                m=re.match(r'\s*(\d+) × ',r)
                if m and 'mounts' in bat: eq(nm,role+'.mounts',num(m.group(1)),bat['mounts'])
                m=re.search(r'([\d,]+) rpg',r)
                if m and 'rounds_per_gun' in bat: eq(nm,role+'.rpg',num(m.group(1)),bat['rounds_per_gun'])
                m=re.search(r'([\d,.]+) min\b',r)
                if m and 'firing_time_min' in bat: eq(nm,role+'.min',num(m.group(1)),bat['firing_time_min'],0.05)
    print(f"  covered {covered} so far · checks {checks} · mismatches {issues}")
if ADVISE:
    print("\nAPPROACH-LAW ADVISORIES (conventions 8; not build failures):")
    [print(x) for x in ADVISE]
print(f"\nCOVERED SECTIONS: {covered}   FIELD CHECKS RUN: {checks}   MISMATCHES: {issues}")
print("uncovered (prose-only or aggregate sections):",uncovered)
sys.exit(1 if issues else 0)
