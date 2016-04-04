describe('Pagination', function () {
    var pagination = new Pagination({ dispRange: 2, perPage: 4 });
    describe('Initialization from array', function () {
        var arr = [ { my_idx: 0, msg: "I'm something special" } ];
        for (var i = 0; i < 100; ++i) {
            arr.push({ my_idx: arr.length, msg: 233 });
        }
        it('should not crash', function () {
            pagination.loadFromArray(arr);
        });
    });
    var e = null;
    pagination.on('refresh', function (_e) { e = _e; });
    var desc = function (e) {
        return e.pages.map(function (e) {
            return e.type + (e.page !== undefined ? e.page.toString() : '') + (e.active ? 'A' : '') + (e.disabled ? 'D' : '');
        });
    };
    var contents = function (e) {
        return e.list.map(function (e) { return e.content; });
    };
    describe('Basic functionalities', function () {
        pagination.on('refresh', function (_e) { e = _e; });
        var arr = [ { my_idx: 0, msg: "I'm something special" } ];
        for (var i = 0; i < 100; ++i) {
            arr.push({ my_idx: arr.length, msg: 233 });
        }
        pagination.loadFromArray(arr);
        it('should work with lots of items', function () {
            pagination.go(13);
            chai.assert.lengthOf(e.pages, 13);
            chai.assert.lengthOf(e.list, 4);
            chai.assert.deepEqual(desc(e),
                ['prev', 'page0', 'page1', 'ellipsis', 'page11', 'page12',
                 'page13A', 'page14', 'page15', 'ellipsis', 'page24', 'page25', 'next']);
            chai.assert.deepEqual(e.list[0], { index: 52, content: { my_idx: 52, msg: 233 } });
            chai.assert.deepEqual(e.list[3], { index: 55, content: { my_idx: 55, msg: 233 } });
            pagination.go(2);
            chai.assert.deepEqual(desc(e),
                ['prev', 'page0', 'page1', 'page2A', 'page3', 'page4', 'ellipsis', 'page24', 'page25', 'next']);
            pagination.go(24);
            chai.assert.deepEqual(desc(e),
                ['prev', 'page0', 'page1', 'ellipsis', 'page22', 'page23', 'page24A', 'page25', 'next']);
            pagination.next();
            chai.assert.deepEqual(desc(e),
                ['prev', 'page0', 'page1', 'ellipsis', 'page23', 'page24', 'page25A', 'nextD']);
            chai.assert.lengthOf(e.list, 1);
        });
        it('should be able to load a new array', function () {
            pagination.loadFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
        it('should work with a rather small number of items', function () {
            chai.assert.deepEqual(desc(e), ['prevD', 'page0A', 'page1', 'page2', 'next']);
            pagination.loadFromArray([1, 2, 3]);
            chai.assert.deepEqual(desc(e), ['prevD', 'page0A', 'nextD']);
            chai.assert.deepEqual(contents(e), [1, 2, 3]);
        });
        it('should work with custom display ranges', function () {
            var p = new Pagination({ dispRange: 4, perPage: 1 });
            p.on('refresh', function (_e) { e = _e; });
            p.loadFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
            chai.assert.deepEqual(contents(e), [1]);
            chai.assert.deepEqual(desc(e),
                ['prevD', 'page0A', 'page1', 'page2', 'page3', 'page4', 'ellipsis', 'page16', 'page17', 'page18', 'page19', 'next']);
            p.go(10);
            chai.assert.deepEqual(contents(e), [11]);
            chai.assert.deepEqual(desc(e),
                ['prev', 'page0', 'page1', 'page2', 'page3', 'ellipsis', 'page6', 'page7', 'page8', 'page9',
                 'page10A', 'page11', 'page12', 'page13', 'page14', 'ellipsis', 'page16', 'page17', 'page18', 'page19', 'next']);
            p.go(19);
            chai.assert.deepEqual(contents(e), [20]);
            chai.assert.deepEqual(desc(e),
                ['prev', 'page0', 'page1', 'page2', 'page3', 'ellipsis', 'page15', 'page16', 'page17', 'page18', 'page19A', 'nextD']);
        });
    });
    describe('Miscellaneous', function () {
        it('should not allow `prev()` and `next()` to go out of bound', function () {
            pagination.loadFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            chai.assert.deepEqual(contents(e), [1, 2, 3, 4]);
            pagination.prev();
            chai.assert.deepEqual(contents(e), [1, 2, 3, 4]);
            pagination.go(2);
            chai.assert.deepEqual(contents(e), [9, 10]);
            pagination.next();
            chai.assert.deepEqual(contents(e), [9, 10]);
            pagination.loadFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
            chai.assert.deepEqual(contents(e), [1, 2, 3, 4]);
            pagination.prev();
            chai.assert.deepEqual(contents(e), [1, 2, 3, 4]);
            pagination.go(2);
            chai.assert.deepEqual(contents(e), [9, 10, 11, 12]);
            pagination.next();
            chai.assert.deepEqual(contents(e), [9, 10, 11, 12]);
        });
        it('should count correctly in `getItemCount()`', function () {
            chai.assert.equal(pagination.getItemCount(), 12);
        });
    });
});
