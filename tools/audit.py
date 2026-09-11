# -*- coding: utf-8 -*-
"""WNT1922 full audit — every check mechanical, re-runnable, and tuned to fire only on
   things that are DETERMINABLE. A check that cannot distinguish a defect from ordinary
   prose does not belong here; the first draft of this file flagged 'Article 190' and
   '73 per cent better' as stale figures and had to be thrown away.
     A. notes that CONTRADICT a live field   B. header shape   C. aircraft derivation law
     D. register shape and voice             E. version/status hygiene
     G. equipment header year vs its codes   H. orthography per nation (conventions 1.1)
     I. section numbering continuity         J. spec-sheet row order vs the 7 templates
     K. prose fleet counts vs data/derived   L. air capacity as a derivation
     M. argument artifacts, rule 43          F. model-validity guard (advisory, always on)
   H, I, J and K exist because four whole classes of defect were invisible to every tool in
   the project: nothing read prose for spelling, nothing read a heading number, nothing read
   the ORDER of spec rows, and nothing held a scenario's prose to the build model that
   validate.py already holds its pack to. Each is negative-tested; a check that finds nothing
   looks exactly like a corpus that is clean, so do not trust a silent check you have not
   deliberately broken.
   Exit 1 on any HARD finding. Advisories never fail the build."""
import re,io,json,glob,math,sys
from pathlib import Path
HARD=[]; SOFT=[]
def hard(c,m): HARD.append((c,m))
def soft(c,m): SOFT.append((c,m))
def n(x): return float(str(x).replace(',',''))

def _json_prose(path):
    """Every human-readable STRING VALUE in a data file, with its dotted path.
    ⚠ KEYS AND IDENTIFIERS ARE SKIPPED. `caliber_in`, `torpedo_defense` and `centerline` are schema
    field names and code ids: they are spelled the way the schema spells them in every nation's file,
    and 'correcting' one breaks the data. Only prose values are scanned."""
    try: doc=json.load(io.open(path,encoding='utf-8'))
    except Exception: return []
    out=[]
    def walk(o,pth):
        if isinstance(o,dict):
            for k,v in o.items(): walk(v,pth+'.'+k)
        elif isinstance(o,list):
            for i,v in enumerate(o): walk(v,pth+f'[{i}]')
        elif isinstance(o,str):
            if len(o.split())>2 and not re.fullmatch(r'[A-Za-z0-9_.\-/]+',o): out.append((pth,o))
    walk(doc,''); return out

# ---------- A. a notes field that CONTRADICTS a live field of the same object ----------
# Absence proves nothing (treaty articles, percentages, dates all live legitimately in prose).
# Contradiction proves everything: the object carries the field AND the note names it differently.
# km/h is NOT mapped: a note may legitimately name a top speed, a torpedo speed or a
# limiting speed, and there is no way to tell which from the text. Only quantities with
# ONE meaning are checkable. 'kg/hp' (bsfc) is excluded for the same reason.
#   ⚠ kg is NOT single-meaning either, and pretending it was produced four false positives in
# one pass (a 675 kg crutch rating, a 405 kg catapult margin, a 550 kg comparison delta). The
# fix is NEIGHBOURHOOD, not deletion: A STALE WEIGHT IS STILL A WEIGHT, so a survivor from an
# older sheet sits CLOSE to the live figure it replaced -- a few per cent, never a factor of
# three. A figure far outside the live range is a different quantity, not a contradiction.
# NEAR is therefore the gate: within NEAR_BAND of some live field, yet matching none of them.
UNIT={'kg':[('weights','empty_kg'),('weights','normal_kg'),('weights','max_kg'),
            ('weights','max_alt_gear_kg')],
      'L'  :[('fuel','internal_l')],
      'm²' :[('dimensions','wing_area_m2'),('dimensions','hangar_footprint_m2')],
      'm2' :[('dimensions','wing_area_m2'),('dimensions','hangar_footprint_m2')],
      'h'  :[('fuel','endurance_h')]}
for p in sorted(glob.glob('data/**/*.json',recursive=True)):
    if '/schema/' in p or '/derived/' in p: continue
    d=json.load(io.open(p,encoding='utf-8'))
    def walk(o):
        if isinstance(o,dict):
            note=o.get('notes')
            if isinstance(note,str):
                nm=o.get('name') or o.get('id') or o.get('code') or '?'
                for m in re.finditer(r'(\d[\d,]*(?:\.\d+)?)\s*(kg|L|m²|m2|h)\b(?!/(?:hp|m))',note):
                    val,u=n(m.group(1)),m.group(2)
                    for sec,key in UNIT.get(u,[]):
                        live=(o.get(sec) or {}).get(key)
                        if live is None: continue
                        # fires only when the note names a value of this kind that no live
                        # field of this kind matches -- i.e. a survivor from an older sheet --
                        # AND sits near enough to one to be that field rather than another
                        # quantity that happens to share the unit.
                        cands=[(o.get(s) or {}).get(k) for s,k in UNIT[u]]
                        cands=[c for c in cands if c is not None]
                        NEAR_BAND=0.25
                        near=any(abs(val-c)<=c*NEAR_BAND for c in cands)
                        if cands and near and all(abs(val-c)>max(2,c*0.02) for c in cands):
                            soft('A-note-contradicts',f"{Path(p).name} :: {nm} :: note says '{m.group(0)}' · live {u}: {cands}")
                        break
            for v in o.values(): walk(v)
        elif isinstance(o,list):
            for v in o: walk(v)
    walk(d)

