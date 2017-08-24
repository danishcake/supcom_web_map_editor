import {sc_edit_tool_base} from "./sc_edit_tool"
import {sc_edit_patch} from "../views/sc_edit_patch"
import {sc_edit_view_snapshot} from "../views/sc_edit_view_snapshot"
import {sc_edit_view_convolution} from "../views/sc_edit_view_convolution"
import {sc_edit_view_methods} from "../views/sc_edit_view_methods"
import {_} from "underscore"

/**
 * Terrain smoothing tool
 * @property {sc_edit_view_snapshot} __snapshot Value of the view prior to changes
 * @property {sc_edit_view_convolution} __convolution View of __snapshot with a blur applied
 * @property {string} __blur_type The type of blur to apply. @see blur_gaussian or blur_average
 */
export class sc_edit_tool_smooth extends sc_edit_tool_base {
  /**
   * Height smoothing tool
   * @param {number} outer_radius Maximum radius of effect
   * @param {number} inner_radius Maximum radius of full intensity effect
   * @param {number} strength Intensity of effect. At 255 the inner radius will be fully set to the smoothed value
   * @property {string} __blur_type The type of blur to apply. @see blur_gaussian or blur_average
   */
  constructor(outer_radius, inner_radius, strength, blur_type) {
    super(outer_radius, inner_radius, strength);

    if (blur_type !== sc_edit_tool_smooth.blur_gaussian &&
        blur_type !== sc_edit_tool_smooth.blur_average) {
      throw new Error(`Parameter 'blur_type' must be a known blur type`);
    }
    this.__blur_type = blur_type;
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
    // Create a flat average filter
    let weights;
    switch (this.__blur_type) {
      case sc_edit_tool_smooth.blur_average:
        weights = sc_edit_view_methods.make_pixel((this.__outer_radius * 2 + 1) * (this.__outer_radius * 2 + 1), 1);
        break;
      default:
      case sc_edit_tool_smooth.blur_gaussian:
        throw new Error("Not implemented");
        break;
    }

    this.__convolution = new sc_edit_view_convolution(this.__snapshot, weights, weights.length);
  }


  /**
   * Smooths the terrain around the application site
   */
  __apply_impl(target_view, position) {
    // Find average value of the tools region every time it is applied
    const average_value = this.__convolution.get_pixel(position);

    // Fill entire patch with average
    sc_edit_view_methods.fill(this.__patch, average_value);

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
    this.__convolution = null;
  }

  static get blur_gaussian() { return 'gaussian'; }
  static get blur_average() { return 'average'; }
}
