import { sc_rect } from "./sc_rect"
import { sc_edit_view_base } from "./views/sc_edit_view"
import { sc_vec2, sc_pixel } from "./sc_vec"
import * as _ from "underscore";

/**
 * @class sc_edit_heightmap
 * Intermediate heightmap for use in rendering and editing
 * * This stores the heightmap as Float32 rather than operating on UInt16,
 *     This is due to WebGL having poor support for Uint16 textures and my not particularly
 *     wanting to faff around with packing/unpacking integers in a shader
 * * This tracks dirty regions.
 *     This is to allow the dirty region to be transferred to the GPU texture
 *     using glTexSubImage2d/glPixelStorei
 */
export class sc_edit_heightmap extends sc_edit_view_base {
  private __source_heightmap: any; // sc_map_heightmap
  private __working_heightmap: Float32Array;
  private __scanline_range: { min: number, max: number }[];
  private __dirty_region: sc_rect | null;
  private __minimum: number;
  private __maximum: number;

  /**
   * Constructor
   * @param {sc_map_heightmap} heightmap Wrapped heightmap
   */
  constructor(heightmap: any) {
    super();
    this.__source_heightmap = heightmap;
    this.__working_heightmap = new Float32Array(this.width * this.height);
    this.__scanline_range = [];
    this.__dirty_region = null;
    this.__minimum = 0;
    this.__maximum = 65535;
    this.__import_heightmap();
    this.mark_dirty_region(new sc_rect(0, 0, this.width, this.height));
    this.update_range_stats();
  }


  /**
   * Convert heightmap to equal sized Float32 array and extract data range
   * Data range is stored per-scanline to allow fast incremental updates
   */
  private __import_heightmap(): void {
    this.__working_heightmap = new Float32Array(this.width * this.height);
    this.__scanline_range = [];

    for (let y = 0; y < this.height; y++) {
      this.__scanline_range.push({min: this.subpixel_max, max: 0})
      for (let x = 0; x < this.width; x++) {
        this.set_pixel([x, y], [this.__source_heightmap.data.readUint16((y * this.width + x) * 2)]);
      }
    }
  }


  /**
   * Exports the working heightmap to a serialisable heightmap,
   * clamping values to  Uint16 values
   * @param {sc_map_heightmap} heightmap Heightmap to export back to
   */
  public export_to_heightmap(heightmap: any): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let height = Math.floor(this.get_pixel([x, y])[0]);
        heightmap.data.writeUint16(height, (y * this.width + x) * 2);
      }
    }
  }


  /**
   * Clears the dirty region
   */
  public reset_dirty_region(): void {
    this.__dirty_region = null;
  }


  /**
   * Mark a region as dirty. This will expand any previous dirty region
   * @param {sc_rect} rect Region to mark dirty
   */
  public mark_dirty_region(rect: sc_rect): void {
    this.__dirty_region = (this.__dirty_region || rect).expand(rect);
  }


  /**
   * Updates the high/low stats.
   * Fairly heavyweight operation, but operates only on the dirty region
   */
  public update_range_stats(): void {
    // Calculate the min/max values of the dirty rows
    if (this.__dirty_region) {
      for (let y = this.__dirty_region.top; y <= this.__dirty_region.bottom; y++) {
        const scanline = this.__working_heightmap.slice(y * this.width, (y + 1) * this.width);
        this.__scanline_range[y].min = _.min(scanline);
        this.__scanline_range[y].max = _.max(scanline);
      }

      // Calculate the range of data
      this.__minimum = _.min(this.__scanline_range, function(item) { return item.min; }).min;
      this.__maximum = _.max(this.__scanline_range, function(item) { return item.max; }).max;

      // Ensure these two don't match
      if (this.__maximum === this.__minimum) {
        this.__minimum--;
        this.__maximum++;
      }
    }
  }


  /**
   * Gets the width. Note that this is the actual width in pixels, which is one larger than the
   * width stored in the heightmap section of the underlying heightmap due to fence post problem.
   */
  protected __get_width_impl(): number {
    return this.__source_heightmap.width + 1;
  }


  /**
   * Gets the height. Note that this is the actual height in pixels, which is one larger than the
   * height stored in the heightmap section of the underlying heightmap due to fence post problem.
   */
  protected __get_height_impl(): number {
    return this.__source_heightmap.height + 1;
  }


  /**
   * Returns the value of a pixel at the given coordinate
   * @param {sc_point} position X/Y coordinate of pixel
   * @return {sc_pixel} Value at X/Y
   */
  protected __get_pixel_impl(position: sc_vec2): sc_pixel {
    return [this.__working_heightmap[position[0] + position[1] * this.width]];
  }


  /**
   * Sets the value of a pixel at the given coordinate
   * @param {sc_point} position X/Y coordinate of pixel
   * @param {sc_pixel} value Pixel value to write
   */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void {
    this.__working_heightmap[position[0] + position[1] * this.width] = value[0];
    if (this.__dirty_region != null) {
      this.__dirty_region.expand_point(position);
    } else {
      this.__dirty_region = new sc_rect(position[0], position[1], 1, 1);
    }
  }


  /** Returns the default pixel value (0) */
  protected __oob_pixel_value_impl(position: sc_vec2): sc_pixel { return [0]; }


  /** Returns the number of subpixels */
  protected __get_subpixel_count_impl(): number { return 1; }


  /** Returns the maximum value of a subpixel */
  protected __get_subpixel_max_impl(): number { return 65535; }


  /** Gets the height scale */
  public get scale(): number { return this.__source_heightmap.scale; }


  /** Get the region marked as region since it was last reset */
  public get dirty_region(): sc_rect | null { return this.__dirty_region; }


  /** Gets the heightmap as a Float32Array */
  public get working_heightmap(): Float32Array { return this.__working_heightmap; }


  /** Gets the minimum height in the entire heightmap */
  public get minimum_height(): number { return this.__minimum; }


  /** Gets the maximum height in the entire heightmap */
  public get maximum_height(): number { return this.__maximum; }
};
