import {sc_edit_view_base} from "./sc_edit_view"

/**
 * Facade around another view that causes OOB pixel reads to return their closest valid neighbour
 */
export class sc_edit_view_oob_clamp extends sc_edit_view_base {
  constructor(wrapped_view) {
    super();
    this.__wrapped_view = __wrapped_view;
  }


  /** Gets the width */
  __get_width_impl() { return this.__wrapped_view.width; }


  /** Gets the height  */
  __get_height_impl() { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate */
  __get_pixel_impl(position) { return this.__wrapped_view.get_pixel(position); }


  /** Sets the value of a pixel at the given coordinate */
  __set_pixel_impl(position, value) { this.__wrapped_view.set_pixel(position, value); }


  /** Returns the closest valid neighbour pixel */
  __oob_pixel_value_impl(position) {
    // Risk: If this is wrong we will end up recursively calling ourselves!
    const valid_position = [Math.min(Math.max(0, position[0]), this.width - 1),
                            Math.min(Math.max(0, position[1]), this.height - 1)];
    return this.__wrapped_view.get_pixel(valid_position);
  }


  /** Returns the number of subpixels */
  __get_subpixel_count_impl() { return this.__wrapped_view.subpixel_count; }


  /** Returns the maximum value of a subpixel */
  __get_subpixel_max_impl() { return this.__wrapped_view.subpixel_max; }
}
