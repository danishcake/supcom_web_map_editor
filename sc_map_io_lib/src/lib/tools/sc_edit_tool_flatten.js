import {sc_edit_tool_base} from "./sc_edit_tool"
import {sc_edit_patch} from "../views/sc_edit_patch"
import {sc_edit_view_snapshot} from "../views/sc_edit_view_snapshot"
import {sc_edit_view_methods} from "../views/sc_edit_view_methods"

/**
 * Terrain flattening tool
 */

export class sc_edit_tool_flatten extends sc_edit_tool_base {
  /**
   * Height flattening tool
   */
  constructor(outer_radius, inner_radius, strength) {
    super(outer_radius, inner_radius, strength);
  }


  /**
   * Prepares a heightmap patch to apply using blend
   */
  __prepare_impl(edit_heightmap, position) {
    // Create the patch that will be applied periodically
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1]);
    sc_edit_view_methods.fill(this.__patch, edit_heightmap.get_pixel(position));
    // Create the blending weight patch that will be used to lerp betweeen
    this.__blending_patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1]);
    // Create a cache of the original heightmap
    this.__snapshot = new sc_edit_view_snapshot(edit_heightmap);

    // Solid inner region with linear falloff to zero
    // Outer region is zero initialised
    for (let y = -this.__outer_radius; y <= this.__outer_radius; y++) {
      let oy = this.__outer_radius + y;
      for (let x = -this.__outer_radius; x <= this.__outer_radius; x++) {
        let ox = this.__outer_radius + x;

        const r = Math.sqrt(x * x + y * y);
        if (r < this.__inner_radius) {
          this.__blending_patch.set_pixel([ox, oy], 1);
        } else if (r < this.__outer_radius) {
          let falloff_factor = (this.__outer_radius - r) / (this.__outer_radius - this.__inner_radius);
          this.__blending_patch.set_pixel([ox, oy], falloff_factor);
        }
      }
    }
  }


  /**
   * Flatten the terrain around the application site the pixels
   */
  __apply_impl(edit_heightmap, position) {
    sc_edit_view_methods.ratcheted_weighted_blend(edit_heightmap, // To edit_heightmap
                                                  [position[0] - this.__outer_radius, position[1] - this.__outer_radius],  // At this position
                                                  this.__patch, // From this source
                                                  this.__snapshot, // And this source
                                                  this.__blending_patch); // Weighting the first by this
  }


  __end_impl() {
    this.__patch = null;
    this.__blending_patch = null;
    this.__snapshot = null;
  }
}
