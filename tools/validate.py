#!/usr/bin/env python3
"""Validate WNT1922 data files against schemas + referential integrity + the
   project's own written laws.

Usage: python tools/validate.py            (from repo root)
       python tools/validate.py --quiet     errors only, no summary
Requires: pip install jsonschema referencing

What this checks beyond JSON Schema, and why each one exists:

  * cross-FILE duplicate class ids     — the old validator unioned ids into a
                                          set, so a duplicate across two navies
                                          collapsed silently instead of erroring
  * cross-nation class-name collisions  — naming law: class names must not
                                          collide across navies
  * component code resolution           — a code in a fit/battery/upgrade row
                                          must exist in an equipment file
  * code/year agreement                 — [jp32eng] must be year 1932; the
                                          code's own year IS its availability
  * prefix/nation agreement             — conventions 1.1
  * as-launched discipline              — no SKU on an as-launched sheet before
                                          its own type year (documented
                                          exceptions: machinery refit groups,
                                          aircraft powerplant refit groups,
                                          capacity-by-type rows, Kits rows,
                                          possible_upgrades)
  * possible_upgrades hygiene           — engine and kit codes never appear
                                          there; the machinery/powerplant row
                                          carries its own refit groups
  * combat radius = ferry / 3           — conventions 4
  * provision match                     — conventions 6: a fitted component
                                          needs a provision whose interface it
                                          plugs into
  * build-model agreement               — a pack's hull counts must be the
                                          numbers build_model.py actually
                                          produces, END-OF-YEAR. This is the
                                          check that catches "91 escorts in
                                          1940" when 91 is the 1950 figure.
"""
import json, glob, sys, os, re
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

QUIET = '--quiet' in sys.argv
errors = 0
warnings = 0


def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


schemas = {}
for p in glob.glob('data/schema/*.json'):
    s = load(p)
    schemas[s['$id']] = s

registry = Registry().with_resources(
    [(k, Resource.from_contents(v)) for k, v in schemas.items()])


def err(label, msg):
    global errors
    errors += 1
    print(f"[{label}] {msg}")


def warn(label, msg):
    global warnings
    warnings += 1
    print(f"[{label}] WARN {msg}")


def validate(instance, schema_id, label):
    v = Draft202012Validator(schemas[schema_id], registry=registry)
    for e in sorted(v.iter_errors(instance), key=lambda e: e.json_path):
        err(label, f"{e.json_path}: {e.message[:200]}")


# --------------------------------------------------------------------------
# load everything
# --------------------------------------------------------------------------
fleet_files = sorted(glob.glob('data/ships/*.json'))
pack_files = sorted(glob.glob('data/ships/hindsight/*.json'))
equip_files = sorted(glob.glob('data/equipment/*.json'))
scen_files = sorted(glob.glob('data/scenarios/*.json'))

for p in fleet_files:
    validate(load(p), 'wnt1922/fleet-file.schema.json', p)
for p in pack_files:
    validate(load(p), 'wnt1922/pack.schema.json', p)
for p in equip_files:
    validate(load(p), 'wnt1922/equipment-file.schema.json', p)
for p in scen_files:
    validate(load(p), 'wnt1922/scenario.schema.json', p)

