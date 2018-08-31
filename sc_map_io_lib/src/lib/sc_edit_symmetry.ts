/**
 * Symmetry classes
 * These define the following interface:
 * 1. get_primary_pixel()
 * 2. get_secondary_pixels()
 * 3. get_primary_bounding_points()
 */

import {sc_rect} from "./sc_rect"
import * as _ from "underscore"
import * as glm from 'gl-matrix';
import { sc_vec2, sc_mat2 } from "./sc_vec";
import { mat2 } from "gl-matrix";

/**
 * Symmetry class. Subclasses should implement
 *
 * __get_primary_pixel_impl: Returns the primary pixel given any pixel
 * __get_secondary_pixels_impl: Returns array of secondary pixels if provided a primary pixel
 */
export abstract class sc_edit_symmetry_base {
  /**
   * Get the primary pixel from any pixel inside size
   * @param {sc_vec2} point Position on map
   * @param {sc_vec2} size Size of map
   * @returns The primary pixel
   * @throws If point is outside [0,0]-size
   */
  get_primary_pixel(point: sc_vec2, size: sc_vec2): sc_vec2 {
    if (!(new sc_rect(0, 0, size[0], size[1])).contains(point[0], point[1])) {
      throw new Error(`[${point[0]}, ${point[1]}] does not lie inside [0,0]-[${size[0]}, ${size[1]}]`)
    }

    return this.__get_primary_pixel_impl(point, size);
  }


  /**
   * @param {sc_vec2} point Position on map
   * @param {sc_vec2} size Size of map
   * @returns The secondary pixels corresponding to the primary pixel
   * @throws If point is outside [0,0]-size
   */
  get_secondary_pixels(point: sc_vec2, size: sc_vec2): sc_vec2[] {
    if (!(new sc_rect(0, 0, size[0], size[1])).contains(point[0], point[1])) {
      throw new Error(`[${point[0]}, ${point[1]}] does not lie inside [0,0]-[${size[0]}, ${size[1]}]`)
    }

    return this.__get_secondary_pixels_impl(point, size);
  }

  /**
   * Obtains the points forming the outline of the primary pixel region
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   */
  get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return this.__get_primary_bounding_points(size);
  }

  /**
   * Determines if the passed position is the primary pixel
   * @param {sc_vec2} pixel Position to test
   * @param {sc_vec2} size Size of the map
   * @returns {boolean} True if pixel is primary
   * Doesn't throw if pixel is outside map bounds, but instead returns false
   */
  is_primary_pixel(pixel: sc_vec2, size: sc_vec2): boolean {
    try {
      const primary_pixel: sc_vec2 = this.get_primary_pixel(pixel, size);
      return primary_pixel[0] === pixel[0] && primary_pixel[1] === pixel[1];
    } catch(e) {
      return false;
    }
  }

  protected abstract __get_primary_pixel_impl(point: sc_vec2, size: sc_vec2): sc_vec2;
  protected abstract __get_secondary_pixels_impl(point: sc_vec2, size: sc_vec2): sc_vec2[];
  protected abstract __get_primary_bounding_points(size: sc_vec2): sc_vec2[];
}

/**
 * No symmetry. All inputs are mapped directly to output and there are not secondary pixels
 * This is just a typedef to base, as it already behaves correctly for no symmetry
 */
class sc_edit_symmetry_none extends sc_edit_symmetry_base {
  /**
   * Get the primary pixel from any pixel inside size.
   * This is always the input pixel
   * @param {sc_vec2} point Position on map
   * @param {sc_vec2} size Size of map
   * @returns The primary pixel
   */
  protected __get_primary_pixel_impl(point: sc_vec2, size: sc_vec2): sc_vec2 {
    return point;
  }


  /**
   * Get the secondary pixels corresponding to any primary pixel.
   * There are no secondary pixels
   * @param {sc_vec2} point Position on map
   * @param {sc_vec2} size Size of map
   * @returns The secondary pixels
   */
  protected __get_secondary_pixels_impl(point: sc_vec2, size: sc_vec2): sc_vec2[] {
    return [];
  }

