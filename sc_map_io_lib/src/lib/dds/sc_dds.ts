/**
 * Basic DDS parsing/writing for ARGB, RGB and DXT5.
 * All input/output is to ARGB, with missing A values
 * set to full opacity
 */
import { sc_dds_header } from "./sd_dds_header";
import { sc_dds_pixelformat } from "./pixelformats/sc_dds_pixelformat";
import check from "../sc_check";
import * as ByteBuffer from 'bytebuffer';
import { sc_dds_pixelformat_argb } from "./pixelformats/sc_dds_pixelformat_argb";
import { sc_dds_pixelformat_rgb } from "./pixelformats/sc_dds_pixelformat_rgb";
import { sc_dds_pixelformat_dxt5 } from "./pixelformats/sc_dds_pixelformat_dxt5";
import { sc_string_to_ascii_array } from "./sc_string_to_ascii_array";

/**
 * Class allowing for loading and saving DDS images in RGB, ARGB and DXT5 format
 */
export class sc_dds {
  private __width: number;
  private __height: number;
  private __data: ByteBuffer;

  /* Constructor. Do not call this directly, use the save/load functions */
  private constructor(data: ByteBuffer, width: number, height: number) {
    this.__width = width;
    this.__height = height;
    this.__data = data;
  }

  public get width(): number { return this.__width; }
  public get height(): number { return this.__height; }
  public get data(): ByteBuffer { return this.__data; }

  /**
   * Loads a DDS texture from the provided ByteBuffer
   * @param input {ByteBuffer} ByteBuffer with a DDS texture at current offset
   */
  public static load(input: ByteBuffer): sc_dds {
    let magic = input.readBytes(4);
    //check.equal("DDS ", magic).... ?

    const buffer = input.readBytes(124).compact();
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
    let pixel_format: sc_dds_pixelformat | undefined;
    if ((dds_header.ddspf_flags & 0x00000004) == 0) {
      check.one_of([0x00000041, 0x00000040], dds_header.ddspf_flags & 0x00000041, "DDS_HEADER dwFlags should indicate RGB or RGBA pixel format");

      if ((dds_header.ddspf_flags & 0x00000041) == 0x00000041) { // RGBA
        pixel_format = new sc_dds_pixelformat_argb();
        check.equal(32,         dds_header.ddspf_rgb_bit_count, "DDS_HEADER RGBBitCount not 32 for RGBA format");
        check.equal(0xFF000000, dds_header.ddspf_a_bit_mask,    "DDS_HEADER ABitMask not 0xFF000000");
        check.equal(0x00FF0000, dds_header.ddspf_r_bit_mask,    "DDS_HEADER RBitMask not 0x00FF0000");
        check.equal(0x0000FF00, dds_header.ddspf_g_bit_mask,    "DDS_HEADER GBitMask not 0x0000FF00");
        check.equal(0x000000FF, dds_header.ddspf_b_bit_mask,    "DDS_HEADER BBitMask not 0x000000FF");
      } else if ((dds_header.ddspf_flags & 0x00000040) == 0x00000040) { // RGB
        pixel_format = new sc_dds_pixelformat_rgb();
        check.equal(24,         dds_header.ddspf_rgb_bit_count, "DDS_HEADER RGBBitCount not 24 for RGB format");
        check.equal(0x00FF0000, dds_header.ddspf_r_bit_mask,    "DDS_HEADER RBitMask not 0x00FF0000");
        check.equal(0x0000FF00, dds_header.ddspf_g_bit_mask,    "DDS_HEADER GBitMask not 0x0000FF00");
        check.equal(0x000000FF, dds_header.ddspf_b_bit_mask,    "DDS_HEADER BBitMask not 0x000000FF");
      }
    } else { // Compressed
      // check.one_of(["DXT5"], pf_four_cc, "Unsupported compression format");
      pixel_format = new sc_dds_pixelformat_dxt5();
    }

    check.not_equal(undefined, pixel_format, `Invalid pixel_format ${pixel_format}`);
    // Annoying that we can't have exception throwing type guards :(

    // Return an sc_dds with this texture
    return new sc_dds((pixel_format as sc_dds_pixelformat).load(input, dds_header.width, dds_header.height),
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
  static save(output: ByteBuffer, data: ByteBuffer, width: number, height: number, pixel_format: sc_dds_pixelformat): void {
    // Ensure that the data ByteBuffer is rewound to the start
    data.reset();
    // Sanity checks
    check.equal(width * height * 4, data.remaining(), `Image data length not equal to ${width}*${height}*4 (${width * height * 4})`);
    pixel_format.sanity_checks(width, height);

    output.append(new Uint8Array(sc_string_to_ascii_array("DDS "))); // Magic value 'DDS '

    // Build and write the header
    const dds_header = new sc_dds_header();
    dds_header.size = 124;
    dds_header.flags = 0x00000001 |   // Caps valid
                       0x00000002 |   // Width valid
                       0x00000004 |   // Height valid
                       0x00001000;    // Pixelformat valid
                                      // Pitch and linearsize will be set by the pixelformat

    dds_header.height = height;
    dds_header.width = width;
    dds_header.caps = 0x00001000; // Texture
    pixel_format.populate_header(width, height, dds_header);

    output.append(dds_header.buffer);

    // Write the compressed stream of data
    pixel_format.save(output, data, width, height);
  }
}

