angular.module('sc_map_edit_bin.controllers').controller("editor-view",
["$scope", function($scope) {

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
    $scope.camera.set_focus_screenspace(evt.clientX, evt.clientY);

    // LMB held during move, start/apply a tool step
    if (evt.buttons & 1) {
      // TODO: Handle start
    }
  };


  /**
   * Finishes applying a tool when LMB is released
   */
  $scope.on_mouseup = function(evt) {
    // LMB released, end tool application
    if (evt.buttons & 1) {
      // TODO: Handle start
    }
  };

  /**
   * Finishes applying a tool when cursor leaves client region
   */
  $scope.on_mouseleave = function(evt) {
    // Cursor left, end tool application
  };
}]);
