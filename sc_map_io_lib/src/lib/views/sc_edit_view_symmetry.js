import {sc_edit_view_base} from "./sc_edit_view"

/**
 * Symmetry view. Setting any pixel will automatically update the secondary pixels
 */
export class sc_edit_view_symmetry extends sc_edit_view_base {
  constructor(wrapped_view, symmetry) {
    super(wrapped_view);
    this.__symmetry = symmetry;
  }


  /** Gets the width */
  __get_width_impl() { return this.__wrapped_view.width; }


  /** Gets the height  */
  __get_height_impl() { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate */
  __get_pixel_impl(position) { return this.__wrapped_view.get_pixel(position); }


  /**
   * Sets the value of a pixel at the given coordinate and all corresponding secondary
   * pixels. If the position is not primary no change is made
   */
  __set_pixel_impl(position, value) {
    const primary_pixel = this.__symmetry.get_primary_pixel(position, [this.__wrapped_view.width, this.__wrapped_view.height]);
    if (primary_pixel[0] === position[0] && primary_pixel[1] === position[1]) {
      const secondary_pixels = this.__symmetry.get_secondary_pixels(position, [this.__wrapped_view.width, this.__wrapped_view.height]);

      this.__wrapped_view.set_pixel(primary_pixel, value);
      for (let secondary_pixel of secondary_pixels) {
        this.__wrapped_view.set_pixel(secondary_pixel, value);
      }
    }
  }


  /** Returns the default pixel value (0) */
  __oob_pixel_value_impl(position) { return this.__wrapped_view.__oob_pixel_value_impl(position); } // TBD: Should I first reflect this?


    /** Returns the number of subpixels */
  __get_subpixel_count_impl() { return this.__wrapped_view.subpixel_count; }


  /** Returns the maximum value of a subpixel */
  __get_subpixel_max_impl() { return this.__wrapped_view.subpixel_max; }
}
