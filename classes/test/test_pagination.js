describe('Pagination', function () {
    var pagination = new Pagination();
    describe('Initialization from array', function () {
        var arr = [ { index: 0, msg: "I'm something special" } ];
        for (var i = 0; i < 100; ++i) {
            arr.push({ index: arr.length, msg: 233 });
        }
        it('should not crash', function () {
            pagination.loadFromArray(arr);
        });
    });
});
