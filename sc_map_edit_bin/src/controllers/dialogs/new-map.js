angular.module('sc_map_edit_bin.controllers').controller("new-map",
["$scope", "$uibModalInstance", "data", function($scope, $uibModalInstance, data) {
  $scope.map = {
    size: 1, // 0=Tiny 5x5, 4=Huge 80x80
    name: '',
    description: '',
    author: localStorage.getItem("sc_map_edit_bin.default_author") || ""
  };

  $scope.validity = {
    name: false,
    description: false,
    author: false,
    all: false
  };

  $scope.update_validity = function() {
    $scope.validity.name = $scope.map.name !== "";
    $scope.validity.description = $scope.map.description !== "";
    $scope.validity.author = $scope.map.author !== "";
    $scope.validity.all = $scope.validity.name &&
                          $scope.validity.description &&
                          $scope.validity.author;
  };
  $scope.update_validity();


  // Note: For some reason I can't seem to put my buttons callbacks within $scope.buttons. Weird!
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.ok = function() {
    // Save the author so we can default it next time
    localStorage.setItem("sc_map_edit_bin.default_author", $scope.map.author);
    $uibModalInstance.close($scope.map);
  };
}]);