# ---------- B/E. header shape and hygiene ----------
NEED_CAT=['Project','Version','Companion to','Conventions','Designations','Scope','Status']
NEED_SCN=['Project','Version','Companion to','Conventions','Owns','Status']
NEED_RD =['Project','Version','Companion to','Shared frame','Owns','Status']
for p in sorted(glob.glob('docs/hindsight/*.md')):
    s=io.open(p,encoding='utf-8').read(); f=Path(p).name
    head=s.split('\n---\n')[0]
    keys=re.findall(r'(?m)^\*\*([^:*]+):\*\*',head)
    want = NEED_CAT if 'catalog' in p else (NEED_RD if p.endswith('road.md') else NEED_SCN)
    if keys[:len(want)]!=want: hard('B-header',f"{f}: keys {keys} != {want}")
    v=re.search(r'(?m)^\*\*Version:\*\* (\S+)',head)
    # three deliberate families: catalogs vNN, scenarios 0.NN, roads N.N
    pat = r'v\d+' if 'catalog' in p else (r'\d+\.\d+' if p.endswith('road.md') else r'0\.\d+')
    if v and not re.fullmatch(pat,v.group(1)): hard('E-version',f"{f}: version '{v.group(1)}' is not the {pat} form")
    if 'Status:** Canonical design reference.' not in head: hard('E-status',f"{f}: non-canonical status line")

# ---------- C. aircraft derivation law ----------
PAIRS=[('docs/hindsight/uk-fishers-ghost-platform-catalog.md','data/ships/hindsight/uk_fishers_ghost_pack.json'),
       ('docs/hindsight/jp-as-long-as-its-black-platform-catalog.md','data/ships/hindsight/jp_as_long_as_its_black_pack.json'),
       ('docs/hindsight/us-five-term-tillman-platform-catalog.md','data/ships/hindsight/us_five_term_tillman_pack.json'),
       ('docs/hindsight/de-nothing-above-water-platform-catalog.md','data/ships/hindsight/de_nothing_above_water_pack.json')]
for md,js in PAIRS:
    s=io.open(md,encoding='utf-8').read(); d=json.load(io.open(js,encoding='utf-8'))
    for a in d.get('aircraft',[]):
        S=a['dimensions'].get('wing_area_m2'); W=a['weights'].get('normal_kg')
        blk=re.search(r'(?ms)^### \d+\.\d+ '+re.escape(a['name'])+r'\b.*?(?=^### |\Z)',s)
        eq=re.search(r'(?m)^\| Equipment \| (.+?) \|\s*$',blk.group(0)) if blk else None
        txt=((eq.group(1) if eq else '')+' '+' '.join(a.get('features',[]))).lower()
        # conventions 8: approach = 1.15 x the bare stall at normal weight, CLmax off the device:
        # slats AND Fowlers 2.4 · Fowler alone 2.25 · slats alone 1.95 ·
        # slotted 1.85 · plain/none 1.55 · swept 1.9. The two devices are NOT equivalent.
        if a['dimensions'].get('sweep_deg'):        cl=1.9
        elif 'slat' in txt and 'fowler' in txt:     cl=2.4
        elif 'fowler' in txt:                       cl=2.25
        elif 'slat' in txt:                         cl=1.95
        elif 'slotted' in txt:                      cl=1.85
        else:                                       cl=1.55
        pa=a['performance'].get('approach_kmh')
        if S and W and pa:
            law=1.15*math.sqrt(2*W*9.81/(1.225*S*cl))*3.6
            if abs(law-pa)>2.5: soft('C-approach',f"{a['name']}: printed {pa}, law {law:.0f} (CLmax {cl})")
        fu=a['fuel']
        for b,lb in ((fu,'internal'),(fu.get('with_tank'),'with_tank')):
            if b and b.get('ferry_km') and b.get('combat_radius_km'):
                if abs(b['combat_radius_km']-b['ferry_km']/3)>max(2.0,b['ferry_km']/3*0.02):
                    hard('C-radius',f"{a['name']} {lb}: {b['ferry_km']}/3 != {b['combat_radius_km']}")
        w=a['weights']
        if not (w['empty_kg']<=w['normal_kg']<=(w.get('max_kg') or w['normal_kg'])):
            hard('C-weights',f"{a['name']}: empty/normal/max out of order")

