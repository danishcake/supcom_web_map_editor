import check from '../../sc_check';
import { sc_dds_header } from "../sd_dds_header";
import { sc_dds_pixelformat } from "./sc_dds_pixelformat";
import * as ByteBuffer from 'bytebuffer';

export class sc_dds_pixelformat_rgb implements sc_dds_pixelformat {
  /**
   * No checks
   */
  public sanity_checks(width: number, height: number): void {
  }

  /**
   * Populates the DDS header with values appropriate for RGB
   */
  public populate_header(width: number, height: number, header: sc_dds_header): void {
    header.flags                = header.flags | 0x00000008;  // Pitch valid (uncompressed)
    header.flags                = header.flags & ~0x00080000; // Linearsize invalid
    header.ddspf_size           = 24;
    header.ddspf_rgb_bit_count  = 24;
    header.ddspf_a_bit_mask     = 0x00000000;
    header.ddspf_r_bit_mask     = 0x00FF0000;
    header.ddspf_g_bit_mask     = 0x0000FF00;
    header.ddspf_b_bit_mask     = 0x000000FF;
    header.pitch_or_linear_size = width * 3;
    header.ddspf_flags          = 0x00000000 | // Alpha invalid
                                  0x00000040;  // Uncompressed data
  }

  /**
   * Loads an uncompressed ARGB8888 texture.
   * @param {ByteBuffer} input Input texture data. Must be width * height * 3 remaining (eg header already read)
   * @param {Number} width Width in pixels
   * @param {Number} height Height in pixels
   * @return {ByteBuffer} A ByteBuffer containing ARGB8888 pixels. Alpha values will be set to 255
   */
  load(input: ByteBuffer, width: number, height: number): ByteBuffer {
      let output = new ByteBuffer(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        output.writeUint8(255, i * 4)
        input.copyTo(output, i * 4 + 1, input.offset, input.offset + 3);
      }
      // Manually advance read position as copyTo will not have changed it
      input.skip(width * height * 3);
      return output;
  }


  /**
   * Saves a texture as uncompressed RGB888 pixels. Alpha values are skipped
   * @param {ByteBuffer} output Output ByteBuffer stream
   * @param {ByteBuffer} data Input texture. Must be width * height * 4 bytes remaining
   * @param {Number} width Width in pixels
   * @param {Number} height Height in pixels
   */
  save(output: ByteBuffer, data: ByteBuffer, width: number, height: number): void {
    check.equal(width * height * 4, data.remaining(), `Attempt to write ${width}x${height} 24bpp texture from buffer of ${data.remaining()} bytes (32bpp input required)`);

    for (let i = 0; i < width * height; i++) {
      output.append(data.slice(i * 4, i * 4 + 3));
    }
  }
}
