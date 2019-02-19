import { sc_edit_tool_base } from "./sc_edit_tool"
import { sc_edit_patch } from "../views/sc_edit_patch"
import { sc_edit_view_snapshot } from "../views/sc_edit_view_snapshot"
import { sc_edit_view_convolution } from "../views/sc_edit_view_convolution"
import { sc_edit_view_methods } from "../views/sc_edit_view_methods"
import * as _ from "underscore"
import { sc_vec2, sc_pixel } from "../sc_vec";
import { sc_edit_view_base } from "../views/sc_edit_view";


/**
 * The type of blur to use
 */
export enum blur_type {
  gaussian,
  average
}


/**
 * Terrain smoothing tool
 * @property {sc_edit_view_snapshot} __snapshot Value of the view prior to changes
 * @property {sc_edit_view_convolution} __convolution View of __snapshot with a blur applied
 * @property {blur_type} __blur_type The type of blur to apply
 */
export class sc_edit_tool_smooth extends sc_edit_tool_base {
  private __blur_type: blur_type;
  private __patch: sc_edit_view_base | null;
  private __blending_patch: sc_edit_view_base | null;
  private __snapshot: sc_edit_view_base | null;
  private __convolution: sc_edit_view_base | null;


  /**
   * Height smoothing tool
   * @param {number} outer_radius Maximum radius of effect
   * @param {number} inner_radius Maximum radius of full intensity effect
   * @param {number} strength Intensity of effect. At 255 the inner radius will be fully set to the smoothed value
   * @property {blur_type} type_of_blur The type of blur to apply
   */
  constructor(outer_radius: number, inner_radius: number, strength: number, type_of_blur: blur_type) {
    super(outer_radius, inner_radius, strength);
    this.__blur_type = type_of_blur;
    this.__patch = null;
    this.__blending_patch = null;
    this.__snapshot = null;
    this.__convolution = null;
  }


  /**
   * Prepares a heightmap patch to apply using blend
   */
  protected __start_impl(target_view: sc_edit_view_base, position: sc_vec2): void {
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
    let weights: sc_pixel;
    switch (this.__blur_type) {
      case blur_type.average:
        weights = sc_edit_view_methods.make_pixel((this.__outer_radius * 2 + 1) * (this.__outer_radius * 2 + 1), 1);
        break;

      default:
      case blur_type.gaussian:
        throw new Error("Not implemented");
    }

    this.__convolution = new sc_edit_view_convolution(this.__snapshot, weights, weights.length);
  }


  /**
   * Smooths the terrain around the application site
   */
  protected __apply_impl(target_view: sc_edit_view_base, position: sc_vec2): void {
    // Find average value of the tools region every time it is applied
    const average_value = (this.__convolution as sc_edit_view_base) .get_pixel(position);

    // Fill entire patch with average
    sc_edit_view_methods.fill(this.__patch as sc_edit_view_base, average_value);

    // Move the tool region towards that average
    sc_edit_view_methods.ratcheted_weighted_blend(target_view, // To edit_heightmap
                                                  [position[0] - this.__outer_radius, position[1] - this.__outer_radius],  // At this position
                                                  this.__patch as sc_edit_view_base, // From this source
                                                  this.__snapshot as sc_edit_view_base, // And this source
                                                  this.__blending_patch as sc_edit_view_base); // Weighting the first by this
  }


  __end_impl() {
    this.__patch = null;
    this.__blending_patch = null;
    this.__snapshot = null;
    this.__convolution = null;
  }
}
