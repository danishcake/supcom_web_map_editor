import { sc_edit_global_tool_base } from './sc_edit_global_tool'
import { sc_script_marker } from '../script/sc_script_marker';
import { sc_edit_symmetry_base } from '../sc_edit_symmetry';
import { sc_edit_tool_data } from '../tools/sc_edit_tool_args';
import { sc_vec2 } from '../sc_vec';


/**
 * Enforces a particular symmetry
 * @property {sc_edit_symmetry_base} __symmetry The Symmetry to enforce
 */
export class sc_edit_global_tool_enforce_marker_symmetry extends sc_edit_global_tool_base {
  private __symmetry: sc_edit_symmetry_base;

  /**
   * Constructor
   * @param {sc_edit_symmetry_base} symmetry
   */
  constructor(symmetry: sc_edit_symmetry_base) {
    super();
    this.__symmetry = symmetry;
  }


  /**
   * Enforces symmetry for markers. Markers in the primary area are replicated, while ones
   * outside the primary area are deleted
   * @param {sc_edit_tool_data} data
   * @private
   */
  protected __apply_impl(data: sc_edit_tool_data): void {
    const size: sc_vec2 = [data.map.heightmap.width, data.map.heightmap.height];

    // Remove markers outside the primary area
    const markers_in_primary = Object.keys(data.save_script.markers)
      .map(key => data.save_script.markers[key])
      .filter(marker => this.__symmetry.is_primary_pixel([marker.position.x, marker.position.z], size));

    // Create symmetric versions of markers inside the primary area
    const markers = [...markers_in_primary];
    for (const marker of markers_in_primary) {
      const reflected_positions = this.__symmetry.get_secondary_pixels([marker.position.x, marker.position.z], size);
      for (const reflected_position of reflected_positions) {
        const marker_name = sc_script_marker.find_unique_name(markers, marker.name);
        const reflected_marker = new sc_script_marker(marker_name, marker);

        // TODO: This is a bodge to make Typescript stop complaining that postion may be undefined
        // Remove bodge when porting marker to Typescript
        if (reflected_marker.position !== undefined) {
          reflected_marker.position.x  = reflected_position[0];
          reflected_marker.position.z  = reflected_position[1];
        }

        markers.push(reflected_marker);
      }
    }

    // Update the map, transforming markers back to key-values pairs
    const marker_kvp: {[key: string]: any} = {};
    for (const marker of markers) {
      marker_kvp[marker.name] = marker;
    }

    data.save_script.markers = marker_kvp;
  }
}