# --------------------------------------------------------------------------
# component index, from every equipment file
# --------------------------------------------------------------------------
CODES = {}          # code -> {year, family, prefix, nation, line, interface, file}
FAMILY_OF = {}
BANDS = ('interest', 'supporting', 'par', 'cold')
for p in equip_files:
    d = load(p)
    pref, nat = d['prefix'], d['nation']
    # CONVENTIONS 8 IS A DISTRIBUTION. A catalog that declares no position cannot
    # be audited, so every band must be stated and every line must sit in one.
    cal = d.get('calibration') or {}
    for b in BANDS:
        if not cal.get(b):
            err(p, f"calibration: band '{b}' is empty or missing — §8 is a DISTRIBUTION "
                   f"and a catalog must state all four bands before any line can be audited")
    seen_bands = set()
    for ln in d['lines']:
        if ln.get('band') not in BANDS:
            err(p, f"line {ln['id']}: band {ln.get('band')!r} is not one of {BANDS} "
                   f"(conventions §8 — the band is data, not prose)")
        else:
            seen_bands.add(ln['band'])
        if ln.get('prefix') and ln['prefix'] != pref:
            err(p, f"line {ln['id']}: prefix {ln['prefix']} != file prefix {pref}")
        if ln['nation'] != nat:
            err(p, f"line {ln['id']}: nation {ln['nation']} != file nation {nat}")
        years = [g['year'] for g in ln['generations']]
        if years != sorted(years):
            err(p, f"line {ln['id']}: generations not in year order {years}")
        if years[0] != ln['founding_year']:
            err(p, f"line {ln['id']}: founding_year {ln['founding_year']} != first generation {years[0]}")
        for g in ln['generations']:
            c, y = g['code'], g['year']
            if not c.startswith(pref):
                err(p, f"{c}: prefix must be {pref} (conventions 1.1: the prefix is mandatory everywhere)")
            m = re.match(r'^[a-z]{2}(\d{2})([a-z]{3})$', c)
            if m:
                if 1900 + int(m.group(1)) != y:
                    err(p, f"{c}: code year {m.group(1)} != stated year {y} "
                           f"(the code's own year IS its availability date)")
                if m.group(2) != ln['family']:
                    err(p, f"{c}: family suffix {m.group(2)} != line family {ln['family']}")
            elif ln['family'] not in ('ang', 'kit', 'flt'):
                err(p, f"{c}: yearless code is only legal for a kit (families ang/kit/flt)")
            if c in CODES:
                err(p, f"{c}: duplicate component code (also in {CODES[c]['file']})")
            # ⚠ THE `Common` BLOCK CARRIES FORWARD INTO EVERY GENERATION AND THIS USED TO DROP IT.
            # The conventions say a generation restates only what CHANGES and inherits the rest from
            # the founding row and the Common row; a tool reading `spec` alone sees a hole where the
            # inherited value is. It cost the crew-weight check the American aircraft round mass,
            # which sat in `common` exactly where the conventions put it. Generation wins on a clash.
            merged = dict(ln.get('common') or {}); merged.update(g.get('spec') or {})
            CODES[c] = dict(year=y, family=ln['family'], prefix=pref, nation=nat,
                            line=ln['id'], band=ln.get('band'), interface=ln.get('interface'),
                            file=p, spec=merged)
    # A BAND MAY BE DECLARED AND HOLD NO LINE. That is not an error, and the rule
    # that made it one was withdrawn the hour it was written: the
    # STRONGEST form of a cold band is a line that is not in the catalog at all.
    # Japan declares heavy-calibre gunnery cold and carries no heavy-gun line,
    # because the plan stopped developing heavy guns in 1922. Britain declares
    # trade defence cold and carries no escort. An absence is a design statement.
    _bands_with_no_line = set(BANDS) - seen_bands

# --------------------------------------------------------------------------
# class / hull index, with CROSS-FILE duplicate detection
# --------------------------------------------------------------------------
CLASSES = {}        # class_id -> (nation, name, file, classdict)
HULLS = {}
NAMES = {}          # normalised class name -> [(nation, file)]


def eff_spec(entry):
    """The spec behind an armament entry or a station alternative, whichever way it is
    stated. ⚠ AN ITEM TOO MINOR FOR A SKU IS A LITERAL, NOT A HOLE: it carries its own
    mass here so every arithmetic check downstream still reaches it."""
    if not isinstance(entry, dict):
        return {}
    if 'component' in entry:
        return (CODES.get(entry['component']) or {}).get('spec') or {}
    return entry.get('spec') or {}


def norm(n):
    return re.sub(r'\s*class$', '', n.strip(), flags=re.I).lower()


def index_classes(p, d, classes):
    for c in classes:
        cid = c['id']
        if cid in CLASSES:
            err(p, f"class id '{cid}' already defined in {CLASSES[cid][2]} "
                   f"(ids are the keys the data is stored under; a duplicate collapses silently)")
        CLASSES[cid] = (c['nation'], c['name'], p, c)
        NAMES.setdefault(norm(c['name']), []).append((c['nation'], p))


for p in fleet_files + pack_files:
    d = load(p)
    index_classes(p, d, d.get('classes', []))
    for h in d.get('hulls', []):
        if h['id'] in HULLS:
            err(p, f"hull id '{h['id']}' already defined in {HULLS[h['id']]}")
        HULLS[h['id']] = p

for name, owners in sorted(NAMES.items()):
    nats = {n for n, _ in owners}
    if len(nats) > 1:
        err('naming-law', f"class name '{name}' used by {sorted(nats)} "
                          f"— class names must not collide across navies")

# --------------------------------------------------------------------------
# intra-file integrity + the component-style checks
# --------------------------------------------------------------------------
ENGINE_FAMILIES = {'eng', 'aeg', 'jet'}
KIT_FAMILIES = {'ang', 'kit', 'flt'}


def check_code(p, label, code, ref_year=None, nation=None):
    """Resolve a code and, when ref_year is given, apply as-launched discipline."""
    if code not in CODES:
        err(p, f"{label}: unknown component code '{code}'")
        return None
    info = CODES[code]
    if nation and info['nation'] != nation:
        err(p, f"{label}: '{code}' belongs to {info['nation']}, not {nation}")
    if ref_year is not None and info['year'] > ref_year:
        err(p, f"{label}: '{code}' (introduced {info['year']}) on an as-launched sheet "
               f"whose reference year is {ref_year}")
    return info