# ---------- D. register shape ----------
# The BAND is the conventions' (docs/equipment-conventions.md, global rules): two paragraphs,
# 85-200 words each. Rule 39 owns what each paragraph is FOR.
# ⚠ THE SENTENCE COUNT IS NOW EXACTLY FOUR AND FOUR, AT USER ORDER (85th): "first 4 lines in universe
# developmental history and interesting lore, bottom 4 lines in universe doctrine and usage
# observations". The old band was 3-5 and 'about four', and under it 47 per cent of the corpus was
# something other than 4+4 while every entry still passed. A band that admits the shape the user did
# not ask for is not enforcing the shape the user asked for.
VOICE=[(r'\bwhat (?:it|the \w+) costs\b','design trade-off framing'),
       (r'\bwhat it buys\b','design trade-off framing'),
       (r'\brecorded as such\b','document voice'),
       (r'\b(?:A6M|A7M|F6F|F4F|F4U|P-51|Ki-4\d|MiG-\d|Bf 1\d\d)\b','real-aircraft comparator'),
       (r'kg/m²','spec figure in prose'),
       (r'\baspect ratio of \d','spec figure in prose'),
       (r'\bre-derived\b','editing voice'),
       (r'\bcalibrat(?:ion|ed)\b','band voice'),
       # ⚠ THE SAMENESS TICS, MEASURED OFF THE CORPUS THE 85th THREW AWAY. Each of these appeared in
       # four or more registers across different navies, which is what "why is the 4+4 txt always the
       # same" was pointing at. They are banned by name so they cannot creep back one entry at a time.
       (r'\bis (?:known|believed|understood) to have been\b','sameness tic'),
       (r'\bthere is no sign\b','sameness tic'),
       (r'\bat the far end of\b','sameness tic'),
       (r'\bdid not exist when\b','sameness tic'),
       (r'\bso far as can be\b','sameness tic'),
       (r'\bforeign services differ\b','sameness tic'),
       (r'\bnothing published since\b','sameness tic'),
       (r'\bhas been published on the\b','sameness tic'),
       (r'\bis the curiosity\b','sameness tic'),
       (r'\bthe weak point is\b','sameness tic')]
# ⚠ EQUIPMENT CATALOGS ARE CHECKED TOO. This ran on platform catalogs only for many orders, so the
# four equipment catalogs' registers were never shape-checked at all -- 18 of the Japanese file's 33
# paragraphs were under the floor and nothing said so. A rule that applies to every register must be
# run against every register.
#   SWEPT is the honest way to switch a rule on over a backlog. Applying it hard everywhere at once
# would have turned 81 pre-existing violations in three untouched navies into a permanently red
# build, and a build that is always red says nothing. A file that has been through the prose sweep
# is HARD; one that has not is ADVISORY and says so by name. ⚠ ADD A FILE HERE WHEN IT IS SWEPT --
# the list is the backlog, and an empty backlog is the point. ⚠ THE BACKLOG IS NOW EMPTY: all eight
# catalogs are swept and every register-shape finding in the corpus is HARD.
SWEPT={'inherited-hulls-catalog.md',
       'jp-as-long-as-its-black-platform-catalog.md','jp-as-long-as-its-black-equipment-catalog.md',
       'uk-fishers-ghost-platform-catalog.md','us-five-term-tillman-platform-catalog.md',
       'de-nothing-above-water-platform-catalog.md','de-nothing-above-water-equipment-catalog.md',
       'uk-fishers-ghost-equipment-catalog.md','us-five-term-tillman-equipment-catalog.md'}
for p in sorted(glob.glob('docs/hindsight/*catalog.md')):
    s=io.open(p,encoding='utf-8').read(); f=Path(p).name
    # ⚠ ONE PARAGRAPH NOW, NOT TWO. The 88th replaced the 4 + 4 with a single block of six, so the
    # old pattern -- heading, blank, para, blank, para, blank, table -- no longer matches ANYTHING,
    # and a check that matches nothing passes silently. It is the corpus-wide version of the hole
    # found in the 84th and 85th. The paragraph count is asserted below for exactly that reason.
    seen=0
    for m in re.finditer(r'(?ms)^### (\d+\.\d+) (.+?)$\n\n(.+?)\n\n\|',s):
        seen+=1
        for lab,par in (('reg',m.group(3)),):
            # ⚠ COUNT SENTENCES PROPERLY. `par.count('. ')+1` misses a sentence ending in ? or ! and
            # miscounts an abbreviation, and it was the only counter this check ever had.
            sents=[x for x in re.split(r'(?<=[.!?])\s+(?=[A-Z"“])',par.strip()) if x.strip()]
            sn=len(sents); wc=len(par.split())
            lvl = hard if f in SWEPT else soft
            tag = '' if f in SWEPT else ' [not yet swept]'
            if '\n\n' in par.strip():
                lvl('D-shape',f"{f} §{m.group(1)}: more than one paragraph, want ONE block of six{tag}")
            if sn!=6: lvl('D-shape',f"{f} §{m.group(1)}: {sn} sentences, want exactly 6{tag}")
            if not 80<=wc<=185: lvl('D-length',f"{f} §{m.group(1)}: {wc} words, want 90-170{tag}")
            elif not 90<=wc<=170: soft('D-length',f"{f} §{m.group(1)}: {wc} words, just outside 90-170{tag}")
            # ⚠ AND THE SENTENCE-LENGTH CAP, WHICH IS THE POINT OF THE 88th's VOICE. The specimen the
            # user struck by name was 33 words in four clauses. One point per sentence, stated and
            # left alone; anything past 30 words is a clause-stack and is a hard failure.
            for si,sent in enumerate(sents,1):
                n=len(sent.split())
                if n>30: lvl('D-longwinded',f"{f} §{m.group(1)}: sentence {si} is {n} words — one point per sentence{tag}")
            # ⚠ CASE-INSENSITIVE, AND THE NEGATIVE TEST IS WHY. Every VOICE pattern was written in
            # lower case and matched case-sensitively, so a tic that opened a sentence -- "There is
            # no sign that..." -- went straight through the check that exists to catch it. The flag
            # goes in the call, never as (?i) inside an alternation, which has bitten this file before.
            for pat,why in VOICE:
                h=re.search(pat,par,re.I)
                if h: lvl('D-voice',f"{f} §{m.group(1)} {lab}: '{h.group(0)}' — {why}{tag}")
            # ⚠ A REGISTER IS WRITTEN AS A JANE'S ENTRY IS WRITTEN: it does not shout, it does not
            # bold, and it never names the document it is printed in. The warning marker is house
            # style everywhere else in a catalog and is REQUIRED there; inside a register it is the
            # file addressing its own maintainer instead of the officer reading it.
            # ⚠ A REGISTER IS AN OUTSIDE OBSERVER'S REVIEW. He has no papers: no minute, no
            # memorandum, no staff requirement read rather than published -- and he is not in
            # this navy, so FIRST PERSON is the plainest tell there is and the only one of the
            # insider markers that can be matched without false positives. The rest of the
            # voice is a hand pass; see the note under check D.
            for pat,why in ((r'⚠','warning marker in a register'),
                            (r'\*\*','bold in a register'),
                            (r'\b(?:this|the) catalog\b','the register naming the document'),
                            (r'\bthis file\b','the register naming the document'),
                            (r'(?<![A-Za-z])(?:our|we|us)(?![A-Za-z])',
                             'first person — a register is written from OUTSIDE the navy'),
                            (r'\bthe scenario\b|\bthe divergence\b','scenario voice'),
                            (r'\b(?:cold|par|interest|supporting) band\b','calibration voice'),
                            (r'§\s?\d+\.\d+','the register citing a section number')):
                h=re.search(pat,par,re.I)
                if h: lvl('D-janes',f"{f} §{m.group(1)} {lab}: '{h.group(0)}' — {why}{tag}")

    # ⚠ ⚠ AND ASSERT THE CHECK ACTUALLY SAW SOMETHING. Every register-shape change so far has been
    # a change to the PATTERN this loop matches on, and a pattern that matches nothing reports a
    # clean corpus. A catalog with sections and no matched registers is a broken check, not a clean file.
    ns=len(re.findall(r'(?m)^### \d+\.\d+ ',s))
    if ns and not seen:
        hard('D-blind',f"{f}: {ns} sections and the register pattern matched NONE — the check is blind, not the file clean")

