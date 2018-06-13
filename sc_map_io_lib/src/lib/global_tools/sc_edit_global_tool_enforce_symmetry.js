import {sc_edit_global_tool_base} from './sc_edit_global_tool'
import {sc_edit_view_symmetry} from '../views/sc_edit_view_symmetry'

/**
 * Enforces a particular symmetry
 */
export class sc_edit_global_tool_enforce_symmetry extends sc_edit_global_tool_base {
  /**
   * Constructor
   * @param {sc_edit_symmetry_base} symmetry
   */
  constructor(symmetry) {
    super();
    this.symmetry = symmetry;
  }

  /**
   * Enforces symmetry
   * @param {sc_edit_tool_data} data
   * @private
   */
  __apply_impl(data) {
    const heightmap_view = new sc_edit_view_symmetry(data.edit_heightmap, this.symmetry);
    const texturemap_view = new sc_edit_view_symmetry(data.edit_texturemap, this.symmetry);

    for (let view of [heightmap_view, texturemap_view]) {
      for (let y = 0; y < view.height; y++) {
        for (let x = 0; x < view.width; x++) {
          const p = [x, y];
          view.set_pixel(p, view.get_pixel(p));
        }
      }
    }
  }
}