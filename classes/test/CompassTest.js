var expect = chai.expect;
var assert = chai.assert;

var a1 = [
    { start:   0, end: 400, idx: 0 },
    { start:  10, end: 410, idx: 1 },
    { start: 110, end: 120, idx: 2 },
    { start: 130, end: 880, idx: 3 },
    { start: 120, end: 420, idx: 4 },
    { start: 200, end: 210, idx: 5 },
    { start: 200, end: 210, idx: 6 },
    { start: 890, end: 900, idx: 7 },
    { start:   0, end: 999, idx: 8 },
    { start: 300, end: 880, idx: 9 }
];
var a2 = [
    { start: 890, end: 900, idx: 7 },
    { start:   0, end: 999, idx: 8 },
    { start: 895, end: 892, idx: 9 },
    { start: 'bug', end: 'bug' },
    { start: 233, end: 'bugger', idx: 10 },
    { desc: "I don't have a start or end field" }
];
var testNormal = function (c) {
    var located;
    located = []; c.eachDo(0, 5, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 0, 8 ]);
    located = []; c.eachDo(5, 15, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 0, 1, 8 ]);
    located = []; c.eachDo(122, 123, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 0, 1, 4, 8 ]);
    located = []; c.eachDo(405, 408, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 1, 3, 4, 8, 9 ]);
    located = []; c.eachDo(233, 666, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 0, 1, 3, 4, 8, 9 ]);
    located = []; c.eachDo(202, 208, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 0, 1, 3, 4, 5, 6, 8 ]);
};
var testCorner = function (c) {
    var located;
    located = []; c.eachDo(999, 999, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 8 ]);
    located = []; c.eachDo(890, 890, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 7, 8 ]);
    located = []; c.eachDo(410, 880, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 1, 3, 4, 8, 9 ]);
    located = []; c.eachDo(200, 210, function (e) { located.push(e.idx); }); located.sort();
    assert.deepEqual(located, [ 0, 1, 3, 4, 5, 6, 8 ]);
}

describe('Compass', function () {
    describe('Basic functionalities', function () {
        it('shoud work under normal circumstances', function () {
            var c = new Compass({ threshold: 500 });
            c.load(a1);
            testNormal(c);
        });
        it('shoud handle corner cases correctly', function () {
            var c = new Compass({ threshold: 500 });
            c.load(a1);
            testCorner(c);
        });
    });
    describe('Threshold adjustments', function () {
        it('shoud work with default threshold (rather large)', function () {
            var c = new Compass();
            c.load(a1);
            testNormal(c);
            testCorner(c);
        });
        it('shoud work with different thresholds', function () {
            var c = new Compass({ threshold: 1 });
            c.load(a1);
            testNormal(c);
            testCorner(c);
            c = new Compass({ threshold: 100 });
            c.load(a1);
            testNormal(c);
            testCorner(c);
        });
    });
    describe('Callback contexts', function () {
        it('should work with callback context', function () {
            var c = new Compass({ threshold: 233 });
            c.load(a1);
            located = []; c.eachDo(0, 5, function (e) { this.push(e.idx); }, located); located.sort();
            assert.deepEqual(located, [ 0, 8 ]);
            located = []; c.eachDo(202, 208, function (e) { this.push(e.idx); }, located); located.sort();
            assert.deepEqual(located, [ 0, 1, 3, 4, 5, 6, 8 ]);
            located = []; c.eachDo(890, 890, function (e) { this.push(e.idx); }, located); located.sort();
            assert.deepEqual(located, [ 7, 8 ]);
        });
    });
    describe('Error handling', function () {
        it('should reject non-arrays', function () {
            try {
                var c = new Compass({ threshold: 88 });
                c.load(23333333333);
                assert.equal(0, 1);
            } catch (e) {
                if (e.actual !== undefined && e.expected !== undefined) assert.equal(0, 1);
            }
        });
        it('should ignore non-numbers and items with `start` larger than `start`', function () {
            var c = new Compass({ threshold: 233 });
            c.load(a2);
            located = []; c.eachDo(233, 236, function (e) { this.push(e.idx); }, located); located.sort();
            assert.deepEqual(located, [ 8 ]);
            located = []; c.eachDo(900, 900, function (e) { this.push(e.idx); }, located); located.sort();
            assert.deepEqual(located, [ 7, 8 ]);
        });
    });
});