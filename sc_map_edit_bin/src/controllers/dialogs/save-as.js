angular.module('sc_map_edit_bin.controllers').controller("save-as",
["$scope", "$rootScope", "$timeout", "$uibModalInstance", "editor_state", "dialogs", "data", function($scope, $rootScope, $timeout, $uibModalInstance, editor_state, dialogs, data) {

  $scope.data = {
    // Save mode. This can be one of:
    // 0 (localstorage), 1 (zip file)
    mode: 0,
    // Save location. This can be one of
    // "file:///file.zip"
    // and is valid for modes 1 and 2
    location: ""
  };

  $scope.validity = {
    location: true,
    all: false
  };

  $scope.update_validity = function() {
    switch ($scope.data.mode) {
      case 0:
        $scope.validity.location = true;
        break;
      case 1:
        $scope.validity.location = $scope.data.location !== "";
        break;
    }

    $scope.validity.all = $scope.validity.location;
  };
  $scope.update_validity();


  $scope.mode_change = function() {
    $scope.validity.location = "";
    $scope.update_validity();
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
        break;
    }
    $uibModalInstance.close();
  };
}]);
