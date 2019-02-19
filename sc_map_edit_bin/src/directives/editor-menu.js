const angular = require('angular');

angular.module('sc_map_edit_bin.directives').directive('editorMenu', function() {
  return {
    restrict: 'E',
    template: require('../../templates/editor-menu.html')
  };
}).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/popovers/global_smoothing.html', require('../../templates/popovers/global_smoothing.html'));
  $templateCache.put('templates/popovers/symmetry.html', require('../../templates/popovers/symmetry.html'));
}]);