  /**
   * The bounding region is the entire size area
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [0, 0],
      [size[0], 0],
      [size[0], size[1]],
      [0, size[1]]
    ];
  }
}


/**
 * Matrix based symmetry
 * This is a convenience subclass that allows symmetries that can be expressed using a 2x2 matrix
 * to be easily expressed
 */
abstract class sc_edit_symmetry_matrix extends sc_edit_symmetry_base {
  private __primary_predicate: (point: sc_vec2, size: sc_vec2) => boolean;
  private __matrices: sc_mat2[];

  /**
   * Stores the matrices that transform a secondary pixel to primary
   * @param primary_predicate {Function} Returns true if the point provided is a primary pixel
   * @param matrices {sc_mat2[]} Array to 2x2 matrices that map primary pixels to secondary
   */
  constructor(primary_predicate: (point: sc_vec2, size: sc_vec2) => boolean, matrices: sc_mat2[]) {
    super();
    this.__primary_predicate = primary_predicate;
    this.__matrices = matrices;
  }

  /**
   * Get the primary pixel from any pixel inside size.
   * @param {sc_vec2} point Position on map
   * @param {sc_vec2} size Size of map
   * @returns The primary pixel
   */
  protected __get_primary_pixel_impl(point: sc_vec2, size: sc_vec2): sc_vec2 {
    if (this.__primary_predicate(point, size)) {
      return point;
    }

    const secondary_pixels = this.__get_secondary_pixels_impl(point, size);
    for (let secondary_pixel of secondary_pixels) {
      if (this.__primary_predicate(secondary_pixel, size)) {
        return secondary_pixel;
      }
    }

    // Disaster - no pixel has been identified as primary.
    console.log(`[${point[0]}, ${point[1]}] had secondary pixels: [`);
    for (let secondary_pixel of secondary_pixels) {
      console.log(`[${secondary_pixel[0]}, ${secondary_pixel[1]}],`);
    }
    console.log(`]`);
    throw new Error(`[${point[0]}, ${point[1]}] does not have a primary pixel`)
  }


  /**
   * Get the secondary pixels corresponding to any primary pixel.
   * @param {sc_vec2} point Position on map
   * @param {sc_vec2} size Size of map
   * @returns The secondary pixels
   */
  protected __get_secondary_pixels_impl(point: sc_vec2, size: sc_vec2): sc_vec2[] {
    let mid_indices = glm.vec2.fromValues((size[0] - 1) / 2, (size[1] - 1) / 2);

    // Find all the secondary pixels
    let secondary_pixels: sc_vec2[] = _.map(this.__matrices, (transform: sc_mat2): sc_vec2 => {
      let secondary_pixel  = glm.vec2.clone(point);
      glm.vec2.sub(secondary_pixel, secondary_pixel, mid_indices);
      glm.vec2.transformMat2(secondary_pixel,
                             secondary_pixel,
                             mat2.fromValues(transform[0], transform[1], transform[2], transform[3]));
      glm.vec2.add(secondary_pixel, secondary_pixel, mid_indices);
      return [secondary_pixel[0], secondary_pixel[1]];
      // Note: glm produces {'0': x, '1': y} objects
      // TODO: If I start using non-integer matrices I'll need to use a Math.round here
    });

    // If any secondary pixel has mapped to a primary pixel then cull it
    return _.filter(secondary_pixels, (secondary_pixel: sc_vec2): boolean => {
      return secondary_pixel[0] != point[0] || secondary_pixel[1] != point[1];
    });
  }
}


/**
 * Horizontal symmetry
 * All pixels on the left hand size are considered primary. The right hand side is secondary
 */
class sc_edit_symmetry_horizontal extends sc_edit_symmetry_matrix {
  constructor() {
    super((point, size) => { return point[0] <= Math.floor((size[0] - 1) / 2); },
          [[-1,  0,
             0,  1]]);
  }

