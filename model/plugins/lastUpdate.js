module.exports = exports = function lastModifiedPlugin (schema, options) {
        schema.add({ lastUpdate: Date });

        schema.pre('save', function (next) {
            this.lastUpdate = new Date;
            next();
        });
}
