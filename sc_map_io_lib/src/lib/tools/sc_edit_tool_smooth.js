import {sc_edit_tool_base} from "./sc_edit_tool"
import {sc_edit_patch} from "../views/sc_edit_patch"
import {sc_edit_view_snapshot} from "../views/sc_edit_view_snapshot"
import {sc_edit_view_methods} from "../views/sc_edit_view_methods"
import {_} from "underscore"

/**
 * Terrain smoothing tool
 */
export class sc_edit_tool_smooth extends sc_edit_tool_base {
  /**
   * Height smoothing tool
   */
  constructor(outer_radius, inner_radius, strength) {
    super(outer_radius, inner_radius, strength);
  }


  /**
   * Prepares a heightmap patch to apply using blend
   */
  __start_impl(target_view, position) {
    // Create the patch that will be applied periodically
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1],
                                     target_view.subpixel_count,
                                     target_view.subpixel_max);

    // Create the blending weight patch that will be used to lerp between
    this.__blending_patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1],
                                              target_view.subpixel_count,
                                              target_view.subpixel_max);
    const inner_strength = sc_edit_view_methods.make_pixel(target_view.subpixel_count, Math.min(1, this.__strength / 255.0));
    const outer_strength = sc_edit_view_methods.make_pixel(target_view.subpixel_count, 0);
    sc_edit_view_methods.radial_fill(this.__blending_patch,
                                     inner_strength,
                                     this.__inner_radius,
                                     outer_strength,
                                     this.__outer_radius);

    // Create a cache of the original heightmap
    this.__snapshot = new sc_edit_view_snapshot(target_view);
  }


  /**
   * Smooths the terrain around the application site
   */
  __apply_impl(target_view, position) {
    // Find average value of the tools region every time it is applied
    // TODO: If I reuse averages a lot I should write sc_edit_view_averaged/blurred
    // or even sc_edit_view_convolution

    let sum = sc_edit_view_methods.make_pixel(this.__patch.subpixel_count, 0);
    for (let y = -this.__outer_radius; y <= this.__outer_radius; y++) {
      let iy = y + position[1];
      for (let x = -this.__outer_radius; x <= this.__outer_radius; x++) {
        let ix = x + position[0];
        let original_pixel = this.__snapshot.get_pixel([ix, iy]);
        for (let i = 0; i < this.__patch.subpixel_count; i++) {
          sum[i] += original_pixel[i];
        }
      }
    }
    sc_edit_view_methods.fill(this.__patch, _.map(sum, value => value / (this.__patch.width * this.__patch.height)));

    // Move the tool region towards that average
    sc_edit_view_methods.ratcheted_weighted_blend(target_view, // To edit_heightmap
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
