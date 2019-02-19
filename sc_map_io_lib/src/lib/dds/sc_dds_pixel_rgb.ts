import { sc_bitfield } from "../sc_bitfield";

/**
 * Represents a RGB pixel. Internally pixels are stored as RGB888.
 * Constructor is private, so use the from* static methods
 */
export class sc_dds_pixel_rgb {
  private __r: number;
  private __g: number;
  private __b: number;

  private constructor(r: number = 0, g: number = 0, b: number = 0) {
    this.__r = Math.floor(r);
    this.__g = Math.floor(g);
    this.__b = Math.floor(b);
  }

  public get r(): number { return this.__r; }
  public get g(): number { return this.__g; }
  public get b(): number { return this.__b; }
  public get packed_rgb565(): number {
    return Math.floor(this.__r * 31 / 255) * (32 * 64) +
           Math.floor(this.__g * 63 / 255) * 32 +
           Math.floor(this.__b * 31 / 255);
  }

  public distance_sq(rhs: sc_dds_pixel_rgb): number {
    return (this.r - rhs.r) * (this.r - rhs.r) +
           (this.g - rhs.g) * (this.g - rhs.g) +
           (this.b - rhs.b) * (this.b - rhs.b);
  }

  public luminance(): number {
    // Why is g scaled by 2? Because http://www.gamedev.no/projects/MegatextureCompression/324337_324337.pdf suggests so!
    return this.r + this.g * 2 + this.b;
  }

  public static from_packed_rgb565(rgb_565: number) {
    // TODO: Check DXT5 ARGB bit order - what byte is b stored in?

    let rgb = new sc_bitfield(rgb_565);
    let b = (rgb.read_bits(5) * 255) / 31;
    let g = (rgb.read_bits(6) * 255) / 63;
    let r = (rgb.read_bits(5) * 255) / 31;
    return new sc_dds_pixel_rgb(r, g, b);
  }

  public static from_rgb888(r: number, g: number, b: number) {
    return new sc_dds_pixel_rgb(r, g, b)
  }

  public static from_zeroes() {
    return new sc_dds_pixel_rgb(0, 0, 0);
  }

  /**
   * Provides a per-channel interpolated colour.
   * @param rgb0 The first colour
   * @param rgb1 The second colour
   * @param factor Scaling factor between the two. If 0 is used rgb0 is returned.
   */
  public static lerp(rgb0: sc_dds_pixel_rgb, rgb1: sc_dds_pixel_rgb, factor: number): sc_dds_pixel_rgb {
    return new sc_dds_pixel_rgb(rgb0.r + (rgb1.r - rgb0.r) * factor,
                                rgb0.g + (rgb1.g - rgb0.g) * factor,
                                rgb0.b + (rgb1.b - rgb0.b) * factor)
  }
}