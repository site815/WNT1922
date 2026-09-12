export function allocateShipNames(s, c, id, classId, count) {
  const n = s.nations[id],
    cl = c.classes[classId],
    bare = (name) => name.replace(/^(?:HMS|USS|IJN|HIJMS|FS|RM|SMS) /, "");
  const used = new Set(
    n.groups.flatMap((g) => [bare(g.name), ...(g.shipNames || []).map(bare)]),
  );
  const pool = c.nations[id].shipNamePools?.[classId] || [];
  const names = pool.filter((name) => !used.has(bare(name))).slice(0, count);
  let pennant = s.nextId;
  while (names.length < count) {
    const name = cl.type + "-" + pennant++;
    if (!used.has(name)) {
      names.push(name);
      used.add(name);
    }
  }
  return names;
}