def check_class(p, c, nation):
    cid = c['id']
    # as_launched_year wins over type_year. They coincide only in Japan, where
    # the class's designation IS its year of introduction. A British class is
    # named for the year it was ORDERED and commissions three to five years
    # later, and a German class is not named for a year at all.
    ty = c.get('as_launched_year', c.get('type_year'))
    prov = {q['interface'] for q in c.get('provisions', [])}

    # ⚠ A HULL'S CATAPULT RATING AND ITS CATAPULT'S RATING ARE THE SAME NUMBER STATED TWICE,
    # and until the seventy-seventh order nothing compared them: the Maya said 7 t where her
    # own catapult said 7.7 and both figures had been in the files for months. Now that the
    # hull names the SKU, the two readings are checkable arithmetic.
    av = c.get('aviation') or {}
    cat, rat = av.get('catapult'), av.get('catapult_rating_t')
    if cat and rat is not None:
        sku = (CODES.get(cat) or {}).get('spec') or {}
        launch = sku.get('launch_t')
        if launch is not None and abs(launch - rat) > 0.01:
            err(p, f"{cid}.aviation: the hull says {rat} t and {cat} says {launch} t — "
                   f"one number, stated twice, and they disagree")

    # A battery entry names EITHER a SKU (`component`) or, where the fitting lies
    # outside the navy's own Mark/Type sequence and therefore has no SKU, a literal
    # `spec`. Exactly one. Conventions 7 and the ship-class schema both say so; this
    # is the check that makes a main battery impossible to lose into `armament`.
    for b in c.get('batteries', []):
        lbl = f"{cid}.batteries[{b['role']}]"
        has_c, has_s = 'component' in b, 'spec' in b
        if has_c == has_s:
            err(p, f"{lbl}: a battery entry needs EXACTLY ONE of `component` (a SKU) "
                   f"or `spec` (a literal, for a fitting outside the Mark/Type sequence)"
                   f" — it has {'both' if has_c else 'neither'}")
            continue
        info = None
        if has_c:
            info = check_code(p, lbl, b['component'], ty, nation)
            if info and info['family'] == 'bat':
                err(p, f"{lbl}: '{b['component']}' is a storage battery. `batteries` is "
                       f"the WEAPONS array — the cell belongs in the `battery` row")
        if b.get('ammunition'):
            check_code(p, lbl + '.ammunition', b['ammunition'], ty, nation)
        if info and info.get('interface') and c.get('provisions') and info['interface'] not in prov:
            warn(p, f"{lbl}: '{b['component']}' plugs into '{info['interface']}' "
                    f"but the class declares no such provision")
        # ⚠ A FIRING TIME IS NOT A DATUM, IT IS `rounds_per_gun / rate` AND THE GUN OWNS THE RATE.
        # Nine of them were wrong across two navies and nothing noticed, because the batteries were
        # cross-checked against nothing and the arithmetic behind the figure was never run. It holds
        # on every battery in the project that resolves a rate; where the gun states none, SKIP.
        if info:
            sp = info.get('spec') or {}
            rate = sp.get('rpm_per_gun') or sp.get('rpm_per_barrel') or sp.get('rpm')
            rpg, ft = b.get('rounds_per_gun'), b.get('firing_time_min')
            if rate and rpg and ft:
                want = rpg / rate
                if abs(want - ft) > max(0.5, ft * 0.05):
                    err(p, f"{lbl}: firing time {ft} min against {rpg} rpg at {rate} rpm, "
                           f"which is {want:.1f} — the figure is the division, not a datum")

    # EVERY GUN-ARMED SURFACE COMBATANT CARRIES EXACTLY ONE role:'main' ENTRY.
    # Carriers, merchants and submarines are exempt: a carrier has no main battery
    # by nature, and a boat may or may not carry a deck gun.
    if c.get('batteries') is not None and c.get('type') in ('BB', 'BC', 'CA', 'CL', 'DD'):
        mains = [b for b in c.get('batteries', []) if b.get('role') == 'main']
        if len(mains) != 1:
            err(p, f"{cid}: a {c['type']} must carry exactly one batteries[] entry with "
                   f"role 'main' — found {len(mains)}. A main battery outside the navy's "
                   f"Mark/Type sequence uses a literal `spec`; it never lives in `armament`")
    if c.get('batteries') is not None and c.get('armament', {}).get('main_battery') is not None:
        err(p, f"{cid}: a COMPONENT-style class states its main battery in `batteries[]` "
               f"with role 'main', never in `armament.main_battery`")

    for f in c.get('machinery', {}).get('fits', []):
        # machinery refit groups are exempt from as-launched discipline by the
        # engine code's own year (conventions 7)
        info = check_code(p, f"{cid}.machinery", f['component'], None, nation)
        if info and info['family'] not in ENGINE_FAMILIES:
            err(p, f"{cid}.machinery: '{f['component']}' is not an engine family")
    if c.get('machinery'):
        m = c['machinery']
        if m['cruise_bank'] > m['bays']:
            err(p, f"{cid}.machinery: cruise_bank {m['cruise_bank']} > bays {m['bays']}")

    # A storage battery is a component with generations, and its home is the
    # class's own `battery` row — the exact analogue of the machinery row. It is
    # not a sensor, not a weapon and not an upgrade, and all three mistakes were
    # in the German pack before this check existed.
    if c.get('battery'):
        b = c['battery']
        info = check_code(p, f"{cid}.battery", b['component'], None, nation)
        if info and info['family'] != 'bat':
            err(p, f"{cid}.battery: '{b['component']}' is not of family 'bat'")
        for g in b.get('refit_groups', []):
            gi = check_code(p, f"{cid}.battery.refit_groups", g, None, nation)
            if gi and gi['family'] != 'bat':
                err(p, f"{cid}.battery.refit_groups: '{g}' is not of family 'bat'")

    for s in c.get('sensors', []):
        info = check_code(p, f"{cid}.sensors", s, ty, nation)
        if info and info['family'] == 'bat':
            err(p, f"{cid}.sensors: '{s}' is a storage battery, not a sensor — "
                   f"it belongs in the class's `battery` row")
    for k in c.get('kits', []):
        check_code(p, f"{cid}.kits", k, None, nation)   # Kits rows predate the kit

    for u in c.get('possible_upgrades', []):
        info = check_code(p, f"{cid}.possible_upgrades", u, None, nation)
        if info and info['family'] in ENGINE_FAMILIES:
            err(p, f"{cid}.possible_upgrades: engine code '{u}' — the machinery row "
                   f"carries its own refit groups")
        if info and info['family'] in KIT_FAMILIES:
            err(p, f"{cid}.possible_upgrades: kit code '{u}' — kits are fittings, not upgrades")
        if info and info['family'] == 'bat':
            err(p, f"{cid}.possible_upgrades: battery code '{u}' — the battery row "
                   f"carries its own refit groups, exactly as the machinery row does")
        # An upgrade MAY predate the class: the Shima carries a launcher
        # foundation and no launcher, and optical sights and no director, so
        # older SKUs are genuine upgrades for her. Only flag a code the class
        # already carries as launched.
        carried = ({b['component'] for b in c.get('batteries', []) if 'component' in b} |
                   {b.get('ammunition') for b in c.get('batteries', [])} |
                   set(c.get('sensors', [])))
        if info and u in carried:
            err(p, f"{cid}.possible_upgrades: '{u}' is already carried as launched")

    for q in c.get('provisions', []):
        if q.get('fitted', 0) > q['count']:
            err(p, f"{cid}.provisions[{q['interface']}]: fitted {q['fitted']} > count {q['count']}")
        if q.get('for'):
            check_code(p, f"{cid}.provisions[{q['interface']}].for", q['for'], None, nation)

    d = c['displacement']
    if 'full_load_tons' in d and d['full_load_tons'] < d['standard_tons']:
        err(p, f"{cid}: full load {d['full_load_tons']} < standard {d['standard_tons']}")
    if 'empty_tons' in d and d['empty_tons'] > d['standard_tons']:
        err(p, f"{cid}: empty {d['empty_tons']} > standard {d['standard_tons']}")
    if c.get('parent_class') and c['parent_class'] not in CLASSES:
        err(p, f"{cid}: unknown parent_class '{c['parent_class']}'")


