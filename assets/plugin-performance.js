/* Comparisons require one shared Native series. Historical per-MOD ratios are rejected. */
(function (root) {
  function summarize(data, frontier = {points: []}) {
    if (data.schema_version !== 'plugin-performance/v2' || data.baseline !== null
        || data.status !== 'awaiting-unified-native') throw new Error('Unified Native evidence is not admitted');
    return new Map(data.entries.map(entry => {
      if ('pairs' in entry || 'ratios' in entry) throw new Error('Per-MOD Native comparisons are forbidden');
      const points = frontier.points.filter(point =>
        point.cohort_id === 'qwen35-35b-a3b-bf16-sweprefix-smoke-v1'
        && point.configuration?.mods?.includes(entry.id)
        && point.evidence?.status === 'measured'
        && Number.isFinite(point.metrics?.output_tps));
      return [entry.id, { ...entry, gain: null, count: 0,
        measuredPointCount: points.length,
        measuredConcurrencies: [...new Set(points.map(point => point.load.concurrency))].sort((a, b) => a - b)
      }];
    }));
  }
  function compare(left, right, results) {
    const a = results.get(left.id)?.gain, b = results.get(right.id)?.gain;
    const aMeasured = Number.isFinite(a), bMeasured = Number.isFinite(b);
    if (aMeasured !== bMeasured) return aMeasured ? -1 : 1;
    return aMeasured ? b - a : 0;
  }
  const api = { summarize, compare };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PluginPerformance = api;
})(globalThis);
