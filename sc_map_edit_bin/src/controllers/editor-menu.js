angular.module('sc_map_edit_bin.controllers').controller("editor-menu",
["$scope", "editor_state", function($scope, editor_state) {
  $scope.tool = {
    category: 'heightmap',
    heightmap: {
      type: 'raise'
    },
    texturemap: {
      texture_index: 0,
      type: 'add'
    },
    marker: {
      type: 'select'
    },
    size: 10,
    strength: 10,
    symmetry: 'none'
  };

  $scope.increase_tool_size = () => $scope.tool.size = Math.min($scope.tool.size + 1, 100);
  $scope.decrease_tool_size = () => $scope.tool.size = Math.max($scope.tool.size - 1,   0);

  $scope.increase_tool_strength = () => $scope.tool.strength = Math.min($scope.tool.strength + 1, 100);
  $scope.decrease_tool_strength = () => $scope.tool.strength = Math.max($scope.tool.strength - 1,   1);

  // On any change to the tool variables rebuild the tool
  $scope.$watch('tool', () => { editor_state.build_tool($scope.tool); }, true);
}]);
