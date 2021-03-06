const angular = require('angular');
import { sc_edit_tool_args, sc_edit_tool_data } from '../../../sc_map_io_lib/src/lib/tools/sc_edit_tool_args';

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

  const make_tool_data = () => {
    return new sc_edit_tool_data(editor_state.edit_heightmap_view,
                                 editor_state.edit_texturemap_view,
                                 editor_state.scripts.save,
                                 editor_state.edit_target_view,
                                 editor_state.map);
  };


  /**
   * Updates the zoom focus, and if a tool is in use applies tool
   */
  $scope.on_mousemove = function(evt) {
    // Give focus to the view so that keyboard navigation works
    evt.target.focus();

    // This now needs to be reverse projected from screen to camera unit vector, then intersected with the z=0 plane
    // This is then the new focus for the zoom
    let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);
    $scope.data.cursor_info = `[${Math.floor(world_position[0])}, ${Math.floor(world_position[1])}]`;

    editor_state.tool_position = world_position;

    // LMB held during move, start/apply a tool step
    if ((evt.buttons & 1) && editor_state.tool !== null) {
      const tool_data = make_tool_data();
      const tool_args = new sc_edit_tool_args(world_position,
                                              evt.shiftKey ? sc_edit_tool_args.modifier_shift :
                                                             sc_edit_tool_args.modifier_none,
                                              editor_state.symmetry);

      editor_state.tool.apply(tool_data, tool_args);
    }
  };


  $scope.on_mousedown = function(evt) {
    // LMB depressed, do tool first prep
    if (evt.which === 1 && editor_state.tool !== null) {
      let world_position = $scope.camera.project_to_world([evt.offsetX, evt.offsetY]);

      const tool_data = make_tool_data();
      const tool_args = new sc_edit_tool_args(world_position,
                                              evt.shiftKey ? sc_edit_tool_args.modifier_shift :
                                                             sc_edit_tool_args.modifier_none,
                                              editor_state.symmetry);

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

      const tool_data = make_tool_data();
      const tool_args = new sc_edit_tool_args(world_position,
                                              evt.shiftKey ? sc_edit_tool_args.modifier_shift :
                                                             sc_edit_tool_args.modifier_none,
                                              editor_state.symmetry);
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
      const tool_data = make_tool_data();
      const tool_args = new sc_edit_tool_args([0, 0],
                                              evt.shiftKey ? sc_edit_tool_args.modifier_shift :
                                                             sc_edit_tool_args.modifier_none,
                                              editor_state.symmetry);

      editor_state.tool.end(tool_data, tool_args);
    }

    // Clear the tool position
    editor_state.tool_position = null;
  };


  /**
   * Handles keyup events
   */
  $scope.on_keyup = function(evt) {
    if (editor_state.tool !== null) {
      const tool_data = make_tool_data();
      editor_state.tool.keyup(tool_data, event.keyCode);
    }

    // WASD and UDLR keys drive camera, but communicate their state via editor_state
    editor_state.on_keyup(evt.keyCode);
  };


  /**
   * Handles keyup events
   */
  $scope.on_keydown = function(evt) {
    if (editor_state.tool !== null) {
      const tool_data = make_tool_data();
      editor_state.tool.keydown(tool_data, event.keyCode);
    }
    editor_state.on_keydown(evt.keyCode);
  };
}]);