def check_aircraft(p, a, nation):
    aid = a['id']
    ty = a['type_year']
    # An empty weight may be BUILT rather than asserted. Where it is, the build-up lives in
    # `weights.derivation` and this checks it: the line items must add up, and the sheet must
    # be the honest figure less the stated credit. ⚠ THIS EXISTS BECAUSE THE ARITHMETIC USED
    # TO LIVE IN A `notes` FIELD, where no tool could tell a derivation figure from a stale
    # one -- audit.py's A-check fired on six of them and every one was correct prose.
    # A derivation in the data is checkable; a derivation in prose is decoration.
    # ⚠ WHAT IS NORMAL WEIGHT ACTUALLY MADE OF? Conventions define it as a take-off weight with
    # full internal fuel, gun ammunition, oil and the crew, and every performance figure in the
    # corpus is quoted at it -- but nothing checked that the gap between empty and normal could
    # hold those things. ⚠ THIS CHECK USED TO SIT INSIDE `if dv:` AND SO RAN ON FOUR AIRCRAFT OUT
    # OF TWELVE, because only Japan's carry a `weights.derivation` block -- which is the real
    # reason the other eight were never checked, not the empty `armament` arrays that were blamed
    # for it. ⚠ AND IT IGNORED OIL, enforcing a weaker rule than the conventions state: 7 per cent
    # of fuel VOLUME on a piston type, a flat 20 kg on a jet.
    fu = a.get('fuel') or {}
    L = fu.get('internal_l')
    if L:
        ammo = 0.0
        for wpn in a.get('armament', []):
            sp = eff_spec(wpn)
            g = sp.get('round_belted_g') or sp.get('round_complete_g')
            if g and wpn.get('rounds'): ammo += wpn['rounds'] * g / 1000.0
        crew = a.get('crew') or {}
        manned = crew.get('normal') or crew.get('seats') or 1
        pw = (a.get('powerplant') or {}).get('component')
        is_jet = (CODES.get(pw) or {}).get('family') == 'jet'
        oil = 20.0 if is_jet else 0.063 * L
        resid = a['weights']['normal_kg'] - a['weights']['empty_kg'] - L * 0.72 - ammo
        if resid - oil < 80 * manned:
            warn(p, f"{aid}.weights: normal less empty leaves {resid:.0f} kg after fuel and "
                    f"ammunition; {oil:.0f} kg of that is oil, leaving {resid-oil:.0f} kg for "
                    f"{manned} crew at 80 kg a man — short by {80*manned-(resid-oil):.0f} kg. "
                    f"Normal weight is a TAKE-OFF weight and every performance figure is quoted at it")

    # An empty weight may be BUILT rather than asserted. Where it is, the build-up lives in
    # `weights.derivation` and this checks it: the line items must add up, and the sheet must
    # be the honest figure less the stated credit.
    dv = (a.get('weights') or {}).get('derivation')
    if dv:
        # ⚠ THE COMPARATOR'S PUBLISHED WEIGHT IS NEVER ADJUSTED. A construction allowance on it was
        # tried and withdrawn: the equipment stacked on top was still counted at face value, so it
        # silently credited radar sets, armour plate and guns -- which weigh the same wherever they
        # are built. Where the comparator is land-based the navalization is counted in added_kg like
        # any other equipment. Do not re-add a comparator-side credit.
        got = dv['comparator_kg'] + dv['added_kg'] - dv['not_carried_kg']
        if abs(got - dv['honest_kg']) > 0.5:
            err(p, f"{aid}.weights.derivation: {dv['comparator_kg']} + {dv['added_kg']} - "
                   f"{dv['not_carried_kg']} = {got:.0f}, but honest_kg says {dv['honest_kg']}")
        want = dv['honest_kg'] * (1 - dv['credit'])
        if abs(want - a['weights']['empty_kg']) > 5:
            err(p, f"{aid}.weights: empty {a['weights']['empty_kg']} != honest "
                   f"{dv['honest_kg']} less {dv['credit']:.0%} ({want:.0f})")
        # ⚠ AGAINST THE COMPARATOR'S REAL PUBLISHED WEIGHT. The catalog claims nothing on these sheets
        # is lighter than the real article it is measured against; that is only worth something if it
        # is checked against the weight the real aeroplane actually had.
        if a['weights']['empty_kg'] < dv['comparator_kg']:
            err(p, f"{aid}.weights: empty {a['weights']['empty_kg']} is BELOW the real weight of "
                   f"{dv['comparator']} ({dv['comparator_kg']}) — the credit cannot outrun the "
                   f"equipment, and the catalog claims it never does")
        # ⚠ 'SUBSTANTIALLY DIFFERENT' IS NOT A NEUTRAL FILTER AND THIS IS WHERE THAT IS VISIBLE. The
        # small items that get dropped are almost all things ours carries and the comparator does not
        # -- a beacon set, catapult spools, extra tankage, span, high-lift devices -- so dropping them
        # always makes ours LIGHTER. It runs the same direction as the credit, so it is an unlabelled
        # extension of it, and past a few per cent that is no longer rounding.
        dr = dv.get('dropped_kg', 0)
        if dr and dr / dv['honest_kg'] > 0.04:
            warn(p, f"{aid}.weights.derivation: {dr} kg dropped as 'not substantial' is "
                    f"{dr/dv['honest_kg']:.1%} of honest and is nearly all on the + side — the "
                    f"effective credit is {dv['credit'] + dr/dv['honest_kg']:.0%}, not {dv['credit']:.0%}")
    # ⚠ A STATION'S RATING IS A LOAD LIMIT AND EVERY ALTERNATIVE ON IT HAS A MASS THE
    # EQUIPMENT FILE ALREADY STATES, so the two can be multiplied out and compared. They
    # had never been. Two sheets carried a store nearly three times the rating printed
    # beside it, in adjacent rows of the same table, for as long as both rows existed:
    # nothing read the mass out of one file and the rating out of the other. `rating_kg`
    # is PER RACK; a station with no `racks` is one point, so the two readings coincide.
    for st in (a.get('stations') or []):
        cap = st.get('rating_kg')
        if not cap:
            continue
        racks = st.get('racks', 1)
        for alt in (st.get('alternatives') or []):
            sp = eff_spec(alt)
            # the ladder, heaviest-honest first: as dropped with its air kit, then the
            # store's own mass, then a mine as laid, then a bare drum. A tank is fuel.
            unit = sp.get('as_dropped_kg') or sp.get('mass_kg') or sp.get('laid_kg') \
                or sp.get('drum_kg')
            if unit is None:
                form = (sp.get('forms') or [{}])[0]
                lit = sp.get('liters') or form.get('liters')
                if lit:
                    unit = lit * 0.72 + (sp.get('dry_kg') or form.get('dry_kg') or 0)
            if unit is None:
                continue                   # no stated mass: nothing to check, no finding
            n = alt.get('count', 1)
            if racks > 1 and unit > cap + 0.5:
                err(p, f"{aid}.stations.{st['id']}: {alt['component']} is {unit:.0f} kg and "
                       f"the rack is rated {cap:.0f} kg — one store does not fit one rack")
            if n * unit > racks * cap + 0.5:
                err(p, f"{aid}.stations.{st['id']}: {n} x {alt['component']} is "
                       f"{n*unit:.0f} kg against {racks} x {cap:.0f} kg of rating "
                       f"({racks*cap:.0f} kg) — the loadout does not fit the station")

    # ⚠ COMPONENT XOR SPEC, the shape `powerplant` already uses. An item too minor for a
    # SKU is stated as a literal WITH ITS MASS rather than dropped, so removing an entry
    # costs the catalog a line and costs the checks nothing.
    for wpn in (a.get('armament') or []):
        hc, hs = 'component' in wpn, 'spec' in wpn
        if hc == hs:
            err(p, f"{aid}.armament: needs EXACTLY ONE of `component` (a SKU) or `spec` "
                   f"(a literal, for a weapon too minor to earn one) — it has "
                   f"{'both' if hc else 'neither'}")
    for st in (a.get('stations') or []):
        for alt in (st.get('alternatives') or []):
            hc, hs = 'component' in alt, 'spec' in alt
            if hc == hs:
                err(p, f"{aid}.stations.{st.get('id')}: an alternative needs EXACTLY ONE of "
                       f"`component` or `spec` — it has {'both' if hc else 'neither'}")

    # A powerplant names EITHER an engine SKU (`component`) or, where the navy's
    # engines are a property of the aeroplane rather than a swappable article,
    # a literal `spec`. Exactly one — the same rule a battery entry follows.
    pw = a['powerplant']
    has_c, has_s = 'component' in pw, 'spec' in pw
    if has_c == has_s:
        err(p, f"{aid}.powerplant: needs EXACTLY ONE of `component` (an engine SKU) "
               f"or `spec` (a literal, for a navy with no engine SKUs) — it has "
               f"{'both' if has_c else 'neither'}")
    if has_c:
        check_code(p, f"{aid}.powerplant", pw['component'], ty, nation)
    for g in pw.get('refit_groups', []):
        check_code(p, f"{aid}.powerplant.refit_groups", g, None, nation)
    for w in a.get('armament', []):
        if 'component' in w:
            check_code(p, f"{aid}.armament", w['component'], ty, nation)
    for st in a.get('stations', []):
        for alt in st.get('alternatives', []):
            if 'component' in alt:
                check_code(p, f"{aid}.stations[{st['id']}]", alt['component'], ty, nation)
    for e in a.get('equipment', []):
        check_code(p, f"{aid}.equipment", e, ty, nation)
    for k in a.get('kits', []):
        check_code(p, f"{aid}.kits", k, None, nation)
    for u in a.get('possible_upgrades', []):
        info = check_code(p, f"{aid}.possible_upgrades", u, None, nation)
        if info and info['family'] in ENGINE_FAMILIES:
            err(p, f"{aid}.possible_upgrades: engine code '{u}' — the Powerplant row "
                   f"carries its own refit groups")
        if info and info['family'] in KIT_FAMILIES:
            err(p, f"{aid}.possible_upgrades: kit code '{u}' — kits are fittings, not upgrades")
    fu = a.get('fuel', {})
    for blk, lbl in ((fu, 'fuel'), (fu.get('with_tank', {}), 'fuel.with_tank')):
        if blk.get('ferry_km') and blk.get('combat_radius_km'):
            want = blk['ferry_km'] / 3.0
            if abs(blk['combat_radius_km'] - want) > max(2.0, want * 0.02):
                err(p, f"{aid}.{lbl}: combat radius {blk['combat_radius_km']} != ferry/3 "
                       f"({want:.0f}) — conventions 4")
    if fu.get('with_tank', {}).get('tank'):
        check_code(p, f"{aid}.fuel.with_tank", fu['with_tank']['tank'], None, nation)
    w = a['weights']
    if w.get('max_kg') and w['max_kg'] < w['normal_kg']:
        err(p, f"{aid}: max weight < normal weight")
    if w['normal_kg'] < w['empty_kg']:
        err(p, f"{aid}: normal weight < empty weight")


