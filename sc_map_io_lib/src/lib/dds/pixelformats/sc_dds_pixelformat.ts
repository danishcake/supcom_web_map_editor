import { sc_dds_header } from "../sd_dds_header";
import * as ByteBuffer from 'bytebuffer';


/**
 * Defines the characteristics of a pixel format
 */
export interface sc_dds_pixelformat {
  /**
   * Throws if format specific constraints are not met
   */
  sanity_checks(width: number, height: number): void;

  /**
   * Populates DDS header with format specific fields and flags
   */
  populate_header(width: number, height: number, header: sc_dds_header): void;

  load(input: ByteBuffer, width: number, height: number): ByteBuffer;
  save(output: ByteBuffer, data: ByteBuffer, width: number, height: number): void;

};
