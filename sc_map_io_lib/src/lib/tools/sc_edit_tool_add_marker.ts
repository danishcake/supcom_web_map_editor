import * as _ from "underscore";
import { sc_script_marker, sc_script_marker_template } from "../script/sc_script_marker";
import { sc_edit_tool_base } from "./sc_edit_tool";
import { sc_edit_tool_data, sc_edit_tool_args } from "./sc_edit_tool_args";
import { sc_vec2 } from "../sc_vec";

/**
 * Marker creation tool
 * This tool creates a marker of the type configured at construction when the cursor is depressed
 */

export class sc_edit_tool_add_marker extends sc_edit_tool_base {
  private __marker_template: sc_script_marker_template;


  /**
   * Creates a tool that will create a marker with the given template when applied
   * @param {marker_template} Template to use. Must contain required keys.
   * The name key will be made unique by applying a _{ID} suffix
   */
  constructor(marker_template: sc_script_marker_template) {
    super(1, 1, 1);
    this.__marker_template = marker_template;
  }


  /**
   * Start function. This should be called at when mouse first clicked.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public start(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    if (!this.__active) {
      const size: sc_vec2 = [data.edit_heightmap.width, data.edit_heightmap.height];
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
  public apply(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
  }


  /**
   * Finish application of a tool
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public end(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    this.__active = false;
  }
}
