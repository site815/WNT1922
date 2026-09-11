# -*- coding: utf-8 -*-
"""Nothing Above Water construction model (Germany).

   ONE RAMPED PURSE. This is deliberately the JAPANESE instrument and not the
   British one: a stated annual envelope in t-equivalent, spent down each year
   across open lines by a stated share, exactly as `build_model.py` does. The
   one change frame section 6.4 asks for is that the envelope is A RAMP RATHER
   THAN A FLAT RATE, because Germany's construction curve has a shape no other
   nation in this project has:

       NEAR-ZERO 1922-32, THEN NEAR-VERTICAL FROM 1933.

   AND THE MODEL'S FINDING IS THAT THE RAMP IS NOT WHERE THE DIVERGENCE LIVES.
   The vertical part is 1933 onward and it is unremarkable - a large industrial
   country that decides to build submarines can build submarines. What is
   remarkable is the flat part. Germany spends 1922-32 at about 5,600 t-equiv a
   year, which was her actual historical construction rate and is under a tenth
   of Japan's envelope and under a tenth of Britain's, AND SHE LAYS DOWN ONE
   HULL WITH IT: Emden, ordered before the argument was won. Everything else in
   those eleven years is spent on a fleet she is not permitted to own - a design
   office in The Hague, prototypes in Finland, Spain and Turkey, jigs, drawings,
   a battery line funded on a traction contract, and crews.

   THAT SPEND BUYS NO TONNAGE AT ALL. The model reports it as `bank_spent` and
   never converts it into a hull, because it did not buy hulls. What it bought
   is a LEAD TIME, and that is the model's second output: with the bank, a
   coastal boat is one year from order to commissioning and an ocean boat two.
   WITHOUT IT they are three and five, and the June 1935 announcement - boats in
   the water within months - is arithmetically impossible. `--leads` prints the
   counterfactual: the same envelope, the same shares, and no thirteen years.

   Usage:  python build_model_de.py            summary + year table
           python build_model_de.py --leads    the no-bank counterfactual
           python build_model_de.py --emit     write data/derived/de_build_model.json
"""

# ---------------------------------------------------------------------------
# THE ENVELOPE. Stated, never searched (SIM-RULE: an envelope is an input).
# ---------------------------------------------------------------------------
# 1922-31 is Germany's REAL construction rate and not a guess: Emden (5,600 t),
# the three Koenigsbergs, Leipzig, Deutschland and twelve torpedo boats came to
# roughly 54,000 t of launchings in ten years. In this divergence none of the
# cruisers and none of the Panzerschiffe are ordered, so the same money is there
# and there is nothing legal to spend it on.
#
# 1932 is the first raider keel, against a votes line for "fleet auxiliaries"
# that nobody has yet asked to see itemised. 1933 is when the money arrives -
# and it arrives at a programme that has already existed for eleven years,
# which is the whole of that year's contribution.
ENV = [(1922, 5600), (1932, 9000), (1933, 22000), (1934, 48000),
       (1935, 84000), (1936, 95000), (1940, 104000)]


def env(y):
    v = 0
    for y0, e in ENV:
        if y >= y0:
            v = e
    return float(v)


# ---------------------------------------------------------------------------
# THE LINES.
# ---------------------------------------------------------------------------
DISP = {'RAIDER': 19000, 'RAIDER2': 21000,
        'COASTAL': 320, 'OCEAN': 1120, 'MASS': 840, 'ELEKTRO': 2000,
        'CRUISER': 5600}

# Year a line may first be BOUGHT. Note what this is not: it is not the year a
# hull may commission. No German submarine is in commission before June 1935 -
# the reveal is total and the fleet has to appear from nothing - so the coastal
# line opens in 1934 and its first boats commission in 1935, which is the
# historical Mob-U programme and the only way the announcement works.
OPEN = {'CRUISER': 1922, 'RAIDER': 1932, 'OCEAN': 1933, 'COASTAL': 1934,
        'MASS': 1937, 'RAIDER2': 1940, 'ELEKTRO': 1941}

# Years from order to commissioning, WITH the thirteen-year bank behind it.
LEAD = {'CRUISER': 3, 'RAIDER': 3, 'RAIDER2': 3,
        'COASTAL': 1, 'OCEAN': 2, 'MASS': 1, 'ELEKTRO': 1}

# The counterfactual: the same programme without the bank. A yard that has
# never seen the drawings, has no jigs, and is training its own crews.
LEAD_NO_BANK = {'CRUISER': 3, 'RAIDER': 4, 'RAIDER2': 4,
                'COASTAL': 3, 'OCEAN': 5, 'MASS': 3, 'ELEKTRO': 4}

