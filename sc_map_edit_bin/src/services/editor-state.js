/**
 * Contains the state of the editor that is shared between different views
 * Key parts are:
 * tool: The type of editing tool to apply when clicking/draging
 * map:
 */
angular.module('sc_map_edit_bin.services').factory('editor_state', function() {
  let service = {};

  service.tool = null; // TODO: Add a select tool

  /**
   * Builds a tool from the current tool_data
   * @param {object} tool_data Structure defining selected tool options. See editor-menu.js
   */
  service.build_tool = function(tool_data) {
    const outer = tool_data.size;
    const inner = tool_data.size * 0.5; // TODO: Make this variable
    const strength = tool_data.strength;

    switch(tool_data.category) {
      case 'select':
        service.tool = null;
        break;

      case 'heightmap':
        switch(tool_data.heightmap.type) {
          case 'raise':
            service.tool = new sc_map_io_lib.sc.edit.tool.raise(outer, inner, strength);
            break;

          case 'lower':
            service.tool = new sc_map_io_lib.sc.edit.tool.lower(outer, inner, strength);
            break;

          case 'flatten':
            service.tool = new sc_map_io_lib.sc.edit.tool.flatten(outer, inner, strength);
            break;

          default:
            service.tool = null;
            break;
        }
        break;

      case 'texture':
        service.tool = null;
        break;

      default:
        service.tool = null;
        break;
    }
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
   * Attempts to load the map. On error makes no change to the state
   * @param buffers {object}
   * @return {bool} True on success
   * @throws {Error} error
   */
  service.load_map = function(map) {
    service.map = map.scmap;
    service.scripts.scenario = map.scripts.scenario;
    service.scripts.save = map.scripts.save;

    // Build editable heightmap
    service.edit_heightmap = new sc_map_io_lib.sc.edit.heightmap(service.map.heightmap);

    // Call each registered map change subscriber
    _.each(service.callbacks.on_new_map, callback => callback());
  };


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

    // Build editable heightmap
    service.edit_heightmap = new sc_map_io_lib.sc.edit.heightmap(service.map.heightmap);

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
