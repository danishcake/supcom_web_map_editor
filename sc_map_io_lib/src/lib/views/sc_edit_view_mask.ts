import {sc_edit_view_base} from "./sc_edit_view"
import { sc_pixel, sc_vec2 } from "../sc_vec";

/**
 * Facade around another view that masks writes on a per channel basis
 */
export class sc_edit_view_mask extends sc_edit_view_base {
  private __wrapped_view: sc_edit_view_base;
  private __mask: sc_pixel;

  constructor(wrapped_view: sc_edit_view_base, mask: sc_pixel) {
    super();

    if (mask.length != wrapped_view.subpixel_count) {
      throw new Error("Mask/view mismatch");
    }

    this.__wrapped_view = wrapped_view;
    this.__mask = mask;
  }


  /** Gets the width */
  protected __get_width_impl(): number { return this.__wrapped_view.width; }


  /** Gets the height  */
  protected __get_height_impl(): number { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate */
  protected __get_pixel_impl(position: sc_vec2): sc_pixel { return this.__wrapped_view.get_pixel(position); }


  /**
   * Sets all subchannels where mask is truthy
   */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void {
    const masked_value: sc_pixel = this.get_pixel(position);
    for (let i = 0; i < this.subpixel_count; i++) {
      if (this.__mask[i]) {
        masked_value[i] = value[i];
      }
    }
    this.__wrapped_view.set_pixel(position, masked_value);
  }


  /** Returns the default pixel value (0) */
  protected __oob_pixel_value_impl(position: sc_vec2): sc_pixel { return this.__wrapped_view.oob_pixel_value(position); }


  /** Returns the number of subpixels */
  protected __get_subpixel_count_impl(): number { return this.__wrapped_view.subpixel_count; }


  /** Returns the maximum value of a subpixel */
  protected __get_subpixel_max_impl(): number { return this.__wrapped_view.subpixel_max; }
}
