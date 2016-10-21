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

export class sc_edit_heightmap {
  constructor(heightmap) {
    this.__source_heightmap = heightmap;
    this.__import_heightmap();
    this.mark_dirty_region(new sc_rect(0, 0, this.width - 1, this.height - 1));
  }


  /**
   * Convert heightmap to equal sized Float32 array
   */
  __import_heightmap() {
    this.__working_heightmap = new Float32Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let i = x + y * this.width;
        this.__working_heightmap[i] = this.__source_heightmap.data.readUint16(i * 2);
      }
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
  get width() { return this.__source_heightmap.width + 1; }


  /**
   * Gets the height. Note that this is the actual height in pixels, which is one larger than the
   * height stored in the heightmap section of the underlying heightmap due to fence post problem.
   */
  get height() { return this.__source_heightmap.height + 1; }


  /**
   * Get the region marked as region since it was last reset
   */
  get dirty_region() { return this.__dirty_region; }


  /**
   * Gets the heightmap as a Float32Array
   */
  get working_heightmap() { return this.__working_heightmap; }
};
