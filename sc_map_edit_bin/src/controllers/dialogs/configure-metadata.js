angular.module('sc_map_edit_bin.controllers').controller("configure-metadata",
["$scope", "$uibModalInstance", "data", function($scope, $uibModalInstance, data) {

  if (!data) throw new Error(`Argument data cannot be null`);
  if (!data.name) throw new Error(`Argument data must contain name`);
  if (!data.author) throw new Error(`Argument data must contain author`);
  if (!data.description) throw new Error(`Argument data must contain description`);

  $scope.data = {
    name: data.name,
    author: data.author,
    description: data.description
  };


  $scope.validity = {
    name: false,
    author: false,
    description: false
  };


  $scope.update_validity = function() {
    $scope.validity.name = $scope.data.name !== "";
    $scope.validity.description = $scope.data.description !== "";
    $scope.validity.author = $scope.data.author !== "";
    $scope.validity.all = $scope.validity.name &&
                          $scope.validity.description &&
                          $scope.validity.author;
  };


  $scope.update_validity();


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  $scope.ok = function() {
    $uibModalInstance.close($scope.data);
  };
}]);
