angular.module('sc_map_edit_bin.controllers').controller("open-map",
["$scope", "$uibModalInstance", "dialogs", "data", function($scope, $uibModalInstance, dialogs, data) {

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
    map: {
      scripts: {
        scenario: null,
        save: null,
        script: null
      },
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
    $uibModalInstance.close($scope.data.map);
  };

  $scope.open_scenario = function(scenario_buffer) {
    try {
      let scenario = new sc_map_io_lib.sc.script.scenario()
      scenario.load(dcodeIO.ByteBuffer.wrap(scenario_buffer, dcodeIO.ByteBuffer.LITTLE_ENDIAN));

      // Sucessfully loaded .scmap
      $scope.data.map.scripts.scenario = scenario;

      // TODO: Component cross checking here
      $scope.data.validity.scenario_set = true;
      $scope.update_validity();
    } catch(error) {
      dialogs.error('Error parsing _scenario.lua', error.message);
    }
  };

  $scope.open_save = function(save_buffer) {

    try {
      let save = new sc_map_io_lib.sc.script.save()
      save.load(dcodeIO.ByteBuffer.wrap(save_buffer, dcodeIO.ByteBuffer.LITTLE_ENDIAN));

      // Sucessfully loaded .scmap
      $scope.data.map.scripts.save = save;

      // TODO: Component cross checking here
      $scope.data.validity.save_set = true;
      $scope.update_validity();
    } catch(error) {
      dialogs.error('Error parsing _save.lua', error.message);
    }
  };

  $scope.open_script = function(script_buffer) {


    $scope.data.validity.script_set = true;
    $scope.update_validity();
  };

  $scope.open_scmap = function(scmap_buffer) {
    try {
      let scmap = new sc_map_io_lib.sc.map();
      scmap.load(dcodeIO.ByteBuffer.wrap(scmap_buffer, dcodeIO.ByteBuffer.LITTLE_ENDIAN));

      // Sucessfully loaded .scmap
      $scope.data.map.scmap = scmap;

      // TODO: Component cross checking here
      $scope.data.validity.scmap_set = true;
      $scope.update_validity();
    } catch(error) {
      dialogs.error('Error parsing .scmap', error.message);
    }
  };
}]);