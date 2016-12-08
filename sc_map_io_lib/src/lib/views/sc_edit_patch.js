import {sc_edit_view_base} from "./sc_edit_view"

/**
 * A region of pixels - pretty much the simplest possible view with some actual
 * backing storage
 */
export class sc_edit_patch extends sc_edit_view_base{
  /**
   * Creates an uninitialised patch
   */
  constructor(size) {
    super();
    // TODO: assert size
    this.__size = size;
    this.__buffer = new Float32Array(this.__size[0] * this.__size[1]);
  }


  /** Gets the width */
  __get_width_impl() { return this.__size[0]; }


  /** Gets the height  */
  __get_height_impl() { return this.__size[1]; }


  /** Returns the value of a pixel at the given coordinate */
  __get_pixel_impl(position) { return this.__buffer[position[0] + position[1] * this.width]; }


  /** Sets the value of a pixel at the given coordinate */
  __set_pixel_impl(position, value) { this.__buffer[position[0] + position[1] * this.width] = value; }


  /** Returns the default pixel value (0) */
  __oob_pixel_value_impl(position) { return 0; }
}
