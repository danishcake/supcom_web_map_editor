import {sc_edit_tool_base} from "./sc_edit_tool"
import {sc_edit_patch} from "../views/sc_edit_patch"
import {sc_edit_view_methods} from "../views/sc_edit_view_methods"

/**
 * Raise/lower tool. Applicable to single dimension data channel 0 only
 */
class sc_edit_tool_height_change extends sc_edit_tool_base {
  /**
   * Height changing tool
   * @param {boolean} raise true to increase height
   */
  constructor(outer_radius, inner_radius, strength, raise) {
    super(outer_radius, inner_radius, strength);
    this.__raise = raise ? 1 : -1;
  }


  /**
   * Prepares a heightmap patch to apply using addition
   */
  __start_impl(edit_heightmap, position) {
    // Create the patch that will be applied periodically
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1],
                                     edit_heightmap.subpixel_count,
                                     edit_heightmap.subpixel_max);
    const inner_strength = sc_edit_view_methods.make_pixel(edit_heightmap.subpixel_count, this.__strength);
    const outer_strength = sc_edit_view_methods.make_pixel(edit_heightmap.subpixel_count, 0);
    sc_edit_view_methods.radial_fill(this.__patch, inner_strength, this.__inner_radius, outer_strength, this.__outer_radius);
  }


  /**
   * Raises/lowers the pixels
   */
  __apply_impl(edit_heightmap, position) {
    if (this.__raise === 1) {
      sc_edit_view_methods.add(edit_heightmap, [position[0] - this.__outer_radius, position[1] - this.__outer_radius], this.__patch);
    } else {
      sc_edit_view_methods.sub(edit_heightmap, [position[0] - this.__outer_radius, position[1] - this.__outer_radius], this.__patch);
    }
  }


  __end_impl() {
    this.__patch = null;
  }
}

/**
 * Specialisation of the un-exported sc_edit_tool_height_change for raising terrain
 */
export class sc_edit_tool_raise extends sc_edit_tool_height_change {
  constructor(outer_radius, inner_radius, strength) {
    super(outer_radius, inner_radius, strength, true);
  }
}


/**
 * Specialisation of the un-exported sc_edit_tool_height_change for lowering terrain
 */
export class sc_edit_tool_lower extends sc_edit_tool_height_change {
  constructor(outer_radius, inner_radius, strength) {
    super(outer_radius, inner_radius, strength, false);
  }
}
