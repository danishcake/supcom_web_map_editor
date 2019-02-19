import { sc_edit_tool_base } from "./sc_edit_tool";
import { sc_edit_tool_data, sc_edit_tool_args } from "./sc_edit_tool_args";

export enum water_depth {
  shallow,
  deep,
  abyssal
}

/**
 * Water height tool
 * This tool can affect one of three layers (shallow, deep or abyssal)
 *
 * radius and strength are ignored
 *
 * @property __layer The layer that will be changed
 */
export class sc_edit_tool_water_elevation extends sc_edit_tool_base {
  private __layer: water_depth;

  constructor(layer: water_depth) {
    super(1, 1, 1);
    this.__layer = layer;
  }


  /**
   * Set the water depth to the depth at the cursor position
   * This uses the full apply method, as we don't want interpolation and we do want access to both
   * targets
   */
  public apply(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Enable the water
    data.map.water.has_water = true;

    // Find the depth under the cursor
    const height = data.edit_heightmap.get_pixel(args.heightmap_grid_position)[0] *
                   data.map.heightmap.scale;

    // Set the heights appropriately
    switch(this.__layer) {
      case water_depth.shallow:
        data.map.water.elevation = height;
        data.map.water.elevation_deep = Math.min(data.map.water.elevation_deep, height);
        data.map.water.elevation_abyss = Math.min(data.map.water.elevation_abyss, height);
        break;

      case water_depth.deep:
        data.map.water.elevation = Math.max(data.map.water.elevation, height);
        data.map.water.elevation_deep = height;
        data.map.water.elevation_abyss = Math.min(data.map.water.elevation_abyss, height);
        break;

      case water_depth.abyssal:
        data.map.water.elevation = Math.max(data.map.water.elevation, height);
        data.map.water.elevation_deep = Math.max(data.map.water.elevation_deep, height);
        data.map.water.elevation_abyss = height;
        break;
    }
  }

  /**
   * Call into apply when start called
   * This mimics the behaviour of the base tool, where __apply_impl is called on start
   */
  public start(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    this.apply(data, args);
  }
}
