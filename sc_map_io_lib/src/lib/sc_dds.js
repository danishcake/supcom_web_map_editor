/**
 * Basic DDS parsing/writing for ARGB, RGB and DXT5.
 * All input/output is to ARGB, with missing A values
 * set to full opacity
 */

import check from "./sc_check";
import {sc_bitfield} from "./sc_bitfield"
import {_} from "underscore";
const ByteBuffer = require('bytebuffer');
const util = require('util');


/**
 * string to ASCII array helper.
 * @param {string} str String to translate
 * @returns {array} An array of ASCII characters. No null terminator is used
 */
const string_to_ascii_array = function(str) {
  let arr = [];
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i));
  }
  return arr;
};


/**
 * Benchmarking utility.
 * @param {Array} start If null the current time is returned
 *                      If non-null the number of milliseconds elapsed is returned
 */
const clock = function(start) {
  if (!start) return process.hrtime();
  let end = process.hrtime(start);
  return Math.round((end[0] * 1000) + (end[1]/1000000));
};


/**
 * Unwraps a ByteBuffer or ArrayBuffer containing an DDS header
 * Note I've managed to make endian dependent code in the browser. Go team!
 * What I need is an endian specifying Uint32Array etc
 */
class sc_dds_header {
  // Constructs a zeroed dds_header
  constructor(buffer) {
    if (buffer) {
      // Unwrap a ByteBuffer to the ArrayBuffer/Buffer
      if (buffer instanceof ByteBuffer) {
        buffer = buffer.buffer;
      }

      // If running under node, even getting the underlying ArrayBuffer doesn't
      // seem to work, so instead we're copying to a brand new one
      if (Buffer && Buffer.isBuffer(buffer)) {
        var dst = new ArrayBuffer(buffer.length);
        new Uint8Array(dst).set(buffer);
        buffer = dst;
      }

      check.equal(124, buffer.byteLength, "If a buffer is passed to sc_dds_header it must be 124 bytes long");
    }

    this.__buffer = buffer || new ArrayBuffer(124);

    /* Provides the following C struct
    typedef struct {
      uint32_t           dwSize;
      uint32_t           dwFlags;
      uint32_t           dwHeight;
      uint32_t           dwWidth;
      uint32_t           dwPitchOrLinearSize;
      uint32_t           dwDepth;
      uint32_t           dwMipMapCount;
      uint32_t           dwReserved1[11];
      struct {
        uint32_t dwSize;
        uint32_t dwFlags;
        uint32_t dwFourCC;
        uint32_t dwRGBBitCount;
        uint32_t dwRBitMask;
        uint32_t dwGBitMask;
        uint32_t dwBBitMask;
        uint32_t dwABitMask;
      } ddspf;
      uint32_t           dwCaps;
      uint32_t           dwCaps2;
      uint32_t           dwCaps3;
      uint32_t           dwCaps4;
      uint32_t           dwReserved2;
    } DDS_HEADER;
    */
    this.__size = new Uint32Array(this.__buffer, 0);
    this.__flags = new Uint32Array(this.__buffer, 4);
    this.__height = new Uint32Array(this.__buffer, 8, 1);
    this.__width = new Uint32Array(this.__buffer, 12, 1);
    this.__pitch_or_linear_size = new Uint32Array(this.__buffer, 16, 1);
    this.__depth = new Uint32Array(this.__buffer, 20, 1);
    this.__mip_map_count = new Uint32Array(this.__buffer, 24, 1);
    this.__reserved = new Uint32Array(this.__buffer, 28, 11);
    this.__ddspf_size = new Uint32Array(this.__buffer, 72, 1);
    this.__ddspf_flags = new Uint32Array(this.__buffer, 76, 1);
    this.__ddspf_four_cc = new Uint8Array(this.__buffer, 80, 4);
    this.__ddspf_rgb_bit_count = new Uint32Array(this.__buffer, 84, 1);
    this.__ddspf_r_bit_mask = new Uint32Array(this.__buffer, 88, 1);
    this.__ddspf_g_bit_mask = new Uint32Array(this.__buffer, 92, 1);
    this.__ddspf_b_bit_mask = new Uint32Array(this.__buffer, 96, 1);
    this.__ddspf_a_bit_mask = new Uint32Array(this.__buffer, 100, 1);
    this.__caps = new Uint32Array(this.__buffer, 104, 1);
    this.__caps2 = new Uint32Array(this.__buffer, 108, 1);
    this.__caps3 = new Uint32Array(this.__buffer, 112, 1);
    this.__caps4 = new Uint32Array(this.__buffer, 116, 1);
    this.__reserved2 = new Uint32Array(this.__buffer, 120, 1);
  }

