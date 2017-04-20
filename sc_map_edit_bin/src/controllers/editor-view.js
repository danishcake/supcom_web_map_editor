angular.module('sc_map_edit_bin.controllers').controller("editor-view",
["$scope", "editor_state", function($scope, editor_state) {

  /**
   * Zooms the map around the current mouse hover position
   */
  $scope.on_wheel = function(evt, d, dx, dy) {
     $scope.camera.zoom_steps(dy);
   };


  /**
   * Updates the zoom focus, and if a tool is in use applies tool
   */
  $scope.on_mousemove = function(evt) {
    // This now needs to be reverse projected from screen to camera unit vector, then intersected with the z=0 plane
    // This is then the new focus for the zoom
    let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);
    $scope.camera.set_focus(world_position);

    // LMB held during move, start/apply a tool step
    if ((evt.buttons & 1) && editor_state.tool !== null) {
      editor_state.tool.apply(new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap, editor_state.scripts.save),
                              new sc_map_io_lib.sc.edit.tool.args(world_position,
                                                                  evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                                 sc_map_io_lib.sc.edit.tool.args.modifier_none));
    }
  };


  $scope.on_mousedown = function(evt) {
    // LMB depressed, do tool first prep
    if (evt.which == 1 && editor_state.tool !== null) {
      let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);

      editor_state.tool.start(new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap, editor_state.scripts.save),
                              new sc_map_io_lib.sc.edit.tool.args(world_position,
                                                                  evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                                 sc_map_io_lib.sc.edit.tool.args.modifier_none));
    }
  };


  /**
   * Finishes applying a tool when LMB is released
   */
  $scope.on_mouseup = function(evt) {
    // LMB released, end tool application
    if (evt.which == 1 && editor_state.tool !== null) {
      let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);
      editor_state.tool.end(new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap, editor_state.scripts.save),
                            new sc_map_io_lib.sc.edit.tool.args(world_position,
                                                                evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                               sc_map_io_lib.sc.edit.tool.args.modifier_none));
    }
  };

  /**
   * Finishes applying a tool when cursor leaves client region
   */
  $scope.on_mouseleave = function(evt) {
    // Cursor left, end tool application
    if (editor_state.tool !== null) {
      editor_state.tool.end(new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap, editor_state.scripts.save),
                            new sc_map_io_lib.sc.edit.tool.args([0, 0],
                                                                evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                               sc_map_io_lib.sc.edit.tool.args.modifier_none));
    }
  };
}]);