AIRCRAFT = {}
for p in fleet_files + pack_files:
    d = load(p)
    nat = d['nation']
    ids = [c['id'] for c in d.get('classes', [])]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        err(p, f"duplicate class ids within file: {dupes}")
    for c in d.get('classes', []):
        check_class(p, c, nat)
    for a in d.get('aircraft', []):
        if a['id'] in AIRCRAFT:
            err(p, f"aircraft id '{a['id']}' already defined in {AIRCRAFT[a['id']]}")
        AIRCRAFT[a['id']] = p
        check_aircraft(p, a, nat)
    for h in d.get('hulls', []):
        if h['class_id'] not in CLASSES:
            err(p, f"hull {h['id']}: unknown class_id {h['class_id']}")
        if not h.get('name') and not h.get('pennant'):
            warn(p, f"hull {h['id']}: neither name nor pennant — a ship needs one identity")
        for code in h.get('fit', []):
            check_code(p, f"hull {h['id']}.fit", code, None, nat)
    hids = [h['id'] for h in d.get('hulls', [])]
    dupes = {i for i in hids if hids.count(i) > 1}
    if dupes:
        err(p, f"duplicate hull ids within file: {dupes}")

# --------------------------------------------------------------------------
# packs: base references, aggregates, and the build-model check
# --------------------------------------------------------------------------
# Hull type -> the key a build model counts it under. Deliberately near-identity:
# a model that does not distinguish two types simply never emits the second key,
# and a key present in the model but not in the pack is ignored rather than
# forced to zero. CVL folds into CV because no model in the project separates
# them; CA does NOT fold into CL, because Britain's four Counties and eight
# Swifts are two different arguments and collapsing them hides one of them.
TYPE_TO_MODEL = {'BB': 'BB', 'BC': 'BC', 'CV': 'CV', 'CVL': 'CV', 'CA': 'CA',
                 'CL': 'CL', 'DD': 'DD', 'DE': 'DE', 'SS': 'SS'}