# Boat shares, stated by era. "The submarine share dominates it entirely: the
# raiders are one hull a year and everything else is boats" (frame 6.4), so the
# raider line is a QUOTA taken off the top and these shares divide what is left.
# The 1942 shift is the Schwertwal's acceptance report, whose whole text is
# three words: BUILD NOTHING ELSE.
SHARES = [
    (1933, {'OCEAN': 1.00}),
    # 1934 IS THE YEAR THE SHARE MOVED. The staff could have had a larger
    # announcement fleet by buying coastal boats, which commission in a year;
    # it bought ocean hulls instead, which take two. The reveal of June 1935 is
    # therefore SMALLER THAN IT COULD HAVE BEEN, on purpose, and the fleet
    # behind it is larger and longer-legged for the same money.
    (1934, {'OCEAN': 0.67, 'COASTAL': 0.33}),
    (1935, {'OCEAN': 0.70, 'COASTAL': 0.30}),
    (1936, {'OCEAN': 0.80, 'COASTAL': 0.20}),
    (1937, {'MASS': 0.60, 'OCEAN': 0.30, 'COASTAL': 0.10}),
    (1940, {'MASS': 0.72, 'OCEAN': 0.20, 'COASTAL': 0.08}),
    (1941, {'MASS': 0.60, 'ELEKTRO': 0.30, 'OCEAN': 0.07, 'COASTAL': 0.03}),
    (1942, {'ELEKTRO': 0.65, 'MASS': 0.32, 'COASTAL': 0.03}),
    (1944, {'ELEKTRO': 0.88, 'MASS': 0.12}),
]


def shares(y):
    s = {}
    for y0, d in SHARES:
        if y >= y0:
            s = d
    return s


# The raider line is authored because canon states it: one keel a year from
# 1932, and a larger second design from 1940. Four hulls are on the slips at
# the start date - Seeadler in commission, Kormoran, Widder and Moewe building -
# and that is the only count the frame states outright.
RAIDER_KEELS = {y: ('RAIDER' if y < 1940 else 'RAIDER2') for y in range(1932, 1951)}

# The one hull of the flat decade, and she was ordered on 8 December 1921.
CRUISER_KEELS = {1922: 'CRUISER'}

TYPE_OF = {'RAIDER': 'CA', 'RAIDER2': 'CA', 'CRUISER': 'CL',
           'COASTAL': 'SS', 'OCEAN': 'SS', 'MASS': 'SS', 'ELEKTRO': 'SS'}

# Emden is a BASE-FILE hull (data/ships/de.json) and the pack inherits her, so
# she is charged against the envelope - she is the flat decade's only hull and
# leaving her out would flatter it - but she is NOT in the fleet the model states
# it built. Counting her there would count her twice, exactly as counting
# Britain's converted Courageous trio would.
NOT_FLEET = {'CRUISER'}

# The design office is never closed and never becomes tonnage. 1922-32 it takes
# EVERYTHING the quota lines do not, which is the divergence stated as a number.
# From 1933 it is a flat research charge off the top, because the Hai
# requirement of 1936, the Atlantis of 1937 and the Elektroboot all had to be
# drawn by somebody while the yards were full.
OFFICE_FROM_1933 = 2400

START, END = 1922, 1950


def run(end=END, lead=None):
    lead = lead or LEAD
    built = {k: 0 for k in DISP}
    carry = {k: 0.0 for k in DISP}
    due = {}                      # commissioning year -> {line: n}
    bank_spent = 0.0
    rows = []
    for y in range(START, end + 1):
        purse = env(y)
        ordered = {}

        # --- the quota lines, taken off the top -----------------------------
        charged = 0.0
        for keels in (CRUISER_KEELS, RAIDER_KEELS):
            for ky, line in keels.items():
                if ky <= y < ky + lead[line]:
                    c = DISP[line] / float(lead[line])
                    charged += c
                    if ky == y:
                        ordered[line] = ordered.get(line, 0) + 1
                        due.setdefault(y + lead[line], {})
                        due[y + lead[line]][line] = due[y + lead[line]].get(line, 0) + 1
        purse -= charged

        # --- the design office, off the top ----------------------------------
        # 1922-32 it takes everything the quota lines did not. From 1933 it is a
        # flat charge, and the difference between those two sentences is the
        # entire German divergence expressed as arithmetic.
        office = purse if y <= 1932 else min(purse, float(OFFICE_FROM_1933))
        bank_spent += max(0.0, office)
        purse -= office

        # --- the boats -------------------------------------------------------
        sh = shares(y)
        for line, frac in sorted(sh.items()):
            if y < OPEN[line] or frac <= 0:
                continue
            p = purse * frac + carry[line]
            n = 0
            while p >= DISP[line]:
                p -= DISP[line]
                n += 1
            carry[line] = p
            if n:
                ordered[line] = ordered.get(line, 0) + n
                k = y + lead[line]
                due.setdefault(k, {})
                due[k][line] = due[k].get(line, 0) + n

        # --- commissionings --------------------------------------------------
        for line, n in due.get(y, {}).items():
            built[line] += n
        eoy, delivered, fleet_tons = {}, {}, 0
        for line, n in built.items():
            if n and line not in NOT_FLEET:
                eoy[TYPE_OF[line]] = eoy.get(TYPE_OF[line], 0) + n
                fleet_tons += n * DISP[line]
        for line, n in due.get(y, {}).items():
            if line not in NOT_FLEET:
                delivered[TYPE_OF[line]] = delivered.get(TYPE_OF[line], 0) + n
        building = {}
        for k, d in due.items():
            if k > y:
                for line, n in d.items():
                    building[line] = building.get(line, 0) + n

        rows.append(dict(
            year=y, envelope=int(env(y)), quota_charge=int(round(charged)),
            ordered=dict(ordered), delivered=delivered, end_of_year=eoy,
            fleet_tons=fleet_tons,
            by_line={k: v for k, v in built.items() if v},
            building=building, bank_spent_cumulative=int(round(bank_spent))))
    return rows


