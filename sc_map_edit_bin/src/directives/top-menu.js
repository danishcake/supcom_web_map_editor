const angular = require('angular');

angular.module('sc_map_edit_bin.directives').directive('topMenu', function() {
  return {
    restrict: 'E',
    template: require('../../templates/top-menu.html')
  };
}).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/popovers/overlays.html', require('../../templates/popovers/overlays.html'));
}]);
