import { sc_edit_view_base } from "./sc_edit_view"
import { sc_edit_symmetry_base } from "../sc_edit_symmetry";
import { sc_vec2, sc_pixel } from "../sc_vec";
import { sc_edit_view_passthrough } from "./sc_edit_view_passthrough";

/**
 * Symmetry view. Setting any pixel will automatically update the secondary pixels
 */
export class sc_edit_view_symmetry extends sc_edit_view_passthrough {
  private __symmetry: sc_edit_symmetry_base;

  constructor(wrapped_view: sc_edit_view_base, symmetry: sc_edit_symmetry_base) {
    super(wrapped_view);
    this.__symmetry = symmetry;
  }


  /**
   * Sets the value of a pixel at the given coordinate and all corresponding secondary
   * pixels. If the position is not primary no change is made
   */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void {
    const primary_pixel = this.__symmetry.get_primary_pixel(position, [this.__wrapped_view.width, this.__wrapped_view.height]);
    if (primary_pixel[0] === position[0] && primary_pixel[1] === position[1]) {
      const secondary_pixels = this.__symmetry.get_secondary_pixels(position, [this.__wrapped_view.width, this.__wrapped_view.height]);

      this.__wrapped_view.set_pixel(primary_pixel, value);
      for (let secondary_pixel of secondary_pixels) {
        this.__wrapped_view.set_pixel(secondary_pixel, value);
      }
    }
  }
}
