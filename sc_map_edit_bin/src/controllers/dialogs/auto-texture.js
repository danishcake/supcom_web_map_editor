const angular = require('angular');
import { sc_edit_view_methods } from '../../../../sc_map_io_lib/src/lib/views/sc_edit_view_methods';

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
    const histogram = sc_edit_view_methods.calculate_histogram(editor_state.edit_heightmap)[0];
    const sorted_signals = sc_edit_view_methods.find_histogram_signals(histogram, 5).slice(0, $scope.options.layers);

    $uibModalInstance.close(sorted_signals);
  };
}]).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/dialogs/auto-texture.html', require('../../../templates/dialogs/auto-texture.html'));
}]);
