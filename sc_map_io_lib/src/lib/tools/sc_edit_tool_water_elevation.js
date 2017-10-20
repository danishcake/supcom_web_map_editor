/**
 * Water height tool
 * This tool can affect one of three layers (shallow, deep or abyssal)
 *
 * radius and strength are ignored
 *
 * @property __layer The layer that will be changed
 */
export class sc_edit_tool_water_elevation {
  static get shallow() { return "shallow"; }
  static get deep() { return "deep"; }
  static get abyssal() { return "abyssal"; }

  constructor(layer) {
    this.__active = false;
    this.__layer = layer;
  }


  /** Setter for outer radius */
  set_outer_radius(outer_radius) {}


  /** Setter for inner radius */
  set_inner_radius(inner_radius) {}


  /** Setter for strength */
  set_strength(strength) {}


  /** @type {number} */
  get outer_radius() { return 1; }


  /** @type {number} */
  get inner_radius() { return 1; }


  /**
   * Start function. This can either select a marker, or if the marker is already selected
   * start a move
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  start(data, args) {
    this.__active = true;
    this.apply(data, args);
  }


  /**
   * Apply function. Moves all selected markers once total distance moved exceeds a small
   * threshold
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  apply(data, args) {
    // Enable the water
    data.map.water.has_water = true;

    // Find the depth under the cursor
    const height = data.edit_heightmap.get_pixel(args.heightmap_grid_position)[0] *
                   data.map.heightmap.scale;

    // Set the heights appropriately
    switch(this.__layer) {
      case sc_edit_tool_water_elevation.shallow:
        data.map.water.elevation = height;
        data.map.water.elevation_deep = Math.min(data.map.water.elevation_deep, height);
        data.map.water.elevation_abyss = Math.min(data.map.water.elevation_abyss, height);
        break;

      case sc_edit_tool_water_elevation.deep:
        data.map.water.elevation = Math.max(data.map.water.elevation, height);
        data.map.water.elevation_deep = height;
        data.map.water.elevation_abyss = Math.min(data.map.water.elevation_abyss, height);
        break;

      case sc_edit_tool_water_elevation.abyssal:
        data.map.water.elevation = Math.max(data.map.water.elevation, height);
        data.map.water.elevation_deep = Math.max(data.map.water.elevation_deep, height);
        data.map.water.elevation_abyss = height;
        break;
    }
  }


  /**
   * Finish application of a tool.
   *
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  end(data, args) {
    if (this.__active) {
      this.apply(data, args);
    }
    this.__active = false;
  }
}
