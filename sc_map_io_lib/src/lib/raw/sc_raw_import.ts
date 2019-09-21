import { sc_edit_heightmap } from '../sc_edit_heightmap';
import * as ByteBuffer from 'bytebuffer';
import { sc_edit_texturemap } from '../sc_edit_texturemap';


/**
 * Imports a heightmap from a raw file
 *
 * @param heightmap The map heightmap to write to
 * @param raw The raw heightmap to import
 */
export const sc_raw_heightmap_import = (heightmap: sc_edit_heightmap, raw: ByteBuffer): void => {
  const [w, h] = [heightmap.width, heightmap.height];
  if (raw.capacity() !== w * h * 2) {
    throw new Error(`Attempting to import a ${w}x${h} heightmap which requires a ${w * h * 2}` +
                    `byte raw file, but input was ${raw.capacity()} bytes`);
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      heightmap.set_pixel([x, y], [raw.readUint16()]);
    }
  }
};


/**
 * Imports a texturemap from a pair of raw files
 * @param texturemap The map texturemap to populate
 * @param chan_03 The raw lower channels
 * @param chan_47 The raw upper channels
 */
export const sc_raw_texturemap_import = (texturemap: sc_edit_texturemap, chan_03: ByteBuffer, chan_47: ByteBuffer): void => {
  const [w, h] = [texturemap.width, texturemap.height];
  if (chan_03.capacity() !== w * h * 4) {
    throw new Error(`Attempting to import a ${w}x${h} texturemap which requires a ${w * h * 4}` +
                    `byte raw file for channels 0-3, but input was ${chan_03.capacity()} bytes`);
  }
  if (chan_47.capacity() !== w * h * 4) {
    throw new Error(`Attempting to import a ${w}x${h} texturemap which requires a ${w * h * 4}` +
                    `byte raw file for channels 4-7, but input was ${chan_47.capacity()} bytes`);
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pixel = [chan_03.readUint8(), chan_03.readUint8(), chan_03.readUint8(), chan_03.readUint8()
                     chan_47.readUint8(), chan_47.readUint8(), chan_47.readUint8(), chan_47.readUint8()];
      texturemap.set_pixel([x, y], pixel);
    }
  }
};
