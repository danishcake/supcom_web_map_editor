angular.module('sc_map_edit_bin.controllers').controller("editor-menu",
["$scope", "editor_state", function($scope, editor_state) {
  $scope.tool = {
    category: 'select',
    heightmap: {
      type: 'raise'
    },
    texturemap: {
      texture_index: 0,
      type: 'add'
    },
    size: 20,
    strength: 10
  };

  $scope.increase_tool_size = function() { Math.max($scope.tool.size++,   0); };
  $scope.decrease_tool_size = function() { Math.min($scope.tool.size--, 100); };

  $scope.increase_tool_strength = function() { Math.max($scope.tool.strength++,   1); };
  $scope.decrease_tool_strength = function() { Math.min($scope.tool.strength--, 100); };

  // On any change to the tool variables rebuild the tool
  $scope.$watch('tool', () => { editor_state.build_tool($scope.tool); }, true);
}]);
