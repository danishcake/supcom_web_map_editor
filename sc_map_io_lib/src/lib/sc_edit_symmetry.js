/**
 * Symmetry classes
 * These define the following interface:
 * 1. get_primary_pixel()
 * 2. get_secondary_pixels()
 */

import {sc_rect} from "./sc_rect"

/**
 * Symmetry class. Subclasses should implement
 *
 * __get_primary_pixel_impl: Returns the primary pixel given any pixel
 * __get_secondary_pixels_impl: Returns array of secondary pixels if provided a primary pixel
 */
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
}

/**
 * No symmetry. All inputs are mapped directly to output and there are not secondary pixels
 * This is just a typedef to base, as it already behaves correctly for no symmetry
 */
class sc_edit_symmetry_none extends sc_edit_symmetry_base {
  /**
   * Get the primary pixel from any pixel inside size.
   * This is always the input pixel
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The primary pixel
   */
  __get_primary_pixel_impl(point, size) {
    return point;
  }


  /**
   * Get the secondary pixels corresponding to any primary pixel.
   * There are not secondary pixels
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The secondary pixels
   */
  __get_secondary_pixels_impl(point, size) {
    return [];
  }
}

/**
 * Horizontal symmetry
 * All pixels on the left hand size are considered primary. The right hand side is secondary
 */
class sc_edit_symmetry_horizontal extends sc_edit_symmetry_base {
  /**
   * Get the primary pixel from any pixel inside size.
   * This is the left hand pixel about the centre
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The primary pixel
   */
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


  /**
   * Get the secondary pixels corresponding to any primary pixel.
   * This is the pixel mirrored horizontally around the center
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The secondary pixels
   */
  __get_secondary_pixels_impl(point, size) {
    // 257 wide -> 0   -> 256
    //             127 -> 129
    //             128 -> 128
    // 256 wide -> 0   -> 255
    //             127 -> 128
    return [[size[0] - point[0] - 1, point[1]]]
  }
}

/**
 * Vertical symmetry
 * All pixels on the top half are considered primary. The bottom half side is secondary
 */
class sc_edit_symmetry_vertical extends sc_edit_symmetry_base {
  /**
   * Get the primary pixel from any pixel inside size.
   * This is the top pixel
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The primary pixel
   */
  __get_primary_pixel_impl(point, size) {
    // For odd width, the index that transforms to self
    // For even width, the index to the left of centre (last that is not reflected)
    let mid_index = Math.floor((size[1] - 1) / 2);

    if (point[1] <= mid_index) {
      return point;
    } else {
      // 257 - 129 - 1 = 127
      // 256 - 128 - 1 = 127
      return [point[0], size[1] - point[1] - 1];
    }
  }


  /**
   * Get the secondary pixels corresponding to any primary pixel.
   * This is the pixel mirrored vertically around the center
   * @param {number[2]} point Position on map
   * @param {number[2]} size Size of map
   * @returns The secondary pixels
   */
  __get_secondary_pixels_impl(point, size) {
    // 257 high -> 0   -> 256
    //             127 -> 129
    //             128 -> 128
    // 256 high -> 0   -> 255
    //             127 -> 128
    return [[point[0], size[1] - point[1] - 1]];
  }
}

let sc_edit_symmetry = {
  none: sc_edit_symmetry_none,
  horizontal: sc_edit_symmetry_horizontal,
  vertical: sc_edit_symmetry_vertical,
};

export { sc_edit_symmetry }
