module.exports = array => array.map((p, idx) => (p > 0 ? {
  x: idx % Math.sqrt(array.length),
  y: array.length / Math.sqrt(array.length) - 1 - Math.floor(idx / Math.sqrt(array.length)),
  userId: p,
} : null))
  .filter(e => !!e);
