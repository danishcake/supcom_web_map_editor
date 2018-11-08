/**
 * Contains type definitions for types that have no real home
 */
export enum sc_map_size {
  tiny = 0,     // Tiny 5x5
  small = 1,    // Small 10x10
  medium = 2,   // Medium 20x20
  large = 3,    // Large 40x40
  huge = 4      // Huge 80x80
}


/**
 * Defines the fields used to create a new map
 */
export interface sc_map_args {
  name: string;
  author: string;
  description: string;
  size: sc_map_size;
  default_height: number;
}
