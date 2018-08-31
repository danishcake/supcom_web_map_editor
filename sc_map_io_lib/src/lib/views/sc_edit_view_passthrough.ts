import { sc_edit_view_base } from './sc_edit_view';
import { sc_vec2, sc_pixel } from '../sc_vec';

export class sc_edit_view_passthrough extends sc_edit_view_base {
  protected __wrapped_view: sc_edit_view_base;

  constructor(wrapped_view: sc_edit_view_base) {
    super();
    this.__wrapped_view = wrapped_view;
  }

  /**
   * Gets the width from the wrapped view
   */
  protected __get_width_impl(): number {
    return this.__wrapped_view.width;
  }

  /**
   * Gets the height from the wrapped view
   */
  protected __get_height_impl(): number {
    return this.__wrapped_view.height;
  }

  /**
   * Gets the OOB pixel value from the wrapped view
   * @param {sc_vec2} position The position to obtain the OOB value at
   */
  protected __oob_pixel_value_impl(position: sc_vec2): sc_pixel {
    return this.__wrapped_view.oob_pixel_value(position);
  }

  /**
   * Gets the pixel at a particular location from the wrapped view
   * @param {sc_vec2} position The position to obtain the pixel value at
   */
  protected __get_pixel_impl(position: sc_vec2): sc_pixel {
    return this.__wrapped_view.get_pixel(position);
  }

  /**
   * Sets the pixel at a particular location on the wrapped view
   * @param {sc_vec2} position The pixel to set
   * @param {sc_pixel} value The value to set it to
   */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void {
    this.__wrapped_view.set_pixel(position, value);
  }

  /**
   * Gets the subpixel count from the wrapped view
   */
  protected __get_subpixel_count_impl(): number {
    return this.__wrapped_view.subpixel_count;
  }

  /**
   * Gets the maximum value of a subpixel from the wrapped view
   */
  protected __get_subpixel_max_impl(): number {
    return this.__wrapped_view.subpixel_max;
  }
}