  /** Gets the backing ArrayBuffer */
  get buffer()                    { return this.__buffer; }

  /** Gets individual fields */
  get size()                      { return this.__size[0]; }
  set size(value)                 { this.__size[0] = value; }
  get flags()                     { return this.__flags[0]; }
  set flags(value)                { this.__flags[0] = value; }
  get height()                    { return this.__height[0]; }
  set height(value)               { this.__height[0] = value; }
  get width()                     { return this.__width[0]; }
  set width(value)                { this.__width[0] = value; }
  get pitch_or_linear_size()      { return this.__pitch_or_linear_size[0]; }
  set pitch_or_linear_size(value) { this.__pitch_or_linear_size[0] = value; }
  get depth()                     { return this.__depth[0]; }
  set depth(value)                { this.__depth[0] = value; }
  get mip_map_count()             { return this.__mip_map_count[0]; }
  set mip_map_count(value)        { this.__mip_map_count[0] = value; }
  get ddspf_size()                { return this.__ddspf_size[0]; }
  set ddspf_size(value)           { this.__ddspf_size[0] = value; }
  get ddspf_flags()               { return this.__ddspf_flags[0]; }
  set ddspf_flags(value)          { this.__ddspf_flags[0] = value; }
  get ddspf_rgb_bit_count()       { return this.__ddspf_rgb_bit_count[0]; }
  set ddspf_rgb_bit_count(value)  { this.__ddspf_rgb_bit_count[0] = value; }
  get ddspf_r_bit_mask()          { return this.__ddspf_r_bit_mask[0]; }
  set ddspf_r_bit_mask(value)     { this.__ddspf_r_bit_mask[0] = value; }
  get ddspf_g_bit_mask()          { return this.__ddspf_g_bit_mask[0]; }
  set ddspf_g_bit_mask(value)     { this.__ddspf_g_bit_mask[0] = value; }
  get ddspf_b_bit_mask()          { return this.__ddspf_b_bit_mask[0]; }
  set ddspf_b_bit_mask(value)     { this.__ddspf_b_bit_mask[0] = value; }
  get ddspf_a_bit_mask()          { return this.__ddspf_a_bit_mask[0]; }
  set ddspf_a_bit_mask(value)     { this.__ddspf_a_bit_mask[0] = value; }
  get caps()                      { return this.__caps[0]; }
  set caps(value)                 { this.__caps[0] = value; }
  get caps2()                     { return this.__caps2[0]; }
  set caps2(value)                { this.__caps2[0] = value; }
  get caps3()                     { return this.__caps3[0]; }
  set caps3(value)                { this.__caps3[0] = value; }
  get caps4()                     { return this.__caps4[0]; }
  set caps4(value)                { this.__caps4[0] = value; }

  /* For ease of use the FourCC string is exposed as an actual string */
  get ddspf_four_cc() {
    return String.fromCharCode(this.__ddspf_four_cc[0]) +
           String.fromCharCode(this.__ddspf_four_cc[1]) +
           String.fromCharCode(this.__ddspf_four_cc[2]) +
           String.fromCharCode(this.__ddspf_four_cc[3]);
  }

  set ddspf_four_cc(value) {
    check.type_is('string', value, `Attempt to set ddspf_four_cc with a non-string value`);
    check.equal(4, value.length, `Attempt to set ddspf_four_cc with a string which is ${value.length} characters long`);

    const ascii_array = string_to_ascii_array(value);
    this.__ddspf_four_cc[0] =  ascii_array[0];
    this.__ddspf_four_cc[1] =  ascii_array[1];
    this.__ddspf_four_cc[2] =  ascii_array[2];
    this.__ddspf_four_cc[3] =  ascii_array[3];
  }
};



class sc_dds_pixel_rgb {
  constructor(r = 0, g = 0, b = 0) {
    this.__r = Math.floor(r);
    this.__g = Math.floor(g);
    this.__b = Math.floor(b);
  }

  get r() { return this.__r; }
  get g() { return this.__g; }
  get b() { return this.__b; }
  get packed_rgb565() {
    return Math.floor(this.__r * 31 / 255) * (32 * 64) +
           Math.floor(this.__g * 63 / 255) * 32 +
           Math.floor(this.__b * 31 / 255);
  }

