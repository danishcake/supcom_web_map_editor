import { sc_dds_pixelformat } from "./sc_dds_pixelformat";
import { sc_dds_header } from "../sd_dds_header";
import check from '../../sc_check';

export class sc_dds_pixelformat_argb implements sc_dds_pixelformat {
  /**
   * No checks
   */
  public sanity_checks(width: number, height: number): void {
  }


  /**
   * Populates the DDS header with values appropriate for ARGB
   */
  public populate_header(width: number, height: number, header: sc_dds_header): void {
    header.flags                = header.flags | 0x00000008;  // Pitch valid (uncompressed)
    header.flags                = header.flags & ~0x00080000; // Linearsize invalid
    header.ddspf_size           = 32;
    header.ddspf_rgb_bit_count  = 32;
    header.ddspf_a_bit_mask     = 0xFF000000;
    header.ddspf_r_bit_mask     = 0x00FF0000;
    header.ddspf_g_bit_mask     = 0x0000FF00;
    header.ddspf_b_bit_mask     = 0x000000FF;
    header.pitch_or_linear_size = width * 4;
    header.ddspf_flags          = 0x00000001 | // Alpha valid
                                  0x00000040;  // Uncompressed data
  }


  /**
   * Loads an uncompressed ARGB8888 texture.
   * @param {ByteBuffer} input Input texture data. Must be width * height * 4 remaining (eg header already read)
   * @param {Number} width Width in pixels
   * @param {Number} height Height in pixels
   * @return {ByteBuffer} A ByteBuffer containing ARGB8888 pixels
   */
  load(input: ByteBuffer, width: number, height: number): ByteBuffer {
    return input.readBytes(width * height * 4).compact();
  }


  /**
   * Saves a texture as uncompressed ARGB8888 pixels
   * @param {ByteBuffer} output Output ByteBuffer stream
   * @param {ByteBuffer} data Input texture. Must be width * height * 4 bytes remaining
   * @param {Number} width Width in pixels
   * @param {Number} height Height in pixels
   */
  save(output: ByteBuffer, data: ByteBuffer, width: number, height: number): void {
    check.equal(width * height * 4, data.remaining(), `Attempt to write ${width}x${height} 32bpp texture from buffer of ${data.remaining()} bytes`);
    output.append(data);
  }
}
