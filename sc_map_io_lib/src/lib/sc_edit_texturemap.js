/**
 * Intermediate texturemap for use in rendering and editing
 * * This stores the texture channels as UInt8, so doesn't require the import/synchronized
 *   stage required by edit_heightmap
 * * This tracks dirty regions.
 *     This is to allow the dirty region to be transferred to the GPU texture
 *     using glTexSubImage2d/glPixelStorei
 *
 * Each pixel has 8 components
 */

import {sc_rect} from "./sc_rect"
import {sc_edit_view_base} from "./views/sc_edit_view"
import {_} from "underscore";


export class sc_edit_texturemap extends sc_edit_view_base {
  constructor(source_heightmap) {
    super(null);
    this.__source_heightmap = source_heightmap;
    this.mark_dirty_region(new sc_rect(0, 0, this.width, this.height));
  }


  /**
   * Clears the dirty region
   */
  reset_dirty_region() {
    this.__dirty_region = null;
  }


  /**
   * Mark a region as dirty
   */
  mark_dirty_region(rect) {
    this.__dirty_region = (this.__dirty_region || rect).expand(rect);
  }


  /**
   * Gets the width
   */
  __get_width_impl() { return this.__source_heightmap.width; }


  /**
   * Gets the height
   */
  __get_height_impl() { return this.__source_heightmap.height; }


  /**
   * Returns the value of a pixel at the given coordinate
   */
  __get_pixel_impl(position) {
    const index_base  = (position[0] + position[1] * this.width) * 4;
    return [this.__source_heightmap.chan0_3.readUint8(index_base + 0),
            this.__source_heightmap.chan0_3.readUint8(index_base + 1),
            this.__source_heightmap.chan0_3.readUint8(index_base + 2),
            this.__source_heightmap.chan0_3.readUint8(index_base + 3),
            this.__source_heightmap.chan4_7.readUint8(index_base + 0),
            this.__source_heightmap.chan4_7.readUint8(index_base + 1),
            this.__source_heightmap.chan4_7.readUint8(index_base + 2),
            this.__source_heightmap.chan4_7.readUint8(index_base + 3)];
  }


  /**
   * Sets the value of a pixel at the given coordinate
   */
  __set_pixel_impl(position, value) {
    const index_base = (position[0] + position[1] * this.width) * 4;
    this.__source_heightmap.chan0_3.writeUint8(Math.floor(value[0]), index_base + 0);
    this.__source_heightmap.chan0_3.writeUint8(Math.floor(value[1]), index_base + 1);
    this.__source_heightmap.chan0_3.writeUint8(Math.floor(value[2]), index_base + 2);
    this.__source_heightmap.chan0_3.writeUint8(Math.floor(value[3]), index_base + 3);
    this.__source_heightmap.chan4_7.writeUint8(Math.floor(value[4]), index_base + 0);
    this.__source_heightmap.chan4_7.writeUint8(Math.floor(value[5]), index_base + 1);
    this.__source_heightmap.chan4_7.writeUint8(Math.floor(value[6]), index_base + 2);
    this.__source_heightmap.chan4_7.writeUint8(Math.floor(value[7]), index_base + 3);

    if (this.__dirty_region != null) {
      this.__dirty_region.expand_point(position);
    } else {
      this.__dirty_region = new sc_rect(position[0], position[1], 1, 1);
    }
  }


  /**
   * Returns the default pixel value (all zeroes)
   */
  __oob_pixel_value_impl(position) { return [0,0,0,0,0,0,0,0]; }


  /** Returns the number of subpixels */
  __get_subpixel_count_impl() { return 8; }


  /** Returns the maximum value of a subpixel */
  __get_subpixel_max_impl() { return 255; }


  /**
   * Get the region marked as region since it was last reset
   */
  get dirty_region() { return this.__dirty_region; }


  /**
   * Gets the texturemap channels 0-3
   */
  get chan0_3() { return this.__source_heightmap.chan0_3; }


  /**
   * Gets the texturemap channels 4-7
   */
  get chan4_7() { return this.__source_heightmap.chan4_7; }
};
