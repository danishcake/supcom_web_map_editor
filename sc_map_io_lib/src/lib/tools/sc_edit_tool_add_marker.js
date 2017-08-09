import {_} from "underscore";


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
  set_outer_radius(outer_radius) {}


  /**
   * Setter for inner radius
   */
  set_inner_radius(inner_radius) {}


  /**
   * Setter for stength
   */
  set_strength(strength) {}


  /**
   * Start function. This should be called at when mouse first clicked.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  start(data, args) {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    if (!this.__active) {
      // First application, so place marker at current position
      const marker_names = _.chain(data.save_script.markers)
        .filter((marker, marker_name) => {
          return marker.type === this.__marker_template.type;
        })
        .pluck('name')
        .value();

      // Dumb linear search for first free index.
      // Fine for small N, which is what we have
      let marker_name_stem = this.__marker_template.name;

      // God do I hate Javascript. Give me value sematics or give me death!
      let marker = JSON.parse(JSON.stringify(this.__marker_template));

      for (let i = 0;; i++) {
        const candidate_marker_name = `${this.__marker_template.name}_${i}`;
        if (!_.contains(marker_names, candidate_marker_name)) {
          marker.name = candidate_marker_name;
          break;
        }
      }

      // Position marker under cursor
      marker.position.x = args.grid_position[0];
      marker.position.z = args.grid_position[1];

      // Add the marker
      data.save_script.markers[marker.name] = marker;

      this.__active = true;
    }
  }


  /**
   * Apply function. This should be called at every position where the mouse moves.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  apply(data, args) {}


  /**
   * Finish application of a tool
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  end(data, args) {
    this.__active = false;
  }
}
