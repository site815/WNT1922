// Cash already paid/received, separate from the budget forecast. No balances
// are changed here; older saves reconcile their unrecorded activity explicitly.
export const GOLD_FLOW_LABELS = Object.freeze({
  output: 'GDP and trade income',
  upkeep: 'Fleet upkeep',
  treaty: 'Naval treaty charges',
  industry: 'Industrial operation',
  training: 'Sailor and aviator training',
  aircraft: 'Naval aircraft production',
  governmentAircraft: 'Government aircraft replacements',
  shipRepairs: 'Ship repairs',
  portRepairs: 'Port repairs',
  industrialRepairs: 'Industrial and yard repairs',
  diplomaticTrade: 'Diplomatic resource exchanges',
  diplomaticAdministration: 'Diplomatic visits and naval demonstrations',
});

export function recordGold(n, category, amount) {
  if (!n.monthAccount || !Number.isFinite(amount) || amount === 0) return;
  if (!Object.hasOwn(GOLD_FLOW_LABELS, category)) throw Error('Unknown cash-flow category.');
  const flows = n.monthAccount.goldFlows ??= {};
  flows[category] = (flows[category] || 0) + amount;
}

export function goldAccount(n) {
  const flows = n.monthAccount?.goldFlows || {};
  const change = n.gold - (n.monthAccount?.opening.gold ?? n.gold);
  const rows = Object.entries(GOLD_FLOW_LABELS)
    .filter(([key]) => Math.abs(flows[key] || 0) > 1e-8)
    .map(([key, label]) => ({ key, label, amount: flows[key] }));
  const other = change - rows.reduce((sum, row) => sum + row.amount, 0);
  if (Math.abs(other) > 1e-8)
    rows.push({ key: 'other', label: 'Orders, diplomacy, refunds and other activity', amount: other });
  return { rows, change };
}

export function diplomacyAccount(n) {
  const amounts=flows=>Object.fromEntries(['gold','industry','strategic'].map(k=>[k,flows?.[k]||0]));
  return {current:amounts(n.monthAccount?.diplomaticFlows),last:amounts(n.monthAccount?.last?.diplomaticFlows)};
}
