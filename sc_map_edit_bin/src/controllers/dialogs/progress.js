const angular = require('angular');

/**
 * Generic progress dialog. Handles the following broadcasts:
 * $rootScope.$broadcast("dialogs.progress.progress", { progress: 0, message: ""});
 * $rootScope.$broadcast("dialogs.progress.complete");
 * $rootScope.$broadcast("dialogs.progress.error", { message: ""});
 *
 * Complete will automatically close the dialog after 500ms
 * Error will leave the dialog open until dismissed
 * Usage:
 *
 *  dialogs.create("templates/dialogs/progress.html",
 *                 "progress",
 *                 {},
 *                 modal_dlg_opts);
 *
 *  // Now use the broadcast commands above to control the dialog state
 */
angular.module('sc_map_edit_bin.controllers').controller("progress",
["$scope", "$timeout", "$uibModalInstance", "data", function($scope, $timeout, $uibModalInstance, data) {

  $scope.data = {
    title: data.title || "Working...",
    progress_value: 0,
    progress_text: data.message || "Working...",
    finished: false,
  };

  const on_progress = function(evt, data) {
    $scope.data.progress_value = data.progress * 100;
    $scope.data.progress_text  = data.message;
  };

  const on_complete = function() {
    $scope.data.progress_value = 100;
    $scope.data.progress_text  = "Done";
    $timeout(() => $uibModalInstance.close(), 500);
  };

  const on_error = function(evt, data) {
    $scope.data.finished = true;
    $scope.data.progress_text = `Error: ${data.message}`;
  };

  $scope.$on('dialogs.progress.progress', on_progress);
  $scope.$on('dialogs.progress.complete', on_complete);
  $scope.$on('dialogs.progress.error',    on_error);

  $scope.ok = function() {
    $uibModalInstance.close();
  };
}]).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/dialogs/progress.html', require('../../../templates/dialogs/progress.html'));
}]);
