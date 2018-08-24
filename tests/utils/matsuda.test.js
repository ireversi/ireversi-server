const twice = require('../../src/utils/matsuda.js');

describe('Twice number', () => {
  it('3 x 2 = 6', () => {
    const result = twice(3);
    expect(result).toBe(6);
  });

  it('10.5 x 2 = 21', () => {
    const result = twice(10.5);
    expect(result).toBe(21);
  });
});
