/**
 * Selection and marker movement tool
 * This tool has modes depending on whether marker[s] are selected
 * If no markers selected then clicking searches for a marker on mouse-up
 * If markers are already selected but not under the cursor on mouse-down then it also searches for a marker
 * If markers are already selected and the mouse is over one at when first depressed then subsequent mouse-movement
 * moves the markers
 *
 * radius and strength are ignored
 */

export class sc_edit_tool_select_marker {
  constructor() {
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
   * Apply function. This should be called at every position where the mouse moves.
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  apply(edit_heightmap, save_script, new_position) {

    if (this.__active) {
      // Previously active. If started over a marker then move markers
    
    } else {
      // First application, so check selection and what's under the cursor
    }

    this.__active = true;
  }


  /**
   * Finish application of a tool
   */
  end() {
    this.__active = false;
  }
}