# ---------- G. equipment-catalog header year vs the founding code in its own table ----------
# A section header carries a designation and a year; the table under it carries the codes, and a
# code's own year IS its availability date. When a line is re-dated, the CODE gets changed and the
# HEADER is forgotten -- the Japanese utility engine sat as "Type 32 (1932)" over a table reading
# [jp33aeg] for many orders, and nothing could see it: validate.py reads JSON, crosscheck.py reads
# spec rows, and audit.py's A-check reads `notes` fields. Nothing was reading a markdown heading
# against the data beneath it. Compares the FOUNDING (first) code only; later generations of a line
# legitimately carry later years.
for p in sorted(glob.glob('docs/hindsight/*-equipment-catalog.md')):
    s=io.open(p,encoding='utf-8').read(); f=Path(p).name
    for blk in re.split(r'(?m)^(?=### \d+\.\d+ )',s):
        # NOTE: the separator is a real em dash. It must NOT be written as \u2014 inside a RAW
        # string -- in r'...' that is five literal characters and the pattern silently never
        # matches, which is exactly how the first version of this check passed its own negative
        # test by finding nothing at all.
        m=re.match('### (\\d+\\.\\d+) ([^\\n\u2014]+?) \u2014 ([^\\n(]+?) \\((\\d{4})\\)',blk)
        if not m: continue
        codes=re.findall(r'\|\s*\[([a-z]{2}(\d{2})[a-z]{3})\]',blk)
        if not codes: continue
        yr=int(m.group(4)); c0,y0=codes[0][0],1900+int(codes[0][1])
        if y0!=yr:
            hard('G-header-year',f"{f} §{m.group(1)} {m.group(2).strip()}: header says "
                                f"'{m.group(3).strip()} ({yr})' but the founding code [{c0}] is {y0}")

