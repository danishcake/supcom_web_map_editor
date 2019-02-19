import * as _ from "underscore"
import { sc_edit_tool_base } from "./sc_edit_tool";
import { sc_vec2 } from "../sc_vec";
import { sc_edit_tool_data, sc_edit_tool_args } from "./sc_edit_tool_args";
import { sc_script_marker } from "../script/sc_script_marker";
import { sc_script_save } from "../script/sc_script_save";
import { sc_edit_symmetry_base } from "../sc_edit_symmetry";


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

export class sc_edit_tool_select_marker extends sc_edit_tool_base {
  private __moved: boolean;
  private __last_position: sc_vec2;
  private __started_over_selected_marker = false;

  constructor() {
    super(1, 1, 1);
    this.__moved = false;
    this.__last_position = [0, 0];
    this.__started_over_selected_marker = false;
  }


  /**
   * Start function. This can either select a marker, or if the marker is already selected
   * start a move
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public start(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    if (!this.__active) {
      const size: sc_vec2 = [data.edit_heightmap.width, data.edit_heightmap.height];
      // First application, so toggle selection of what's under the cursor
      const clicked_marker = this.__get_clicked_marker(data.save_script, args.position);

      this.__started_over_selected_marker = false;
      if (clicked_marker) {
        const reflected_markers = this.__get_secondary_markers(clicked_marker, data.save_script, args.symmetry, size);
        const all_markers = [clicked_marker].concat(reflected_markers);

        // Deselect markers currently selected marker if shift held
        if (args.shift) {
          if (clicked_marker.selected) {
            all_markers.forEach(marker => delete marker.selected);
          } else {
            all_markers.forEach(marker => marker.selected = true);
          }
        } else {
          // Otherwise start moving
          if (clicked_marker.selected) {
            this.__started_over_selected_marker = true;
          } else {
            all_markers.forEach(marker => marker.selected = true);

            // If shift not held then deselect all other markers
            _.chain(data.save_script.markers)
              .filter((marker) => {
                return !_.contains(all_markers, marker);
              })
              .each((marker) => {
                delete marker.selected;
              });
          }
        }
      } else {
        // If shift not held then deselect all markers
        if (!args.shift) {
          const markers = Object.keys(data.save_script.markers).map(marker_name => data.save_script.markers[marker_name]);
          markers.forEach(marker => {
            delete marker.selected;
          });
        }
      }

      this.__moved = false;
      this.__active = true;
      this.__last_position = args.position;
    }
  }

  /**
   * Apply function. Moves all selected markers once total distance moved exceeds a small
   * threshold
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public apply(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);
    const size: sc_vec2 = [data.edit_heightmap.width, data.edit_heightmap.height];

    const delta: sc_vec2 = [args.grid_position[0] - this.__last_position[0], args.grid_position[1] - this.__last_position[1]];

    if (!this.__moved) {
      const distance_moved = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1]);
      // TBD: This would be way better in screenspace
      if (distance_moved >= 1) {
        this.__moved = true;
      }
    }


    // Once movement has been detected start shifting the markers
    if (this.__moved && this.__started_over_selected_marker) {
      this.__last_position = args.grid_position;

      // Now: Find the markers in the primary region
      // Move those. All others should then reflected
      // Any leftover should be moved as per primary
      const moved_markers: sc_script_marker[] = [];
      const selected_markers = Object.keys(data.save_script.markers)
                                     .map(marker_name => data.save_script.markers[marker_name])
                                     .filter(marker => marker.selected);
      const primary_markers = selected_markers.filter((marker) => args.symmetry.is_primary_pixel([marker.position.x, marker.position.z], size));

      for (const primary_marker of primary_markers) {
        // Calculate pre-move secondary positions
        const pre_move_secondary_positions = args.symmetry.get_secondary_pixels([primary_marker.position.x, primary_marker.position.z], size);

        // Move primary
        primary_marker.position.x += delta[0];
        primary_marker.position.z += delta[1];
        moved_markers.push(primary_marker);

        // Calculate post-move secondary positions
        const post_move_secondary_positions = args.symmetry.get_secondary_pixels([primary_marker.position.x, primary_marker.position.z], size);

        for (let i = 0; i < pre_move_secondary_positions.length; i++) {
          const pre_move_secondary_position = pre_move_secondary_positions[i];
          const post_move_secondary_position = post_move_secondary_positions[i];

          // Find the nearest marker
          const secondary_marker = this.__get_marker_of_same_type_near(primary_marker.type,
                                                                       data.save_script,
                                                                       pre_move_secondary_position);

          if (secondary_marker) {
            secondary_marker.position.x = post_move_secondary_position[0];
            secondary_marker.position.z = post_move_secondary_position[1];
            moved_markers.push(secondary_marker);
          }
        }
      }

      // Any selected markers that were not moved by movement of reflected markers should be moved
      // as per primary

      const unmoved_markers = _.without(selected_markers, ...moved_markers);
      //const unmoved_markers = selected_markers.filter(p => moved_markers.find(p) == null);
      for (const unmoved_marker of unmoved_markers) {
        unmoved_marker.position.x += delta[0];
        unmoved_marker.position.z += delta[1];
      }
    }
  }


  /**
   * Finish application of a tool.
   * If the tool wasn't significantly moved it tries to toggle the selection
   * state of whatever was under the cursor
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public end(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // TBD: At end of application I should snap moved markers to grid
    this.__active = false;
  }


  /**
   * Gets the marker directly under the cursor
   * @param {sc_script_save} save_script Save script to edit
   * @param {number} position x/y-coordinate of centre of tool, measured from top/left
   * @return The closest marker under the cursor, or null if no marker close enough
   */
  private __get_clicked_marker(save_script: sc_script_save, position: sc_vec2): sc_script_marker | null {
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


  /**
   * Given a marker and symmetry, find the markers that were probably created as reflections
   * @param {sc_script_marker} primary_marker The primary (eg just clicked) marker
   * @param {sc_script_save} save_script The save script containing all markers
   * @param {sc_edit_symmetry_base} symmetry The symmetry in use
   * @param {sc_vec2} size Heightmap/marker units size
   */
  private __get_secondary_markers(primary_marker: sc_script_marker,
                                  save_script: sc_script_save,
                                  symmetry: sc_edit_symmetry_base,
                                  size: sc_vec2): sc_script_marker[] {
    if (primary_marker == null) {
      return [];
    }

    const markers = Object.keys(save_script.markers).map(marker_name => save_script.markers[marker_name]);
    const primary_position = symmetry.get_primary_pixel([primary_marker.position.x, primary_marker.position.z], size);
    const secondary_positions = symmetry.get_secondary_pixels(primary_position, size);
    const all_positions = [primary_position].concat(secondary_positions);

    const secondary_markers = [];

    // TODO: Express in terms of __get_marker_of_same_type_near
    for (const position of all_positions) {
      for (const marker of markers) {
        // If a marker is not the primary marker, and it is very close to a secondary position then return it
        const delta = [position[0] - marker.position.x,
                       position[1] - marker.position.z];
        const distance_sq = delta[0] * delta[0] + delta[1] * delta[1];
        if (marker != primary_marker && distance_sq < 0.1 && marker.type === primary_marker.type) {
          secondary_markers.push(marker);

          // Only pick a single marker from each secondary position
          break;
        }
      }
    }

    return secondary_markers;
  }


  private __get_marker_of_same_type_near(marker_type: string,
                                         save_script: sc_script_save,
                                         position: sc_vec2): sc_script_marker | null {
    const markers = Object.keys(save_script.markers).map(maker_name => save_script.markers[maker_name]);

    const distance_sorted_markers_of_same_type = markers
      .filter((marker) => marker.type === marker_type)
      .map((marker) => {
        const delta = [position[0] - marker.position.x,
                      position[1] - marker.position.z];
        const distance_sq = delta[0] * delta[0] + delta[1] * delta[1];
        return {
          distance_sq,
          marker
        }
      })
      .sort((lhs, rhs) => lhs.distance_sq - rhs.distance_sq);

    if (distance_sorted_markers_of_same_type.length > 0) {
      if (distance_sorted_markers_of_same_type[0].distance_sq <= 0.5) {
        // Distance threshold: We want the closest marker, where aligning to a rotated grid position may have moved it.
        // Maximum distance in each axis is 0.5, so assume (0.5*0.5) * 2 = 0.5
        return distance_sorted_markers_of_same_type[0].marker;
      }
    }

    return null;
  }
}
