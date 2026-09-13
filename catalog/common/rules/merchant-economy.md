# Civilian merchant fleet

Average registered volume grows monthly by the coefficient below. Civilian production uses the GTP-scaled capacity shortage and logistics multipliers in [economy.md](economy.md); it has no naval catalog or order controls.

**Registered volume:** opening average GRT = the national opening register's total GRT / hull count. Current merchant GRT = surviving hulls × current average GRT. Each full month increases the average by 0.1%, with partial opening months prorated. For 1936 Japan, 4,085,650 / 2,146 = 1,903.844 GRT per hull. The provisional 1922 Soviet register uses 1,000 GRT per hull until a verified register is available.

GRT is a measure of enclosed ship volume: one register ton is 100 cubic feet (approximately 2.832 cubic metres), not a cargo weight or a gold value. See the [US Coast Guard's tonnage explanation](https://www.dco.uscg.mil/OCSNCOE/Drill-Down/DD-022/). The game's required transport volume, (GDP + GTP) / 2 GRT per month, is a balance rule; it is not derived from this physical unit definition. GTP is authored separately and has no live GRT-to-gold conversion.

For rebuilding, the opening GTP/GRT ratio is a national capacity benchmark, not a physical conversion. Required fleet GRT = opening GRT × current GTP / opening GTP. Production ranges from one base hull/month with sufficient or excess GRT to ten with no shipping, then applies the logistics multiplier and additive industry-expansion bonus. In peace and war the hull production formula is the same; GTP's own peace/war growth can change the requirement. The following values are shared across all fourteen starts.

```json game-data
{
  "MERCHANT_SIZE_MONTHLY": 0.001,
  "HULLS_SUFFICIENT": 1,
  "HULLS_MAX_SHORTAGE": 10,
  "LOGISTICS_MIN_PRODUCTION": 0.5,
  "LOGISTICS_NEUTRAL_PRODUCTION": 1,
  "LOGISTICS_MAX_PRODUCTION": 2
}
```