  distance_sq(rhs) {
    return (this.r - rhs.r) * (this.r - rhs.r) +
           (this.g - rhs.g) * (this.g - rhs.g) +
           (this.b - rhs.b) * (this.b - rhs.b);
  }

  luminance() {
    // Why is g scaled by 2? Because http://www.gamedev.no/projects/MegatextureCompression/324337_324337.pdf suggests so!
    return this.r + this.g * 2 + this.b;
  }

  static from_packed_rgb565(rgb_565) {
    // TODO: Check DXT5 ARGB bit order - what byte is b stored in?

    let rgb = new sc_bitfield(rgb_565);
    let b = (rgb.read_bits(5) * 255) / 31;
    let g = (rgb.read_bits(6) * 255) / 63;
    let r = (rgb.read_bits(5) * 255) / 31;
    return new sc_dds_pixel_rgb(r, g, b);
  }

  /**
   * Provides a per-channel interpolated colour.
   * @param rgb0 The first colour
   * @param rgb1 The second colour
   * @param factor Scaling factor between the two. If 0 is used rgb0 is returned.
   */
  static lerp(rgb0, rgb1, factor) {
    return new sc_dds_pixel_rgb(rgb0.r + (rgb1.r - rgb0.r) * factor,
                                rgb0.g + (rgb1.g - rgb0.g) * factor,
                                rgb0.b + (rgb1.b - rgb0.b) * factor)
  }
}

/**
 * Table of supported pixel formats.
 * This includes code to compress and decompress each
 */
