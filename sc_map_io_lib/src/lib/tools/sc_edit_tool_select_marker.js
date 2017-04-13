import {_} from "underscore"

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
    this.__moved = false;
    this.__last_position = [0, 0];
    this.__started_over_selected_marker = false;
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
   * Start function. This can either select a marker, or if the marker is already selected
   * start a move
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {sc_script_save} save_script Save script to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  start(edit_heightmap, save_script, new_position) {
    if (!this.__active) {
      // First application, so toggle selection of what's under the cursor
      const clicked_marker = this.__get_clicked_marker(save_script, new_position);

      this.__started_over_selected_marker = false;
      if (clicked_marker) {
        if (clicked_marker.selected) {
          this.__started_over_selected_marker = true;
        } else {
          clicked_marker.selected = true;

          // If shift not held then deselect all other markers
          _.chain(save_script.markers)
            .filter((marker) => {
              return marker !== clicked_marker;
            })
            .each((marker) => {
              delete marker.selected;
            });
        }
      } else {
        // If shift not held then deselect all markers
        _.each(save_script.markers, (marker) => {
          delete marker.selected;
        });
      }

      this.__moved = false;
      this.__active = true;
      this.__last_position = new_position;
    }
  }

  /**
   * Apply function. Moves all selected markers once total distance moved exceeds a small
   * threshold
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {sc_script_save} save_script Save script to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  apply(edit_heightmap, save_script, new_position) {
    const delta = [new_position[0] - this.__last_position[0], new_position[1] - this.__last_position[1]];

    if (!this.__moved) {
      const distance_moved = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1]);
      // TBD: This would be way better in screenspace
      if (distance_moved > 1) {
        this.__moved = true;
      }
    }

    // Once movement has been detected start shifting the markers
    if (this.__moved && this.__started_over_selected_marker) {
      _.chain(save_script.markers)
        .filter((marker) => { return !!marker.selected; })
        .each((marker) => {
          marker.position.x += delta[0];
          marker.position.z += delta[1];
        });
      this.__last_position = new_position;
    }
  }


  /**
   * Finish application of a tool.
   * If the tool wasn't significantly moved it tries to toggle the selection
   * state of whatever was under the cursor
   * @param {sc_edit_heightmap} edit_heightmap Heightmap to edit
   * @param {sc_script_save} save_script Save script to edit
   * @param {number} new_position x/y-coordinate of centre of tool, measured from top/left
   */
  end(edit_heightmap, save_script, new_position) {
    this.__active = false;
  }


  /**
   * Gets the marker directly under the cursor
   * @param {sc_script_save} save_script Save script to edit
   * @param {number} position x/y-coordinate of centre of tool, measured from top/left
   * @return The closest marker under the cursor, or null if no marker close enough
   */
  __get_clicked_marker(save_script, position) {
    if (_.isEmpty(save_script.markers)) {
      return null;
    }
    const closest_marker = _.chain(save_script.markers)
      .map((marker) => {
        const delta = [position[0] - marker.position.x,
                       position[1] - marker.position.z];
        const distance_sq = delta[0] * delta[0] + delta[1] * delta[1];

        return {
          marker: marker,
          distance_sq: distance_sq
        };
      })
      .min((marker) => {
        return marker.distance_sq;
      })
      .value();

      // TODO: Refine threshold!
      if(closest_marker.distance_sq < 2) {
        return closest_marker.marker;
      } else {
        return null;
      }
  }
}
