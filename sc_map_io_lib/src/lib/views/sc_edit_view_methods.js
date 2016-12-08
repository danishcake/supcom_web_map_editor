/**
 * Contains methods for manipulating views
 */

 /**
 * Fills the entire destination with a single value - glorified memset :(
 * @param {sc_edit_view_base} dest Destination view
 * @param {number} value Value with which to fill
 */
let fill = function(dest, value) {
  for (let oy = 0; oy < dest.height; oy++) {
    for (let ox = 0; ox < dest.width; ox++) {
      dest.set_pixel([ox, oy], value);
    }
  }
};


/**
 * Adds each pixel in src to the corresponding pixel in dest.
 * Pixels that fall outside dest will be ignored
 * @param {sc_edit_view_base} dest Destination view
 * @param {sc_edit_view_base} src Source view
 * @param {position} offset Top-left position in dest that src will be applied to
 */
let add = function(dest, offset, src) {
  for (let iy = 0; iy < src.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src.width; ix++) {
      const ox = ix + offset[0];
      dest.set_pixel([ox, oy], dest.get_pixel([ox, oy]) + src.get_pixel([ix, iy]));
    }
  }
};


/**
 * Subtracts each pixel in src from the corresponding pixel in dest.
 * Pixels that fall outside dest will be ignored
 * @param {sc_edit_view_base} dest Destination view
 * @param {sc_edit_view_base} src Source view
 * @param {position} offset Top-left position in dest that src will be applied to
 */
let sub = function(dest, offset, src) {
  for (let iy = 0; iy < src.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src.width; ix++) {
      const ox = ix + offset[0];
      dest.set_pixel([ox, oy], dest.get_pixel([ox, oy]) - src.get_pixel([ix, iy]));
    }
  }
};


/**
 * Sets each pixel in dest to the corresponding pixel in src.
 * Pixels that fall outside dest will be ignored
 * @param {sc_edit_view_base} dest Destination view
 * @param {sc_edit_view_base} src Source view
 * @param {position} offset Top-left position in dest that src will be applied to
 */
let set = function(dest, offset, src) {
  for (let iy = 0; iy < src.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src.width; ix++) {
      const ox = ix + offset[0];
      dest.set_pixel([ox, oy], src.get_pixel([ix, iy]));
    }
  }
};

const sc_edit_view_methods = {
  fill: fill,
  add:  add,
  sub:  sub,
  set:  set
};

export { sc_edit_view_methods };
