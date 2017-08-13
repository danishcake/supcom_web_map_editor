/**
 * Contains type definitions for types that have no real home
 */

/**
 * @typedef sc_point
 * @type {number[]}
 * An array of two numbers [x,y]
 */

/**
 * @typedef sc_vec2
 * @type {number[]}
 * An array of two numbers [x,y]
 */

/**
 * @typedef sc_vec3
 * @type {number[]}
 * An array of three numbers [x,y,z]
 */

/**
 * @typedef sc_vec4
 * @type {number[]}
 * An array of three numbers [x,y,z,w]
 */

/**
 * @typedef sc_pixel
 * @type {number[]}
 * An array of numbers, each representing a subpixel or colour channel
 * Typically 1 element for heightmaps or 8 elements for texturemaps
 */

/**
 * @typedef sc_map_size
 * @type {number}
 * @property {number} 0 Tiny 5x5
 * @property {number} 1 Small 10x10
 * @property {number} 2 Medium 20x20
 * @property {number} 3 Large 40x40
 * @property {number} 4 Huge 80x80
 */

/**
 * @typedef sc_map_args
 * @type {object}
 * @member {string} name The name of the map
 * @member {string} author The author
 * @member {string} description A brief description of the map
 * @member {sc_map_size} size The size of the map
 * @member {number} default_height A uint16 with the initial height
 */