angular.module('sc_map_edit_bin.services').factory('editor_state', function() {
  let service = {};

  service.tool = 'select';
  service.tool_size = 20;

  return service;
});
