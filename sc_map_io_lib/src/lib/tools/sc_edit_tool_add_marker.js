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
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {sc_edit_heightmap} edit_heightmap Save script to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  start(edit_heightmap, save_script, new_position) {
    if (!this.__active) {
      // First application, so place marker at current position
      const marker_names = _.chain(save_script.markers)
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
      marker.position.x = new_position[0];
      marker.position.z = new_position[1];

      // Add the marker
      save_script.markers[marker.name] = marker;

      this.__active = true;
    }
  }


  /**
   * Apply function. This should be called at every position where the mouse moves.
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {sc_edit_heightmap} edit_heightmap Save script to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  apply(edit_heightmap, save_script, new_position) {}


  /**
   * Finish application of a tool
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {sc_script_save} save_script Save script to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  end(edit_heightmap, save_script, new_position) {
    this.__active = false;
  }
}
