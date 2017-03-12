angular.module('sc_map_edit_bin.controllers').controller("save-progress",
["$scope", "$timeout", "$uibModalInstance", "data", function($scope, $timeout, $uibModalInstance, data) {

  $scope.data = {
    progress_value: 0,
    progress_text: "",
    finished: false,

    map:            data.map,
    edit_heightmap: data.edit_heightmap
    // TODO: Scripts
  };

  // TBD: Do this in stages so I can refresh the UI?
  async.waterfall([
    (next) => {
      $scope.data.progress_text = "Synchronising heightmap...";
      $scope.data.progress_value = "0";
      $timeout(() => { next(null); }, 50);
    },
    (next) => {
      $scope.data.edit_heightmap.export_to_heightmap($scope.data.map.heightmap);
      $timeout(() => { next(null); }, 50);
    },
    (next) => {
      $scope.data.progress_text = "Serialising...";
      $scope.data.progress_value = "20";
      $timeout(() => { next(null); }, 50);
    },
    (next) => {
      let serialised_map = data.map.save();
      $timeout(() => { next(null, serialised_map); }, 50);
    },
    (serialised_map, next) => {
      $scope.data.progress_text = "Encoding...";
      $scope.data.progress_value = "90";
      $timeout(() => { next(null, serialised_map); }, 50);
    },
    (serialised_map, next) => {
      // Base64 encode
      let b64_serialised_map = serialised_map.toBase64();
      $timeout(() => { next(null, b64_serialised_map); }, 50);
    },
    (b64_serialised_map, next) => {
      $scope.data.progress_text = "Writing...";
      $scope.data.progress_value = "95";
      $timeout(() => { next(null, b64_serialised_map); }, 50);
    },
    (b64_serialised_map, next) => {
      // Write to local storage
      localStorage.setItem("sc_map_edit_bin.save.scmap", b64_serialised_map);
      $timeout(() => { next(); }, 100);
    }
  ],
  (err) => {
    if (err) {
      $scope.data.progress_text = `Error: ${err}`;
      $scope.data.progress_value = "0";
      $scope.data.finished = true;
    } else {
      $scope.data.progress_text = "Success";
      $scope.data.progress_value = "100";
      $timeout(() => { $uibModalInstance.close(); }, 300);
    }
  });


  $scope.ok = function() {
    $uibModalInstance.close();
  };
}]);
