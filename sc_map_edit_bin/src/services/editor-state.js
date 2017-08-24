/**
 * Contains the state of the editor that is shared between different views
 * Key parts are:
 * tool: The type of editing tool to apply when clicking/draging
 * map:
 */
angular.module('sc_map_edit_bin.services').factory('editor_state', function() {
  let service = {};

  // Tool/edit_heightmap_view/symmetry are populated when the tool is created
  // Map/scripts/edit_heightmap/edit_heightmap are populated when the map is created or loaded (which also recreates the tool)
  service.tool = null;
  service.edit_heightmap_view = null;
  service.symmetry = null;
  service.save_location = "unsaved";
  service.map = null;
  service.edit_heightmap = null;
  service.edit_texturemap = null;
  service.edit_target_view = null;
  service.scripts = null;
  service.render_mode = "heightmap";

  /**
   * Returns the location the map was most recently saved to or loaded from
   */
  service.get_save_location = () => { return service.save_location; };


  /**
   * Sets the most recently saved to location
   */
  service.set_save_location = (location) => { service.save_location = location; };

  /**
   * Creates an 8 element array suitable for use with a mask view, leaving specified channel unmasked
   * @param {number} tool_layer Layer to leave unmasked
   */
  const mask_from_tool_layer = function(tool_layer) {
    const mask = sc_map_io_lib.sc.edit.view.methods.make_pixel(8, 0);
    mask[tool_layer] = 1;
    return mask;
  };

  /**
   * @function target_view_wrapper
   * @param {sc_edit_view_base} wrapped_view A view to be wrapped in another
   * @return {sc_edit_view_base} The passed view wrapped in some wrapper (eg symmetry, mask etc)
   */

  /**
   * Builds a tool from the current tool_data
   * @param {object} tool_data Structure defining selected tool options. See editor-menu.js
   */
  service.build_tool = function(tool_data) {
    const outer = tool_data.size;
    const inner = tool_data.size * 0.5; // TODO: Make this variable
    const strength = tool_data.strength;
    /** @type target_view_wrapper */
    let target_view_constructor = null; // If set, the target view will be passed to this and the return value used


    // Recreate the tool
    switch(tool_data.category) {
      case 'heightmap':
        service.render_mode = 'heightmap';
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

          case 'smooth':
            service.tool = new sc_map_io_lib.sc.edit.tool.smooth(outer, inner, strength, sc_map_io_lib.sc.edit.tool.smooth.blur_average);
            break;

          default:
            service.tool = null;
            break;
        }
        break;

      case 'texture':
        service.render_mode = 'texturemap';
        switch(tool_data.texturemap.type) {
          case 'saturate_layer':
            service.tool = new sc_map_io_lib.sc.edit.tool.set(outer, outer, 255);
            target_view_constructor = (target_view) => new sc_map_io_lib.sc.edit.view.mask(target_view, mask_from_tool_layer(tool_data.texturemap.layer));
            break;

          case 'half_layer':
            service.tool = new sc_map_io_lib.sc.edit.tool.set(outer, outer, 192);
            target_view_constructor = (target_view) => new sc_map_io_lib.sc.edit.view.mask(target_view, mask_from_tool_layer(tool_data.texturemap.layer));
            break;

          case 'clear_layer':
            service.tool = new sc_map_io_lib.sc.edit.tool.set(outer, outer, 0);
            target_view_constructor = (target_view) => new sc_map_io_lib.sc.edit.view.mask(target_view, mask_from_tool_layer(tool_data.texturemap.layer));
            break;

          case 'clear_higher_layers':
            service.tool = new sc_map_io_lib.sc.edit.tool.clear_higher(outer, inner, tool_data.texturemap.layer);
            break;

          case 'raise_layer':
            service.tool = new sc_map_io_lib.sc.edit.tool.raise(outer, inner, strength);
            target_view_constructor = (target_view) => new sc_map_io_lib.sc.edit.view.mask(target_view, mask_from_tool_layer(tool_data.texturemap.layer));
            break;

          case 'lower_layer':
            service.tool = new sc_map_io_lib.sc.edit.tool.lower(outer, inner, strength);
            target_view_constructor = (target_view) => new sc_map_io_lib.sc.edit.view.mask(target_view, mask_from_tool_layer(tool_data.texturemap.layer));
            break;

          case 'smooth_edges':
            service.tool = new sc_map_io_lib.sc.edit.tool.smooth(outer, inner, strength, sc_map_io_lib.sc.edit.tool.smooth.blur_average);
            break;

          default:
            service.tool = null;
            break;
        }


        break;

      default:
        switch (tool_data.marker.type) {
          case 'select':
            service.tool = new sc_map_io_lib.sc.edit.tool.select_marker();
            break;
          case 'army':
            service.tool = new sc_map_io_lib.sc.edit.tool.add_marker( {
              type: 'Blank Marker',
              name: 'ARMY', // _${index}
              position: {x: 0, y: 0, z: 0}, // Will be replaced
              orientation: {x: 0, y: 0, z: 0},
              color: 'ff800080',
              prop: '/env/common/props/markers/M_Blank_prop.bp'
            });
            break;
          case 'mass':
            service.tool = new sc_map_io_lib.sc.edit.tool.add_marker( {
              type: 'Mass',
              name: 'Mass', // _${index}
              position: {x: 0, y: 0, z: 0}, // Will be replaced
              orientation: {x: 0, y: 0, z: 0},
              resource: true,
              amount: 100.000000,
              color: 'ff808080',
              editorIcon: '/textures/editor/marker_mass.bmp',
              size: 1.000000,
              prop: '/env/common/props/markers/M_Mass_prop.bp'
            });
            break;
          case 'hydro':
            service.tool = new sc_map_io_lib.sc.edit.tool.add_marker( {
              type: 'Hydrocarbon',
              name: 'Hydrocarbon', // _${index}
              position: {x: 0, y: 0, z: 0}, // Will be replaced
              orientation: {x: 0, y: 0, z: 0},
              resource: true,
              amount: 100.000000,
              color: 'ff008000',
              size: 1.000000,
              prop: '/env/common/props/markers/M_Hydrocarbon_prop.bp',
            });
            break;
          default:
            service.tool = null;
            break;
        }
        break;
    }

    // Recreate the symmetry view
    switch(tool_data.symmetry) {
      case 'none':
      default:
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.none();
        break;

      case 'horizontal':
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.horizontal();
        break;

      case 'vertical':
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.vertical();
        break;

      case 'xy':
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.xy();
        break;

      case 'yx':
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.yx();
        break;

      case 'quadrants':
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.quadrants();
        break;

      case 'octants':
        service.symmetry = new sc_map_io_lib.sc.edit.symmetry.octants();
        break;
    }

    service.edit_heightmap_view = new sc_map_io_lib.sc.edit.view.symmetry(service.edit_heightmap, service.symmetry);
    service.edit_texturemap_view = new sc_map_io_lib.sc.edit.view.symmetry(service.edit_texturemap, service.symmetry);

    // Set the primary target view for the tool based on the tool
    switch(tool_data.category) {
      case 'heightmap':
      default:
        service.edit_target_view = service.edit_heightmap_view;
        break;
      case 'texture':
        service.edit_target_view = service.edit_texturemap_view;
        break;
    }

    if (target_view_constructor !== null) {
      service.edit_target_view = target_view_constructor(service.edit_target_view);
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
    service.save_location = map.save_location;

    // Build editable heightmap/texturemap
    service.edit_heightmap = new sc_map_io_lib.sc.edit.heightmap(service.map.heightmap);
    service.edit_texturemap = new sc_map_io_lib.sc.edit.texturemap(service.map.texturemap)

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

    // Build editable heightmap/texturemap
    service.edit_heightmap = new sc_map_io_lib.sc.edit.heightmap(service.map.heightmap);
    service.edit_texturemap = new sc_map_io_lib.sc.edit.texturemap(service.map.texturemap);

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