for p in pack_files:
    d = load(p)
    base = d['base'].get('file')
    if base and not os.path.exists(base):
        err(p, f"base file '{base}' does not exist")
    elif not base:
        if not d['base'].get('no_base_reason'):
            err(p, "base has no file and no no_base_reason — say why, do not leave it blank")
    else:
        bd = load(base)
        bids = {h['id'] for h in bd['hulls']}
        for hid in d['base'].get('retained_hulls', []):
            if hid not in bids:
                err(p, f"base.retained_hulls: '{hid}' is not a hull in {base}")
    pack_class_ids = {c['id'] for c in d.get('classes', [])}
    base_class_ids = set()
    if base and os.path.exists(base):
        base_class_ids = {c['id'] for c in load(base).get('classes', [])}
    # The build model builds NEW HULLS. Ships the pack inherits from the base
    # file are the model's starting position, not its output, so only classes
    # the pack itself defines are counted against it — and BOTH named hulls
    # and aggregates count, because Japan names nothing below the battle line
    # and Britain names everything above the flotillas.
    counts = {}

    def tally(class_id, n, status):
        if class_id not in CLASSES:
            err(p, f"unknown class_id {class_id}")
            return
        if class_id not in pack_class_ids:
            if class_id not in base_class_ids:
                warn(p, f"'{class_id}' is neither a class this pack defines nor one "
                        f"in its base file")
            return                      # inherited: not the model's output
        if status == 'building':
            return
        key = TYPE_TO_MODEL.get(CLASSES[class_id][3].get('type'))
        if key:
            counts[key] = counts.get(key, 0) + n

    for ag in d.get('aggregates', []):
        tally(ag['class_id'], ag['count'], ag.get('status'))
    for h in d.get('hulls', []):
        tally(h['class_id'], 1, h.get('status'))

    bm = d.get('build_model', {})
    dv = bm.get('derived')
    if dv and os.path.exists(dv):
        model = load(dv)
        year = int(d['as_of'][:4])
        # as_of 1 Jan YYYY is the END of YYYY-1: rows are END-OF-YEAR
        row_year = year - 1 if d['as_of'][5:] == '01-01' else year
        rows = [r for r in model['years'] if r['year'] == row_year]
        if not rows:
            err(p, f"build_model: no row for {row_year} in {dv}")
        elif 'end_of_year' not in rows[0]:
            err(p, f"build_model: {dv} rows carry no 'end_of_year' — a model that "
                   f"cannot state the fleet it built cannot be checked against one")
        else:
            eoy = rows[0]['end_of_year']
            for k, got in sorted(counts.items()):
                want = eoy.get(k)
                if want is None:
                    continue
                if got != want:
                    err(p, f"build_model: {k} count {got} != model END {row_year} = {want}. "
                           f"ROWS ARE END-OF-YEAR — check you are not quoting a later year's figure.")
            if not QUIET:
                print(f"  {p}: build model agrees at END {row_year} — " +
                      " · ".join(f"{k} {v}" for k, v in sorted(counts.items())))
    elif dv:
        err(p, f"build_model.derived '{dv}' missing — run `python build_model.py --emit`")

