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
 * Pixels that fall outside src will be ignored
 * @param {sc_edit_view_base} dest Destination view
 * @param {sc_edit_view_base} src Source view
 * @param {position} dest_offset Top-left position in dest that src will be applied to
 * @param {position} src_offset Top-left position in src that forms origin of copying
 * @param {position} size Width and height of region to copy between
 */
let copy = function(dest, dest_offset, src, src_offset, size) {
  const src_w = Math.min(size[0], src.width - src_offset[0]);
  const src_h = Math.min(size[1], src.height - src_offset[1]);

  for (let y = 0; y < src_h; y++) {
    const iy = y + src_offset[1];
    const oy = y + dest_offset[1]
    for (let x = 0; x < src_w; x++) {
      const ix = x + src_offset[0];
      const ox = x + dest_offset[0];
      dest.set_pixel([ox, oy], src.get_pixel([ix, iy]));
    }
  }
}


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


/**
 * Blends two inputs into the output using a third input as weights
 * @param {sc_edit_view_base} dest Destination view
 * @param {position} offset The offset into destionat/src2 to use
 * @param {sc_edit_view_base} src1 A region with which to blend (usually smaller than dest)
 * @param {sc_edit_view_base} src2 The second source to blend with. Typically the same size as dest, or may be dest
 * @param {sc_edit_view_base} weights Weighting array. Should be same size of src1
 */
let weighted_blend = function(dest, offset, src1, src2, weights) {
  for (let iy = 0; iy < src1.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src1.width; ix++) {
      const ox = ix + offset[0];

      const p1 = src1.get_pixel([ix, iy]);
      const p2 = src2.get_pixel([ox, oy]);
      const w =  weights.get_pixel([ix, iy]);

      dest.set_pixel([ox, oy], p1 * w + p2 * (1.0 - w));
    }
  }
};


/**
 * Similar to weighted_blend, but ratchets towards src1. If dest is closer to src1 (in same sign)
 * before application then no change is made to that pixel
 * @param {sc_edit_view_base} dest Destination view
 * @param {position} offset The offset into destionat/src2 to use
 * @param {sc_edit_view_base} src1 A region with which to blend (usually smaller than dest)
 * @param {sc_edit_view_base} src2 The second source to blend with. Typically the same size as dest, or may be dest
 * @param {sc_edit_view_base} weights Weighting array. Should be same size of src1
 */
let ratcheted_weighted_blend = function(dest, offset, src1, src2, weights) {
  for (let iy = 0; iy < src1.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src1.width; ix++) {
      const ox = ix + offset[0];

      const p1 = src1.get_pixel([ix, iy]);
      const p2 = src2.get_pixel([ox, oy]);
      const w =  weights.get_pixel([ix, iy]);
      const candidate = p1 * w + p2 * (1.0 - w);
      const current = dest.get_pixel([ox, oy]);

      const current_delta = current - p1;
      const candidate_delta = candidate - p1;

      if (candidate_delta == 0 ||
          candidate_delta < 0 && candidate_delta > current_delta ||
          candidate_delta > 0 && candidate_delta < current_delta) {
        dest.set_pixel([ox, oy], candidate);
      }
    }
  }
};

/**
 * Fills the inner radius with inner_value, then falls off linearly to outer_value
 * at outer_radius and beyond
 * @param {sc_edit_view_base} dest Destination view
 * @param {number} inner_value The value to use within inner_radius
 * @param {number} inner_radius The inner radius
 * @param {number} outer_value The value to user outside the outer_radius
 * @param {number} outer_radius The outer radius
 */
let radial_fill = function(dest, inner_value, inner_radius, outer_value, outer_radius) {
  // A patch 33 pixels across has centre bin at 16
  const cx = (dest.width - 1) / 2;
  const cy = (dest.height - 1) / 2;

  for (let oy = 0; oy < dest.height; oy++) {
    for (let ox = 0; ox < dest.width; ox++) {
      const r = Math.sqrt((ox - cx) * (ox - cx) + (oy - cy) * (oy - cy));
      if (r < inner_radius) {
        dest.set_pixel([ox, oy], inner_value);
      } else if (r < outer_radius) {
        const interpolated_value = inner_value +  // 1
                                   (outer_value - inner_value) * // -1
                                   ((r - inner_radius) / (outer_radius - inner_radius)); // 1 at outer_radius, 0 at inner_radius
        dest.set_pixel([ox, oy], interpolated_value);
      } else {
        dest.set_pixel([ox, oy], outer_value);
      }
    }
  }
};


const sc_edit_view_methods = {
  fill:                     fill,
  add:                      add,
  sub:                      sub,
  copy:                     copy,
  set:                      set,
  weighted_blend:           weighted_blend,
  ratcheted_weighted_blend: ratcheted_weighted_blend,
  radial_fill:              radial_fill
};

export { sc_edit_view_methods };
