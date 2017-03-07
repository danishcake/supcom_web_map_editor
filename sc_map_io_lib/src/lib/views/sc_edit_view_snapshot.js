import {sc_edit_view_base} from "./sc_edit_view"
import {sc_edit_patch} from "./sc_edit_patch"
import {sc_edit_view_methods} from "./sc_edit_view_methods"


/**
 * A lazy snapshot of the underlying view. This creates a snapshot at construction, so that if the underlying
 * view is changed it's original values are still available
 *
 * Writes are passed through to the underlying view, but will not be reflected by calls
 * to get_pixel on the cache
 */
export class sc_edit_view_snapshot extends sc_edit_view_base {
  /**
   * Creates a snapshot with no initial cache tiles
   */
  constructor(inner_view) {
    super(inner_view);
    this.__tilesize = 16;
    this.__tiles = [];
    this.__tilesize2d = [this.__tilesize, this.__tilesize];

    // Initially all tiles are null, indicating no data cached
    for (let y = 0; y < Math.ceil(this.__wrapped_view.height / this.__tilesize); y++) {
      let row = [];
      for (let x = 0; x < Math.ceil(this.__wrapped_view.width / this.__tilesize); x++) {
        row.push(null);
      }
      this.__tiles.push(row);
    }
  }


  /** Gets the width */
  __get_width_impl() { return this.__wrapped_view.width; }


  /** Gets the height  */
  __get_height_impl() { return this.__wrapped_view.height; }


  /** Returns the value of a pixel at the given coordinate */
  __get_pixel_impl(position) {
    // TODO: Reduce duplicate calculations in this
    this.__ensure_cached(position);
    const tile_indices = this.__get_tile_indices(position);
    const position_in_tile = this.__get_position_in_tile(position);
    return this.__tiles[tile_indices[0]][tile_indices[1]].get_pixel(position_in_tile);
  }


  /** Sets the value of a pixel at the given coordinate */
  __set_pixel_impl(position, value) {
    this.__ensure_cached(position);
    this.__wrapped_view.set_pixel(position, value);
  }


  /** Returns the default pixel value (0) */
  __oob_pixel_value_impl(position) { return 0; }

  /** Gets the [x,y] index of the tile corresponding to the pixel position */
  __get_tile_indices(position) {
    return [Math.floor(position[0] / this.__tilesize), Math.floor(position[1] / this.__tilesize)];
  }

  /** Gets the [x,y] pixel coordinate of the start of the tile */
  __get_tile_origin(position) {
    let tile_indices = this.__get_tile_indices(position);
    tile_indices[0] *= this.__tilesize;
    tile_indices[1] *= this.__tilesize;
    return tile_indices;
  }

  /** Gets the [x,y] pixel coordinate of pixel within its tile */
  __get_position_in_tile(position) {
    let tile_origin = this.__get_tile_origin(position);
    return [position[0] - tile_origin[0], position[1] - tile_origin[1]];
  }

  /** Ensures a tile is cached, but makes no change if already cached */
  __ensure_cached(position) {
    const tile_indices = this.__get_tile_indices(position);

    if (!this.__tiles[tile_indices[0]][tile_indices[1]]) {
      const tile_origin = this.__get_tile_origin(position);
      const tile = new sc_edit_patch(this.__tilesize2d);
      sc_edit_view_methods.copy(tile, [0, 0], this.__wrapped_view, tile_origin, this.__tilesize2d);
      this.__tiles[tile_indices[0]][tile_indices[1]] = tile;
    }
  }

  /** Gets the number of stored tiles. Primarily for unit testing */
  get tile_count() {
    let count = 0;
    for (let y = 0; y < Math.ceil(this.__wrapped_view.height / this.__tilesize); y++) {
      for (let x = 0; x < Math.ceil(this.__wrapped_view.width / this.__tilesize); x++) {
        if (this.__tiles[y][x]) {
          count++;
        }
      }
    }

    return count;
  }
}