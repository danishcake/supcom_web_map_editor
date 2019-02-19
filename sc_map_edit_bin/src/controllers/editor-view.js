const angular = require('angular');
const sc_map_io_lib = require('../../../sc_map_io_lib/dist/sc_map_io_lib.bundle');

angular.module('sc_map_edit_bin.controllers').controller("editor-view",
["$scope", "editor_state", function($scope, editor_state) {

  $scope.data = {
    cursor_info: ""
  };

  /**
   * Zooms the map around the current mouse hover position
   */
  $scope.on_wheel = function(evt, d, dx, dy) {
    $scope.camera.set_focus([evt.originalEvent.offsetX, evt.originalEvent.offsetY]);
    $scope.camera.zoom_steps(dy);
  };


  /**
   * Updates the zoom focus, and if a tool is in use applies tool
   */
  $scope.on_mousemove = function(evt) {
    // This now needs to be reverse projected from screen to camera unit vector, then intersected with the z=0 plane
    // This is then the new focus for the zoom
    let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);
    $scope.data.cursor_info = `[${Math.floor(world_position[0])}, ${Math.floor(world_position[0])}]`;

    editor_state.tool_position = world_position;

    // LMB held during move, start/apply a tool step
    if ((evt.buttons & 1) && editor_state.tool !== null) {
      const tool_data = new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap_view,
                                                            editor_state.edit_texturemap_view,
                                                            editor_state.scripts.save,
                                                            editor_state.edit_target_view,
                                                            editor_state.map);
      const tool_args = new sc_map_io_lib.sc.edit.tool.args(world_position,
                                                            evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                           sc_map_io_lib.sc.edit.tool.args.modifier_none);

      editor_state.tool.apply(tool_data, tool_args);

    }
  };


  $scope.on_mousedown = function(evt) {
    // LMB depressed, do tool first prep
    if (evt.which === 1 && editor_state.tool !== null) {
      let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);

      const tool_data = new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap_view,
                                                            editor_state.edit_texturemap_view,
                                                            editor_state.scripts.save,
                                                            editor_state.edit_target_view,
                                                            editor_state.map);
      const tool_args = new sc_map_io_lib.sc.edit.tool.args(world_position,
                                                            evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                           sc_map_io_lib.sc.edit.tool.args.modifier_none);

      editor_state.tool.start(tool_data, tool_args);
    }
  };


  /**
   * Finishes applying a tool when LMB is released
   */
  $scope.on_mouseup = function(evt) {
    // LMB released, end tool application
    if (evt.which === 1 && editor_state.tool !== null) {
      let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);
      const tool_data = new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap_view,
                                                            editor_state.edit_texturemap_view,
                                                            editor_state.scripts.save,
                                                            editor_state.edit_target_view,
                                                            editor_state.map);
      const tool_args = new sc_map_io_lib.sc.edit.tool.args(world_position,
                                                            evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                           sc_map_io_lib.sc.edit.tool.args.modifier_none);
      editor_state.tool.end(tool_data, tool_args);
    }
  };

  /**
   * Finishes applying a tool when cursor leaves client region
   */
  $scope.on_mouseleave = function(evt) {
    $scope.data.cursor_info = "";

    // Cursor left, end tool application
    if (editor_state.tool !== null) {
      const tool_data = new sc_map_io_lib.sc.edit.tool.data(editor_state.edit_heightmap_view,
                                                            editor_state.edit_texturemap_view,
                                                            editor_state.scripts.save,
                                                            editor_state.edit_target_view,
                                                            editor_state.map);
      const tool_args = new sc_map_io_lib.sc.edit.tool.args([0, 0],
                                                            evt.shiftKey ? sc_map_io_lib.sc.edit.tool.args.modifier_shift :
                                                                           sc_map_io_lib.sc.edit.tool.args.modifier_none);

      editor_state.tool.end(tool_data, tool_args);
    }

    // Clear the tool position
    editor_state.tool_position = null;
  };
}]);
