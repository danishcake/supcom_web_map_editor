const angular = require('angular');
import { sc_script_script } from '../../../../sc_map_io_lib/src/lib/script/sc_script_script';
import { sc_zip } from '../../../../sc_map_io_lib/src/lib/sc_zip';
import { sc_stl_export } from '../../../../sc_map_io_lib/src/lib/stl/sc_stl_export';
const async = require('async');
const saveAs = require('file-saver').saveAs;

angular.module('sc_map_edit_bin.controllers').controller("save-progress",
["$scope", "$timeout", "$uibModalInstance", "data", function($scope, $timeout, $uibModalInstance, data) {

  $scope.data = {
    progress_value: 0,
    progress_text: "",
    finished: false,

    map:             data.map,
    edit_heightmap:  data.edit_heightmap,
    scripts:         data.scripts
  };

  /**
   * Saves the map to local storage
   */
  const save_to_localstorage = function() {
    async.waterfall([
      (next) => {
        $scope.data.progress_text = "Serialising scripts...";
        $scope.data.progress_value = 0;
        $timeout(() => { next(null); }, 50);
      },
      (next) => {
        const serialised_scripts = {
          scenario: $scope.data.scripts.scenario.save(),
          save:     $scope.data.scripts.save.save($scope.data.edit_heightmap)
        };
        $timeout(() => { next(null, serialised_scripts); }, 50);
      },
      (serialised_scripts, next) => {
        $scope.data.progress_text = "Synchronising heightmap...";
        $scope.data.progress_value = 0;
        $timeout(() => { next(null, serialised_scripts); }, 50);
      },
      (serialised_scripts, next) => {
        $scope.data.edit_heightmap.export_to_heightmap($scope.data.map.heightmap);
        $timeout(() => { next(null, serialised_scripts); }, 50);
      },
      (serialised_scripts, next) => {
        $scope.data.progress_text = "Serialising scmap...";
        $scope.data.progress_value = 20;
        $timeout(() => { next(null, serialised_scripts); }, 50);
      },
      (serialised_scripts, next) => {
        let serialised_map = data.map.save();
        $timeout(() => { next(null, serialised_scripts, serialised_map); }, 50);
      },
      (serialised_scripts, serialised_map, next) => {
        $scope.data.progress_text = "Encoding...";
        $scope.data.progress_value = 90;
        $timeout(() => { next(null, serialised_scripts, serialised_map); }, 50);
      },
      (serialised_scripts, serialised_map, next) => {
        // Base64 encode
        let b64_serialised_map = serialised_map.toBase64();
        let b64_serialised_scripts = {
          scenario: serialised_scripts.scenario.toBase64(),
          save: serialised_scripts.save.toBase64()
        };
        $timeout(() => { next(null, b64_serialised_scripts, b64_serialised_map); }, 50);
      },
      (b64_serialised_scripts, b64_serialised_map, next) => {
        $scope.data.progress_text = "Writing...";
        $scope.data.progress_value = 95;
        $timeout(() => { next(null, b64_serialised_scripts, b64_serialised_map); }, 50);
      },
      (b64_serialised_scripts, b64_serialised_map, next) => {
        // Write to local storage
        localStorage.setItem("sc_map_edit_bin.save.scenario", b64_serialised_scripts.scenario);
        localStorage.setItem("sc_map_edit_bin.save.save",     b64_serialised_scripts.save);
        localStorage.setItem("sc_map_edit_bin.save.scmap",    b64_serialised_map);
        $timeout(() => { next(); }, 100);
      }
    ],
    (err) => {
      if (err) {
        $scope.data.progress_text = `Error: ${err}`;
        $scope.data.progress_value = 0;
        $scope.data.finished = true;
      } else {
        $scope.data.progress_text = "Success";
        $scope.data.progress_value = 100;
        $timeout(() => { $uibModalInstance.close(); }, 300);
      }
    });
  };


  /**
   * Saves the map to a zipfile
   */
  const save_to_zipfile = function() {
    $scope.data.progress_text = "Serialising and compressing...";
    $scope.data.progress_value = 10;

    const map_data = {
      scmap: $scope.data.map,
      scripts: {
        scenario: $scope.data.scripts.scenario,
        save: $scope.data.scripts.save,
        script: new sc_script_script()
      },
      edit_heightmap: $scope.data.edit_heightmap
    };

    // Start the actual saving in a callback so dialog is shown faster
    $timeout(() => {
      sc_zip.save(map_data)
        .then((zip_arraybuffer) => {
          $timeout(() => {
            $scope.data.progress_text = `Success`;
            $scope.data.progress_value = 100;
          }, 0);
          $timeout(() => { $uibModalInstance.close(); }, 300);

          const blob = new Blob([zip_arraybuffer], {type: "application/octet-stream"});
          saveAs(blob, `${$scope.data.scripts.scenario.name}.zip`)
        })
        .catch((err) => {
          $timeout(() => {
            $scope.data.progress_text = `Error: ${err}`;
            $scope.data.progress_value = 0;
            $scope.data.finished = true;
          }, 0);
        });
    }, 300);
  };


  /**
   * Saves the heightmap to an STL file
   */
  const save_to_stl = function() {
    $scope.data.progress_text = "Serialising...";
    $scope.data.progress_value = 10;

    $timeout(() => {
      try {
        const stl_bb = sc_stl_export($scope.data.edit_heightmap,
                                     data.stl_options.base_thickness,
                                     data.stl_options.heightmap_scale);
        const blob = new Blob([stl_bb.toArrayBuffer()], {type: "application/octet-stream"});
        $timeout(() => {
          $scope.data.progress_text = `Success`;
          $scope.data.progress_value = 100;
        }, 0);
        $timeout(() => { $uibModalInstance.close(); }, 300);
        saveAs(blob, `SupremeCommanderHeightmap.stl`)

      } catch (err) {
        $timeout(() => {
          $scope.data.progress_text = `Error: ${err}`;
          $scope.data.progress_value = 0;
          $scope.data.finished = true;
        });
      }
    }, 300);
  }


  if (data.dest === 'localstorage') {
    save_to_localstorage();
  } else if (data.dest === 'zipfile') {
    save_to_zipfile();
  } else if (data.dest === 'stl') {
    save_to_stl();
  } else {
    $scope.data.progress_text = `Error: Unknown save destination '${data.dest}'`;
    $scope.data.progress_value = "0";
    $scope.data.finished = true;
  }


  $scope.ok = function() {
    $uibModalInstance.close();
  };
}]).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/dialogs/save-progress.html', require('../../../templates/dialogs/save-progress.html'));
}]);
