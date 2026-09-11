# -*- coding: utf-8 -*-
"""ALIIB construction model.

   ONE SYSTEM, AND ONLY ONE. There is a single standardization dividend, it
   applies to every hull line equally, and it is PAID FOR EARLY: nothing but
   twenty prototype submarines is laid before 1927, and the money is neither
   banked nor lent between lines -- it is spent on yards, jigs, block halls, the
   hydroformed panel line and one frozen drawing per role. What comes back for
   it is SHARE(y), the fraction of its own tonnage a hull costs, falling from 1
   to a floor as the system comes on stream.

   ⚠ DO NOT RE-ADD a per-line dividend, a learning curve on hull number, or a
   separate post-1935 realisation ramp. Those existed (PREM / R / Pf / U / K /
   CVDIV) and were replaced by this one curve at the user's order, because four
   interacting knobs could not be reasoned about and this one can."""
import math
share={'CV':189300,'CL':147200,'DDDE':98800,'SS':75000}
tot=sum(share.values()); share={k:v/tot for k,v in share.items()}
# ⚠ STANDARD DISPLACEMENTS ARE THE PLATFORM CATALOG'S, TO THE TON. The catalog owns specifications
# and this table mirrors it; a divergence here is a divergence in canon, because the road's treaty
# ledger is computed from these numbers. ⚠ THEY ARE ALSO A PRICE: the purse is fixed, so changing a
# displacement changes the FLEET. Syncing CV 23,700 -> 23,990 and SS 1,800 -> 1,600 moved END 1935
# from CV 6 - SS 24 to CV 5 - SS 28. Never edit one without re-emitting and re-syncing the canon.
DISP={'CV':23990,'CL':7540,'DD':2970,'DE':1220,'SS':1600,'PROTO':1100}
OPEN={'CV':1932,'CL':1929,'DD':1932,'DE':1932,'SS':1933,'PROTO':1925}
# ⚠ OPEN[t] IS THE YEAR THE FIRST HULL OF THAT LINE COMMISSIONS, and it equals the
# class's Type year, because conventions §2.2 defines a Japanese type number as the
# year of introduction. BUILD[t] is keel-to-commissioning, so the KEELS go down
# OPEN[t]-BUILD[t]. Nothing in this model is laid and commissioned in one year, and
# a road file that says otherwise has put the wrong event on the date.
BUILD={'CV':3,'CL':2,'DD':2,'DE':1,'SS':2,'PROTO':1}
SS_LINE=1933   # the year the prototype boats stop and the I-series starts

DIV_LAST_FULL=1930   # a hull costs its full tonnage through this year
DIV_STEP=0.10        # then a tenth off every year
DIV_FLOOR=0.40       # until the floor, which is reached in 1936 and never left
def SHARE(y):
    """Fraction of its own tonnage the marginal hull costs, any class, any year.
       1.0 to 1930 - 0.9 in 1931 - 0.8, 0.7, 0.6, 0.5 - 0.4 from 1936 for good."""
    return max(DIV_FLOOR, 1.0 - DIV_STEP*max(0, y-DIV_LAST_FULL))
def cost(t,n,y): return DISP[t]*SHARE(y)

def run(ANN,end=1950):
    built={t:0 for t in DISP}; carry={t:0.0 for t in DISP}; rows=[]
    for y in range(1925,end+1):
        a={'CV':share['CV'],'CL':share['CL'],'DD':share['DDDE']*0.70,'DE':share['DDDE']*0.30,
           'SS':share['SS'],'PROTO':0.0}
        if y<SS_LINE: a['PROTO']=a['SS']; a['SS']=0.0
        for t in ('DD','DE'):
            if y<OPEN[t]: a['CL']+=a[t]; a[t]=0.0
        got={t:0 for t in DISP}
        for t,frac in a.items():
            if frac==0 or y<OPEN[t] or (t=='PROTO' and (y>=SS_LINE or built['PROTO']>=20)): continue
            purse=ANN*frac+carry[t]
            while True:
                if t=='PROTO' and built['PROTO']>=20: break
                c=cost(t,built[t]+1,y)
                if purse>=c: purse-=c; built[t]+=1; got[t]+=1
                else: break
            carry[t]=purse
        rows.append((y,dict(got),dict(built)))
    return rows