# --------------------------------------------------------------------------
# ship-name collisions inside one navy, at one date
#
# A pack completes hulls the base file only had building, and then names its
# own new ships. Two ships of one navy afloat under the same name on the same
# day is a canon error, not a data style — and it is invisible until the base
# file and the pack are read together, which nothing did before this file.
# --------------------------------------------------------------------------
AFLOAT = {'active', 'reserve', 'trials', 'converting', 'disarmed', 'target'}
for p in pack_files:
    d = load(p)
    base = d['base'].get('file')
    if not base or not os.path.exists(base):
        continue
    bd = load(base)
    retained = set(d['base'].get('retained_hulls', []))
    names = {}
    for h in bd['hulls']:
        if h['id'] in retained and h.get('name'):
            names.setdefault(h['name'].replace('USS ', '').replace('HMS ', '')
                             .replace('IJN ', '').strip().lower(), []).append(
                                 f"{base}:{h['id']}")
    for h in d.get('hulls', []):
        if h.get('name') and h.get('status') in AFLOAT:
            names.setdefault(h['name'].strip().lower(), []).append(f"{p}:{h['id']}")
    for nm, owners in sorted(names.items()):
        if len(owners) > 1:
            warn(p, f"two {d['nation']} ships named '{nm}' afloat at {d['as_of']}: "
                    f"{owners} — CANON QUESTION, not a data style. One of them needs a "
                    f"different name, and only the user can say which.")

