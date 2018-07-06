const angular = require('angular');
const sc_map_io_lib = require('../../../../sc_map_io_lib/dist/sc_map_io_lib.bundle');

angular.module('sc_map_edit_bin.controllers').controller("auto-texture",
["$scope", "$uibModalInstance", "data", "editor_state", function($scope, $uibModalInstance, data, editor_state) {
  $scope.options = {
    layers: 1
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.ok = function() {
    // TBD: Can I avoid recalculating this?
    const histogram = sc_map_io_lib.sc.edit.view.methods.calculate_histogram(editor_state.edit_heightmap)[0];
    const sorted_signals = sc_map_io_lib.sc.edit.view.methods.find_histogram_signals(histogram, 5).slice(0, $scope.options.layers);

    $uibModalInstance.close(sorted_signals);
  };
}]);
