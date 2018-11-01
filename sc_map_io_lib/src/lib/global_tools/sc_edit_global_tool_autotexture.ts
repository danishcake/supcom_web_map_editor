import {sc_edit_global_tool_base} from './sc_edit_global_tool'
import {sc_edit_view_methods} from '../views/sc_edit_view_methods'
import {sc_edit_view_convolution} from '../views/sc_edit_view_convolution'
import {sc_edit_view_snapshot} from '../views/sc_edit_view_snapshot'
import {sc_edit_view_oob_clamp} from '../views/sc_edit_view_oob_clamp'
import {sc_edit_view_mask} from '../views/sc_edit_view_mask'
import { sc_edit_tool_data } from '../tools/sc_edit_tool_args';

/**
 * Apply autotexture to the entire height/texture maps
 */
export class sc_edit_global_tool_autotexture extends sc_edit_global_tool_base {
  private __signals: number[];

  constructor(signals: number[]) {
    super();

    this.__signals = signals;
  }

  /**
   * Applies auto texturing algorithm
   * @param {sc_edit_tool_data} data
   * @private
   */
  protected __apply_impl(data: sc_edit_tool_data): void {
    /**
     * Texturing algorithm:
     * 1. Terrain below abyssal water is set to base;
     * 2. Terrain below any water, or just above, is set to layer 1;
     * 3. Terrain above water is set to layer 2;
     * 4. Flat regions are then assigned layer 3, 4 and 5 as they increase in height;
     * 5. Layer 6 is mixed into all other layers based on gradient to indicate cliffs;
     * 6. Everything gets a nice big blur, apart from 6 which gets a small blur
     *
     * If there is no water:
     * 1. Terrain at the lowest height is set to base;<br/>
     * 2. Flat regions are then assigned layer 2, 3 and 4 as they increase in height;<br/>
     * 3. Layer 5 is mixed into all other layers based on gradient to indicate cliffs.<br/>
     * 4. Everything gets a nice big blur, apart from 6 which gets a small blur
     */

    const oob_clamping_heightmap = new sc_edit_view_oob_clamp(data.edit_heightmap);
    // TODO: Grow bounds of flat regions by 100%, keeping them non-overlapping
    const cliff_threshold = 1.0 / data.map.heightmap.scale;
    // TODO: Heightmap size is actually double + 1 texturemap size
    if (data.map.water.has_water) {
      for (let y = 0; y < data.edit_texturemap.height; y++) {
        for (let x = 0; x < data.edit_texturemap.width; x++) {
          // Calculate gradient. Heightmap dimensions are +1 to all, so this works OK
          // TODO: Peaks?
          // TODO: Ignore flat regions below water
          /**
           * Heightmap is much larger than texturemap - eg 257 to 128
           * To take this a simple extreme:
           * 4x4 -> 9x9
           * I should sample [x * 2 - 1, y * 2 -1] to [x * 2 + 1, y * 2 + 1], a total of nine points
           */
          const verts = [oob_clamping_heightmap.get_pixel([x * 2 - 1, y * 2 - 1])[0],
                         oob_clamping_heightmap.get_pixel([x * 2,     y * 2 - 1])[0],
                         oob_clamping_heightmap.get_pixel([x * 2 + 1, y * 2 - 1])[0],
                         oob_clamping_heightmap.get_pixel([x * 2 - 1, y * 2    ])[0],
                         oob_clamping_heightmap.get_pixel([x * 2,     y * 2    ])[0],
                         oob_clamping_heightmap.get_pixel([x * 2 + 1, y * 2    ])[0],
                         oob_clamping_heightmap.get_pixel([x * 2 - 1, y * 2 + 1])[0],
                         oob_clamping_heightmap.get_pixel([x * 2,     y * 2 + 1])[0],
                         oob_clamping_heightmap.get_pixel([x * 2 + 1, y * 2 + 1])[0]];
          const gradient = Math.max(...verts) - Math.min(...verts);
          const height = verts.reduce((sum, term) => sum + term, 0) / verts.length;

          if (height <= data.map.water.elevation_abyss) {
            // Base
            const value = sc_edit_view_methods.make_pixel(data.edit_texturemap.subpixel_count, 0);
            data.edit_texturemap.set_pixel([x,y], value);
          } else if (height <= data.map.water.elevation + 16) {
            // Layer 1 (sand)
            const value = sc_edit_view_methods.make_pixel(data.edit_texturemap.subpixel_count, 0);
            value[1] = data.edit_texturemap.subpixel_max;
            data.edit_texturemap.set_pixel([x,y], value);
          } else {
            // Layer 2 (general terrain - grass/smooth rock etc)
            const value = sc_edit_view_methods.make_pixel(data.edit_texturemap.subpixel_count, 0);
            value[2] = data.edit_texturemap.subpixel_max;
            data.edit_texturemap.set_pixel([x,y], value);
          }

          // Now add in flat regions
          for (let flat_region = 0; flat_region < this.__signals.length; flat_region++) {
            const value = data.edit_texturemap.get_pixel([x,y]);
            value[flat_region + 3] = 1;
          }

          // Layer 6 (cliffs)
          // TBD: This may only mix a tiny amount for marginally non-navigable terrain
          const cliff_scalar = Math.min(1, Math.max(0, (gradient / cliff_threshold) * 2 - 1));
          const value = data.edit_texturemap.get_pixel([x,y]);
          value[6] = (0.5 + 0.5 * cliff_scalar) * data.edit_texturemap.subpixel_max;
          data.edit_texturemap.set_pixel([x,y], value);
        }
      }
    }

    // Finally blur the bejesus out of it
    // Channel 6 is used to indicate cliffs, so receives a small blur
    const snapshot = new sc_edit_view_snapshot(data.edit_texturemap);
    const big_blur_mask = new sc_edit_view_mask(snapshot, [1, 1, 1, 1, 1, 0, 1, 1]);
    const small_blur_mask = new sc_edit_view_mask(snapshot, [0, 0, 0, 0, 0, 1, 0, 0]);

    // Apply a big blur (11x11)
    const big_blur_weights = sc_edit_view_methods.make_pixel(11*11, 1);
    const big_blur_convolution = new sc_edit_view_convolution(big_blur_mask, big_blur_weights, big_blur_weights.length);

    // Apply a small blur (5x5)
    const small_blur_weights = sc_edit_view_methods.make_pixel(5*5, 1);
    const small_blur_convolution = new sc_edit_view_convolution(small_blur_mask, small_blur_weights, small_blur_weights.length);

    // Now apply the blur. Masking and caching work to prevent this affecting ongoing blur calculations
    // and bleeding into masked off channels
    sc_edit_view_methods.set(big_blur_convolution, [0, 0], big_blur_convolution);
    sc_edit_view_methods.set(small_blur_convolution, [0, 0], small_blur_convolution);

  }
}
