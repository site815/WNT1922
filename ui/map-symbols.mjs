import symbols from '../assets/ui/map-symbols.json' with { type: 'json' };

// Native chart meshes and the legend consume this same geometry and palette.
export const MAP_SYMBOLS = symbols;
const points = row => row.points.map(point => point.join(',')).join(' ');
export function fleetSymbolVariant(hulls = []) {
  const types = new Set(hulls.map(hull => hull.type));
  // Flagship role comes from the player's own surviving composition only.
  for (const [variant, members] of [['carrier',['CV','CVL']],['capital',['BB','BC']],['cruiser',['CA','CL']],
    ['escort',['DD','DE','TB','PT']],['submarine',['SS','SM']],['support',['AO','AK','AM','AV','AS','AR']]])
    if (members.some(type => types.has(type))) return variant;
  return 'escort';
}
export function mapSymbolSvg(kind, pixels = 19, {variant, color} = {}) {
  const base = kind === 'selection' ? symbols.selection : symbols.symbols[kind];
  const spec = base && {...base, ...(kind === 'fleet' ? symbols.fleetVariants[variant] : {})};
  if (!spec) throw new Error(`Unknown chart symbol: ${kind}`);
  const ink = /^#[0-9a-f]{6}$/i.test(color || '') ? color : spec.color;
  const casing = symbols.backingColor;
  const polygons = (spec.polygons || []).map(row => `<polygon points="${points(row)}" fill="${row.color || ink}" stroke="${casing}" stroke-width="${symbols.casingWidth}"/>`).join('');
  const strokes = (spec.strokes || []).map(row => {
    const tag = row.closed ? 'polygon' : 'polyline', shape = points(row);
    return `<${tag} points="${shape}" fill="none" stroke="${casing}" stroke-width="${row.width + symbols.casingWidth}"/><${tag} points="${shape}" fill="none" stroke="${row.color || ink}" stroke-width="${row.width}"/>`;
  }).join('');
  return `<svg aria-hidden="true" data-chart-symbol="${kind}" viewBox="-60 -60 120 120" width="${pixels}" height="${pixels}" style="vertical-align:middle;flex:none" stroke-linejoin="round" stroke-linecap="round">${polygons}${strokes}</svg>`;
}
export function mapSymbolLegend({fleetColor} = {}) {
  return [...Object.keys(symbols.symbols), 'selection'].map(kind => {
    const spec = kind === 'selection' ? symbols.selection : symbols.symbols[kind];
    const glyphs = kind === 'fleet' ? Object.entries(symbols.fleetVariants).map(([variant, row]) =>
      `<span title="${row.label}">${mapSymbolSvg(kind,19,{variant,color:fleetColor})}</span>`).join('') : mapSymbolSvg(kind);
    return `<span title="${kind === 'selection' ? 'Selected own force' : 'Shape indicates role; color indicates known nation (country colors at right)'}" style="display:inline-flex;align-items:center;gap:2px">${glyphs}${spec.label}</span>`;
  }).join('');
}