  /**
   * The primary region is the left
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [0,           0],
      [size[0] / 2, 0],
      [size[0] / 2, size[1]],
      [0,           size[1]]
    ];
  }
}


/**
 * Vertical symmetry
 * All pixels on the top half are considered primary. The bottom half side is secondary
 */
class sc_edit_symmetry_vertical extends sc_edit_symmetry_matrix {
  constructor() {
    super((point, size) => { return point[1] <= Math.floor((size[1] - 1) / 2); },
          [[ 1,  0,
             0, -1]]);
  }

  /**
   * The primary region is the top
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [0,        0],
      [size[0] , 0],
      [size[0], size[1] / 2],
      [0,       size[1] / 2]
    ];
  }
}


/**
 * Quadrant symmetry
 * All pixels on the top half-left quadrant are considered primary. The other four
 * quadrants are secondary
 */
class sc_edit_symmetry_quadrants extends sc_edit_symmetry_matrix {
    constructor() {
    super((point, size) => { return point[0] <= Math.floor((size[0] - 1) / 2) &&
                                    point[1] <= Math.floor((size[1] - 1) / 2); },
          [[ 1,  0,
             0, -1],
           [-1,  0,
             0, 1],
           [-1,  0,
             0, -1]]);
  }

  /**
   * The primary region is the top-left
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [0,           0],
      [size[0] / 2, 0],
      [size[0] / 2, size[1] / 2],
      [0,           size[1] / 2]
    ];
  }
}


/**
 * Octant symmetry
 * The pixels in the top-left octant are considered primary
 * P
 * PP
 * PPP
 * PPPP
 */
class sc_edit_symmetry_octants extends sc_edit_symmetry_matrix {
    constructor() {
    super((point, size) => { return point[0] <= point[1] &&
                                    point[0] <= Math.floor((size[0] - 1) / 2) &&
                                    point[1] <= Math.floor((size[1] - 1) / 2); },
      [[ 0,  1,
        -1,  0],
       [-1,  0,
         0, -1],
       [ 0, -1,
         1,  0],
       [ 0,  1,
         1,  0],
       [ 1,  0,
         0, -1],
       [ 0, -1,
        -1,  0],
       [-1,  0,
         0,  1]]);
  }

  /**
   * The primary region is the bottom-left half of the top left quadrant
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [0,           0],
      [size[0] / 2, size[1] / 2],
      [0,           size[1] / 2]
    ];
  }
}


/**
 * X==Y symmetry
 * The pixels where x <= y are considered primary
 * P
 * PP
 * PPP
 * PPPP
 */
class sc_edit_symmetry_xy extends sc_edit_symmetry_matrix {
    constructor() {
    super((point, size) => { return point[0] <= point[1]; },
      [[ 0,  1,
         1,  0]]);
  }

  /**
   * The primary region is the bottom-left
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [0,           0],
      [size[0], size[1]],
      [0,       size[1]]
    ];
  }
}


/**
 * X==-Y symmetry (ignoring translation)
 * The pixels in the bottom-right are considered primary (x + y < size.x)
 * P
 * PP
 * PPP
 * PPPP
 */
class sc_edit_symmetry_yx extends sc_edit_symmetry_matrix {
    constructor() {
    super((point, size) => { return point[0] + point[1] < size[0]; },
      [[ 0, -1,
        -1,  0]]);
  }

  /**
   * The primary region is the top-left
   * @param {sc_vec2} size Size of the map
   * @returns {sc_vec2[]} Set of 2D points forming the outline of the primary region
   * @private
   */
  protected __get_primary_bounding_points(size: sc_vec2): sc_vec2[] {
    return [
      [size[0], 0],
      [0,       size[1]],
      [0,       0]
    ];
  }
}


let sc_edit_symmetry = {
  none:       sc_edit_symmetry_none,
  horizontal: sc_edit_symmetry_horizontal,
  vertical:   sc_edit_symmetry_vertical,
  quadrants:  sc_edit_symmetry_quadrants,
  octants:    sc_edit_symmetry_octants,
  xy:         sc_edit_symmetry_xy,
  yx:         sc_edit_symmetry_yx
};

export { sc_edit_symmetry }
