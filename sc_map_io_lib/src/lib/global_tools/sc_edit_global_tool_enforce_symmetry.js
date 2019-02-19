import {sc_edit_global_tool_base} from './sc_edit_global_tool'
import {sc_edit_view_symmetry} from '../views/sc_edit_view_symmetry'
import {sc_edit_view_methods} from '../views/sc_edit_view_methods'

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

    sc_edit_view_methods.set(heightmap_view, [0, 0], heightmap_view);
    sc_edit_view_methods.set(texturemap_view, [0, 0], texturemap_view);
  }
}