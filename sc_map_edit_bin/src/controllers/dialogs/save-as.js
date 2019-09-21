const angular = require('angular');
const modal_dlg_opts = require('../../constants').modal_dlg_opts;

angular.module('sc_map_edit_bin.controllers').controller("save-as",
["$scope", "$rootScope", "$timeout", "$uibModalInstance", "editor_state", "dialogs", "data", function($scope, $rootScope, $timeout, $uibModalInstance, editor_state, dialogs, data) {

  $scope.data = {
    // Save mode. This can be one of:
    // 0 (localstorage), 1 (zip file), 2 (STL), 3 (Raw heightmap)
    mode: 0,
    base_thickness: 4,
    scale_exageration: 11
  };

  $scope.base_thickness_change = function() {
    if ($scope.data.base_thickness < 1) {
      $scope.data.base_thickness = 1;
    }
    if ($scope.data.base_thickness > 50) {
      $scope.data.base_thickness = 50;
    }
  };

  // Units are 10%. To transform to percentage the function is
  // $page * 10 + 90
  $scope.scale_exageration_change = function() {
    if ($scope.data.scale_exageration < 1) {
      $scope.data.scale_exageration = 1;
    }
    if ($scope.data.scale_exageration > 40) {
      $scope.data.scale_exageration = 40;
    }
  };

  // Note: For some reason I can't seem to put my buttons callbacks within $scope.buttons. Weird!
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  const save_to_localstorage = function() {
    editor_state.set_save_location('localstorage');
    dialogs.create("templates/dialogs/save-progress.html",
                   "save-progress",
                   {
                     dest: 'localstorage',
                     map: editor_state.map,
                     edit_heightmap: editor_state.edit_heightmap,
                     scripts: editor_state.scripts
                   },
                   modal_dlg_opts);
  };


  const save_to_zipfile = function() {
    editor_state.set_save_location('zipfile');
    dialogs.create('templates/dialogs/save-progress.html',
                   'save-progress',
                   {
                     dest: 'zipfile',
                     map: editor_state.map,
                     edit_heightmap: editor_state.edit_heightmap,
                     scripts: editor_state.scripts
                   },
                   modal_dlg_opts);
  };

  const save_to_stl = function() {
    dialogs.create('templates/dialogs/save-progress.html',
                   'save-progress',
                   {
                     dest: 'stl',
                     stl_options: {
                       base_thickness: $scope.data.base_thickness,
                       heightmap_scale: $scope.data.scale_exageration * 0.1 + 0.9
                     },
                     map: editor_state.map,
                     edit_heightmap: editor_state.edit_heightmap,
                     scripts: editor_state.scripts
                   },
                   modal_dlg_opts);
  };

  const save_to_raw_heightmap = function() {
    dialogs.create('templates/dialogs/save-progress.html',
                   'save-progress',
                   {
                     dest: 'raw_heightmap',
                     map: editor_state.map,
                     edit_heightmap: editor_state.edit_heightmap,
                     scripts: editor_state.scripts
                   },
                   modal_dlg_opts);
  };

  const save_to_raw_texturemap = function() {
    dialogs.create('templates/dialogs/save-progress.html',
                   'save-progress',
                   {
                     dest: 'raw_texturemap',
                     map: editor_state.map,
                     edit_heightmap: editor_state.edit_heightmap,
                     scripts: editor_state.scripts
                   },
                   modal_dlg_opts);
  };


  $scope.ok = function() {
    switch($scope.data.mode) {
      case 0:
      default:
        save_to_localstorage();
        break;

      case 1:
        save_to_zipfile();
        break;

      case 2:
        save_to_stl();
        break;

      case 3:
        save_to_raw_heightmap();
        break;

      case 3:
        save_to_raw_texturemap();
        break;
    }
    $uibModalInstance.close();
  };
}]).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/dialogs/save-as.html', require('../../../templates/dialogs/save-as.html'));
}]);
