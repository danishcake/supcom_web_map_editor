import { sc_edit_heightmap } from '../sc_edit_heightmap';
import * as ByteBuffer from 'bytebuffer';
import { sc_edit_texturemap } from '../sc_edit_texturemap';


/**
 * Converts the heightmap to a simple .raw format that can be imported in Photoshop
 *
 * @param heightmap The map heightmap to convert to raw
 */
export const sc_raw_heightmap_export = (heightmap: sc_edit_heightmap): ByteBuffer => {
  const [w, h] = [heightmap.width, heightmap.height];
  const bb = new ByteBuffer(w * h * 2, true);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      bb.writeUint16(heightmap.get_pixel([x, y])[0]);
    }
  }

  bb.flip();
  return bb;
};


/**
 * Converts the texturemap to a pair of simple .raw format files that can be imported in Photoshop
 *
 * @param texturemap The map texturemap to convert to raw
 */
export const sc_raw_texturemap_export = (texturemap: sc_edit_texturemap): {chan_03: ByteBuffer, chan_47: ByteBuffer} => {
  const [w, h] = [texturemap.width, texturemap.height];
  const chan_03 = new ByteBuffer(w * h * 4, true);
  const chan_47 = new ByteBuffer(w * h * 4, true);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const subpixels = texturemap.get_pixel([x,y]);

      chan_03.writeUint8(subpixels[0]);
      chan_03.writeUint8(subpixels[1]);
      chan_03.writeUint8(subpixels[2]);
      chan_03.writeUint8(subpixels[3]);
      chan_47.writeUint8(subpixels[4]);
      chan_47.writeUint8(subpixels[5]);
      chan_47.writeUint8(subpixels[6]);
      chan_47.writeUint8(subpixels[7]);
    }
  }

  chan_03.flip();
  chan_47.flip();
  return {chan_03, chan_47};
};
