/**
 * Contains the state of the editor that is shared between different views
 * Key parts are:
 * tool: The type of editing tool to apply when clicking/draging
 * map:
 */
angular.module('sc_map_edit_bin.services').factory('editor_state', function() {
  let service = {};

  // TODO: Make tool a class
  service.tool = {
      type: 'select',
      size: 20
  };

  // TODO: Make metadata a class
  service.map = {
    metadata: {
      name: "Unnamed map",
      author: "Anonymous",
      description: "No description"
    }
  }

  return service;
});
