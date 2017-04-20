
/**
 * String used to represent an army with no allocated spawn position
 */
const unassigned_army = "Unassigned";

angular.module('sc_map_edit_bin.controllers').controller("configure-forces",
["$scope", "$uibModalInstance", "dialogs", "data", function($scope, $uibModalInstance, dialogs, data) {

  /**
   * Save contains army markers, while the scenario contains the forces in the armies object
   */
  $scope.data = {
    scripts: data.scripts,
    max_players: 12,
    player_count: data.scripts.scenario.armies.length,
    armies: [],
    spawn_markers: []
  };


  // Clamp the number of players to 2
  if ($scope.data.player_count < 2) {
    $scope.data.player_count = 2;
  }


  // Lets figure out the initial army/marker association.
  // If a marker doesn't exist then drop it
  for (let i = 0; i < $scope.data.player_count; i++) {
    if (i < $scope.data.scripts.scenario.armies.length &&
        _.has($scope.data.scripts.save.markers, $scope.data.scripts.scenario.armies[i])) {
      $scope.data.armies.push($scope.data.scripts.scenario.armies[i]);
    } else {
      $scope.data.armies.push(unassigned_army);
    }
  }


  // Find markers suitable for use as a spawn location
  $scope.data.spawn_markers = _.chain($scope.data.scripts.save.markers)
    .filter(marker => marker.type === "Blank Marker")
    .pluck("name")
    .value();
  $scope.data.spawn_markers.push(unassigned_army);


  /**
   * When the number of armies is increased add a null to the armies listStyleType
   * When an army is removed just lop it from the list
   */
  $scope.army_count_change = function() {
    if ($scope.data.player_count < 2) {
      $scope.data.player_count = 2;
    }

    while ($scope.data.player_count > $scope.data.armies.length) {
      $scope.data.armies.push(unassigned_army);
    }

    if ($scope.data.player_count < $scope.data.armies.length) {
      $scope.data.armies = $scope.data.armies.slice(0, $scope.data.player_count);
    }
  };


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  $scope.accept = function() {
    $uibModalInstance.close($scope.data.armies);
  };
}]);


angular.module('sc_map_edit_bin.controllers').filter('unusedMarkers', function() {
  return function(markers, used_markers, index) {
    let used_markers_without_reserved = _.difference(used_markers, [unassigned_army, used_markers[index]]);
    let unused_markers = _.difference(markers, used_markers_without_reserved);
    return unused_markers;
  };
});