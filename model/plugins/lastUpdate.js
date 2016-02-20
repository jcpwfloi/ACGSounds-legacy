module.exports = exports = function lastModifiedPlugin (schema, options) {
        schema.add({ lastUpdate: Date, createdAt: Date });

        schema.pre('save', function (next) {
            this.lastUpdate = new Date;

            if (!this.createdAt) this.createdAt = new Date;
            next();
        });
}
