import {sc_edit_view_base} from "./sc_edit_view"
import { sc_pixel, sc_vec2 } from "../sc_vec";

/**
 * Facade around another view that causes OOB pixel reads to return their closest valid neighbour
 */
export class sc_edit_view_oob_clamp extends sc_edit_view_base {
  private __wrapped_view: sc_edit_view_base;

  constructor(wrapped_view: sc_edit_view_base) {
    super();
    this.__wrapped_view = wrapped_view;
  }


  /** Gets the width */
  protected __get_width_impl(): number { return this.__wrapped_view.width; }


  /** Gets the height  */
  protected __get_height_impl(): number { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate */
  protected __get_pixel_impl(position: sc_vec2): sc_pixel { return this.__wrapped_view.get_pixel(position); }


  /** Sets the value of a pixel at the given coordinate */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void { this.__wrapped_view.set_pixel(position, value); }


  /** Returns the closest valid neighbour pixel */
  protected __oob_pixel_value_impl(position: sc_vec2): sc_pixel {
    // Risk: If this is wrong we will end up recursively calling ourselves!
    const valid_position: sc_vec2 = [Math.min(Math.max(0, position[0]), this.width - 1),
                                     Math.min(Math.max(0, position[1]), this.height - 1)];
    return this.__wrapped_view.get_pixel(valid_position);
  }


  /** Returns the number of subpixels */
  protected __get_subpixel_count_impl(): number { return this.__wrapped_view.subpixel_count; }


  /** Returns the maximum value of a subpixel */
  protected __get_subpixel_max_impl(): number { return this.__wrapped_view.subpixel_max; }
}
