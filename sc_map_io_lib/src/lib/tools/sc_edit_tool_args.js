/**
 * Represents the data passed to editing tool to be operated upon
 */
export class sc_edit_tool_data {
  constructor(edit_heightmap, edit_texturemap, save_script, target_view, map) {
    this.__edit_heightmap = edit_heightmap;
    this.__edit_texturemap = edit_texturemap;
    this.__save_script = save_script;
    this.__map = map;

    // Primary target defaults to heightmap, but can be overridden
    this.__target = target_view || edit_heightmap || edit_texturemap;
  }

  /** @return {sc_edit_view_base} */
  get edit_heightmap() { return this.__edit_heightmap; }

  /** @return {sc_edit_view_base} */
  get edit_texturemap() { return this.__edit_texturemap; }

  /** @return {sc_edit_view_base} */
  get target() { return this.__target; }
  /** @param {sc_edit_view_base} value */
  set target(value) { this.__target = value; }

  /** @return {sc_script_save} */
  get save_script() { return this.__save_script; }

  /** @return {sc_map} */
  get map() { return this.__map; }
}


/**
 * Represents the data passed to an editing tool defining where and
 * how it should be applied
 */
export class sc_edit_tool_args {
  static get modifier_none() { return 0; }
  static get modifier_shift() { return 1; }

  constructor(position, modifiers) {
    this.__position = position;
    this.__shift = (modifiers & sc_edit_tool_args.modifier_shift) !== 0;
    this.__heightmap_target = true;
  }

  /**
   * Returns the position to apply the tool on the heightmap
   * @return {sc_vec2}
   */
  get heightmap_position() {
    return this.__position;
  }

  /**
   * Returns the position to apply the tool on the texturemap, which is half the size of
   * the heightmap
   * @return {sc_vec2}
   */
  get texturemap_position() {
    return [ this.__position[0] / 2,
             this.__position[1] / 2 ];
  }

  /**
   * Returns the grid position (eg integer components) to apply the tool on the heightmap
   * @return {sc_vec2}
   */
  get heightmap_grid_position() {
    return [ Math.round(this.__position[0]),
             Math.round(this.__position[1]) ];
  }

  /**
   * Returns the grid position (eg integer components) to apply the tool on the texturemap,
   * which is half the size of the heightmap
   * @return {sc_vec2}
   */
  get texturemap_grid_position() {
    return [ Math.round(this.__position[0] / 2),
             Math.round(this.__position[1] / 2) ];
  }

  /**
   * Returns the position to apply a tool. This will be either texturemap_position or heightmap_position depending on
   * the value of __heightmap_target
   * @return {sc_vec2}
   */
  get position() {
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
  get grid_position() {
    if (this.__heightmap_target) {
      return this.heightmap_grid_position;
    } else {
      return this.texturemap_grid_position;
    }
  }

  get shift() { return this.__shift; }

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
  set_target(target, heightmap_target, texturemap_target) {
    if (target && heightmap_target && target.width === heightmap_target.width) {
      this.__heightmap_target = true;
    } else if (target && texturemap_target && target.width === texturemap_target.width) {
      this.__heightmap_target = false;
    } else {
      this.__heightmap_target = true;
    }
  }
}
