import {sc_edit_view_base} from "./sc_edit_view"

/**
 * Symmetry view. Setting any pixel will automatically update the secondary pixels
 */
export class sc_edit_view_symmetry extends sc_edit_view_base {
  constructor(wrapped_view, symmetry) {
    super(wrapped_view);
    this.__symmetry = symmetry;
  }

  __get_width_impl() { return this.__wrapped_view.width; }
  __get_height_impl() { return this.__wrapped_view.height; }
  __get_pixel(position) { return this.__wrapped_view.get_pixel(position); }
  __set_pixel(position, value) {
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
