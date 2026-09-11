# -*- coding: utf-8 -*-
"""Fisher's Ghost construction model (Britain).

   THIS IS NOT build_model.py AND IT IS NOT MEANT TO BE.

   Japan's model is a PURSE: a flat tonnage envelope, an 80 per cent learning
   curve, and a programme that falls out of repeating one hull per role for
   twenty-five years. Nothing about Britain works that way. Her programme is
   FIVE NAMED CLASSES ON A KNOWN CADENCE, every one larger and different from
   the last, so there is no curve to ride and nothing to search for. Searching
   for a British programme would be searching for something the Admiralty
   already wrote down.

   So this model is an AUDIT, not a purse. The programme is authored, hull by
   hull, from the dates canon states. The model computes what that schedule
   demands each year and holds it against TWO VOTES:

     * the HULL VOTE, in tons, which the treaties limit and which Britain
       therefore lies about; and
     * the MACHINERY VOTE, in shaft horsepower, WHICH NO TREATY LIMITS AT ALL
       and which Britain quadruples between 1922 and 1930.

   The whole scenario lives in the gap between them. The hull vote is
   embarrassed, public and argued about in Parliament every March. The
   machinery vote is enormous, invisible and has never once been debated,
   because a turbine is not a ship.

   AND THE MODEL'S FINDING IS THAT THE CONSTRAINT MOVES. Through the twenties
   it is the machinery vote that binds - cumulative demand peaks at 133 per
   cent of the vote in 1923 - which is WHY the vote was quadrupled: Britain
   did not quadruple it out of enthusiasm, she quadrupled it because the
   Insuperables - 244,000 shp apiece for the fleet's first 36 knots - could
   not otherwise have been ordered. By 1930 the quadrupling
   has done its work and the binding constraint moves to STEEL, and stays
   there. Every year from 1930 to 1933 the hull vote is over-subscribed and
   the machinery vote is not.

   That is why the ladder's shape is what it is. NOTHING EVER COMES OFF A
   BRITISH CAPITAL SHIP: the G3's protective scheme of 1921 is carried
   unaltered by all four classes, so every generation's growth has to be paid
   for out of the votes rather than out of the belt. The machinery vote pays
   for the four knots (Invincible 160,000 shp to Insuperable 244,000), and the
   hull vote pays for everything after it - the 18-inch, the deeper torpedo
   system and the anti-aircraft battery that makes Incorrigible the heaviest
   ship in the fleet. Four ships, one design, and the estimates absorb all of
   it.

   Two outputs. (a) The fleet at every year-end, which comes from the authored
   laying-down and completion dates and therefore CANNOT DRIFT FROM CANON.
   (b) The load on each vote in each year, which is the finding.

   Usage:  python build_model_uk.py            summary + year table
           python build_model_uk.py --emit     write data/derived/uk_build_model.json
"""

# ---------------------------------------------------------------------------
# THE TWO VOTES. Stated, never searched (SIM-RULE: an envelope is an input).
# ---------------------------------------------------------------------------
# HULL VOTE - tons of new combatant hull under construction per year.
# Britain's real construction vote 1922-35 bought roughly 30,000 t/yr. This
# programme demands about twice that, and the model does not pretend thrift
# pays for it. Four canon savings pay for perhaps half:
#
#   1. FOURTEEN CAPITAL HULLS SCRAPPED OR SOLD 1924-31 - five R class, four
#      Iron Dukes, five Queen Elizabeths, of which two went to the Royal
#      Australian Navy WITH RAN CREWS AND ON SOMEBODY ELSE'S PAYROLL. Upkeep
#      and manning released; the Australian pair banked as cash.
#   2. TWENTY-THREE CRUISERS NOT BUILT - 26 hulls against a stated trade-
#      defence requirement of 70.
#   3. ABOUT FORTY DESTROYERS NOT BUILT, and no escort programme in any year.
#   4. NO MODERNISATION OF ANYTHING, EVER. Britain re-engines three ships in
#      fourteen years and refits nothing else.
#
# THE OTHER HALF IS A REAL RISE IN THE NAVAL ESTIMATES AND IS NOT DEFENSIBLE
# ON ARITHMETIC. It is defensible on canon, which says it out loud twice:
# Parliament is in OPEN REVOLT over the estimates, and THE FLEET CONSUMED THE
# 1920s AND EVERYONE KNOWS IT. A vote at twice history is what a fleet that
# consumed a decade looks like on a ledger, and the revolt is its price.
# If a future ruling wants this fleet cheaper, THIS is the number to move,
# and the hulls that fall out are Unapproachable and Incorrigible.
HULL_VOTE = 54000            # t/yr, flat

