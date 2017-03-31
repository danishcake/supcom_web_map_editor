angular.module('sc_map_edit_bin.controllers').controller("open-map",
["$scope", "$uibModalInstance", "dialogs", "data", function($scope, $uibModalInstance, dialogs, data) {

  const local_storage_has_map = localStorage.getItem("sc_map_edit_bin.save.scmap") !== null;

  $scope.data = {
    open_mode_tab_index: local_storage_has_map ? 0 : 1,
    validity:
    {
      scenario_set: false,
      save_set: false,
      scmap_set: false,
      all_set: false
    },
    map: {
      scripts: {
        scenario: null,
        save: null
      },
      scmap: null
    },
    local_storage_has_map: local_storage_has_map
  }

  $scope.update_validity = function() {
    $scope.data.validity.all_set = $scope.data.validity.scenario_set &&
                                   $scope.data.validity.save_set &&
                                   $scope.data.validity.scmap_set;
  };

  // Note: For some reason I can't seem to put my buttons callbacks within $scope.buttons. Weird!
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.load_localstorage = function() {
    try {
      // Retrive scmap from localstorage and load
      const b64_serialised_scmap = localStorage.getItem("sc_map_edit_bin.save.scmap");
      const serialised_scmap = dcodeIO.ByteBuffer.wrap(b64_serialised_scmap, "base64", dcodeIO.ByteBuffer.LITTLE_ENDIAN);
      const scmap = new sc_map_io_lib.sc.map();
      scmap.load(serialised_scmap);

      const b64_serialised_script_scenario = localStorage.getItem("sc_map_edit_bin.save.scenario");
      const serialised_script_scenario = dcodeIO.ByteBuffer.wrap(b64_serialised_script_scenario, "base64", dcodeIO.ByteBuffer.LITTLE_ENDIAN);
      const script_scenario = new sc_map_io_lib.sc.script.scenario();
      script_scenario.load(serialised_script_scenario);

      const b64_serialised_script_save = localStorage.getItem("sc_map_edit_bin.save.save");
      const serialised_script_save = dcodeIO.ByteBuffer.wrap(b64_serialised_script_save, "base64", dcodeIO.ByteBuffer.LITTLE_ENDIAN);
      const script_save = new sc_map_io_lib.sc.script.save();
      script_save.load(serialised_script_save);

      // Sucessfully loaded .scmap
      $scope.data.map.scmap = scmap;
      $scope.data.map.scripts.scenario = script_scenario;
      $scope.data.map.scripts.save = script_save;
      $scope.data.map.save_location = "localstorage";

      $uibModalInstance.close($scope.data.map);
    } catch(error) {
      dialogs.error('Error parsing .scmap', error.message);
    }
  }

  $scope.load_archive = function(archive_buffer) {
    sc_map_io_lib.sc.zip.load(archive_buffer)
    .then((map) => {
      $scope.data.map.scmap = map.scmap;
      $scope.data.map.scripts.scenario = map.scripts.scenario;
      $scope.data.map.scripts.save = map.scripts.save;
      $scope.data.map.save_location = "zipfile";

      $uibModalInstance.close($scope.data.map);
    })
    .catch((error) => {
      dialogs.error('Error loading map from zipfile', error.message);
    });
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
