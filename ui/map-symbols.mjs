import symbols from '../assets/ui/map-symbols.json' with { type: 'json' };

// Native chart meshes and the legend consume this same geometry and palette.
export const MAP_SYMBOLS = symbols;
const points = row => row.points.map(point => point.join(',')).join(' ');
export function mapSymbolSvg(kind, pixels = 19) {
  const spec = kind === 'selection' ? symbols.selection : symbols.symbols[kind];
  if (!spec) throw new Error(`Unknown chart symbol: ${kind}`);
  const casing = symbols.backingColor;
  const polygons = (spec.polygons || []).map(row => `<polygon points="${points(row)}" fill="${row.color || spec.color}" stroke="${casing}" stroke-width="${symbols.casingWidth}"/>`).join('');
  const strokes = (spec.strokes || []).map(row => {
    const tag = row.closed ? 'polygon' : 'polyline', shape = points(row);
    return `<${tag} points="${shape}" fill="none" stroke="${casing}" stroke-width="${row.width + symbols.casingWidth}"/><${tag} points="${shape}" fill="none" stroke="${row.color || spec.color}" stroke-width="${row.width}"/>`;
  }).join('');
  return `<svg aria-hidden="true" data-chart-symbol="${kind}" viewBox="-60 -60 120 120" width="${pixels}" height="${pixels}" style="vertical-align:middle;flex:none" stroke-linejoin="round" stroke-linecap="round">${polygons}${strokes}</svg>`;
}
export function mapSymbolLegend() {
  return [...Object.keys(symbols.symbols), 'selection'].map(kind => {
    const spec = kind === 'selection' ? symbols.selection : symbols.symbols[kind];
    return `<span style="display:inline-flex;align-items:center;gap:2px">${mapSymbolSvg(kind)}${spec.label}</span>`;
  }).join('');
}