# MACHINERY VOTE - shaft horsepower of new plant funded per year. NOTHING IN
# ANY TREATY LIMITS A TURBINE, which is the real defection of the decade and
# the only line in the British estimates that grows every single year.
MACH_1922 = 165000           # shp/yr
MACH_1930 = 680000           # shp/yr from 1930 - 4.12x, then flat
MACH_RAMP_END = 1930


def mach_vote(y):
    if y <= 1922:
        return float(MACH_1922)
    if y >= MACH_RAMP_END:
        return float(MACH_1930)
    f = (y - 1922) / float(MACH_RAMP_END - 1922)
    return MACH_1922 + (MACH_1930 - MACH_1922) * f


# ---------------------------------------------------------------------------
# THE PROGRAMME - authored hull by hull from the dates canon states.
#   (class_id, display, type, tons, shp, [(laid_down, completed), ...])
# `completed` of None means still building when the run ends.
#
# CLASS IDS ARE THE PACK'S IDS, exactly, so that
# `data/ships/hindsight/uk_fishers_ghost_pack.json` and this model can be held
# against each other by tools/validate.py rather than by eye.
# ---------------------------------------------------------------------------
PROGRAMME = [
    # Suspended on the afternoon of 6 February 1922 as the treaty requires -
    # for eleven weeks - and resumed on 24 April as "reconstructions" of hulls
    # surrendered for scrapping. Declared at 35,000 t. The world gasped and
    # filed the declaration; the Admiralty's only complaint was the speed.
    ("invincible_bc22", "Invincible", "BC", 48400, 160000,
     [(1922, 1925), (1922, 1925)]),

    # The last cruisers Britain builds to anybody else's requirement, and the
    # last heavy cruisers she builds at all.
    ("county_ca24", "County", "CA", 10000, 80000,
     [(1924, 1928), (1925, 1929), (1926, 1929), (1927, 1930)]),

    # The large light cruisers, converted. Hull tonnage already exists; the
    # charge is flight decks, hangars and lifts at 40 per cent of a new hull.
    ("courageous_conversion", "Courageous", "CV", 9000, 30000,
     [(1922, 1925), (1925, 1928), (1927, 1930)]),

    # The second rung, on experimental high-pressure plants the Royal Navy -
    # uniquely - has made reliable, because it has spent more on marine
    # machinery research than the rest of the world combined.
    ("insuperable_bc27", "Insuperable", "BC", 51500, 244000,
     [(1927, 1929), (1927, 1930), (1928, 1931), (1929, 1932)]),

    # Re-engining Hood, Renown and Repulse to 33 knots. NO HULL TONNAGE AT
    # ALL - a pure machinery-vote item, and the clearest thing in the model:
    # three ships, no new steel, and it costs more shaft horsepower than the
    # entire County programme. It is also what makes them THE SLOW SHIPS.
    ("re_engine", "re-engining", "--", 0, 150000,
     [(1927, 1929), (1928, 1930), (1929, 1931)]),

    # Fisher's actual dream. The drawing office motto is carved over the door.
    ("incomparable_bc31", "Incomparable", "BC", 54500, 251000,
     [(1931, 1934), (1931, 1935)]),

    # The fleet's 36 knots on 7,200 tons: a quarter of standard displacement
    # in machinery, which no cruiser in any navy has ever carried.
    ("swift_cl29", "Swift", "CL", 7200, 87000,
     [(1929, 1931), (1929, 1931), (1930, 1932), (1930, 1932),
      (1931, 1933), (1931, 1933), (1932, 1934), (1932, 1934),
      (1933, 1935), (1933, 1935), (1934, 1936), (1935, 1937)]),

    # Fast decks, because a deck that cannot keep up with the battle line is
    # a deck this doctrine has no use for.
    ("ark_royal_cv31", "Ark Royal", "CV", 25400, 169000,
     [(1931, 1934), (1932, 1935), (1935, None)]),

    # Sixty destroyers in fourteen years against a navy that historically
    # built a hundred, and NO ESCORTS AT ALL, in any year, ever.
    ("sabre_dd22", "destroyers", "DD", 1400, 38000,
     [(1922 + (i * 12) // 60, 1924 + (i * 12) // 60) for i in range(60)]),

    ("sturgeon_ss23", "submarines", "SS", 1400, 3000,
     [(1923 + (i * 11) // 30, 1925 + (i * 11) // 30) for i in range(30)]),


    # The motto taken literally. Ordered March 1935, laid down September, and
    # 8 per cent complete when the conference collapses. Nobody is buying
    # knots any more: the 1935 estimates went on a FOURTH triple 18-inch
    # group, and the belt, the deck and the barbettes came out to pay for it.
    ("incorrigible_bc35", "Incorrigible", "BC", 59000, 265000,
     [(1935, None), (1935, None)]),
]

CAPITAL = {"invincible_bc22", "insuperable_bc27", "incomparable_bc31", "incorrigible_bc35"}
# Not new hulls. Both consume a vote - the re-engining consumes more shaft
# horsepower than the entire County programme - but neither adds a ship to the
# navy, so neither may appear in the fleet the model states it built. The three
# converted large light cruisers and the three re-engined battlecruisers are
# already in the base file; counting them here would count them twice.
CONVERSIONS = {"courageous_conversion", "re_engine"}
# Nominal build span for a hull still on the slip when the run ends.
UNFINISHED_SPAN = {"incorrigible_bc35": 4, "ark_royal_cv31": 4}
# Incorrigible is laid down in SEPTEMBER, so 1935 buys about a third of a
# year, and the model returns the 8 per cent canon states.
FIRST_YEAR_FRACTION = {"incorrigible_bc35": 0.32, "ark_royal_cv31": 0.9}

START, END = 1922, 1936
NAME = {c[0]: c[1] for c in PROGRAMME}


def run(end=END):
    rows = []
    cum_t, cum_s = [0.0], [0.0]
    for y in range(START, end + 1):
        want_t = want_s = 0.0
        complete, building = {}, {}
        eoy, delivered, conversions = {}, {}, {}
        fleet_tons = 0
        for cid, name, typ, tons, shp, hulls in PROGRAMME:
            for h in hulls:
                ld, comp = h[0], h[1]
                span = h[2] if len(h) > 2 else (
                    (comp - ld) if comp else UNFINISHED_SPAN.get(cid, 4))
                span = max(1, span)
                ff = FIRST_YEAR_FRACTION.get(cid, 1.0)
                if ld <= y < ld + span:
                    share = (1.0 / span) * (ff if y == ld else 1.0)
                    want_t += tons * share
                    want_s += shp * share
                if comp and y >= comp:
                    complete[cid] = complete.get(cid, 0) + 1
                    if cid in CONVERSIONS:
                        conversions[cid] = conversions.get(cid, 0) + 1
                    else:
                        eoy[typ] = eoy.get(typ, 0) + 1
                        fleet_tons += tons
                        if y == comp:
                            delivered[typ] = delivered.get(typ, 0) + 1
                elif ld <= y:
                    done = (y - ld + 1) - (1.0 - ff)
                    building.setdefault(cid, []).append(
                        round(min(99.9, 100.0 * done / span), 1))
        hv, mv = float(HULL_VOTE), mach_vote(y)
        cum_t[0] += want_t
        cum_s[0] += want_s
        n = y - START + 1
        cum_hv = hv * n
        cum_mv = sum(mach_vote(yy) for yy in range(START, y + 1))
        rows.append(dict(
            year=y,
            cum_hull_demand=int(round(cum_t[0])),
            cum_hull_load_pct=round(100.0 * cum_t[0] / cum_hv, 1),
            cum_mach_demand=int(round(cum_s[0])),
            cum_mach_load_pct=round(100.0 * cum_s[0] / cum_mv, 1),
            hull_vote=int(hv), hull_demand=int(round(want_t)),
            hull_load_pct=round(100.0 * want_t / hv, 1),
            mach_vote=int(mv), mach_demand=int(round(want_s)),
            mach_load_pct=round(100.0 * want_s / mv, 1),
            binding=("machinery" if want_s / mv >= want_t / hv else "hull"),
            oversubscribed=[k for k, v in (("hull", want_t / hv),
                                           ("machinery", want_s / mv)) if v > 1.0],
            # end_of_year is NEW HULLS ONLY, by type, and is what
            # tools/validate.py holds the pack against. Conversions are
            # reported beside it and never inside it.
            delivered=delivered, end_of_year=eoy, fleet_tons=fleet_tons,
            conversions_complete=conversions,
            complete=complete, building=building))
    return rows


def emit(path='data/derived/uk_build_model.json'):
    import json, os
    rows = run()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = {
        "$generated_by": "build_model_uk.py",
        "note": "ROWS ARE END-OF-YEAR. Do not hand-edit: regenerate with "
                "`python build_model_uk.py --emit`. This model AUDITS an authored "
                "programme against two votes; it does not search for one. The fleet "
                "at each year-end comes from the authored dates and cannot drift "
                "from canon; the FINDING is the load on each vote.",
        "scenario": "fishers-ghost",
        "nation": "GBR",
        "hull_vote_t_yr": HULL_VOTE,
        "machinery_vote_shp_yr": {
            "1922": MACH_1922, "1930_onward": MACH_1930,
            "note": "Quadrupled 1922-30 and then flat. NO TREATY LIMITS A TURBINE."},
        "classes": [dict(id=c[0], name=c[1], type=c[2], tons=c[3], shp=c[4],
                         count=len(c[5]), capital=c[0] in CAPITAL)
                    for c in PROGRAMME],
        "years": rows,
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

    rows = run()
    print("hull vote      %s t/yr, flat  (about 1.6x Britain's historical construction "
          "vote: four canon savings pay for nearly all of it)" % format(HULL_VOTE, ','))
    print("machinery vote %s shp/yr in 1922 -> %s from 1930   QUADRUPLED, and no "
          "treaty limits it" % (format(MACH_1922, ','), format(MACH_1930, ',')))
    print()
    print("| Year | hull demand | yr | cum | mach demand | yr | cum | binding |")
    print("|---|---|---|---|---|---|---|---|")
    for r in rows:
        print("| %d | %s t | %.0f%% | %.0f%% | %s shp | %.0f%% | %.0f%% | %s |" % (
            r['year'], format(r['hull_demand'], ','), r['hull_load_pct'],
            r['cum_hull_load_pct'], format(r['mach_demand'], ','),
            r['mach_load_pct'], r['cum_mach_load_pct'],
            r['binding'].upper() if r['oversubscribed'] else r['binding']))
    print()
    e = rows[[r['year'] for r in rows].index(1935)]
    print("END 1935 - the fleet as the delegation leaves the conference room:")
    for k, v in sorted(e['complete'].items()):
        print("   %-13s %d" % (NAME[k], v))
    for k, v in sorted(e['building'].items()):
        print("   %-13s building at %s per cent" % (
            NAME[k], ", ".join(str(x) for x in v)))
    nb = sum(1 for r in rows if r['binding'] == 'machinery')
    ov = [r['year'] for r in rows if 'machinery' in r['oversubscribed']]
    hov = [r['year'] for r in rows if 'hull' in r['oversubscribed']]
    print()
    print("THE MACHINERY VOTE BINDS IN %d OF %d YEARS." % (nb, len(rows)))
    print("  over-subscribed (machinery): %s" % (", ".join(map(str, ov)) or "no year"))
    print("  over-subscribed (hull):      %s" % (", ".join(map(str, hov)) or "no year"))
