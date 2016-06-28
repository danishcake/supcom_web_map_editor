/*jslint node: true, indent: 2*/
'use strict';

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');


  // Define the configuration for all the tasks
  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test_io_lib: {
        options: {
          reporter: 'spec',
          //captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
        },
        src: ['sc_map_io_lib/dist/test/**/*.js']
      }
    },

    babel: {
      options: {
        sourceMap: true,
        retainLines: true,
        presets: ['es2015']
      },
      dist_io_lib: {
        files: [{
          expand: true,
          cwd: "sc_map_io_lib/src/",
          src: ["**/*.js"],
          dest: "sc_map_io_lib/dist/",
          ext: ".js"
        }]
      }
    },

    copy: {
      testdata_io_lib: {
        expand: true,
        cwd: 'sc_map_io_lib/src/test/data',
        src: '**',
        dest: 'sc_map_io_lib/dist/test/data'
      }
    }
  });

  grunt.registerTask('default', [
    'babel:dist_io_lib',
    'copy:testdata_io_lib',
    'mochaTest:test_io_lib'
  ]);
};
