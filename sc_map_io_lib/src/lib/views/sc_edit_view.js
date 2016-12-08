/**
 * Base view class. Defines the interface that all views should implement
 * via NVO pattern
 *
 * __get_width_impl() - returns the width of the view
 * __get_height_impl() - returns the height of the view
 * __oob_pixel_value_impl([x, y]) - default value if OOB access attempted
 * __get_pixel_impl([x, y]) - return the pixel at (x, y)
 * __set_pixel_impl([x, y]) - sets the pixel at (x, y)
 *
 */
export class sc_edit_view_base {
  constructor(wrapped_view) {
    this.__wrapped_view = wrapped_view;
  }

  /** Gets the width of this view */
  get width() {
    return this.__get_width_impl();
  }

  /** Gets the height of this view */
  get height() {
    return this.__get_height_impl();
  }

  /**
   * Gets the pixel at this coordinate within the view
   * If outside bounds zero will be returned
   */
  get_pixel(position) {
    if (position[0] >= 0 && position[0] < this.width && position[1] >= 0 && position[1] < this.height) {
      return this.__get_pixel_impl(position);
    } else {
      return this.__oob_pixel_value_impl(position);
    }
  }

  /**
   * Set the pixel at this coordinate within the view
   * If outside bounds no change will be made
   */
  set_pixel(position, value) {
    if (position[0] >= 0 && position[0] < this.width && position[1] >= 0 && position[1] < this.height) {
      this.__set_pixel_impl(position, Math.max(Math.min(value, 65535), 0));
    }
  }
}
