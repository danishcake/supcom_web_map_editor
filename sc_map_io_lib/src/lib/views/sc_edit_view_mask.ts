import { sc_edit_view_base } from "./sc_edit_view"
import { sc_pixel, sc_vec2 } from "../sc_vec";
import { sc_edit_view_passthrough } from "./sc_edit_view_passthrough";

/**
 * Facade around another view that masks writes on a per channel basis
 */
export class sc_edit_view_mask extends sc_edit_view_passthrough {
  private __mask: sc_pixel;

  constructor(wrapped_view: sc_edit_view_base, mask: sc_pixel) {
    super(wrapped_view);

    if (mask.length != wrapped_view.subpixel_count) {
      throw new Error("Mask/view mismatch");
    }

    this.__mask = mask;
  }

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
}
