angular.module('sc_map_edit_bin.controllers').controller("save-as",
["$scope", "$rootScope", "$timeout", "$uibModalInstance", "editor_state", "dialogs", "data", function($scope, $rootScope, $timeout, $uibModalInstance, editor_state, dialogs, data) {

  $scope.data = {
    // Save mode. This can be one of:
    // 0 (localstorage), 1 (directory), 2 (zip file)
    mode: 0,
    // Save location. This can be one of
    // "file:///directory", "file:///file.zip"
    // and is valid for modes 1 and 2
    location: ""
  };

  $scope.validity = {
    location: true,
    all: false
  };

  $scope.update_validity = function() {
    switch ($scope.data.mode) {
      case 0:
        $scope.validity.location = true;
        break;
      case 1:
        $scope.validity.location = $scope.data.location !== "";
        break;
      case 2:
        $scope.validity.location = $scope.data.location !== "";
        break;
    }

    $scope.validity.all = $scope.validity.location;
  };
  $scope.update_validity();


  $scope.mode_change = function() {
    $scope.validity.location = "";
    $scope.update_validity();
  };

  // Note: For some reason I can't seem to put my buttons callbacks within $scope.buttons. Weird!
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  let save_to_localstorage = function() {
    // TBD: Do this in stages so I can refresh the UI?
    // Eg
    // save((progress_percentage, progress_message, continuation) => {
    //   $rootScope.$broadcast('dialogs.wait.progress', {'progress' : progress_percentage});
    //   $rootScope.$broadcast('dialogs.wait.message', {'msg': progress_message});
    //   $timeout(continuation, 10);
    // });

    async.waterfall([
      (next) => {
      // Show a dialog
        dialogs.wait('Saving...', 'Please wait - this can take several seconds', 0);
        $timeout(() => { next(); }, 100);
      },
      (next) => {
        // Serialise
        // TODO: Use editor_state.edit_heightmap to populate the actual heightmap before serialisation
        // editor_state.edit_heightmap.export_heightmap(editor_state.map.heightmap);
        let serialised_map = editor_state.map.save();
        $timeout(() => { next(null, serialised_map); }, 100);
      },
      (serialised_map, next) => {
        // Base64 encode
        let b64_serialised_map = serialised_map.toBase64();
        $timeout(() => { next(null, b64_serialised_map); }, 100);
      },
      (b64_serialised_map, next) => {
        // Write to local storage
        localStorage.setItem("sc_map_edit_bin.saved_map", b64_serialised_map);
        $timeout(() => { next(); }, 100);
      }
    ],
    (err) => {
      // Hide the progress dialog
      $rootScope.$broadcast('dialogs.wait.complete');
    });
  };


  $scope.ok = function() {
    switch($scope.data.mode) {
      case 0:
      default:
        save_to_localstorage();
        break;

      case 1:
      case 2:
        break;
    }
    $uibModalInstance.close();
  };
}]);
