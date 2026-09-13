# levels — data and balance

Levels run from 1 to 9. Opening level is 1 in 1922 and 5 in 1936. Naval industry preserves its opening calibration: (1 + (opening level − 1) × 0.15) / 1.6. Each subsequent upgrade adds 15% of that opening capacity to output and yards. Expansion multiplier = 1 + upgrades since opening × 0.15. The same multiplier applies to civilian hull production after its shortage and logistics factors. Other facilities retain their own documented linear level factors.

```json game-data
{
  "MIN_LEVEL": 1,
  "MAX_LEVEL": 9,
  "LEVEL_YEARS": [
    1922,
    1925,
    1929,
    1932,
    1936,
    1939,
    1942,
    1945,
    1948
  ],
  "INDUSTRY_EXPANSION": 0.15
}
```
