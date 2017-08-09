import {sc_edit_view_base} from "./sc_edit_view"
import {sc_edit_view_methods} from "./sc_edit_view_methods"

/**
 * A region of pixels - pretty much the simplest possible view with some actual
 * backing storage
 */
export class sc_edit_patch extends sc_edit_view_base {
  /**
   * @constructor
   * Creates an uninitialised patch
   * @param {sc_vec2} size Width/height of the patch
   * @param {number} subpixel_count Number of subpixels per pixel
   * @param {number} subpixel_max Maximum value of a subpixel
   */
  constructor(size, subpixel_count, subpixel_max) {
    super();
    if  (size == null) {
      throw new Error(`sc_edit_patch size argument cannot be null`);
    }

    if  (subpixel_count == null) {
      throw new Error(`sc_edit_patch subpixel_count argument cannot be null`);
    }

    if  (subpixel_max == null) {
      throw new Error(`sc_edit_patch subpixel_max argument cannot be null`);
    }

    // TODO: assert size
    // TODO: Try swapping out Float32Array for a simple [] array
    this.__size = size;
    this.__buffer = new Float32Array((this.__size[0] * this.__size[1]) * subpixel_count);
    this.__subpixel_count = subpixel_count;
    this.__subpixel_max = subpixel_max;
  }


  /** Gets the width */
  __get_width_impl() { return this.__size[0]; }


  /** Gets the height  */
  __get_height_impl() { return this.__size[1]; }


  /** Returns the value of a pixel at the given coordinate */
  __get_pixel_impl(position) {
    const index_base = (position[0] + position[1] * this.width) * this.subpixel_count;
    const result = sc_edit_view_methods.make_pixel(this.subpixel_count, 0);
    for (let i = 0; i < this.subpixel_count; i++) {
      result[i] = this.__buffer[index_base + i];
    }
    return result;
  }


  /** Sets the value of a pixel at the given coordinate */
  __set_pixel_impl(position, value) {
    const index_base = (position[0] + position[1] * this.width) * this.subpixel_count;
    for (let i = 0; i < this.subpixel_count; i++) {
      this.__buffer[index_base + i] = value[i];
    }
  }


  /** Returns the default pixel value (0) */
  __oob_pixel_value_impl(position) { return 0; }


  /** Returns the number of subpixels */
  __get_subpixel_count_impl() { return this.__subpixel_count; }


  /** Returns the maximum value of a subpixel */
  __get_subpixel_max_impl() { return this.__subpixel_max; }
}
