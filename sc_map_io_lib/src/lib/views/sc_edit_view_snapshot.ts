import { sc_edit_view_base } from "./sc_edit_view"
import { sc_edit_patch } from "./sc_edit_patch"
import { sc_edit_view_methods } from "./sc_edit_view_methods"
import { sc_vec2, sc_pixel } from "../sc_vec";
import { sc_edit_view_passthrough } from "./sc_edit_view_passthrough";


/**
 * A lazy snapshot of the underlying view. This creates a snapshot when a pixel is read, so that if the underlying
 * view is changed it's original values are still available. The snapshot is lazy, so you must access a pixel before it
 * will exhibit this caching behaviour.
 *
 * Writes are passed through to the underlying view, but will not be reflected by calls
 * to get_pixel on the cache
 */
export class sc_edit_view_snapshot extends sc_edit_view_passthrough {
  private __tilesize: number;
  private __tiles: sc_edit_view_base[][];
  private __tilesize2d: sc_vec2;

  /**
   * Creates a snapshot with no initial cache tiles
   */
  constructor(wrapped_view: sc_edit_view_base) {
    super(wrapped_view);

    this.__tilesize = 16;
    this.__tiles = [];
    this.__tilesize2d = [this.__tilesize, this.__tilesize];

    // Initially all tiles are null, indicating no data cached
    for (let y = 0; y < Math.ceil(this.__wrapped_view.height / this.__tilesize); y++) {
      let row: sc_edit_view_base[] = new Array<sc_edit_view_base>(Math.ceil(this.__wrapped_view.width / this.__tilesize));
      this.__tiles.push(row);
    }
  }


  /** Returns the value of a pixel at the given coordinate */
  protected __get_pixel_impl(position: sc_vec2): sc_pixel {
    // TODO: Reduce duplicate calculations in this
    this.__ensure_cached(position);
    const tile_indices = this.__get_tile_indices(position);
    const position_in_tile = this.__get_position_in_tile(position);
    return this.__tiles[tile_indices[0]][tile_indices[1]].get_pixel(position_in_tile);
  }


  /** Sets the value of a pixel at the given coordinate */
  protected __set_pixel_impl(position: sc_vec2, value: sc_pixel): void {
    this.__ensure_cached(position);
    this.__wrapped_view.set_pixel(position, value);
  }


  /** Gets the [x,y] index of the tile corresponding to the pixel position */
  private __get_tile_indices(position: sc_vec2): sc_vec2 {
    return [Math.floor(position[0] / this.__tilesize), Math.floor(position[1] / this.__tilesize)];
  }


  /** Gets the [x,y] pixel coordinate of the start of the tile */
  private __get_tile_origin(position: sc_vec2): sc_vec2 {
    let tile_indices = this.__get_tile_indices(position);
    tile_indices[0] *= this.__tilesize;
    tile_indices[1] *= this.__tilesize;
    return tile_indices;
  }


  /** Gets the [x,y] pixel coordinate of pixel within its tile */
  private __get_position_in_tile(position: sc_vec2): sc_vec2 {
    let tile_origin = this.__get_tile_origin(position);
    return [position[0] - tile_origin[0], position[1] - tile_origin[1]];
  }


  /** Ensures a tile is cached, but makes no change if already cached */
  private __ensure_cached(position: sc_vec2): void {
    const tile_indices = this.__get_tile_indices(position);

    if (!this.__tiles[tile_indices[0]][tile_indices[1]]) {
      const tile_origin = this.__get_tile_origin(position);
      const tile = new sc_edit_patch(this.__tilesize2d, this.subpixel_count, this.subpixel_max);
      sc_edit_view_methods.copy(tile, [0, 0], this.__wrapped_view, tile_origin, this.__tilesize2d);
      this.__tiles[tile_indices[0]][tile_indices[1]] = tile;
    }
  }

  /**
   * Adds the entire wrapped view to the cache, disabling lazy caching
   */
  cache_everything(): void {
    // Initially all tiles are null, indicating no data cached
    for (let y = 0; y < Math.ceil(this.__wrapped_view.height / this.__tilesize); y++) {
      for (let x = 0; x < Math.ceil(this.__wrapped_view.width / this.__tilesize); x++) {
        this.__ensure_cached([x, y])
      }
    }
  }


  /** Gets the number of stored tiles. Primarily for unit testing */
  get tile_count(): number {
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
