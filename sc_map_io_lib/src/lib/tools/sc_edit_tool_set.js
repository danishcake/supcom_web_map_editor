import {sc_edit_tool_base} from "./sc_edit_tool"
import {sc_edit_patch} from "../views/sc_edit_patch"
import {sc_edit_view_methods} from "../views/sc_edit_view_methods"

/**
 * View setting tool
 * @property {sc_edit_patch} __patch Value to be written
 * @property {sc_edit_patch} __radial_mask Mask for value to be written
 */
export class sc_edit_tool_set extends sc_edit_tool_base {
  /**
   * @constructor
   * @param {number} outer_radius The maximum radius of tool effect
   * @param {number} inner_radius The radius of maximum effect
   * @param {number[]} strength The intensity of the effect, per channel. If a channel is undefined it has no effect
   */
  constructor(outer_radius, inner_radius, strength) {
    super(outer_radius, inner_radius, strength);
  }


  /**
   * Preparation for apply - creates channel mask view
   * @param {sc_edit_view_base} target_view
   * @param {sc_vec2} position
   */
  __start_impl(target_view, position) {
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1], target_view.subpixel_count, target_view.subpixel_max);
    this.__radial_mask = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1], target_view.subpixel_count, 1);

    sc_edit_view_methods.fill(this.__patch, sc_edit_view_methods.make_pixel(target_view.subpixel_count, this.__strength));
    sc_edit_view_methods.radial_fill(this.__radial_mask,
                                     sc_edit_view_methods.make_pixel(target_view.subpixel_count, 1),
                                     this.__outer_radius,
                                     sc_edit_view_methods.make_pixel(target_view.subpixel_count, 0),
                                     this.__outer_radius);
  }


  /**
   * Sets the values in the view
   * @param {sc_edit_view_base} target_view
   * @param {sc_vec2} position
   */
  __apply_impl(target_view, position) {
    // TBD: Weighted blend is complete overkill here.
    // I could implement this significantly faster
    sc_edit_view_methods.weighted_blend(target_view,
                                        [position[0] - this.__outer_radius, position[1] - this.__outer_radius],
                                        this.__patch,
                                        target_view,
                                        this.__radial_mask);
  }


  __end_impl() {
    this.__patch = null;
    this.__radial_mask = null;
  }
}
