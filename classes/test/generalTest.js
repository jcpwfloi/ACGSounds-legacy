var expect = chai.expect;
var assert = chai.assert;

describe('General', function() {
    describe('#each()', function() {
        it('shoud iterate array', function() {
            var arr = [1, 2, 3, 4];
            var temp = [];
            each(arr, function(val) {
                temp.push(val);
            });
            assert.deepEqual(arr, temp);
        });
        it('should iterate object', function() {
            var obj = {
                a: 1,
                b: 2,
                c: 3
            };
            var temp = {};
            each(obj, function(value, key) {
                temp[key] = value;
            });
            assert.deepEqual(obj, temp);
        });
        it('should give `this` context', function() {
            var _ = this;
            each([0, 1, 2], function() {
                assert.equal(_, this);
            }, this);
        });
    });
    describe('#extend()', function() {
        it('should function with two arguments', function() {
            var data1 = {
                green: 1,
                red: 2,
                indigo: 3
            };
            var data2 = {
                indigo: 4,
                red: 5,
                blue: 6
            };
            var result1 = {
                indigo: 4,
                red: 5,
                blue: 6,
                green: 1
            };
            extend(data1, data2);
            assert.deepEqual(data1, result1);
        });
        it('should function with multi arguments', function() {
            var objs = [];
            var result = {}, input = {};
            for (var i = 0; i < 100; ++ i) {
                var data = {};
                data[i] = true;
                result[i] = true;
                objs.push(data);
            }
            objs.unshift(input);
            extend.apply(this, objs);
            assert.deepEqual(input, result);
        });
    });
    describe('#arrayRemove', function() {
        it('should functions', function() {
            var arr1 = [123, 456, 789, 134, 125];
            arrayRemove(arr1, 789);
            assert.deepEqual(arr1, [123, 456, 134, 125]);
            arrayRemove(arr1, 123);
            assert.deepEqual(arr1, [456, 134, 125]);
        });
    });
    describe('String.prototype', function() {
        describe('#format()', function() {
            it('should functions', function() {
                assert.equal('fff{0}fff{1}'.format('团', '万岁！'), 'fff团fff万岁！');
                assert.equal('{{{0}{1}}}'.format(0, 1), '{{01}}');
            });
        });
    });
    describe('Data.prototype', function() {
        describe('#Format', function() {
            it('should functions', function() {
                var str = '1998-04-03 08:00:00.123';
                var date = new Date(str);
                assert.equal(date.Format('yyyy-MM-dd hh:mm:ss.S'), str);
            });
        });
    });
});