# ---------- H. orthography per nation (conventions 1.1) ----------
# ---------- H. orthography: ONE dialect, American, everywhere ----------
# The project ran on a per-nation dialect for many orders -- British files for Britain, Germany and
# the shared frame, American for America and Japan, with the inherited-hull catalog split by chapter.
# It is now American throughout, by ruling, and this check is correspondingly simple: a British
# spelling anywhere is a defect. That includes identifiers, which were converted with the prose.
#   ⚠ KEYS AND CODES ARE STILL SKIPPED IN JSON -- only prose values are scanned (see _json_prose).
B2A={'programme':'program','programmes':'programs','calibre':'caliber','calibres':'calibers',
 'metre':'meter','metres':'meters','centimetre':'centimeter','centimetres':'centimeters',
 'kilometre':'kilometer','kilometres':'kilometers','millimetre':'millimeter','millimetres':'millimeters',
 'kilogramme':'kilogram','kilogrammes':'kilograms','manoeuvre':'maneuver','manoeuvres':'maneuvers',
 'manoeuvring':'maneuvering','manoeuvrable':'maneuverable','stabilise':'stabilize','stabilised':'stabilized',
 'judgement':'judgment','moulded':'molded','mould':'mold','colour':'color','colours':'colors',
 'harbour':'harbor','harbours':'harbors','behaviour':'behavior','armour':'armor','armoured':'armored',
 'unarmoured':'unarmored','modernisation':'modernization','modernised':'modernized','modernising':'modernizing',
 'organisation':'organization','organisations':'organizations','organise':'organize','organised':'organized',
 'recognise':'recognize','recognised':'recognized','mobilisation':'mobilization','instalment':'installment',
 'relabelled':'relabeled','per cent':'percent','favourite':'favorite','favour':'favor','defence':'defense',
 'defences':'defenses','offence':'offense','centre':'center','centres':'centers','centreline':'centerline',
 'signalling':'signaling','signalled':'signaled','fuelling':'fueling','fuelled':'fueled',
 'refuelling':'refueling','cancelled':'canceled','aeroplane':'airplane','aeroplanes':'airplanes',
 'tonne':'ton','tonnes':'tons','storey':'story','sceptical':'skeptical','draught':'draft',
 'specialise':'specialize','specialised':'specialized','specialisation':'specialization',
 'standardisation':'standardization','standardised':'standardized','analyse':'analyze','analysed':'analyzed',
 'grey':'gray','sulphur':'sulfur','aluminium':'aluminum','licence':'license','practise':'practice',
 'learnt':'learned','burnt':'burned','spelt':'spelled','amongst':'among','whilst':'while',
 'labelled':'labeled','modelled':'modeled','travelled':'traveled','levelled':'leveled','skilful':'skillful',
 'honour':'honor','honours':'honors','honourable':'honorable','labour':'labor','labours':'labors',
 'labourer':'laborer','labourers':'laborers','neighbour':'neighbor','neighbours':'neighbors',
 'endeavour':'endeavor','rumour':'rumor','rumours':'rumors','vapour':'vapor','splendour':'splendor',
 'draughtsman':'draftsman','draughtsmen':'draftsmen','draughts':'drafts','draughty':'drafty',
 'modernise':'modernize','economise':'economize','economised':'economized','economising':'economizing',
 'apologise':'apologize','authorise':'authorize','authorised':'authorized','categorise':'categorize',
 'characterise':'characterize','characterised':'characterized','civilise':'civilize',
 'criticise':'criticize','criticised':'criticized','emphasise':'emphasize','emphasised':'emphasized',
 'generalise':'generalize','itemise':'itemize','itemised':'itemized','jeopardise':'jeopardize',
 'maximise':'maximize','maximised':'maximized','memorise':'memorize','minimise':'minimize',
 'minimised':'minimized','normalise':'normalize','optimise':'optimize','optimised':'optimized',
 'penalise':'penalize','penalised':'penalized','prioritise':'prioritize','prioritised':'prioritized',
 'realise':'realize','realised':'realized','summarise':'summarize','summarised':'summarized',
 'utilise':'utilize','utilised':'utilized','enrol':'enroll','fulfil':'fulfill','instil':'instill',
 'distil':'distill','appal':'appall','marvellous':'marvelous','sabre':'saber','calibre':'caliber',
 'fibre':'fiber','fibres':'fibers','theatre':'theater','theatres':'theaters','plough':'plow',
 'kerb':'curb','tyre':'tire','tyres':'tires','pyjamas':'pajamas','axe':'ax','offences':'offenses',
 'pretence':'pretense','licenced':'licensed','practised':'practiced','practising':'practicing',
 'sombre':'somber','lustre':'luster','metre':'meter','metres':'meters','litre':'liter','litres':'liters'}
# proper nouns and foreign terms that legitimately keep their spelling
# The generated catalog also prints the stable identifier of the proper-named Sabre class.
ORTHO_ALLOW=re.compile(r'Ministry of Defence|Air Ministry|Royal Air Force|Sabres?|sabre_dd22')
ORTHO_FILES=(sorted(glob.glob('docs/**/*.md',recursive=True))+sorted(glob.glob('agents/*.md'))
             +['README.md','CONTINUATION-HANDOVER.md']
             +sorted(glob.glob('data/ships/hindsight/*_pack.json'))+sorted(glob.glob('data/equipment/*.json'))
             +sorted(glob.glob('data/scenarios/*.json'))+sorted(glob.glob('data/derived/*.json'))
             +sorted(glob.glob('data/schema/*.json')))
for p in ORTHO_FILES:
    f=Path(p).name
    if p.endswith('.json'):
        chunks=[(pth,txt) for pth,txt in _json_prose(p)]
    else:
        try: chunks=[(None,io.open(p,encoding='utf-8').read())]
        except Exception: continue
    for where,txt in chunks:
        txt=ORTHO_ALLOW.sub('',txt)
        for w,want in B2A.items():
            for m in re.finditer(r'(?<![A-Za-z])'+re.escape(w)+r'(?![A-Za-z])',txt,re.I):
                loc = where if where else str(txt[:m.start()].count('\n')+1)
                hard('H-orthography',f"{f}:{loc} '{m.group(0)}' — the project is American English; want '{want}'")


