/**
 * Basic DDS parsing/writing for ARGB, RGB and DXT5. 
 * All input/output is to ARGB, with missing A values
 * set to full opacity
 */

import check from "./sc_check";
import {sc_bitfield} from "./sc_bitfield"
import {_} from "underscore";
const ByteBuffer = require('bytebuffer');

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
    return 0; // TODO
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
const sc_dds_pixelformat = {
  RawRGB: {
    load(input, width, height) {
      console.log(`Loading ${width}x${height} RawRGB`);
      let output = new ByteBuffer(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        output.writeUint8(255, i * 4)
        input.copyTo(output, i * 4 + 1, input, input.offset, input.offset + 3);
      }
      // Manually advance read position as copyTo will not have changed it
      input.skip(width * height * 3);
    },
    save(output) {
      
    }
  },
  RawARGB: {
    load(input, width, height) {
      return input.readBytes(width * height * 4).compact();
    },
    save(output) {
      
    }
  },
  DXT5: {
    load(input, width, height) {
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
          if (min_a > max_a) {
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
      return output;
    },
    save(output) {
      
    }
  }
};

class sc_dds_header {
  constructor() {
    this.__width = undefined;
    this.__height = undefined;
    this.__format = undefined;
  }
  
  get width() { return this.__width; }
  get height() { return this.__height; }
  get format() { return this.__format; }
  
  
  load(input) {
    let size = input.readUint32();
    let flags = input.readUint32();
    let height = input.readUint32();
    let width = input.readUint32();    
    let pitch_or_linear_size = input.readUint32();
    let depth = input.readUint32();
    let mip_map_count = input.readUint32();
    input.readBytes(44); // dwReserved
    let pf_size = input.readUint32();
    let pf_flags = input.readUint32();
    let pf_four_cc = input.readUint32();
    let pf_rgb_bit_count = input.readUint32();
    let pf_rbit_mask = input.readUint32();
    let pf_gbit_mask = input.readUint32();
    let pf_bbit_mask = input.readUint32();
    let pf_abit_mask = input.readUint32();
                
    let caps = input.readUint32();
    let caps2 = input.readUint32();
    let caps3 = input.readUint32();
    let caps4 = input.readUint32();
    input.readUint32(); // dwReserved2 
    
    
    // Sanity checks
    check.equal(124, size, "DDS_HEADER size should be 124");
    check.bits_set(flags, 0x00000002, "DDS_HEADER dwFlags width not valid");
    check.bits_set(flags, 0x00000004, "DDS_HEADER dwFlags height not valid");
    check.bits_set(flags, 0x00001000, "DDS_HEADER dwFlags pixelFormat not valid");
    check.equal(32, pf_size, "DDS_HEADER dwsize not 32");
    check.one_of([0x00000040, 0x00000004], pf_flags & 0x00000044, "DDS_HEADER dwFlags should indicate RGB or compressed data");
    // Note: Check disabled, these have been observed to both be invalid. I don't use it and dont have stride data
    // check.one_of([0x00080000, 0x00000008], flags & 0x00080008, "DDS_HEADER dwFlags should indicate pitch or linearsize");
    
    // Determine pixelformat
    let pixel_format = undefined;
    if ((pf_flags & 0x00000004) == 0) {
      check.one_of([0x00000041, 0x00000040], pf_flags & 0x00000041, "DDS_HEADER dwFlags should indicate RGB or RGBA pixel format");

      if ((pf_flags & 0x00000041) == 0x00000041) {
        // RGBA
        pixel_format = sc_dds_pixelformat.RawARGB;
        check.equal(32, pf_rgb_bit_count, "DDS_HEADER RGBBitCount not 32 for RGBA format");
        check.equal(0xFF000000, pf_abit_mask, "DDS_HEADER ABitMask not 0xFF000000");
        check.equal(0x00FF0000, pf_rbit_mask, "DDS_HEADER RBitMask not 0x00FF0000");
        check.equal(0x0000FF00, pf_gbit_mask, "DDS_HEADER GBitMask not 0x0000FF00");
        check.equal(0x000000FF, pf_bbit_mask, "DDS_HEADER BBitMask not 0x000000FF");
      } else if ((pf_flags & 0x00000040) == 0x00000040) {
        // RGB
        pixel_format = sc_dds_pixelformat.RawRGB;
        check.equal(24, pf_rgb_bit_count, "DDS_HEADER RGBBitCount not 24 for RGB format");
        check.equal(0x00FF0000, pf_rbit_mask, "DDS_HEADER RBitMask not 0x00FF0000");
        check.equal(0x0000FF00, pf_gbit_mask, "DDS_HEADER GBitMask not 0x0000FF00");
        check.equal(0x000000FF, pf_bbit_mask, "DDS_HEADER BBitMask not 0x000000FF");
      }
    } else {
      // Some sort of compressed format. Determine if it's one we support
      // TODO: Figure out bitwise comparison between 'DXT5' and a uint32
      // check.one_of(["DXT5"], pf_four_cc, "Unsupported compression format");
      pixel_format = sc_dds_pixelformat.DXT5;
    }

    if (pixel_format == undefined) {
      // Should not reach this, explode
      check.equal(true, false, `Invalid pixel_format ${pixel_format}`)
    }
    
    // Record fields
    this.__width = width;
    this.__height = height;
    this.__format = pixel_format;
  }
  save(output) {}
}

export class sc_dds {
  constructor() {
    this.__width = undefined;
    this.__height = undefined;
    this.__data = [];
  }
  
  get width() { return this.__width; }
  get height() { return this.__height; }
  get data() { return this.__data; }
  
  load(input) {
    let magic = input.readBytes(4);
    //check.equal("DDS ", magic).... ?
    
    let dds_header = new sc_dds_header();
    dds_header.load(input);
    
    let data = dds_header.format.load(input, dds_header.width, dds_header.height);
    
    // Record fields
    this.__width = dds_header.width;
    this.__height = dds_header.height;
    this.__data = data;
  }
  
  save(output) {}
}