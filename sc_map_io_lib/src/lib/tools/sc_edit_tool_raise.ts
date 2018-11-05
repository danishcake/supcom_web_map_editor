import { sc_edit_tool_base } from "./sc_edit_tool"
import { sc_edit_patch } from "../views/sc_edit_patch"
import { sc_edit_view_methods } from "../views/sc_edit_view_methods"
import { sc_edit_view_base } from "../views/sc_edit_view";
import { sc_vec2 } from "../sc_vec";

/**
 * Raise/lower tool. Applies to all subchannels equally
 */
class sc_edit_tool_height_change extends sc_edit_tool_base {
  private __raise: boolean;
  private __power: number;
  private __patch: sc_edit_view_base | null;


  /**
   * Height changing tool
   * @param {boolean} raise true to increase height
   * @param {number} power The power to which the tool is raised. Values > 1 are peakier
   */
  constructor(outer_radius: number, inner_radius: number, strength: number, raise: boolean, power: number) {
    super(outer_radius, inner_radius, strength);
    this.__raise = raise;
    this.__power = power;
    this.__patch = null;
  }


  /**
   * Prepares a heightmap patch to apply using addition
   */
  protected __start_impl(target_view: sc_edit_view_base, position: sc_vec2): void {
    // Create the patch that will be applied periodically
    this.__patch = new sc_edit_patch([this.__outer_radius * 2 + 1, this.__outer_radius * 2 + 1],
                                     target_view.subpixel_count,
                                     target_view.subpixel_max);
    const inner_strength = sc_edit_view_methods.make_pixel(target_view.subpixel_count, this.__strength);
    const outer_strength = sc_edit_view_methods.make_pixel(target_view.subpixel_count, 0);
    sc_edit_view_methods.radial_fill(this.__patch, inner_strength, this.__inner_radius, outer_strength, this.__outer_radius);
    if (this.__power !== 1.0) {
      const scalar = this.__strength / Math.pow(this.__strength, this.__power);
      sc_edit_view_methods.transform(this.__patch, (subpixel, pixel) => Math.pow(subpixel, this.__power) * scalar);
    }
  }


  /**
   * Raises/lowers the pixels
   */
  protected __apply_impl(target_view: sc_edit_view_base, position: sc_vec2): void {
    if (this.__raise) {
      sc_edit_view_methods.add(target_view,
                               [position[0] - this.__outer_radius, position[1] - this.__outer_radius],
                               this.__patch as sc_edit_view_base);
    } else {
      sc_edit_view_methods.sub(target_view,
                               [position[0] - this.__outer_radius, position[1] - this.__outer_radius],
                               this.__patch as sc_edit_view_base);
    }
  }


  protected __end_impl(): void {
    this.__patch = null;
  }
}

/**
 * Specialisation of the un-exported sc_edit_tool_height_change for raising terrain
 */
export class sc_edit_tool_raise extends sc_edit_tool_height_change {
  constructor(outer_radius: number, inner_radius: number, strength: number) {
    super(outer_radius, inner_radius, strength, true, 1);
  }
}

/**
 * Specialisation of the un-exported sc_edit_tool_height_change for lowering terrain
 */
export class sc_edit_tool_lower extends sc_edit_tool_height_change {
  constructor(outer_radius: number, inner_radius: number, strength: number) {
    super(outer_radius, inner_radius, strength, false, 1);
  }
}

/**
 * Specialisation of the un-exported sc_edit_tool_height_change for raising a peak
 */
export class sc_edit_tool_raise_peak extends sc_edit_tool_height_change {
  constructor(outer_radius: number, inner_radius: number, strength: number) {
    super(outer_radius, inner_radius, strength, true, 4);
  }
}

/**
 * Specialisation of the un-exported sc_edit_tool_height_change for lowering a peak
 */
export class sc_edit_tool_lower_peak extends sc_edit_tool_height_change {
  constructor(outer_radius: number, inner_radius: number, strength: number) {
    super(outer_radius, inner_radius, strength, false, 4);
  }
}
