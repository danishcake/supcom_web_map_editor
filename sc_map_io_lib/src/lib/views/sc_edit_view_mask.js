import {sc_edit_view_base} from "./sc_edit_view"
import {sc_edit_view_methods} from "./sc_edit_view_methods"

/**
 * Facade around another view that masks writes on a per channel basis
 */
export class sc_edit_view_mask extends sc_edit_view_base {
  constructor(wrapped_view, mask) {
    super();
    this.__wrapped_view = wrapped_view;
    this.__mask = mask;
  }


  /** Gets the width */
  __get_width_impl() { return this.__wrapped_view.width; }


  /** Gets the height  */
  __get_height_impl() { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate */
  __get_pixel_impl(position) { return this.__wrapped_view.get_pixel(position); }


  /**
   * Sets all subchannels where mask is truthy
   */
  __set_pixel_impl(position, value) {
    const masked_value = this.get_pixel(position);
    for (let i = 0; i < this.subpixel_count; i++) {
      if (this.__mask[i]) {
        masked_value[i] = value[i];
      }
    }
    this.__wrapped_view.set_pixel(position, masked_value);
  }


  /** Returns the default pixel value (0) */
  __oob_pixel_value_impl(position) { return this.__wrapped_view.__oob_pixel_value_impl(position); }


  /** Returns the number of subpixels */
  __get_subpixel_count_impl() { return this.__wrapped_view.subpixel_count; }


  /** Returns the maximum value of a subpixel */
  __get_subpixel_max_impl() { return this.__wrapped_view.subpixel_max; }
}
