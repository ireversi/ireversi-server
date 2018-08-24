const twice = require('../../src/utils/kai.js');

// テスト１単位
describe('Twice number', () => {
    it('3 x 2 = 6', ()=>{
        const result = twice(3);
        expect(result).toBe(6); // resultが6である(toBe)ことをexpectしている
    });
    it('5.5 x 2 = 11', () =>{
        const result = twice(5.5);
        expect(result).toBe(11);
    });
});