export const sc_dds_pixelformat = {
  RawRGB: {
    /**
     * Loads an uncompressed ARGB8888 texture.
     * @param {ByteBuffer} input Input texture data. Must be width * height * 3 remaining (eg header already read)
     * @param {Number} width Width in pixels
     * @param {Number} height Height in pixels
     * @return {ByteBuffer} A ByteBuffer containing ARGB8888 pixels. Alpha values will be set to 255
     */
    load(input, width, height) {
      //console.log(`Loading ${width}x${height} RawRGB`);
      let output = new ByteBuffer(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        output.writeUint8(255, i * 4)
        input.copyTo(output, i * 4 + 1, input, input.offset, input.offset + 3);
      }
      // Manually advance read position as copyTo will not have changed it
      input.skip(width * height * 3);
      return output;
    },
    /**
     * Saves a texture as uncompressed RGB888 pixels. Alpha values are skipped
     * @param {ByteBuffer} output Output ByteBuffer stream
     * @param {ByteBuffer} data Input texture. Must be width * height * 4 bytes remaining
     * @param {Number} width Width in pixels
     * @param {Number} height Height in pixels
     */
    save(output, data, width, height) {
      check.equal(width * height * 4, data.remaining(), `Attempt to write ${width}x${height} 24bpp texture from buffer of ${data.remaining()} bytes (32bpp input required)`);

      for (let i = 0; i < width * height; i++) {
        output.append(data.slice(i * 4, i * 4 + 3));
      }
    }
  },

  RawARGB: {
    /**
     * Loads an uncompressed ARGB8888 texture.
     * @param {ByteBuffer} input Input texture data. Must be width * height * 4 remaining (eg header already read)
     * @param {Number} width Width in pixels
     * @param {Number} height Height in pixels
     * @return {ByteBuffer} A ByteBuffer containing ARGB8888 pixels
     */
    load(input, width, height) {
      //console.log(`Loading ${width}x${height} RawARGB`);
      return input.readBytes(width * height * 4).compact();
    },
    /**
     * Saves a texture as uncompressed ARGB8888 pixels
     * @param {ByteBuffer} output Output ByteBuffer stream
     * @param {ByteBuffer} data Input texture. Must be width * height * 4 bytes remaining
     * @param {Number} width Width in pixels
     * @param {Number} height Height in pixels
     */
    save(output, data, width, height) {
      check.equal(width * height * 4, data.remaining(), `Attempt to write ${width}x${height} 32bpp texture from buffer of ${data.remaining()} bytes`);

      output.append(data);
    }
  },

  DXT5: {
    /**
     * DXT5 compression uses a straight line through colour space, with the colours at 0%, 33%, 66% and 100%
     * These algorithms suggest colour pairs for a given block
     */

    rgb_colourpair_generators: {
      // Too heavy :( - 120 comparisons
      //maximal_colour_distance: function(rgb_block) {
      //  return {c0: 0, c1: 0}
      //},

      /**
       * Returns the pair of colours maximally separated by intensity
       */
      maximal_intensity_distance: function(rgb_block) {
        const pixel_luminances = _.map(rgb_block, (rgb_pixel, index) => {
          return {index: index, luminance: rgb_pixel.luminance()};
        });

        const min_luminance = _.min(pixel_luminances, (pixel) => {
          return pixel.luminance;
        });
        const max_luminance = _.min(pixel_luminances, (pixel) => {
          return pixel.luminance;
        });

        return [{ c0: rgb_block[min_luminance.index],
                  c1: rgb_block[max_luminance.index] }];
      },

      /**
       * Returns a pair of colours containing the bounding rgb cube
       */
      rgb_extents: function(rgb_block) {
        // Find bounding rgb values
        let max_r = 0;
        let max_g = 0;
        let max_b = 0;
        let min_r = 255;
        let min_g = 255;
        let min_b = 255;

        for (let i = 0; i < 16; i++) {
          if (rgb_block[i].r > max_r) max_r = rgb_block[i].r;
          if (rgb_block[i].g > max_g) max_g = rgb_block[i].g;
          if (rgb_block[i].b > max_b) max_b = rgb_block[i].b;
          if (rgb_block[i].r < min_r) min_r = rgb_block[i].r;
          if (rgb_block[i].g < min_g) min_g = rgb_block[i].g;
          if (rgb_block[i].b < min_b) min_b = rgb_block[i].b;
        }

        // Return both the bounding box and the bounding box inset by 1/16th as suggested by
        // http://www.gamedev.no/projects/MegatextureCompression/324337_324337.pdf
        const offset_r = (max_r - min_r) / 16;
        const offset_g = (max_g - min_g) / 16;
        const offset_b = (max_b - min_b) / 16;
        return [{ c0: new sc_dds_pixel_rgb(min_r, min_g, min_b),
                  c1: new sc_dds_pixel_rgb(max_r, max_g, max_b) },
                { c0: new sc_dds_pixel_rgb(min_r + offset_r, min_g + offset_g, min_b + offset_b),
                  c1: new sc_dds_pixel_rgb(max_r - offset_r, max_g - offset_g, max_b - offset_b) }];
      }
    },

    /**
     * Loads a compressed DXT5 texture.
     * @param {ByteBuffer} input Input texture data. Must be width * height remaining (eg header already read)
     * @param {Number} width Width in pixels
     * @param {Number} height Height in pixels
     * @return {ByteBuffer} A ByteBuffer containing ARGB8888 pixels
     */
    load(input, width, height) {
      //console.log(`Loading ${width}x${height} DXT5`);
      // DXT5 consists of 4x4 blocks with 4:1 compression.
      // This code reads each 4x4 block, decompresses it and writes it to the correct part
      // of a larger array
      let output = new ByteBuffer(width * height * 4);
      let lut_a = new ByteBuffer(8);
      let lut_rgb = new ByteBuffer(4 * 3);

      for (let y = 0;  y < height / 4; y++) {
        for (let x = 0; x < width / 4; x++) {

          let alpha_block = new sc_bitfield(input.readBytes(8));
          let rgb_block = new sc_bitfield(input.readBytes(8));

          // 1 Decode alpha block
          // 1.1 Find alpha range values
          let max_a = alpha_block.read_bits(8);
          let min_a = alpha_block.read_bits(8);

          // 1.2 Build interpolation LUT
          // If min_a is > max_a then [6] and [7] are set to 0 and 255, with [2-5] interpolated
          if (max_a > min_a) {
            lut_a.writeUint8(max_a, 0);
            lut_a.writeUint8(min_a, 1);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 6) / 7), 2);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 5) / 7), 3);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 4) / 7), 4);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 3) / 7), 5);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 2) / 7), 6);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 1) / 7), 7);
          } else {
            lut_a.writeUint8(max_a, 0);
            lut_a.writeUint8(min_a, 1);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 4) / 5), 2);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 3) / 5), 3);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 2) / 5), 4);
            lut_a.writeUint8(Math.floor(min_a + ((max_a - min_a) * 1) / 5), 5);
            lut_a.writeUint8(0, 6);
            lut_a.writeUint8(255, 7);
          }

          // 1.3 Unpack indices and populate output block
          for (let i = 0; i < 16; i++) {
            let lut_index = alpha_block.read_bits(3);
            let ox = x * 4 + i % 4;
            let oy = y * 4 + Math.floor(i / 4);
            let oi = (oy * width + ox) * 4;
            lut_a.copyTo(output, oi, lut_index, lut_index + 1);
          }

          // 2 Decode RGB block
          // 2.1 Find RGB extents
          let c0_rgb = sc_dds_pixel_rgb.from_packed_rgb565(rgb_block.read_bits(16));
          let c1_rgb = sc_dds_pixel_rgb.from_packed_rgb565(rgb_block.read_bits(16));
          let c2_rgb = sc_dds_pixel_rgb.lerp(c0_rgb, c1_rgb, 0.3333333)
          let c3_rgb = sc_dds_pixel_rgb.lerp(c0_rgb, c1_rgb, 0.6666666)

          // 2.2 Build RGB LUT
          lut_rgb.writeUint8(c0_rgb.r, 0);
          lut_rgb.writeUint8(c0_rgb.g, 1);
          lut_rgb.writeUint8(c0_rgb.b, 2);
          lut_rgb.writeUint8(c1_rgb.r, 3);
          lut_rgb.writeUint8(c1_rgb.g, 4);
          lut_rgb.writeUint8(c1_rgb.b, 5);
          lut_rgb.writeUint8(c2_rgb.r, 6);
          lut_rgb.writeUint8(c2_rgb.g, 7);
          lut_rgb.writeUint8(c2_rgb.b, 8);
          lut_rgb.writeUint8(c3_rgb.r, 9);
          lut_rgb.writeUint8(c3_rgb.g, 10);
          lut_rgb.writeUint8(c3_rgb.b, 11);

          // 2.3 Unpack indices and populate output block
          for(let i = 0; i < 16; i++) {
            let lut_index = rgb_block.read_bits(2) * 3;
            let ox = x * 4 + i % 4;
            let oy = y * 4 + Math.floor(i / 4);
            let oi = (oy * width + ox) * 4 + 1;
            lut_rgb.copyTo(output, oi, lut_index, lut_index + 3);
          }
        }
      }

      // 3. Done
      output.reset();
      return output;
    },

    /**
     * Saves a texture to a compressed DXT5 texture.
     * @param {ByteBuffer} output Output ByteBuffer stream
     * @param {ByteBuffer} data Input texture. Must be width * height * 4 bytes remaining
     * @param {Number} width Width in pixels
     * @param {Number} height Height in pixels
     */
    save(output, data, width, height) {
      /**
       * Extracts a 4x4 block of pixels into alpha and rgb565 components
       * @returns {object} A pair of ArrayBuffers
       */
      const extract_blocks = function(data, x, y, width, height) {
        const result = {
          alpha_pixel_block: new ByteBuffer(16),
          rgb_pixel_block: []
        };

        // 1. Extract the alpha/rgb values into a contiguous block of memory
        const block_origin_x = x * 4;
        const block_origin_y = y * 4;

        const block_origin_index = block_origin_y * width * 4 + block_origin_x * 4;
        for (let by = 0; by < 4; by++)
        {
          const row_origin_index = block_origin_index + width * 4 * by;
          for (let bx = 0; bx < 4; bx++)
          {
            const input_index = row_origin_index + bx * 4;
            const output_index = bx + by * 4;
            const a = data.readUint8(input_index + 0);
            const rgb = new sc_dds_pixel_rgb(data.readUint8(input_index + 1),
                                             data.readUint8(input_index + 2),
                                             data.readUint8(input_index + 3));

            result.alpha_pixel_block.writeUint8(a, output_index);
            result.rgb_pixel_block.push(rgb);
          }
        }

        return result;
      };

      /**
       * Calculates an optimal alpha block
       * @returns {object} The min,max and interpolation table lookup values
       */
      const calculate_alpha_block = function(alpha_pixel_block) {
        // Now build the output alpha block
        // Find alpha range
        const alpha_view = new Uint8Array(alpha_pixel_block.buffer, 0, 16);
        const min_a = _.min(alpha_view);
        const max_a = _.max(alpha_view);

        // Derive the alpha interpolated values
        const alpha_interpolated =
        [
          Math.floor(max_a),
          Math.floor(min_a),
          Math.floor(min_a + ((max_a - min_a) * 6) / 7),
          Math.floor(min_a + ((max_a - min_a) * 5) / 7),
          Math.floor(min_a + ((max_a - min_a) * 4) / 7),
          Math.floor(min_a + ((max_a - min_a) * 3) / 7),
          Math.floor(min_a + ((max_a - min_a) * 2) / 7),
          Math.floor(min_a + ((max_a - min_a) * 1) / 7)
        ];

        const result = {
          max_a: max_a,
          min_a: min_a
        };
        result.indices = _.map(alpha_view, function(a) {
          // Find index of the closest Alpha value in the interpolation table
          const error_metrics = _.map(alpha_interpolated, function(interpolated_value, index) {
            return {index: index, value: Math.abs(a - interpolated_value)};
          });

          return _.min(error_metrics, function(item) {
            return item.value;
          }).index;
        });

        return result;
      };

      /**
       * Calculates an 'optimal' RGB block. It does this by taking each possible pair of colours
       * from the 4x4 region and calculating the sum of squared errors
       * 15 + 14 + 13... -> 120 permuations per block
       * @param rgb_pixel_block {ByteBuffer} A ByteBuffer containing the packed 16x16 RGB565 pixelson
       * @returns {object} The two interpolation values and indices into interpolation
       *                   lookup table
       */
      const calculate_rgb_block = function(rgb_pixel_block) {
        let colourpairs = [];
        for (let colourpair_generator_name in sc_dds_pixelformat.DXT5.rgb_colourpair_generators) {
          let colourpair_generator = sc_dds_pixelformat.DXT5.rgb_colourpair_generators[colourpair_generator_name];
          colourpairs = colourpairs.concat(colourpair_generator(rgb_pixel_block));
        }

        // Determine which colourpair is optimal
        const error_metrics = [];
        let i = 0;
        for (let i = 0; i < colourpairs.length; i++) {

          // Derive additional colours
          const c0 = colourpairs[i].c0;
          const c1 = colourpairs[i].c1;
          const c2 = sc_dds_pixel_rgb.lerp(c0, c1, 0.3333333);
          const c3 = sc_dds_pixel_rgb.lerp(c0, c1, 0.6666666);

          error_metrics.push({
            c0: c0,
            c1: c1,
            metric: 0,
            indices: []
          });

          // Now assign each pixel it's closest colour match
          // and increase the error metric for this palette for that pixel
          for (let j = 0; j < 16; j++) {
            const metric_choice = [
              c0.distance_sq(rgb_pixel_block[j]),
              c1.distance_sq(rgb_pixel_block[j]),
              c2.distance_sq(rgb_pixel_block[j]),
              c3.distance_sq(rgb_pixel_block[j])
            ];

            // Find index of the closest colour in the interpolation table by sum of square of elements
            const best_match_index = _.chain(metric_choice)
            .map(function(error_metric, index) {
              return {
                index: index,
                value: error_metric
              };
            }).min(function(item) {
              return item.value;
            }).value().index;

            error_metrics[i].indices.push(best_match_index);
            error_metrics[i].metric += metric_choice[error_metrics[i].indices[j]];
          }
        }


        // Now all 120 options have been calculated, sort by metric and pick the best
        const best_fit = _.min(error_metrics, function(value) {
          return value.metric;
        });

        const result = {
          c0: best_fit.c0,
          c1: best_fit.c1,
          indices: best_fit.indices
        };
        return result;
      };

      /**
       * Packs the calculated alpha block into 8 bytes using all
       * sorts of bitfield shenanigans
       */
      const write_alpha_block = function(output_bb, alpha_block) {
        let bf = new sc_bitfield([0, 0, 0, 0, 0, 0, 0, 0]);
        bf.write_bits(8, alpha_block.max_a);
        bf.write_bits(8, alpha_block.min_a);
        for (let i = 0; i < 16; i++) {
          bf.write_bits(3, alpha_block.indices[i]);
        }
        output_bb.append(bf.data);
      };

      /**
       * Packs the calculated rgb block into 8 bytes using all
       * sorts of bitfield shenanigans
       */
      const write_rgb_block = function(output_bb, rgb_block) {
        let bf = new sc_bitfield([0, 0, 0, 0, 0, 0, 0, 0]);
        bf.write_bits(16, rgb_block.c0.packed_rgb565);
        bf.write_bits(16, rgb_block.c1.packed_rgb565);
        for (let i = 0; i < 16; i++) {
          bf.write_bits(2, rgb_block.indices[i]);
        }
        output_bb.append(bf.data);
      };

      // Sanity checks
      check.equal(width * height * 4, data.remaining(), `Attempt to write ${width}x${height} DXT5 texture from buffer of ${data.remaining()} bytes (32bpp input required)`);

      // Foreach 4x4 block
      for (let y = 0; y < height / 4; y++)
      {
        for (let x = 0; x < width / 4; x++)
        {
          const {alpha_pixel_block, rgb_pixel_block} = extract_blocks(data, x, y, width, height);
          const alpha_block = calculate_alpha_block(alpha_pixel_block);
          const rgb_block = calculate_rgb_block(rgb_pixel_block);
          write_alpha_block(output, alpha_block);
          write_rgb_block(output, rgb_block);
         }
      }
    }
  }
};


