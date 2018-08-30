const { sum, calc, PracticeModel } = require('../../../../../src/models/hi85/PracticeModel.js');
const { prepareDB, deleteAllDataFromDB } = require('../../../../../src/utils/db.js');

/**
 * From https://jestjs.io/docs/en/getting-started)
 * `test(name, fn)` は `it(name, fn)` と同じであり `it` は `test` のエイリアス
 * it('adds 1 + 2 to equal 3', () => {});
 */
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

/**
 * Using Matchers · Jest
 * https://jestjs.io/docs/en/using-matchers
 */
describe('Using Matchers', () => {
  const values = [3, 2];

  it('Equal', () => {
    // 関数に渡した値の和は 5
    expect(calc.sum(...values)).toBe(5);
    // 関数に渡した値の和は 4 ではない
    expect(calc.sum(...values)).not.toBe(4);
  });

  it('Greater Than', () => {
    // 関数に渡した値の差は 0 より大きい
    expect(calc.difference(...values)).toBeGreaterThan(0);
    // 関数に渡した値の差は 0 以下
    expect(calc.difference(...values)).not.toBeGreaterThan(1);
  });

  it('Greater Than Or Equal', () => {
    // 関数に渡した値の積は 0 以上
    expect(calc.product(...values)).toBeGreaterThanOrEqual(6);
    // 関数に渡した値の積は 7 より小さい
    expect(calc.product(...values)).not.toBeGreaterThanOrEqual(7);
  });

  it('Less Than', () => {
    // 関数に渡した値の商は 2 より小さい
    expect(calc.quotient(...values)).toBeLessThan(2);
    // 関数に渡した値の商は 1 以上
    expect(calc.quotient(...values)).not.toBeLessThan(1);
  });

  it('Less Than Or Equal', () => {
    // 関数に渡した値の余りは 1 以下
    expect(calc.exponent(...values)).toBeLessThanOrEqual(1);
    // 関数に渡した値の余りは 0 より大きい
    expect(calc.exponent(...values)).not.toBeLessThanOrEqual(0);
  });
});

describe('Using with MongoDB', () => {
  // describe のブロック内で何よりも先に 1 回だけ DB の準備を行う
  beforeAll(prepareDB);
  // 個々のテスト後に dropDatabase でデータベースごとデータを削除
  afterEach(deleteAllDataFromDB);

  // Boolean 型のプロパティに異なる型のデータを挿入した際にエラーが発生するか
  it('Cast to Boolean failed', async () => {
    try {
      const Practice = new PracticeModel({ condition: 999 });
      Practice.setInitParams();
      await Practice.save();
    } catch (error) {
      expect(error.toString()).toMatch(/Cast to Boolean failed/);
    }
  });

  // 作成したユーザーが意図した形で保存されているか
  it('Create user', async () => {
    const name = 'mario';
    const condition = process.env.NODE_ENV === 'test';
    const Practice = new PracticeModel({ name, condition });
    Practice.setInitParams();
    await Practice.save();

    await new Promise((resolve, reject) => {
      PracticeModel.findOne({ name }, (error, result) => {
        if (error) reject(error);
        resolve(result);
      });
    })
      .then((result) => {
        const regUserId = /^\w{8}$/;
        const regCreated = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/;
        expect(result).toMatchObject({
          user_id: expect.stringMatching(regUserId),
          name,
          condition: expect.any(Boolean),
          created: expect.stringMatching(regCreated),
        });
      })
      .catch((error) => {
        throw error;
      });
  });
});
