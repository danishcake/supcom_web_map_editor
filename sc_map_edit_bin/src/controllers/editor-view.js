angular.module('sc_map_edit_bin.controllers').controller("editor-view",
["$scope", function($scope) {
   $scope.on_wheel = function(evt, d, dx, dy) {
     $scope.camera.zoom_steps(dy);
   }
}]);
