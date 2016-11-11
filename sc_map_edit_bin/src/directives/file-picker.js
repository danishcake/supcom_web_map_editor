/**
 * Angular file picker button
 *
 * Presents a nice button as a a file picker
 * Usage:
 * <file-picker opened='somecallbackfn'></file-picker>
 *
 * The file-opened event will be called with an ArrayBuffer containing the contents of the file
 */

angular.module('sc_map_edit_bin.directives').directive('fileUpload', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/file-picker.html',
    transclude: true,
    scope: {onopen: '&'},
    link: function(scope, element, attributes) {

      // Unwrap onopen callback
      scope.onopen = scope.onopen();

      let hidden_button = element[0].querySelector("#file_picker");

      // Redirect ng-click to hidden file input button
      scope.show_file_open_dialog = function() {
        hidden_button.form.reset();
        hidden_button.click();
      };

      // When file open dialog picks a file, load it and fire the file_picked
      scope.file_changed = function(file) {
        let file_reader = new FileReader();
        file_reader.onload = function() {
          if (scope.onopen) {
            scope.$apply(() => {
              scope.onopen(file_reader.result);
            })
          }
        };
        file_reader.readAsArrayBuffer(hidden_button.files[0]);
      };
    }
  };
});