/**
 * Class allowing for loading and saving DDS images in RGB, ARGB and DXT5 format
 */
export class sc_dds {
  /* Constructor. Do not call this directly, use the save/load functions */
  constructor(data, width, height) {
    this.__width = width;
    this.__height = height;
    this.__data = data;
  }

  get width() { return this.__width; }
  get height() { return this.__height; }
  get data() { return this.__data; }

  /**
   * Loads a DDS texture from the provided ByteBuffer
   * @param input {ByteBuffer} ByteBuffer with a DDS texture at current offset
   */
  static load(input) {
    let magic = input.readBytes(4);
    //check.equal("DDS ", magic).... ?

    const buffer = input.readBytes(124).compact().buffer;
    let dds_header = new sc_dds_header(buffer);

    // Sanity checks
    check.equal(124, dds_header.size, "DDS_HEADER size should be 124");
    check.bits_set(dds_header.flags, 0x00000002, "DDS_HEADER dwFlags width not valid");
    check.bits_set(dds_header.flags, 0x00000004, "DDS_HEADER dwFlags height not valid");
    check.bits_set(dds_header.flags, 0x00001000, "DDS_HEADER dwFlags pixelFormat not valid");
    check.equal(32, dds_header.ddspf_size, "DDS_HEADER dwsize not 32");
    check.one_of([0x00000040, 0x00000004], dds_header.ddspf_flags & 0x00000044, "DDS_HEADER dwFlags should indicate RGB or compressed data");
    // Note: Check disabled, these have been observed to both be invalid. I don't use it and dont have stride data
    // check.one_of([0x00080000, 0x00000008], flags & 0x00080008, "DDS_HEADER dwFlags should indicate pitch or linearsize");

    // Validate pixel format
    let pixel_format = undefined;
    if ((dds_header.ddspf_flags & 0x00000004) == 0) {
      check.one_of([0x00000041, 0x00000040], dds_header.ddspf_flags & 0x00000041, "DDS_HEADER dwFlags should indicate RGB or RGBA pixel format");

      if ((dds_header.ddspf_flags & 0x00000041) == 0x00000041) { // RGBA
        pixel_format = sc_dds_pixelformat.RawARGB;
        check.equal(32,         dds_header.ddspf_rgb_bit_count, "DDS_HEADER RGBBitCount not 32 for RGBA format");
        check.equal(0xFF000000, dds_header.ddspf_a_bit_mask,    "DDS_HEADER ABitMask not 0xFF000000");
        check.equal(0x00FF0000, dds_header.ddspf_r_bit_mask,    "DDS_HEADER RBitMask not 0x00FF0000");
        check.equal(0x0000FF00, dds_header.ddspf_g_bit_mask,    "DDS_HEADER GBitMask not 0x0000FF00");
        check.equal(0x000000FF, dds_header.ddspf_b_bit_mask,    "DDS_HEADER BBitMask not 0x000000FF");
      } else if ((dds_header.ddspf_flags & 0x00000040) == 0x00000040) { // RGB
        pixel_format = sc_dds_pixelformat.RawRGB;
        check.equal(24,         dds_header.ddspf_rgb_bit_count, "DDS_HEADER RGBBitCount not 24 for RGB format");
        check.equal(0x00FF0000, dds_header.ddspf_r_bit_mask,    "DDS_HEADER RBitMask not 0x00FF0000");
        check.equal(0x0000FF00, dds_header.ddspf_g_bit_mask,    "DDS_HEADER GBitMask not 0x0000FF00");
        check.equal(0x000000FF, dds_header.ddspf_b_bit_mask,    "DDS_HEADER BBitMask not 0x000000FF");
      }
    } else { // Compressed
      // check.one_of(["DXT5"], pf_four_cc, "Unsupported compression format");
      pixel_format = sc_dds_pixelformat.DXT5;
    }

    if (pixel_format == undefined) {
      // Should not reach this, explode
      check.equal(true, false, `Invalid pixel_format ${pixel_format}`)
    }

    // Return an sc_dds with this texture
    return new sc_dds(pixel_format.load(input, dds_header.width, dds_header.height),
                      dds_header.width,
                      dds_header.height);
  }