def tons(b): return sum(b[t]*DISP[t] for t in ('CV','CL','DD','DE','SS'))
def keels_in(rows,y):
    """Hulls whose keel goes down in year y: everything commissioning in y+BUILD[t]."""
    out={}
    for t in DISP:
        n=sum(g[t] for yy,g,_ in rows if yy==y+BUILD[t])
        if n: out[t]=n
    return out
def ways(rows,y):
    """Laid but not yet commissioned at the end of year y."""
    out={}
    for t in DISP:
        laid=sum(g[t] for yy,g,_ in rows if yy-BUILD[t]<=y)
        done=sum(g[t] for yy,g,_ in rows if yy<=y)
        if laid-done: out[t]=laid-done
    return out

# --- emit ------------------------------------------------------------------
# The model is the arbiter of every hull count in the Japanese canon, and it
# used to read and write nothing in data/. Emitting its own output makes the
# counts checkable: tools/validate.py compares the pack's aggregates against
# this file and refuses a figure the model does not produce. ROWS ARE
# END-OF-YEAR — a mid-year figure must lie between the previous year-end and
# that year-end, and quoting a later year's figure for an earlier year is the
# commonest arithmetic error in this project.
EMIT='data/derived/jp_build_model.json'
def emit(ANN=59200,end=1950,path=EMIT):
    import json,os
    rows=run(ANN,end)
    os.makedirs(os.path.dirname(path),exist_ok=True)
    out={
      "$generated_by":"build_model.py",
      "note":"ROWS ARE END-OF-YEAR. Do not hand-edit: regenerate with `python build_model.py --emit`.",
      "scenario":"as-long-as-its-black",
      "nation":"JPN",
      "envelope_t_equiv_yr":ANN,
      "dividend":{"last_full_year":DIV_LAST_FULL,"step_per_year":DIV_STEP,"floor":DIV_FLOOR,
                  "share_by_year":{str(y):round(SHARE(y),4) for y in range(1925,1951)}},
      "displacements_t":DISP,
      "line_opens_first_commission":OPEN,
      "build_years_keel_to_commission":BUILD,
      "years":[{"year":y,"commissioned":g,"end_of_year":b,"keels_laid":keels_in(rows,y),
                "on_the_ways":ways(rows,y),"fleet_tons":tons(b)} for y,g,b in rows],
    }
    with open(path,'w',encoding='utf-8',newline='\n') as f:
        json.dump(out,f,indent=1,ensure_ascii=False); f.write('\n')
    return path

if __name__=='__main__':
    import sys
    if '--emit' in sys.argv:
        print("wrote", emit()); raise SystemExit(0)
    # Flat construction envelope, t-equiv/yr. Near Japan's historical combatant
    # envelope once the reconstruction and auxiliary shares are freed: 11 yrs =
    # 651,200 against 401,746 t of historical launchings, the difference being
    # allocation (no battleship reconstructions, no purpose-built auxiliaries).
    # Stated, not searched: 1935 tonnage is flat across 58,700-59,300.
    ANN=59200
    rows=run(ANN)
    f=[r for r in rows if r[0]==1935][0][2]
    print("annual envelope %s t-equiv/yr  (11 yrs = %s)  -> end-1935 %s t delivered"%(
        format(ANN,','),format(ANN*11,','),format(tons(f),',')))
    print("END 1935: CV %d · CL %d · DD %d · DE %d · SS %d · proto %d"%(
        f['CV'],f['CL'],f['DD'],f['DE'],f['SS'],f['PROTO']))
    for y in (1928,1930,1933,1934):
        b=[r for r in rows if r[0]==y][0][2]
        print("   %d: CV %d CL %d DD %d"%(y,b['CV'],b['CL'],b['DD']))
    print()
    print("| Year | CV | CL | DD | DE | SS | fleet total |")
    for y,g,b in rows:
        print("| %d | %d | %d | %d | %d | %d | CV %d · CL %d · DD %d · DE %d · SS %d |"%(
            y,g['CV'],g['CL'],g['DD'],g['DE'],g['SS'],b['CV'],b['CL'],b['DD'],b['DE'],b['SS']))
