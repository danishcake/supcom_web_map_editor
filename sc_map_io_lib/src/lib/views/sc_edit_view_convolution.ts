import {sc_edit_view_base} from "./sc_edit_view"
import {sc_edit_view_methods} from "./sc_edit_view_methods"
import { sc_vec2, sc_pixel } from "../sc_vec";

/**
 * A facade around another view that uses a inserts a convolution filter in the path of get_pixel
 * This can be used to perform averaging, blurring, edge enhancing etc
 */
export class sc_edit_view_convolution extends sc_edit_view_base {
  private __wrapped_view: sc_edit_view_base;
  private __weights: number[]; // Array of convolution elements. Interpreted as a square array starting at the top left
  private __weight_radius: number; // Number of bins to check on each side of the central bin
  private __divisor: number;  // Scalar factor to apply post convolution

  /**
   * @constructor
   * Creates a convolution view
   * @param {sc_edit_view_base} wrapped_view The view to wrap
   * @param {number[]} weights An array of weights. Must be the square of an odd number in size (1x1, 3x3, 5x5)
   * @param {number} divisor A scalar to divide final convolution by
   */
  constructor(wrapped_view: sc_edit_view_base, weights: number[], divisor: number) {
    super();
    this.__wrapped_view = wrapped_view;
    if  (!weights) {
      throw new Error(`sc_edit_view_convolution weights argument cannot be null`);
    }
    if  (!divisor) {
      throw new Error(`sc_edit_view_convolution divisor argument cannot be null`);
    }
    if  (Math.sqrt(weights.length) % 2 !== 1) {
      throw new Error(`sc_edit_view_convolution weights argument must be square of an odd number in length`);
    }

    this.__weights = weights;
    this.__weight_radius = (Math.sqrt(weights.length) - 1) / 2;
    this.__divisor = divisor;
  }


  /** Gets the width */
  protected __get_width_impl(): number { return this.__wrapped_view.width; }


  /** Gets the height  */
  protected __get_height_impl(): number { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate, after convolution */
  protected __get_pixel_impl(position: sc_vec2): sc_pixel {
    let i: number = 0;
    let sum: sc_pixel = sc_edit_view_methods.make_pixel(this.subpixel_count, 0);
    for (let ix = -this.__weight_radius; ix <= this.__weight_radius; ix++) {
      for (let iy = -this.__weight_radius; iy <= this.__weight_radius; iy++, i++) {
        const ip:sc_vec2 = [position[0] + ix, position[1] + iy];
        // Clamp OOB pixels. TBD: Just wrap this in a clamping view facade?
        ip[0] = ip[0] < 0 ? 0 : ip[0];
        ip[0] = ip[0] > this.width - 1 ? this.width - 1 : ip[0];
        ip[1] = ip[1] < 0 ? 0 : ip[1];
        ip[1] = ip[1] > this.height - 1 ? this.height - 1 : ip[1];

        let pixel = this.__wrapped_view.get_pixel(ip);
        for (let subpixel = 0; subpixel < this.subpixel_count; subpixel++) {
          sum[subpixel] += pixel[subpixel] * this.__weights[i];
        }
      }
    }

    // Subpixels are clamped to valid range so that the rest of the code can continue to make assumptions
    for (let subpixel = 0; subpixel< this.subpixel_count; subpixel++) {
      sum[subpixel] /= this.__divisor;
      sum[subpixel] = Math.max(Math.min(sum[subpixel], this.subpixel_max), 0);
    }

    return sum;
  }


  /** Sets the value of a pixel at the given coordinate */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void {
    this.__wrapped_view.set_pixel(position, value);
  }


  /**
   * If called outside normal region this method is unusual in that it still works, due to edge clamping
   * applied in get_pixel
   */
  protected __oob_pixel_value_impl(position: sc_vec2): sc_pixel {
    return this.__get_pixel_impl(position);
  }


  /** Returns the number of subpixels */
  protected __get_subpixel_count_impl() { return this.__wrapped_view.subpixel_count; }


  /** Returns the maximum value of a subpixel */
  protected __get_subpixel_max_impl() { return this.__wrapped_view.subpixel_max; }
}
