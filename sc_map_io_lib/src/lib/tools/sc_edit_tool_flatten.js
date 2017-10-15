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
  __start_impl(target_view, position) {


    // Create the patch that will be applied periodically
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1],
                                     target_view.subpixel_count,
                                     target_view.subpixel_max);
    sc_edit_view_methods.fill(this.__patch, target_view.get_pixel(position));

    // Create the blending weight patch that will be used to lerp betweeen
    this.__blending_patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1],
                                              target_view.subpixel_count,
                                              target_view.subpixel_max);
    const inner_weight = sc_edit_view_methods.make_pixel(target_view.subpixel_count, 1);
    const outer_weight = sc_edit_view_methods.make_pixel(target_view.subpixel_count, 0);
    sc_edit_view_methods.radial_fill(this.__blending_patch,
                                     inner_weight,
                                     this.__inner_radius,
                                     outer_weight,
                                     this.__outer_radius);

    // Create a cache of the original heightmap
    this.__snapshot = new sc_edit_view_snapshot(target_view);
  }


  /**
   * Flatten the terrain around the application site the pixels
   */
  __apply_impl(target_view, position) {
    sc_edit_view_methods.ratcheted_weighted_blend(target_view, // Write to target_view
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
