angular.module('sc_map_edit_bin.controllers').controller("configure-metadata",
["$scope", "$uibModalInstance", "data", function($scope, $uibModalInstance, data) {

  if (!data) throw new Error(`Argument data cannot be null`);
  if (!data.name) throw new Error(`Argument data must contain name`);
  if (!data.author) throw new Error(`Argument data must contain author`);
  if (!data.description) throw new Error(`Argument data must contain description`);
  if (!data.heightmap_scale) throw new Error(`Argument data must contain heightmap_scale`);


  $scope.data = {
    name: data.name,
    author: data.author,
    description: data.description,
    heightmap_scale: data.heightmap_scale
  };


  $scope.validity = {
    name: false,
    author: false,
    description: false,
    heightmap_scale: false,
    all: false,
    message: ""
  };


  $scope.update_validity = function() {
    $scope.validity.name = $scope.data.name !== "";
    $scope.validity.description = $scope.data.description !== "";
    $scope.validity.author = $scope.data.author !== "";
    $scope.validity.heightmap_scale = $scope.data.heightmap_scale >= 0 && $scope.data.heightmap_scale < 1;
    $scope.validity.all = $scope.validity.name &&
                          $scope.validity.description &&
                          $scope.validity.author &&
                          $scope.validity.heightmap_scale;

    // Determine a useful error message
    if (!$scope.validity.name) {
      $scope.validity.message = "Name cannot be blank";
    } else if (!$scope.validity.description) {
      $scope.validity.message = "Description cannot be blank";
    } else if (!$scope.validity.author) {
      $scope.validity.message = "Author cannot be blank";
    } else if (!$scope.validity.heightmap_scale) {
      $scope.validity.message = "Heighmap scale must be between 0 and 1 - 1/128 (0.0078125) is common";
    } else {
      $scope.validity.message = "";
    }
  };


  $scope.update_validity();


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  $scope.ok = function() {
    $uibModalInstance.close($scope.data);
  };
}]);