# ---------- I. section numbering is continuous and never renumbered (conventions 7) ----------
# '### N.M' inside '## N.' must form a gapless run from 1. A missing 5.5 with a live 5.6 is exactly
# the shape a moved section leaves behind, and nothing read a heading number before this check.
for p in sorted(glob.glob('docs/hindsight/*.md'))+['docs/equipment-conventions.md','docs/hindsight-scenarios.md']:
    f=Path(p).name; s=io.open(p,encoding='utf-8').read()
    subs={}
    for m in re.finditer(r'(?m)^### (\d+)\.(\d+)\b',s):
        subs.setdefault(int(m.group(1)),[]).append(int(m.group(2)))
    for maj,got in subs.items():
        want=list(range(1,max(got)+1))
        miss=[x for x in want if x not in got]
        dup=[x for x in set(got) if got.count(x)>1]
        for x in miss:
            # a gap the file itself tombstones (withdrawn, or moved and said so) is documented,
            # not lost. A gap nothing accounts for is the shape a moved section leaves behind.
            # ⚠ 'is not used' IS THE FLAT FORM AND THE CHECK HAS TO ACCEPT IT. The alternatives
            # below all narrate what happened to the section; rule 43 wants a numbering fact instead.
            tomb=re.search(r'§?'+str(maj)+r'\.'+str(x)+r'\b[^\n]{0,140}?'
                           r'(withdrawn|formerly|moved|now (?:lives|owns)|is not used|is `)',s) or \
                 re.search(r'(withdrawn|formerly|moved)[^\n]{0,140}?§'+str(maj)+r'\.'+str(x)+r'\b',s)
            (soft if tomb else hard)('I-numbering',
                f"{f} §{maj}: subsections {sorted(got)} — §{maj}.{x} is missing"
                + (' [tombstoned in-file]' if tomb else ''))
        if dup:  hard('I-numbering',f"{f} §{maj}: §{maj}.{sorted(dup)[0]} appears twice")

# ---------- J. spec-sheet row order and label spelling (conventions 7 templates) ----------
# The template fixes the row order. Nothing read it: crosscheck.py matches rows by label wherever
# they sit, so a Protection row below Depth was invisible to every tool in the project.
SHIP_T=['Cost / durability','Displacement','Capacity (fitout)','Dimensions','Flight deck','Elevators',
 'Hangar','Escort-carrier fitout','Capacity by type','Main battery','Secondary battery','Light AA',
 'Torpedoes','Fire control','Sensors','Aviation','Mines','ASW','Machinery','Speed (surfaced)',
 'Speed (submerged)','Battery','Fuel','Protection','Cargo gear','Depth','Provisions','Crew','Kits',
 'Possible upgrades']
AIR_T=['Cost / durability','Powerplant','Dimensions','Weights','Crew','Speed','Climb / ceiling',
 'Fuel / endurance / range','Armament','Ordnance','Equipment','Crew systems','Protection','Kits',
 'Possible upgrades']

def _rank(lbl,T):
    best=None
    for i,o in enumerate(T):
        if lbl==o or lbl.startswith(o+' ') or lbl.startswith(o+' ('):
            if best is None or len(o)>len(T[best]): best=i
    return best
for p in sorted(glob.glob('docs/hindsight/*platform-catalog.md')):
    f=Path(p).name
    for sec in re.split(r'(?m)^### ',io.open(p,encoding='utf-8').read())[1:]:
        head=sec.split('\n',1)[0]
        T=SHIP_T if head.startswith('1.') else AIR_T
        prev=-1; prevlbl=''
        for lbl in re.findall(r'(?m)^\|\s*([^|]+?)\s*\|',sec):
            k=_rank(lbl,T)
            if k is None: continue
            if k<prev:
                hard('J-row-order',f"{f} §{head[:34]}: '{lbl}' prints below '{prevlbl}' — "
                                   f"the template puts it above")
            if k>prev: prev,prevlbl=k,lbl

# ---------- K. prose fleet counts vs data/derived (the model is the authority) ----------
# validate.py holds each PACK to the build model. Nothing held the PROSE to it, which is how
# 'they agree at END 1935: CV 10 - CL 33 - DD 8 - DE 8 - SS 9' sat in a scenario file for orders
# against a model that says CV 6 - CL 26 - DD 17 - DE 18 - SS 24, and how a UK line transposed
# BC and CL. Any prose line naming END <year> followed by >=3 'TYPE n' pairs is checked.
MODELS={}
for mp in glob.glob('data/derived/*_build_model.json'):
    try: MODELS[mPath(p).name[:2]]=json.load(io.open(mp,encoding='utf-8'))
    except Exception: pass
def _endyear(model,yr):
    rows=model.get('years')
    if isinstance(rows,list):
        for e in rows:
            if isinstance(e,dict) and e.get('year')==yr:
                return e.get('end_of_year')
    return None
for p in sorted(glob.glob('docs/hindsight/*.md'))+['docs/hindsight-scenarios.md']:
    f=Path(p).name; nat=f[:2]
    for ln,l in enumerate(io.open(p,encoding='utf-8').read().split('\n'),1):
        # the window stops at the sentence boundary: a LATER year's figure in the same
        # paragraph is a different claim, not part of this one.
        for m in re.finditer(r'END[^\n]{0,4}(19\d\d)([^.]{0,200})',l):
            pairs=re.findall(r'\b(BB|BC|CA|CL|CV|DD|DE|SS)\s+(\d+)\b',m.group(2))
            # ⚠ TWO, NOT THREE. A three-pair floor made this check STRUCTURALLY BLIND TO GERMANY,
            # whose fleet is only ever CA and SS -- and the frame's SS7.5 carried 'CA 1 - SS 43'
            # against a model saying SS 33 for orders, in a check written to catch exactly that.
            if len(pairs)<2: continue
            yr=int(m.group(1))
            # a national file is held to ITS OWN model; the shared frame is held to all of them,
            # and is a defect only when no model in the project reproduces the tuple it prints.
            cands=[nat] if nat in MODELS else sorted(MODELS)
            fits=[]
            for c in cands:
                got=_endyear(MODELS[c],yr)
                if not isinstance(got,dict): continue
                bad=[(t,int(v),got.get(t)) for t,v in pairs if t in got and int(v)!=got[t]]
                fits.append((c,bad))
            if not fits or any(not b for _,b in fits): continue
            c,bad=min(fits,key=lambda x: len(x[1]))
            hard('K-prose-model',f"{f}:{ln} END {yr} prose says "
                 +' · '.join(f'{t} {v} (model {c} says {g})' for t,v,g in bad))