  /**
   * Writes a DDS texture to the provided ByteBuffer
   * @param output {ByteBuffer} Destination ByteBuffer
   * @param data {ByteBuffer} Source ByteBuffer. Should contain ARGB8888 pixels
   * @param width {Number} Width in pixels
   * @param height {Number} Height in pixels
   * @param pixel_fomat {sc_dds_pixelformat} Format to write output in
   */
  static save(output, data, width, height, pixel_format) {
    // Ensure that the data ByteBuffer is rewound to the start
    data.reset();
    // Sanity checks
    check.equal(width * height * 4, data.remaining(), `Image data length not equal to ${width}*${height}*4 (${width * height * 4})`);

    // 2. DXT5 specific sanity checks
    if (pixel_format === sc_dds_pixelformat.DXT5)
    {
      check.equal(0, width % 4,  "DXT5 images must be divisible by 4 in all dimensions");
      check.equal(0, height % 4, "DXT5 images must be divisible by 4 in all dimensions");
    }

    output.append(new Uint8Array(string_to_ascii_array("DDS "))); // Magic value 'DDS '

    // Build and write the header
    const dds_header = new sc_dds_header();
    dds_header.size = 124;
    dds_header.flags = 0x00000001 |                                                           // Caps valid
                       0x00000002 |                                                           // Width valid
                       0x00000004 |                                                           // Height valid
                       (pixel_format === sc_dds_pixelformat.DXT5 ? 0x00000000 : 0x00000008) | // Pitch valid (uncompressed)
                       (pixel_format === sc_dds_pixelformat.DXT5 ? 0x00080000 : 0x00000000) | // Linearsize valid (block)
                       0x00001000;                                                            // Pixelformat valid
    dds_header.height = height;
    dds_header.width = width;

    if (pixel_format === sc_dds_pixelformat.RawRGB)
    {
      dds_header.ddspf_size          = 24;
      dds_header.ddspf_rgb_bit_count = 24;
      dds_header.ddspf_a_bit_mask    = 0x00000000;
      dds_header.ddspf_r_bit_mask    = 0x00FF0000;
      dds_header.ddspf_g_bit_mask    = 0x0000FF00;
      dds_header.ddspf_b_bit_mask    = 0x000000FF;
    } else
    {
      dds_header.ddspf_size           = 32;
      dds_header.ddspf_rgb_bit_count  = 32;
      dds_header.ddspf_a_bit_mask     = 0xFF000000;
      dds_header.ddspf_r_bit_mask     = 0x00FF0000;
      dds_header.ddspf_g_bit_mask     = 0x0000FF00;
      dds_header.ddspf_b_bit_mask     = 0x000000FF;
    }


    if (pixel_format === sc_dds_pixelformat.RawARGB)
    {
       dds_header.pitch_or_linear_size = width * 4;
       dds_header.ddspf_flags          = 0x00000001 | // Alpha valid
                                         0x00000040;  // Uncompressed data
    }
    else if (pixel_format === sc_dds_pixelformat.RawRGB)
    {
       dds_header.pitch_or_linear_size = width * 3;
       dds_header.ddspf_flags          = 0x00000000 | // Alpha invalid
                                         0x00000040;  // Uncompressed data
    }
    else if (pixel_format === sc_dds_pixelformat.DXT5)
    {
       dds_header.pitch_or_linear_size = Math.max(1, Math.floor((width + 3) / 4)) * 16;
       dds_header.ddspf_flags          = 0x00000001 | // Alpha valid
                                         0x00000004;  // FOURCC code valid
       dds_header.ddspf_four_cc = "DXT5";
    }

    dds_header.caps = 0x00001000; // Texture

    output.append(dds_header.buffer);

    // Write the compressed stream of data
    pixel_format.save(output, data, width, height);
  }
}