# --------------------------------------------------------------------------
# scenarios: cross-file OOB references
# --------------------------------------------------------------------------
for p in scen_files:
    d = load(p)
    supplemental_classes, supplemental_hulls, supplemental_aircraft = set(), set(), set()
    for src in d.get('sources', {}).get('playable', []):
        if not os.path.exists(src):
            err(p, f"sources: '{src}' does not exist")
            continue
        extra = load(src)
        base = extra.get('historicalBase', {})
        supplemental_classes.update(c['id'] for c in base.get('classes', []))
        supplemental_hulls.update(h['id'] for h in base.get('hulls', []))
        part = extra.get('campaigns', {}).get(d['meta']['id'], {})
        supplemental_classes.update(c['spec']['id'] for c in part.get('classes', []))
        supplemental_hulls.update(h['id'] for h in part.get('navy', {}).get('hulls', []))
        supplemental_aircraft.update(a['id'] for a in part.get('aircraft', []))
    for src in d.get('sources', {}).get('fleets', []) + \
               d.get('sources', {}).get('packs', []) + \
               d.get('sources', {}).get('equipment', []):
        if not os.path.exists(src):
            err(p, f"sources: '{src}' does not exist")
    for dv in d.get('divergences', {}).values():
        if dv.get('enabled') and dv.get('pack') and not os.path.exists(dv['pack']):
            err(p, f"divergences: enabled pack '{dv['pack']}' does not exist")
    for nat, oob in d.get('order_of_battle', {}).items():
        for hid in oob.get('hulls', []):
            if hid not in HULLS and hid not in supplemental_hulls:
                err(p, f"{nat}: unknown hull {hid}")
        for ag in oob.get('aggregates', []):
            if ag['class_id'] not in CLASSES and ag['class_id'] not in supplemental_classes:
                err(p, f"{nat}: unknown class {ag['class_id']}")
        for ac in oob.get('aircraft', []):
            if ac['aircraft_id'] not in AIRCRAFT and ac['aircraft_id'] not in supplemental_aircraft:
                err(p, f"{nat}: unknown aircraft {ac['aircraft_id']}")

# --------------------------------------------------------------------------
print()
print('FAIL: %d errors' % errors if errors else 'ALL VALID')
if not QUIET:
    print(f"classes: {len(CLASSES)} · named hulls: {len(HULLS)} · aircraft: {len(AIRCRAFT)} · "
          f"component SKUs: {len(CODES)} · warnings: {warnings}")
sys.exit(1 if errors else 0)