# ---------- L. air capacity is a derivation, not a datum (conventions 3) ----------
# Embarked = hangar area // the type's hangar footprint, rounded down, deck park excluded;
# spares = ceil(20 % of embarked). Nothing recomputed it: crosscheck.py matches the printed
# Capacity-by-type row against the pack, and the pack does not store the row -- so a hand-typed
# air group could drift from the hangar it is derived from and every tool would pass. The Unryu
# printed 88 Hibari against 4,700 // 52 = 90, and 33+33 against 4,700 // 138 = 34 pairs.
FOOT={}
for _p in glob.glob('data/ships/hindsight/*_pack.json'):
    for _a in json.load(io.open(_p,encoding='utf-8')).get('aircraft',[]):
        _f=(_a.get('dimensions') or {}).get('hangar_footprint_m2')
        if _f: FOOT[_a['name'].split()[0]]=_f
for p in sorted(glob.glob('docs/hindsight/*platform-catalog.md')):
    f=Path(p).name
    for sec in re.split(r'(?m)^### ',io.open(p,encoding='utf-8').read())[1:]:
        head=sec.split('\n',1)[0]
        # ⚠ a (?m) flag mid-alternation is a SyntaxError and made this whole file crash silently
        #   the first time it was written; the negative test is what caught it.
        hm=(re.search(r'(?m)^\| Hangar & deck park \|\s*([\d,]+) m²',sec)
            or re.search(r'(?m)^\| Escort-carrier fitout \|[^|]*?([\d,]+) m² hangar',sec))
        cm=re.search(r'(?m)^\| Capacity by type[^|]*\|([^|]*)\|',sec)
        if not (hm and cm): continue
        H=int(hm.group(1).replace(',',''))
        cell=cm.group(1)
        # Two printed forms, and the tail after an em dash ('— 68 embarked, 7 + 7 spare')
        # is a restatement, not another group. Parse the head of each dot-separated chunk only.
        for chunk in cell.split('·'):
            headpart=chunk.split('—')[0]
            # anchor on the KNOWN type names: a free '[A-Z]\w+' capture grabs the leading word of
            # '**From 1933, one type:** Hibari 90 + 18' and findall never retries from 'Hibari'.
            single=[]
            for t in FOOT:
                m2=re.search(re.escape(t)+r'\b[^+|]{0,34}?\s(\d+) \+ (\d+)\b',headpart)
                if m2: single.append((t,int(m2.group(1)),headpart.index(t)))
            single=[(t,k) for t,k,_ in sorted(single,key=lambda x:x[2])]
            mixed=re.findall(r'\b(\d+)\s+([A-Z][A-Za-z\u0100-\u017f\d]+)\b',headpart)
            mixed=[(t,int(k)) for k,t in mixed if t in FOOT]
            seen=[];  order=[]
            for t,k in (single or mixed):
                if t not in seen: seen.append(t); order.append((t,k))
            if not order: continue
            if len(order)==1 and single:
                t,k=order[0]; want=H//FOOT[t]
                if k!=want: hard('L-air-capacity',
                    f"{f} §{head[:26]}: {t} {k} embarked, but {H} m² // {FOOT[t]} m² = {want}")
            else:
                per=sum(FOOT[t] for t,_ in order); want=H//per
                for t,k in order:
                    if k!=want: hard('L-air-capacity',
                        f"{f} §{head[:26]}: equal mix {t} {k}, but {H} m² // {per} m² = {want} of each")

