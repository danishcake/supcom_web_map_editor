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
      test: {
        options: {
          reporter: 'spec',
          //captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
        },
        src: ['dist/test/**/*.js']
      }
    },

    babel: {
      options: {
        sourceMap: true,
        retainLines: true,
        presets: ['es2015']
      },
      dist: {
        files: [{
          expand: true,
          cwd: "src/",
          src: ["**/*.js"],
          dest: "dist/",
          ext: ".js"
        }]
      }
    },

    copy: {
      testdata: {
        expand: true,
        cwd: 'src/test/data',
        src: '**',
        dest: 'dist/test/data'
      }
    }
  });

  grunt.registerTask('default', [
    'babel:dist',
    'copy:testdata',
    'mochaTest:test'
  ]);
};
