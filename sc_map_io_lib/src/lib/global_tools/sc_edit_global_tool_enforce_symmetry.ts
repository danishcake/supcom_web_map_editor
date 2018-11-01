import { sc_edit_global_tool_base } from './sc_edit_global_tool'
import { sc_edit_view_symmetry } from '../views/sc_edit_view_symmetry'
import { sc_edit_view_methods } from '../views/sc_edit_view_methods'
import { sc_edit_tool_data } from '../tools/sc_edit_tool_args';
import { sc_edit_symmetry_base } from '../sc_edit_symmetry';

/**
 * Enforces a particular symmetry
 */
export class sc_edit_global_tool_enforce_symmetry extends sc_edit_global_tool_base {
  private __symmetry: sc_edit_symmetry_base;

  /**
   * Constructor
   * @param {sc_edit_symmetry_base} symmetry
   */
  constructor(symmetry: sc_edit_symmetry_base) {
    super();
    this.__symmetry = symmetry;
  }

  /**
   * Enforces symmetry
   * @param {sc_edit_tool_data} data
   * @private
   */
  protected __apply_impl(data: sc_edit_tool_data): void {
    const heightmap_view = new sc_edit_view_symmetry(data.edit_heightmap, this.__symmetry);
    const texturemap_view = new sc_edit_view_symmetry(data.edit_texturemap, this.__symmetry);

    sc_edit_view_methods.set(heightmap_view, [0, 0], heightmap_view);
    sc_edit_view_methods.set(texturemap_view, [0, 0], texturemap_view);
  }
}