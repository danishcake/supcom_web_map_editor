/**
 * Intermediate heightmap for use in rendering and editing
 * * This stores the heightmap as Float32 rather than operating on UInt16,
 *     This is due to WebGL having poor support for Uint16 textures and my not particularly
 *     wanting to faff around with packing/unpacking integers in a shader
 * * This tracks dirty regions.
 *     This is to allow the dirty region to be transferred to the GPU texture
 *     using glTexSubImage2d/glPixelStorei
 */

import {sc_rect} from "./sc_rect"
import {sc_edit_view_base} from "./views/sc_edit_view"
import {_} from "underscore";


export class sc_edit_heightmap extends sc_edit_view_base {
  constructor(heightmap) {
    // TODO: Check type of heightmap
    super(null);
    this.__source_heightmap = heightmap;
    this.__import_heightmap();
    this.mark_dirty_region(new sc_rect(0, 0, this.width, this.height));
  }


  /**
   * Convert heightmap to equal sized Float32 array and extract data range
   * Data range is stored per-scanline to allow fast incremental updates
   */
  __import_heightmap() {
    this.__working_heightmap = new Float32Array(this.width * this.height);
    this.__scanline_range = [];

    for (let y = 0; y < this.height; y++) {
      this.__scanline_range.push({min: 65535, max: 0})
      for (let x = 0; x < this.width; x++) {
        this.set_pixel([x, y], this.__source_heightmap.data.readUint16((y * this.width + x) * 2));
        this.__scanline_range[y].min = Math.min(this.__scanline_range[y].min, this.get_pixel([x, y]));
        this.__scanline_range[y].max = Math.max(this.__scanline_range[y].max, this.get_pixel([x, y]));
      }
    }

    // Calculate the range of data
    this.__minimum = _.min(this.__scanline_range, function(item) { return item.min; });
    this.__maximum = _.min(this.__scanline_range, function(item) { return item.max; });
    // Ensure these two don't match
    if (this.__maximum === this.__minimum) {
      this.__minimum--;
      this.__maximum++;
    }
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
   * Gets the width. Note that this is the actual width in pixels, which is one larger than the
   * width stored in the heightmap section of the underlying heightmap due to fence post problem.
   */
  __get_width_impl() { return this.__source_heightmap.width + 1; }


  /**
   * Gets the height. Note that this is the actual height in pixels, which is one larger than the
   * height stored in the heightmap section of the underlying heightmap due to fence post problem.
   */
  __get_height_impl() { return this.__source_heightmap.height + 1; }


  /**
   * Returns the value of a pixel at the given coordinate
   */
  __get_pixel_impl(position) { return this.__working_heightmap[position[0] + position[1] * this.width]; }


  /**
   * Sets the value of a pixel at the given coordinate
   */
  __set_pixel_impl(position, value) {
    this.__working_heightmap[position[0] + position[1] * this.width] = value;
    if (this.__dirty_region != null) {
      this.__dirty_region.expand_point(position);
    } else {
      this.__dirty_region = new sc_rect(position[0], position[1], 1, 1);
    }
  }


  /**
   * Returns the default pixel value (0)
   */
  __oob_pixel_value_impl(position) { return 0; }


  /**
   * Gets the height scale
   */
  get scale() { return this.__source_heightmap.scale; }


  /**
   * Get the region marked as region since it was last reset
   */
  get dirty_region() { return this.__dirty_region; }


  /**
   * Gets the heightmap as a Float32Array
   */
  get working_heightmap() { return this.__working_heightmap; }

  /**
   * Gets the minimum height in the entire heightmap
   */
  get minimum_height() { return this.__minimum; }

  /**
   * Gets the maximum height in the entire heightmap
   */
  get maximum_height() { return this.__maximum; }
};
