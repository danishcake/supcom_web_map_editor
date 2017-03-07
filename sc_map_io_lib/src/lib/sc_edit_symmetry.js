/**
 * Symmetry classes
 * These define the following interface:
 * 1. get_primary_pixel()
 * 2. get_secondary_pixels()
 */

import {sc_rect} from "./sc_rect"

class sc_edit_symmetry_base {
  /**
   * Get the primary pixel from any pixel inside size
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The primary pixel
   * @throws If point is outside [0,0]-size
   */
  get_primary_pixel(point, size) {
    if (!(new sc_rect(0, 0, size[0], size[1])).contains(point[0], point[1])) {
      throw new Error(`[${point[0]}, ${point[1]}] does not lie inside [0,0]-[${size[0]}, ${size[1]}]`)
    }

    return this.__get_primary_pixel_impl(point, size);
  }


  /**
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The secondary pixels corresponding to the primary pixel
   * @throws If point is outside [0,0]-size
   */
  get_secondary_pixels(point, size) {
    if (!(new sc_rect(0, 0, size[0], size[1])).contains(point[0], point[1])) {
      throw new Error(`[${point[0]}, ${point[1]}] does not lie inside [0,0]-[${size[0]}, ${size[1]}]`)
    }

    return this.__get_secondary_pixels_impl(point, size);
  }


  /**
   * Subclass implementation of get_primary_pixel.
   * Override this in the subclass.
   */
  __get_primary_pixel_impl(point, size) {
    return point;
  }


  /**
   * Subclass implementation of get_secondary_pixels.
   * Override this in the subclass.
   */
  __get_secondary_pixels_impl(point, size) {
    return [];
  }
}

/**
 * No symmetry. All inputs are mapped directly to output and there are not secondary pixels
 * This is just a typedef to base, as it already behaves correctly for no symmetry
 */
class sc_edit_symmetry_none extends sc_edit_symmetry_base {

}

/**
 * Horizontal symmetry
 * All pixels on the left hand size are considered primary. The right hand side is secondary
 */
class sc_edit_symmetry_horizontal extends sc_edit_symmetry_base {
  __get_primary_pixel_impl(point, size) {
    // For odd width, the index that transforms to self
    // For even width, the index to the left of centre (last that is not reflected)
    let mid_index = Math.floor((size[0] - 1) / 2);

    if (point[0] <= mid_index) {
      return point;
    } else {
      // 257 - 129 - 1 = 127
      // 256 - 128 - 1 = 127
      //let one_if_even = (size[0] + 1) % 2
      return [size[0] - point[0] - 1, point[1]];
    }
  }


  __get_secondary_pixels_impl(point, size) {
    return [];
  }
}

let sc_edit_symmetry = {
  none: sc_edit_symmetry_none,
  horizontal: sc_edit_symmetry_horizontal
};

export { sc_edit_symmetry }