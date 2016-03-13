module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
            },
            build: {
                src: ['src/general.js', 'src/pagination.js'],
                dest: '../public/javascripts/runtime.min.js'
            }
        },
        clean: {
            release: ["dist/", "npm-debug.log"]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['uglify']);
};

