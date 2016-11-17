angular.module('sc_map_edit_bin.controllers').controller("top-menu",
["$scope", "editor_state", "dialogs", function($scope, editor_state, dialogs) {
  $scope.editor_state = editor_state;

  // Standard modal dialog options
  const modal_dlg_opts = {
    backdrop: 'static',
    size: 'lg'
  };


  $scope.new_map = function() {
    let dlg = dialogs.create("templates/dialogs/new-map.html", "new-map", {}, modal_dlg_opts);
    dlg.result.then(function(map_parameters) {
      editor_state.create_map(map_parameters);
    });
  };
  $scope.open_map = function() {
    let dlg = dialogs.create("templates/dialogs/open-map.html", "open-map", {}, modal_dlg_opts);
    dlg.result.then(function(map) {
      try {
        editor_state.load_map(map);
      } catch(error) {
        dialogs.error('Failed to open map', error.message);
      }
    });
  };
  $scope.save_map = function() {
    dialogs.error('Save Map','Not implemented.');
  };
  $scope.save_map_as = function() {
    dialogs.error('Save Map As','Not implemented.');
  };
  $scope.edit_metadata = function() {
    dialogs.error('Metadata','Not implemented.');
  };
  $scope.edit_textures = function() {
    dialogs.error('Textures','Not implemented.');
  };
  $scope.edit_water = function() {
    dialogs.error('Water','Not implemented.');
  };
  $scope.edit_forces = function() {
    dialogs.error('Forces','Not implemented.');
  };

}]);