def emit(path='data/derived/de_build_model.json'):
    import json, os
    rows = run()
    alt = run(lead=LEAD_NO_BANK)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    e35 = [r for r in rows if r['year'] == 1935][0]
    a35 = [r for r in alt if r['year'] == 1935][0]
    out = {
        "$generated_by": "build_model_de.py",
        "note": "ROWS ARE END-OF-YEAR. Do not hand-edit: regenerate with "
                "`python build_model_de.py --emit`. ONE RAMPED PURSE - the "
                "Japanese instrument with a ramp instead of a flat rate, which "
                "is what frame section 6.4 asks for. The raider line is a QUOTA "
                "taken off the top because canon states it hull by hull; the "
                "boat shares divide what is left.",
        "scenario": "nothing-above-water",
        "nation": "DEU",
        "envelope_t_equiv_yr": {str(y): e for y, e in ENV},
        "displacements_t": DISP,
        "line_opens": OPEN,
        "lead_years": LEAD,
        "lead_years_without_the_bank": LEAD_NO_BANK,
        "finding": {
            "headline": "THE FLAT DECADE IS THE DIVERGENCE, NOT THE RAMP.",
            "detail": "1922-31 runs at 5,600 t-equiv/yr - Germany's real "
                      "construction rate, under a tenth of Japan's envelope and "
                      "under a tenth of Britain's - and it lays down ONE HULL, "
                      "Emden, ordered on 8 December 1921 before the argument was "
                      "won. The rest is spent on a fleet Germany is not permitted "
                      "to own and BUYS NO TONNAGE WHATEVER. The purchase is lead "
                      "time, and that is checkable: with the bank the fleet at END "
                      "1935 is "
                      + " · ".join(f"{k} {v}" for k, v in sorted(e35['end_of_year'].items()))
                      + "; without it, on the same envelope and the same shares, it is "
                      + (" · ".join(f"{k} {v}" for k, v in sorted(a35['end_of_year'].items()))
                         or "nothing at all")
                      + ". The June 1935 announcement is the bank being spent in "
                        "public, and every naval attache in Europe can do that "
                        "arithmetic.",
            "bank_spent_to_1932_t_equiv": [r for r in rows if r['year'] == 1932][0]['bank_spent_cumulative'],
        },
        "years": rows,
        "counterfactual_no_bank": [
            {"year": r['year'], "end_of_year": r['end_of_year']} for r in alt],
    }
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
        f.write('\n')
    return path


if __name__ == '__main__':
    import sys
    if '--emit' in sys.argv:
        print("wrote", emit())
        raise SystemExit(0)

    lead = LEAD_NO_BANK if '--leads' in sys.argv else LEAD
    rows = run(lead=lead)
    if '--leads' in sys.argv:
        print("THE COUNTERFACTUAL: same envelope, same shares, NO THIRTEEN YEARS.")
    print("envelope ramp: " + " -> ".join(
        "%d %s" % (y, format(e, ',')) for y, e in ENV) + " t-equiv/yr")
    print()
    print("| Year | env | quota | ordered | fleet (CA/SS) | bank spent, cum |")
    print("|---|---|---|---|---|---|")
    for r in rows:
        if r['year'] > 1945:
            continue
        print("| %d | %s | %s | %s | CA %d / SS %d | %s |" % (
            r['year'], format(r['envelope'], ','), format(r['quota_charge'], ','),
            ", ".join("%s %d" % (k.lower(), v) for k, v in sorted(r['ordered'].items())) or "-",
            r['end_of_year'].get('CA', 0), r['end_of_year'].get('SS', 0),
            format(r['bank_spent_cumulative'], ',')))
    print()
    e = [r for r in rows if r['year'] == 1935][0]
    print("END 1935 - six months after the announcement:")
    for k, v in sorted(e['by_line'].items()):
        print("   %-8s %d" % (k.lower(), v))
    print("   building:  " + ", ".join(
        "%s %d" % (k.lower(), v) for k, v in sorted(e['building'].items())))
    print("   fleet tons %s · bank spent to date %s t-equiv" % (
        format(e['fleet_tons'], ','), format(e['bank_spent_cumulative'], ',')))
    for y in (1939, 1943, 1945, 1950):
        r = [x for x in rows if x['year'] == y]
        if r:
            r = r[0]
            print("END %d: CA %d · SS %d   (%s)" % (
                y, r['end_of_year'].get('CA', 0), r['end_of_year'].get('SS', 0),
                ", ".join("%s %d" % (k.lower(), v) for k, v in sorted(r['by_line'].items()))))
