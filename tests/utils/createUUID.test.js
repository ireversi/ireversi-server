const createUUID = require('../../src/utils/createUUID.js');

describe('Create uuid', () => {
  it('same length 1', () => {
    const length = 1;
    expect(createUUID(length)).toHaveLength(length);
  });

  it('same length 20', () => {
    const length = 20;
    expect(createUUID(length)).toHaveLength(length);
  });

  it('lower case', () => {
    const uuid = createUUID(8);
    expect(uuid).toBe(uuid.toLowerCase());
  });

  it('different results', () => {
    const length = 6;
    for (let i = 0; i < 100; i += 1) {
      expect(createUUID(length)).not.toBe(createUUID(length));
    }
  });
});
