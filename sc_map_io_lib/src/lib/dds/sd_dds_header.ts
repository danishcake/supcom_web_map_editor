import check from "../sc_check";
import { sc_string_to_ascii_array } from "./sc_string_to_ascii_array";
import * as ByteBuffer from 'bytebuffer';
import { bytebuffer_to_arraybuffer } from "./sc_bytebuffer_to_arraybuffer";

/**
 * Unwraps a ByteBuffer or ArrayBuffer containing an DDS header
 * Note I've managed to make endian dependent code in the browser. Go team!
 * What I need is an endian specifying Uint32Array etc
 */
export class sc_dds_header {
  private __buffer: ArrayBuffer;
  private __size: Uint32Array;
  private __flags: Uint32Array;
  private __height: Uint32Array;
  private __width: Uint32Array;
  private __pitch_or_linear_size: Uint32Array;
  private __depth: Uint32Array;
  private __mip_map_count: Uint32Array;
  private __reserved: Uint32Array;
  private __ddspf_size: Uint32Array;
  private __ddspf_flags: Uint32Array;
  private __ddspf_four_cc: Uint8Array;
  private __ddspf_rgb_bit_count: Uint32Array;
  private __ddspf_r_bit_mask: Uint32Array;
  private __ddspf_g_bit_mask: Uint32Array;
  private __ddspf_b_bit_mask: Uint32Array;
  private __ddspf_a_bit_mask: Uint32Array;
  private __caps: Uint32Array;
  private __caps2: Uint32Array;
  private __caps3: Uint32Array;
  private __caps4: Uint32Array;
  private __reserved2: Uint32Array;

  // Constructs a zeroed dds_header
  constructor(buffer?: ByteBuffer) {
    let underlyingBuffer: ArrayBuffer | null = null;

    if (buffer) {
      underlyingBuffer = bytebuffer_to_arraybuffer(buffer);
      check.equal(124, underlyingBuffer.byteLength, "If a buffer is passed to sc_dds_header it must be 124 bytes long");
    }

    this.__buffer = underlyingBuffer || new ArrayBuffer(124);

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
  public get buffer()                    { return this.__buffer; }

  /** Gets individual fields */
  public get size(): number                      { return this.__size[0]; }
  public set size(value: number)                 { this.__size[0] = value; }
  public get flags(): number                     { return this.__flags[0]; }
  public set flags(value: number)                { this.__flags[0] = value; }
  public get height(): number                    { return this.__height[0]; }
  public set height(value: number)               { this.__height[0] = value; }
  public get width(): number                     { return this.__width[0]; }
  public set width(value: number)                { this.__width[0] = value; }
  public get pitch_or_linear_size(): number      { return this.__pitch_or_linear_size[0]; }
  public set pitch_or_linear_size(value: number) { this.__pitch_or_linear_size[0] = value; }
  public get depth(): number                     { return this.__depth[0]; }
  public set depth(value: number)                { this.__depth[0] = value; }
  public get mip_map_count(): number             { return this.__mip_map_count[0]; }
  public set mip_map_count(value: number)        { this.__mip_map_count[0] = value; }
  public get ddspf_size(): number                { return this.__ddspf_size[0]; }
  public set ddspf_size(value: number)           { this.__ddspf_size[0] = value; }
  public get ddspf_flags(): number               { return this.__ddspf_flags[0]; }
  public set ddspf_flags(value: number)          { this.__ddspf_flags[0] = value; }
  public get ddspf_rgb_bit_count(): number       { return this.__ddspf_rgb_bit_count[0]; }
  public set ddspf_rgb_bit_count(value: number)  { this.__ddspf_rgb_bit_count[0] = value; }
  public get ddspf_r_bit_mask(): number          { return this.__ddspf_r_bit_mask[0]; }
  public set ddspf_r_bit_mask(value: number)     { this.__ddspf_r_bit_mask[0] = value; }
  public get ddspf_g_bit_mask(): number          { return this.__ddspf_g_bit_mask[0]; }
  public set ddspf_g_bit_mask(value: number)     { this.__ddspf_g_bit_mask[0] = value; }
  public get ddspf_b_bit_mask(): number          { return this.__ddspf_b_bit_mask[0]; }
  public set ddspf_b_bit_mask(value: number)     { this.__ddspf_b_bit_mask[0] = value; }
  public get ddspf_a_bit_mask(): number          { return this.__ddspf_a_bit_mask[0]; }
  public set ddspf_a_bit_mask(value: number)     { this.__ddspf_a_bit_mask[0] = value; }
  public get caps(): number                      { return this.__caps[0]; }
  public set caps(value: number)                 { this.__caps[0] = value; }
  public get caps2(): number                     { return this.__caps2[0]; }
  public set caps2(value: number)                { this.__caps2[0] = value; }
  public get caps3(): number                     { return this.__caps3[0]; }
  public set caps3(value: number)                { this.__caps3[0] = value; }
  public get caps4(): number                     { return this.__caps4[0]; }
  public set caps4(value: number)                { this.__caps4[0] = value; }

  /* For ease of use the FourCC string is exposed as an actual string */
  get ddspf_four_cc(): string {
    return String.fromCharCode(this.__ddspf_four_cc[0]) +
           String.fromCharCode(this.__ddspf_four_cc[1]) +
           String.fromCharCode(this.__ddspf_four_cc[2]) +
           String.fromCharCode(this.__ddspf_four_cc[3]);
  }

  set ddspf_four_cc(value: string) {
    check.type_is('string', value, `Attempt to set ddspf_four_cc with a non-string value`);
    check.equal(4, value.length, `Attempt to set ddspf_four_cc with a string which is ${value.length} characters long`);

    const ascii_array = sc_string_to_ascii_array(value);
    this.__ddspf_four_cc[0] =  ascii_array[0];
    this.__ddspf_four_cc[1] =  ascii_array[1];
    this.__ddspf_four_cc[2] =  ascii_array[2];
    this.__ddspf_four_cc[3] =  ascii_array[3];
  }
};
