function Example(opts) {
    EventListener.call(this);

    this.options = {};
    this.defaults = {};

    extend(this.options, this.defaults, opts);
}

Example.prototype = {
    load: function() {
        return 123;
    }
};

extend(Example.prototype, EventListener.prototype);

describe('EventListener', function() {
    it('should function on, off and fire', function() {
        var a = new Example();
        var status = 0;
        a.on('click', function(e) {
            assert.typeOf(e.data, 'number');
            status = e.data;
        });
        a.on('catchAll', function(name, e) {
            if (e.flick) status = e.flick;
        });
        a.fire('click', { data: 1 });
        assert.equal(status, 1);
        a.fire('qoieurhFIUH', { flick: 2333 });
        assert.equal(status, 2333);
        a.off('click');
        a.fire('click', { data: 2 });
        assert.equal(status, 2333);
    });
});

