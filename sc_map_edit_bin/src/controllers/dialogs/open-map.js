angular.module('sc_map_edit_bin.controllers').controller("open-map",
["$scope", "$uibModalInstance", "data", function($scope, $uibModalInstance, data) {

  $scope.data = {
    open_mode_tab_index: 0,
    validity:
    {
      scenario_set: false,
      save_set: false,
      script_set: false,
      scmap_set: false,
      all_set: false
    },
    buffers: {
      scenario: null,
      save: null,
      script: null,
      scmap: null
    }
  }

  $scope.update_validity = function() {
    $scope.data.validity.all_set = $scope.data.validity.scenario_set &&
                                   $scope.data.validity.save_set &&
                                   $scope.data.validity.script_set &&
                                   $scope.data.validity.scmap_set;
  };

  // Note: For some reason I can't seem to put my buttons callbacks within $scope.buttons. Weird!
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.load_archive = function(archive_buffer) {
    // TODO: Extract the individual buffers from the archive
  };

  $scope.load_individual_files = function() {
    // Attempt to load the map. On success close the dialog
    $uibModalInstance.close($scope.data.buffers);
  };

  $scope.open_scenario = function(scenario_buffer) {
    $scope.data.buffers.scenario = scenario_buffer;
    $scope.data.validity.scenario_set = true;
    $scope.update_validity();
  };

  $scope.open_save = function(save_buffer) {
    $scope.data.buffers.save = save_buffer;
    $scope.data.validity.save_set = true;
    $scope.update_validity();
  };

  $scope.open_script = function(script_buffer) {
    $scope.data.buffers.script = script_buffer;
    $scope.data.validity.script_set = true;
    $scope.update_validity();
  };

  $scope.open_scmap = function(scmap_buffer) {
    $scope.data.buffers.scmap = scmap_buffer;
    $scope.data.validity.scmap_set = true;
    $scope.update_validity();
  };
}]);
