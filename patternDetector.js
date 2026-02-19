export function detectPatterns(transactions, adjacency, incoming) {
  const rings = [];

  // -------------------------
  // 1️⃣ Cycle Detection (3-5)
  // -------------------------
  function dfs(start, node, path, visited) {
    if (path.length > 5) return;
    visited.add(node);

    (adjacency[node] || []).forEach(tx => {
      const next = tx.receiver_id;
      if (next === start && path.length >= 3) {
        rings.push({
          members: [...new Set(path)],
          type: "cycle",
          patterns: [`cycle_length_${path.length}`]
        });
      }
      if (!visited.has(next)) {
        dfs(start, next, [...path, next], visited);
      }
    });

    visited.delete(node);
  }

  Object.keys(adjacency).forEach(node => {
    dfs(node, node, [node], new Set());
  });

  // -------------------------
  // 2️⃣ Fan-in / Fan-out
  // -------------------------
  Object.keys(incoming).forEach(acc => {
    const txs = incoming[acc];
    if (txs.length >= 10) {
      rings.push({
        members: txs.map(t => t.sender_id).concat(acc),
        type: "fan_in",
        patterns: ["high_velocity"]
      });
    }
  });

  Object.keys(adjacency).forEach(acc => {
    const txs = adjacency[acc];
    if (txs.length >= 10) {
      rings.push({
        members: txs.map(t => t.receiver_id).concat(acc),
        type: "fan_out",
        patterns: ["high_velocity"]
      });
    }
  });

  return { rings };
}
