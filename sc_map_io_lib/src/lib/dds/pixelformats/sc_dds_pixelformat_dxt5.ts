import { sc_dds_pixelformat } from "./sc_dds_pixelformat";
import { sc_dds_pixel_rgb } from "../sc_dds_pixel_rgb";
import { sc_dds_header } from "../sd_dds_header";
import { sc_bitfield } from "../../sc_bitfield";
import check from "../../sc_check";
import * as ByteBuffer from 'bytebuffer';
import * as _ from "underscore";
import { bytebuffer_to_arraybuffer } from "../sc_bytebuffer_to_arraybuffer";


interface rgb_candidate {
  c0: sc_dds_pixel_rgb,
  c1: sc_dds_pixel_rgb
};


interface rgb_block {
  c0: sc_dds_pixel_rgb;
  c1: sc_dds_pixel_rgb;
  indices: number[];
};


interface alpha_block {
  max_a: number;
  min_a: number;
  indices: number[];
};

type colourpair_generator = (rgb_block: sc_dds_pixel_rgb[]) => rgb_candidate[];


export class sc_dds_pixelformat_dxt5 implements sc_dds_pixelformat {
  /**
   * DXT5 compression uses a straight line through colour space, with the colours at 0%, 33%, 66% and 100%
   * These algorithms suggest colour pairs for a given block
   */
  private static colourpair_generators: colourpair_generator[] = [
    /**
     * maximal_colour_distance
     * This /would/ calculate the best candidate by comparing all possible permutations
     * starting with any pair of colours.
     * Turns out to be too slow (16*15 operations), so not implemented
     */
    //function(rgb_block) {
    //  return {c0: 0, c1: 0}
    //},

    /**
     * maximal_intensity_distance
     * Returns the pair of colours maximally separated by intensity
     */
    function(rgb_block: sc_dds_pixel_rgb[]): rgb_candidate[] {
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
     * rgb_extents
     * Returns a pair of colours containing the bounding rgb cube
     */
    function(rgb_block: sc_dds_pixel_rgb[]): rgb_candidate[] {
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
      return [{ c0: sc_dds_pixel_rgb.from_rgb888(min_r, min_g, min_b),
                c1: sc_dds_pixel_rgb.from_rgb888(max_r, max_g, max_b) },
              { c0: sc_dds_pixel_rgb.from_rgb888(min_r + offset_r, min_g + offset_g, min_b + offset_b),
                c1: sc_dds_pixel_rgb.from_rgb888(max_r - offset_r, max_g - offset_g, max_b - offset_b) }];
    }
  ];

  /**
   * Extracts a 4x4 block of pixels into alpha and rgb565 components
   */
  private extract_blocks(data: ByteBuffer, x: number, y: number, width: number, height: number) {
    const result = {
      alpha_pixel_block: new ByteBuffer(16),
      rgb_pixel_block: new Array<sc_dds_pixel_rgb>()
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
        const rgb = sc_dds_pixel_rgb.from_rgb888(data.readUint8(input_index + 1),
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
  private calculate_alpha_block(alpha_pixel_block: ByteBuffer): alpha_block {
    // Now build the output alpha block
    // Find alpha range
    const alpha_view = new Uint8Array(bytebuffer_to_arraybuffer(alpha_pixel_block), 0, 16);
    const min_a = _.min(alpha_view);
    const max_a = _.max(alpha_view);

    // Derive the alpha interpolated values
    const alpha_interpolated = [
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
      min_a: min_a,
      indices: new Array<number>()
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
   * @param rgb_pixel_block {sc_dds_pixel_rgb[]} An array of 16 RGB pixels
   * @returns {object} The two interpolation values and indices into interpolation
   *                   lookup table
   */
  private calculate_rgb_block(rgb_pixel_block: sc_dds_pixel_rgb[]): rgb_block {
    let colourpairs: rgb_candidate[] = [];
    for (let colourpair_generator of sc_dds_pixelformat_dxt5.colourpair_generators) {
      colourpairs.push(...colourpair_generator(rgb_pixel_block));
    }

    // Determine which colourpair is optimal
    interface rgb_block_candidate extends rgb_block {
      metric: number;
    }


    const error_metrics: rgb_block_candidate[] = [];
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

    const result: rgb_block = {
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
  private write_alpha_block(output_bb: ByteBuffer, alpha_block: alpha_block): void {
    let bf = new sc_bitfield([0, 0, 0, 0, 0, 0, 0, 0]);
    bf.write_bits(8, alpha_block.max_a);
    bf.write_bits(8, alpha_block.min_a);
    for (let i = 0; i < 16; i++) {
      bf.write_bits(3, alpha_block.indices[i]);
    }
    output_bb.append(bf.data_as_bytebuffer);
  };

  /**
   * Packs the calculated rgb block into 8 bytes using all
   * sorts of bitfield shenanigans
   */
  private write_rgb_block(output_bb: ByteBuffer, rgb_block: rgb_block): void {
    let bf = new sc_bitfield([0, 0, 0, 0, 0, 0, 0, 0]);
    bf.write_bits(16, rgb_block.c0.packed_rgb565);
    bf.write_bits(16, rgb_block.c1.packed_rgb565);
    for (let i = 0; i < 16; i++) {
      bf.write_bits(2, rgb_block.indices[i]);
    }
    output_bb.append(bf.data_as_bytebuffer);
  };


  /**
   * Checks all dimensions are divisible by 4
   */
  public sanity_checks(width: number, height: number): void {
    check.equal(0, width % 4,  "DXT5 images must be divisible by 4 in all dimensions");
    check.equal(0, height % 4, "DXT5 images must be divisible by 4 in all dimensions");
  }



  /**
   * Populates the DDS header with values appropriate for DXT5
   */
  public populate_header(width: number, height: number, header: sc_dds_header): void {
    header.flags                = header.flags & ~0x00000008;  // Pitch invalid
    header.flags                = header.flags | 0x00080000; // Linearsize valid
    header.ddspf_size           = 32;
    header.ddspf_rgb_bit_count  = 32;
    header.ddspf_a_bit_mask     = 0xFF000000;
    header.ddspf_r_bit_mask     = 0x00FF0000;
    header.ddspf_g_bit_mask     = 0x0000FF00;
    header.ddspf_b_bit_mask     = 0x000000FF;
    header.pitch_or_linear_size = Math.max(1, Math.floor((width + 3) / 4)) * 16;
    header.ddspf_flags          = 0x00000001 | // Alpha valid
                                  0x00000004;  // FOURCC code valid
    header.ddspf_four_cc = "DXT5";
  }


  /**
   * Loads a compressed DXT5 texture.
   *
   * DXT5 consists of 4x4 blocks with 4:1 compression.
   * This code reads each 4x4 block, decompresses it and writes it to the correct part
   * of a larger array
   *
   * @param {ByteBuffer} input Input texture data. Must be width * height remaining (eg header already read)
   * @param {Number} width Width in pixels
   * @param {Number} height Height in pixels
   * @return {ByteBuffer} A ByteBuffer containing ARGB8888 pixels
   */
  public load(input: ByteBuffer, width: number, height: number): ByteBuffer {
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
  }


  public save(output: ByteBuffer, data: ByteBuffer, width: number, height: number): void {
    // Sanity checks
    check.equal(width * height * 4, data.remaining(), `Attempt to write ${width}x${height} DXT5 texture from buffer of ${data.remaining()} bytes (32bpp input required)`);

    // Foreach 4x4 block
    for (let y = 0; y < height / 4; y++) {
      for (let x = 0; x < width / 4; x++) {
        const {alpha_pixel_block, rgb_pixel_block} = this.extract_blocks(data, x, y, width, height);
        const alpha_block = this.calculate_alpha_block(alpha_pixel_block);
        const rgb_block = this.calculate_rgb_block(rgb_pixel_block);
        this.write_alpha_block(output, alpha_block);
        this.write_rgb_block(output, rgb_block);
      }
    }
  }
}
