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
        it('should work under normal circumstances', function () {
            var c = new Compass({ threshold: 500 });
            c.load(a1);
            testNormal(c);
        });
        it('should handle corner cases correctly', function () {
            var c = new Compass({ threshold: 500 });
            c.load(a1);
            testCorner(c);
        });
    });
    describe('Threshold adjustments', function () {
        it('should work with default threshold (rather large)', function () {
            var c = new Compass();
            c.load(a1);
            testNormal(c);
            testCorner(c);
        });
        it('should work with different thresholds', function () {
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
    describe('Performance', function () {
        L = 1000000; // Total length (1000 s)
        Q = 5000;    // Query range (5 s)
        T = 5000;    // Most notes are under 5 seconds long
        function randLen(x) {
            // Assume 1 out of 50 notes is longer than 5 seconds
            if (Math.random() < 0.98) return Math.random() * T;
            else return Math.random() * L;
        }
        it('a reasonably long sheet (~20 min) in 10 secs (600 frames), enough to be < 30 ms', function () {
            var cps, a3 = [], start, end;
            for (var i = 0; i < 20000; ++i) {
                start = Math.random() * L;
                a3.push({ start: start, end: start + randLen() });
            }
            cps = new Compass({ threshold: T });
            cps.load(a3);
            for (var i = 0; i < 600; ++i) {
                start = Math.random() * L;
                cps.eachDo(start, start + Q, function () { });
            }
        });
        it('1e5 elements, initialization', function () {
            var cps, a3 = [], start, end;
            for (var i = 0; i < 100000; ++i) {
                start = Math.random() * L;
                a3.push({ start: start, end: start + randLen() });
            }
            cps = new Compass({ threshold: T });
            cps.load(a3);
        });
        it('3000 elements, 1e5 queries', function () {
            var cps, a3 = [], start, end;
            for (var i = 0; i < 3000; ++i) {
                start = Math.random() * L;
                a3.push({ start: start, end: start + randLen() });
            }
            cps = new Compass({ threshold: T });
            cps.load(a3);
            for (var i = 0; i < 100000; ++i) {
                start = Math.random() * L;
                cps.eachDo(start, start + Q, function () { });
            }
        });
        it('5e4 elements, 2000 queries', function () {
            var cps, a3 = [], start, end;
            for (var i = 0; i < 50000; ++i) {
                start = Math.random() * L;
                a3.push({ start: start, end: start + randLen() });
            }
            cps = new Compass({ threshold: T });
            cps.load(a3);
            for (var i = 0; i < 2000; ++i) {
                start = Math.random() * L;
                cps.eachDo(start, start + Q, function () { });
            }
        });
        it('5e4 elements with extra fields, 2000 queries', function () {
            var cps, a3 = [], start, end;
            for (var i = 0; i < 50000; ++i) {
                start = Math.random() * L;
                a3.push({ start: start, end: start + randLen(), ex1: 1, ex2: 2, ex3: { ex4: 'xyzzy' } });
            }
            cps = new Compass({ threshold: T });
            cps.load(a3);
            for (var i = 0; i < 2000; ++i) {
                start = Math.random() * L;
                cps.eachDo(start, start + Q, function () { });
            }
        });
    });
});
