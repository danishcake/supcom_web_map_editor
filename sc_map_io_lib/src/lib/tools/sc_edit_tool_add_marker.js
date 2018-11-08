import { _ } from "underscore";
import { sc_script_marker } from "../script/sc_script_marker";

/**
 * Marker creation tool
 * This tool creates a marker of the type configured at construction when the cursor is depressed
 */

export class sc_edit_tool_add_marker {
  /**
   * Creates a tool that will create a marker with the given template when applied
   * @param {marker_template} Template to use. Must contain required keys.
   * The name key will be made unique by applying a _{ID} suffix
   */
  constructor(marker_template) {
    this.__marker_template = marker_template;
    this.__active = false;
  }


  /**
   * Setter for outer radius
   */
  set_outer_radius(outer_radius) { }


  /**
   * Setter for inner radius
   */
  set_inner_radius(inner_radius) { }


  /**
   * Setter for stength
   */
  set_strength(strength) { }

  /** @type {number} */
  get outer_radius() { return 1; }
  /** @type {number} */
  get inner_radius() { return 1; }


  /**
   * Start function. This should be called at when mouse first clicked.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  start(data, args) {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    if (!this.__active) {
      const size = [data.edit_heightmap.width, data.edit_heightmap.height];
      const primary_position = args.symmetry.get_primary_pixel(args.grid_position, size);
      const secondary_positions = args.symmetry.get_secondary_pixels(primary_position, size);
      const all_positions = [primary_position].concat(secondary_positions);

      for (const position of all_positions) {
        // First application, so place marker at current position
        // Find a unique name
        const markers_array = Object.keys(data.save_script.markers).map(marker_name => data.save_script.markers[marker_name]);
        const marker_name = sc_script_marker.find_unique_name(markers_array, this.__marker_template.name);

        // Load fields from template
        const marker = new sc_script_marker(marker_name, this.__marker_template);

        // Position marker under cursor
        marker.position.x = position[0];
        marker.position.z = position[1];

        // Add the marker
        data.save_script.markers[marker.name] = marker;
      }

      this.__active = true;
    }
  }


  /**
   * Apply function. This should be called at every position where the mouse moves.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  apply(data, args) { }


  /**
   * Finish application of a tool
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  end(data, args) {
    this.__active = false;
  }
}
