/*jslint node: true, indent: 2*/
'use strict';

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
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
        sourceMap: false,
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
      },
      dist_edit_bin: {
        files: [{
          expand: true,
          cwd: "sc_map_edit_bin/src",
          src: ["**/*.js"],
          dest: "sc_map_edit_bin/dist/",
          ext: ".js"
        }]
      }
    },

    browserify: {
      dist_io_lib: {
        src: ["sc_map_io_lib/dist/lib/sc.js"],
        dest: "sc_map_io_lib/browserified/sc_map.js",
        options: {
          browserifyOptions: {
            standalone: "sc_map_io_lib"
          }
        }
      }
    },

    copy: {
      testdata_io_lib: {
        expand: true,
        cwd: 'sc_map_io_lib/src/test/data',
        src: '**',
        dest: 'sc_map_io_lib/dist/test/data'
      },
      deploy_thirdparty_io_lib: {
        expand: true,
        src: ['thirdparty/**/*.js'],
        dest: 'sc_map_io_lib/dist'
      },
      deploy_io_lib: {
        expand: true,
        cwd: 'sc_map_io_lib/browserified',
        src: ['**.js'],
        dest: 'sc_map_edit_bin/lib/io_lib',
        ext: '.js'
      }
    }
  });

  grunt.registerTask('build_edit_bin', [
    'babel:dist_edit_bin',
  ]);

  grunt.registerTask('build_io_lib', [
    'babel:dist_io_lib',
    'copy:deploy_thirdparty_io_lib',
    'browserify:dist_io_lib',
    'copy:deploy_io_lib'
  ]);

  // A relatively fast build for unit testing that doesn't browserify io_lib
  grunt.registerTask('test_io_lib', [
    'babel:dist_io_lib',
    'copy:deploy_thirdparty_io_lib',
    'copy:testdata_io_lib',
    'mochaTest:test_io_lib'
  ]);

  grunt.registerTask('default', [
    'build_io_lib',
    'build_edit_bin',
    'copy:testdata_io_lib',
    'mochaTest:test_io_lib'
  ]);

};
