angular.module('sc_map_edit_bin.controllers').controller("editor-menu",
["$scope", "editor_state", function($scope, editor_state) {
  $scope.editor_state = editor_state;

  $scope.increase_tool_size = function() { Math.max($scope.editor_state.tool.size++,   0); };
  $scope.decrease_tool_size = function() { Math.min($scope.editor_state.tool.size--, 100); };
}]);
