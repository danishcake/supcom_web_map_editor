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

  $scope.open_archive = function() {
    $uibModalInstance.close($scope.map);
  };

  $scope.open_scenario = function() {
    $scope.data.validity.scenario_set = true;
    $scope.update_validity();
  }
  ;
  $scope.open_save = function() {
    $scope.data.validity.save_set = true;
    $scope.update_validity();
  };

  $scope.open_script = function() {
    $scope.data.validity.script_set = true;
    $scope.update_validity();
  };

  $scope.open_scmap = function() {
    $scope.data.validity.scmap_set = true;
    $scope.update_validity();
  };
}]);
