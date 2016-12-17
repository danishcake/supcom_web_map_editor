import {sc_edit_tool_base} from "./sc_edit_tool"
import {sc_edit_patch} from "../views/sc_edit_patch"
import {sc_edit_view_methods} from "../views/sc_edit_view_methods"

/**
 * Raise/lower tool
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
  __prepare_impl(edit_heightmap, position) {
    // Create the patch that will be applied periodically
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1]);

    // Solid inner region with linear falloff to zero
    // Outer region is zero initialised
    for (let y = -this.__outer_radius; y <= this.__outer_radius; y++) {
      let oy = this.__outer_radius + y;
      for (let x = -this.__outer_radius; x <= this.__outer_radius; x++) {
        let ox = this.__outer_radius + x;

        const r = Math.sqrt(x * x + y * y);
        if (r < this.__inner_radius) {
          this.__patch.set_pixel([ox, oy], this.__strength);
        } else if (r < this.__outer_radius) {
          let falloff_strength = Math.floor(this.__strength * (this.__outer_radius - r) / (this.__outer_radius - this.__inner_radius));
          this.__patch.set_pixel([ox, oy], falloff_strength);
        }
      }
    }
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
