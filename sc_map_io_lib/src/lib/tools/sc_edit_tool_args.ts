import { sc_edit_heightmap } from "../sc_edit_heightmap";
import { sc_edit_texturemap } from "../sc_edit_texturemap";
import { sc_script_save } from "../sc_script";
import { sc_edit_view_base } from "../views/sc_edit_view";
import { sc_map } from "../sc_map";
import { sc_vec2 } from "../sc_vec";
import { sc_edit_symmetry_base } from "../sc_edit_symmetry";

/**
 * Represents the data passed to editing tool to be operated upon
 */
export class sc_edit_tool_data {
  private __edit_heightmap: sc_edit_heightmap;
  private __edit_texturemap: sc_edit_texturemap;
  private __save_script: sc_script_save;
  private __map: sc_map;
  private __target: sc_edit_view_base;

  constructor(edit_heightmap: sc_edit_heightmap,
              edit_texturemap: sc_edit_texturemap,
              save_script: sc_script_save,
              target_view: sc_edit_view_base,
              map: sc_map) {
    this.__edit_heightmap = edit_heightmap;
    this.__edit_texturemap = edit_texturemap;
    this.__save_script = save_script;
    this.__map = map;

    // Primary target defaults to heightmap, but can be overridden
    this.__target = target_view || edit_heightmap || edit_texturemap;
  }

  /** @return {sc_edit_heightmap} */
  public get edit_heightmap(): sc_edit_heightmap { return this.__edit_heightmap; }

  /** @return {sc_edit_texturemap} */
  public get edit_texturemap(): sc_edit_texturemap { return this.__edit_texturemap; }

  /** @return {sc_edit_view_base} */
  public get target(): sc_edit_view_base { return this.__target; }

  /** @param {sc_edit_view_base} value */
  public set target(value: sc_edit_view_base) { this.__target = value; }

  /** @return {sc_script_save} */
  public get save_script(): sc_script_save { return this.__save_script; }

  /** @return {sc_map} */
  public get map(): sc_map { return this.__map; }
}


/**
 * Represents the data passed to an editing tool defining where and
 * how it should be applied
 */
export class sc_edit_tool_args {
  static get modifier_none() { return 0; }
  static get modifier_shift() { return 1; }

  private __position: sc_vec2;
  private __shift: boolean;
  private __heightmap_target: boolean;
  private __symmetry: sc_edit_symmetry_base;

  constructor(position: sc_vec2, modifiers: number, symmetry: sc_edit_symmetry_base) {
    this.__position = position;
    this.__shift = (modifiers & sc_edit_tool_args.modifier_shift) !== 0;
    this.__heightmap_target = true;
    this.__symmetry = symmetry;

  }

  /**
   * Returns the position to apply the tool on the heightmap
   * @return {sc_vec2}
   */
  public get heightmap_position(): sc_vec2 {
    return this.__position;
  }

  /**
   * Returns the position to apply the tool on the texturemap, which is half the size of
   * the heightmap
   * @return {sc_vec2}
   */
  public get texturemap_position(): sc_vec2 {
    return [ this.__position[0] / 2,
             this.__position[1] / 2 ];
  }

  /**
   * Returns the grid position (eg integer components) to apply the tool on the heightmap
   * @return {sc_vec2}
   */
  public get heightmap_grid_position(): sc_vec2 {
    return [ Math.round(this.__position[0]),
             Math.round(this.__position[1]) ];
  }

  /**
   * Returns the grid position (eg integer components) to apply the tool on the texturemap,
   * which is half the size of the heightmap
   * @return {sc_vec2}
   */
  public get texturemap_grid_position(): sc_vec2 {
    return [ Math.round(this.__position[0] / 2),
             Math.round(this.__position[1] / 2) ];
  }

  /**
   * Returns the position to apply a tool. This will be either texturemap_position or heightmap_position depending on
   * the value of __heightmap_target
   * @return {sc_vec2}
   */
  public get position(): sc_vec2 {
    if (this.__heightmap_target) {
      return this.heightmap_position;
    } else {
      return this.texturemap_position;
    }
  }

  /**
   * Returns the position to apply a tool. This will be either texturemap_grid_position or heightmap_grid_position
   * depending on the value of __heightmap_target
   * @return {sc_vec2}
   */
  public get grid_position(): sc_vec2 {
    if (this.__heightmap_target) {
      return this.heightmap_grid_position;
    } else {
      return this.texturemap_grid_position;
    }
  }

  public get shift(): boolean { return this.__shift; }

  /**
   * Sets the heightmap target flag. If true this will scale positions for heightmaps. If false
   * the scale for texturemaps will be used.
   *
   * This is determined by comparing targets, which are commonly null in unit tests.
   * If there is insufficient information to determine which target to use heightmap is assumed
   * @param {sc_edit_view_base} target The primary target for the tool
   * @param {sc_edit_view_base} heightmap_target The heightmap target
   * @param {sc_edit_view_base} texturemap_target The texturemap target
   *
   */
  public set_target(target: sc_edit_view_base,
                    heightmap_target: sc_edit_view_base,
                    texturemap_target: sc_edit_view_base): void {
    if (target && heightmap_target && target.width === heightmap_target.width) {
      this.__heightmap_target = true;
    } else if (target && texturemap_target && target.width === texturemap_target.width) {
      this.__heightmap_target = false;
    } else {
      this.__heightmap_target = true;
    }
  }

  /**
   * Gets the current symmetry mode. This is usually only of interest
   * to the marker tools, as the other tools can rely on the symmetry view target
   */
  public get symmetry(): sc_edit_symmetry_base { return this.__symmetry; }
}
