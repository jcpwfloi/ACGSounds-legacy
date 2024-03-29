module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                files: {
                    'dist/runtime.js': [
                        'src/general.js',
                        'src/EventListener.js',
                        'src/pagination.js',
                        'src/i18n.js',
                        'src/midi.js',
                        'src/midievents.js',
                        'src/midifile.js',
                        'src/Compass.js',
                        'src/Synesthesia.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
            },
            build: {
                src: 'dist/runtime.js',
                dest: '../public/javascripts/dist/runtime.min.js'
            }
        },
        clean: {
            release: ["dist/", "npm-debug.log", "../public/javascripts/dist/"]
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });

    for (var key in grunt.file.readJSON('package.json').dependencies) {
        if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
    }

    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('test', ['concat', 'karma']);
};

