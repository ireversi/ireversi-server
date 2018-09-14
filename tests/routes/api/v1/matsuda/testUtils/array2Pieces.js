module.exports = array => array.map(
  (p, idx) => (Array.isArray(p) ? p : [p]).map(f => (f !== 0
    ? {
      n: +f.split(':')[0],
      piece: {
        x: idx % Math.sqrt(array.length),
        y: array.length / Math.sqrt(array.length) - 1 - Math.floor(idx / Math.sqrt(array.length)),
        userId: +f.split(':')[1],
      },
    }
    : null)).filter(e => !!e),
)
  .reduce((prev, current) => [
    ...prev,
    ...Array.isArray(current) ? current : [current],
  ], [])
  .sort((a, b) => a.n - b.n)
  .map(p => p.piece);
