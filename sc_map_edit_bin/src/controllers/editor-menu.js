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

  // Uses current symmetry mode to set all secondary pixels to their primary value
  $scope.enforce_symmetry = () => {
    const map_size = [editor_state.edit_heightmap.width, editor_state.edit_heightmap.height];

    for (let y = 0; y < editor_state.edit_heightmap.height; y++) {
      for (let x = 0; x < editor_state.edit_heightmap.width; x++) {
        const current_pixel = [x, y];
        const primary_pixel = editor_state.symmetry.get_primary_pixel(current_pixel, map_size);
        if (current_pixel[0] == primary_pixel[0] && current_pixel[1] == primary_pixel[1])
        {
          editor_state.edit_view.set_pixel(current_pixel, editor_state.edit_view.get_pixel(current_pixel));
        }
      }
    }
  };

  // On any change to the tool variables rebuild the tool
  $scope.$watch('tool', () => { editor_state.build_tool($scope.tool); }, true);

  // On new map, recreate the tool
  editor_state.on_new_map(() => { editor_state.build_tool($scope.tool); });
}]);
