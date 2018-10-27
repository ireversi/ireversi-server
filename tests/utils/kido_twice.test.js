const twice = require('../../src/utils/kido_twice.js');

describe('Twice number', () => {
  it('3 × 2 = 6', () => {
    const result = twice(3);
    expect(result).toBe(6);
  });

  it('5.5 × 2 = 11', () => {
    const result = twice(5.5);
    expect(result).toBe(11);
  });
});
