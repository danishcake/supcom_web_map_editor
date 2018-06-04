angular.module('sc_map_edit_bin.controllers').controller("configure-water",
["$scope", "$uibModalInstance", "data", function($scope, $uibModalInstance, data) {

  if (data == null) throw new Error(`Argument data cannot be null`);
  if (data.enabled == null) throw new Error(`Argument data must contain enabled`);
  if (data.elevation == null) throw new Error(`Argument data must contain elevation`);
  if (data.elevation_deep == null) throw new Error(`Argument data must contain elevation_deep`);
  if (data.elevation_abyss == null) throw new Error(`Argument data must contain elevation_abyss`);


  $scope.data = {
    enabled: data.enabled,
    elevation: data.elevation,
    elevation_deep: data.elevation_deep,
    elevation_abyss: data.elevation_abyss,
  };

  $scope.update_elevation = function() {
    // Constrain lower levels to this value
    $scope.data.elevation_deep = Math.min($scope.data.elevation, $scope.data.elevation_deep);
    $scope.data.elevation_abyss = Math.min($scope.data.elevation_deep, $scope.data.elevation_abyss);
  };

  $scope.update_elevation_deep = function() {
    // Constrain higher and lower levels
    $scope.data.elevation = Math.max($scope.data.elevation, $scope.data.elevation_deep);
    $scope.data.elevation_abyss = Math.min($scope.data.elevation_deep, $scope.data.elevation_abyss);
  };

  $scope.update_elevation_abyss = function() {
    // Constrain the higher levels
    $scope.data.elevation = Math.max($scope.data.elevation, $scope.data.elevation_deep);
    $scope.data.elevation_deep = Math.max($scope.data.elevation_deep, $scope.data.elevation_abyss);
  };


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  $scope.ok = function() {
    $uibModalInstance.close($scope.data);
  };
}]);
