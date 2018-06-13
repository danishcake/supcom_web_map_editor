angular.module('sc_map_edit_bin.controllers').controller("editor-menu",
["$scope", "editor_state", "dialogs", function($scope, editor_state, dialogs) {
  $scope.tool = {
    category: 'heightmap',
    heightmap: {
      type: 'raise'
    },
    texturemap: {
      base_enabled: true,
      layer: 0,
      type: 'saturate_layer'
    },
    marker: {
      type: 'select'
    },
    water: {
      type: 'elevation'
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
    const symmetry_tool = new sc_map_io_lib.sc.edit.global_tool.enforce_symmetry(editor_state.symmetry);
    const tool_data = new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap_view,
                                                          editor_state.edit_texturemap_view,
                                                          editor_state.scripts.save,
                                                          editor_state.edit_target_view,
                                                          editor_state.map);
    symmetry_tool.apply(tool_data);
  };

  $scope.show_autotexturing_dialog = () => {
    let dlg = dialogs.create("templates/dialogs/auto-texture.html",
                             "auto-texture",
                             {
                               edit_heightmap: editor_state.edit_heightmap
                             },
                             modal_dlg_opts);
    dlg.result.then(function(signals) {
      const tool_data = new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap_view,
                                                            editor_state.edit_texturemap_view,
                                                            editor_state.scripts.save,
                                                            editor_state.edit_target_view,
                                                            editor_state.map);

      const autotexture_tool = new sc_map_io_lib.sc.edit.global_tool.autotexture(signals);
      autotexture_tool.apply(tool_data);
    });
  };


  // On any change to the tool variables rebuild the tool
  $scope.$watch('tool', () => {
    // Enforce enabled state for layers
    $scope.tool.texturemap.base_enabled = $scope.tool.texturemap.type === "clear_higher_layers";

    // If the base layer is selected when not enabled, select the bottom layer instead
    if (!$scope.tool.texturemap.base_enabled && $scope.tool.texturemap.layer === -1) {
      $scope.tool.texturemap.layer = 0;
    }


    // Rebuild the tool
    editor_state.build_tool($scope.tool);
  }, true);

  // On new map, recreate the tool
  editor_state.on_new_map(() => { editor_state.build_tool($scope.tool); });
}]);
