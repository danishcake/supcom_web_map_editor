/**
 * Represents the data passed to editing tool to be operated upon
 */
export class sc_edit_tool_data {
  constructor(edit_heightmap, save_script) {
    this.__edit_heightmap = edit_heightmap;
    this.__save_script = save_script;
  }

  get edit_heightmap() { return this.__edit_heightmap; }
  get save_script() { return this.__save_script; }
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
  }

  get position() { return this.__position; }
  get grid_position() {
    return [ Math.round(this.__position[0]),
             Math.round(this.__position[1]) ]; }
  get shift() { return this.__shift; }
}
