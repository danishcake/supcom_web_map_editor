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


  /**
   * Allow consumers of this service to register for callbacks
   * when the map is changed (eg loaded or new map created)
   * TODO: Add a callback library to allow unsubscribe etc?
   */
  service.callbacks = {
    on_new_map: []
  };
  service.on_new_map = function(callback) {
    service.callbacks.on_new_map.push(callback);
  }

  /**
   * Create a new map
   */
  service.create_map = function(map_params) {
    service.map = new sc_map_io_lib.sc.map();
    service.scripts = {
      scenario: new sc_map_io_lib.sc.script.scenario(),
      save: new sc_map_io_lib.sc.script.save()
    };

    service.map.create(initial_map_params);
    service.scripts.scenario.create(initial_map_params);
    service.scripts.save.create(initial_map_params);

    // Call each registered map change subscriber
    _.each(service.callbacks.on_new_map, callback => callback());
  };


  // Create the initial just loaded map
  let initial_map_params = {
    name: "Unnamed map",
    author: localStorage.getItem("sc_map_edit_bin.default_author") || "",
    description: "No description",
    size: 0
  };
  service.create_map(initial_map_params);

  return service;
});
