angular.module('sc_map_edit_bin.controllers').controller("save-as",
["$scope", "$rootScope", "$timeout", "$uibModalInstance", "editor_state", "dialogs", "data", function($scope, $rootScope, $timeout, $uibModalInstance, editor_state, dialogs, data) {

  $scope.data = {
    // Save mode. This can be one of:
    // 0 (localstorage), 1 (zip file)
    mode: 0
  };


  // Note: For some reason I can't seem to put my buttons callbacks within $scope.buttons. Weird!
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  let save_to_localstorage = function() {
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


  let save_to_zipfile = function() {
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


  $scope.ok = function() {
    switch($scope.data.mode) {
      case 0:
      default:
        save_to_localstorage();
        break;

      case 1:
        save_to_zipfile();
        break;
    }
    $uibModalInstance.close();
  };
}]);