# ---------- M. argument artifacts, EVERY file, EVERY line (rule 43) ----------
# The canon files state what a thing IS. No reasoning, no caveats, no confidence, no case for a
# figure, and above all no editing history: "RULED (user)", "is withdrawn", "was 130,000",
# "not to be corrected", "recorded here", "formerly SS5.5". The D-voice check only ever read the
# two paragraphs before a catalog table, so calibration blocks, post-table blocks, scenario files
# and road files -- where nearly all of it lived -- were outside every tool in the project.
# Reasoning goes in chat and in CONTINUATION-HANDOVER.md, which is NOT scanned.
ARTIFACT=[
 (r"RULED \(user\)","editing history"),(r"Ruled \(user\)","editing history"),
 (r"at user order","editing history"),(r"user ruling","editing history"),
 (r"not to be ['‘’]?corrected","instruction not to fix"),
 (r"must not be ['‘’]?fixed","instruction not to fix"),
 (r"Do not correct","instruction not to fix"),(r"not to be re-flagged","audit-defence"),
 (r"not re-flagged","audit-defence"),(r"is not a defect","audit-defence"),
 (r"not damage","audit-defence"),(r"in an earlier draft","editing history"),
 (r"formerly §","editing history"),(r"the file records","document voice"),
 (r"recorded here","document voice"),(r"\bis withdrawn\b","editing history"),
 (r"\bare withdrawn\b","editing history"),(r"may not be reintroduced","editing history"),
 (r"must not be reconstructed","editing history"),(r"change-set","editing history"),
 (r"tombstoned","editing history"),(r"deliberate exception","editing history"),
 (r"reversed an earlier ruling","editing history"),(r"an earlier ruling","editing history"),
 (r"that is reversed","editing history"),(r"is not canon","editing history"),
 (r"not retained anywhere","editing history"),(r"canon needs open","document voice"),
 (r"this file has never stated","document voice"),(r"what it buys","trade-off framing"),
 (r"HOW MUCH OF THIS IS INVENTED","provenance"),
 # ⚠ FOUND BY HAND IN THE 73rd ORDER, ALL INVISIBLE TO THE LIST ABOVE. Five audit-defence markers
 # sat in the calibration blocks in UPPER CASE ("NOT TO BE RE-FLAGGED") and the list was matched
 # case-sensitively, so every one of them read as clean. The patterns are now compiled with re.I.
 (r"not to be re-?proposed","instruction not to fix"),
 (r"do not re-?open|must not be re-opened","instruction not to fix"),
 (r"\bverified\s*[:,]|\bverified and\b","verification stamp"),
 (r"in the same audit|the audit found|this audit\b","editing history"),
 (r"unchanged from v\d|formerly in this section|\bare superseded\b","editing history"),
 (r"moved here when|rulings? applied\b","editing history"),
 (r"was preserved exactly|preserved into those files","provenance"),
 (r"~~","strikethrough tombstone"),
]
# ⚠ CASE-INSENSITIVE. The house voice SHOUTS, so a banned phrase is as likely to be upper case as
# lower, and matching case-sensitively is the same silence as not running at all (rule 30).
ARTIFACT=[(re.compile(pat,re.I),why) for pat,why in ARTIFACT]
# ⚠ AND THE DATA FILES. A `notes` field narrating an editing decision is the same defect as a
# paragraph doing it, and it hid longer: the Japanese pack still carried four `at user order`
# stamps and a deleted airframe after every document had been swept clean.
# ⚠ AND data/scenarios/ + data/schema/ + data/derived/. Rule 35 names in_good_faith_1936.json as
# 'where the last one hid' and check M was not reading it; the schema `description` fields are prose
# a human reads and were never scanned by anything.
# ⚠ AND THE DESIGN DOCS AND THE METHODOLOGY FILE. README.md, scenario-design.md,
# ship-classification-system.md, sp-scenario-catalog.md and sims/SIM-RULES.md were outside every
# file list in the project and had NEVER been scanned; between them they carried a withdrawn-launch-set
# section, two schema-history clauses and a dated deletion narration with a 'do not reconstruct'.
# ⚠ agents/ IS DELIBERATELY NOT HERE: the consistency editor's brief QUOTES the banned-phrase list,
# so scanning it would fire on the list itself. The agent briefs are rule-passed by hand instead.
ART_FILES=(sorted(glob.glob('docs/hindsight/*.md'))+['docs/equipment-conventions.md','docs/hindsight-scenarios.md',
            'README.md','docs/scenario-design.md','docs/ship-classification-system.md',
            'docs/sp-scenario-catalog.md','docs/hindsight/sims/SIM-RULES.md']
           +sorted(glob.glob('data/ships/hindsight/*_pack.json'))+sorted(glob.glob('data/equipment/*.json'))
           +sorted(glob.glob('data/scenarios/*.json'))+sorted(glob.glob('data/schema/*.json'))
           +sorted(glob.glob('data/derived/*.json')))
for p_ in ART_FILES:
    f=Path(p_).name
    units=_json_prose(p_) if p_.endswith('.json') else \
          [(str(i),l) for i,l in enumerate(io.open(p_,encoding='utf-8').read().split('\n'),1)]
    for where,txt in units:
        seen=set()
        for rx,why in ARTIFACT:
            m=rx.search(txt)
            if m and m.group(0).lower() not in seen:
                seen.add(m.group(0).lower())
                hard('M-artifact',f"{f}:{where} '{m.group(0)}' — {why} (rule 43)")

# ---------- F. model-validity guard ----------
# The aircraft polar is calibrated on clean fast monoplanes and FAILS on slow draggy types:
# it returns 0.48x a Swordfish's published range and 0.41x an Arado Ar 196's. Any finding that
# adjudicates the range of a low-speed biplane, floatplane or fixed-gear type with this model
# is unsafe. Recorded here so the limit travels with the tool.
soft('F-model-limit','aircraft range model: A6M2 +0.2 %, Spitfire +3.9 %; Swordfish 0.48x, Ar 196 0.41x '
                     '-- DO NOT use it to adjudicate the range of a slow draggy airplane')

print("="*100)
for lab,rows in (("HARD",HARD),("ADVISORY",SOFT)):
    print(f"\n{lab} — {len(rows)}")
    seen={}
    for c,m in rows: seen.setdefault(c,[]).append(m)
    for c in sorted(seen):
        print(f"  [{c}] {len(seen[c])}")
        for m in seen[c]: print(f"      {m}")
print("\n"+"="*100)
print(f"AUDIT: {len(HARD)} hard · {len(SOFT)} advisory")
sys.exit(1 if HARD else 0)
