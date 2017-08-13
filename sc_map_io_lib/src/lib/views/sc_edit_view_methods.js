/**
 * Contains methods for manipulating views
 */


/**
 * Makes a pixel of given channel depth and fills it with the specified value
 * @param {number} subpixel_count The number of subpixels/channels
 * @param {number} value The value to fill each pixel with
 * @return {array} An array filled with subpixel_count instance of value
 */
let make_pixel = function(subpixel_count, value) {
  const result = [];
  for (let i = 0; i < subpixel_count; i++) {
    result.push(value);
  }
  return result;
};


 /**
 * Fills the entire destination with a single value - glorified memset :(
 * @param {sc_edit_view_base} dest Destination view
 * @param {number} value Value with which to fill
 */
let fill = function(dest, value) {
  if (dest.subpixel_count != value.length) {
    throw new Error(`Inconsistent subpixel_count in fill(dest[${dest.subpixel_count}], value[${value.length}])`);
  }

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
  if (dest.subpixel_count != src.subpixel_count) {
    throw new Error(`Inconsistent subpixel_count in add(dest[${dest.subpixel_count}], src[${src.subpixel_count}])`);
  }

  for (let iy = 0; iy < src.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src.width; ix++) {
      const ox = ix + offset[0];
      const a = dest.get_pixel([ox, oy]);
      const b = src.get_pixel([ix, iy])
      for (let i = 0; i < a.length; i++) {
        a[i] += b[i];
      }

      dest.set_pixel([ox, oy], a);
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
  if (dest.subpixel_count != src.subpixel_count) {
    throw new Error(`Inconsistent subpixel_count in sub(dest[${dest.subpixel_count}], src[${src.subpixel_count}])`);
  }

  for (let iy = 0; iy < src.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src.width; ix++) {
      const ox = ix + offset[0];
      const a = dest.get_pixel([ox, oy]);
      const b = src.get_pixel([ix, iy]);
      for (let i = 0; i < a.length; i++) {
        a[i] -= b[i];
      }
      dest.set_pixel([ox, oy], a);
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
  if (dest.subpixel_count != src.subpixel_count) {
    throw new Error(`Inconsistent subpixel_count in copy(dest[${dest.subpixel_count}], src[${src.subpixel_count}])`);
  }

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
  if (dest.subpixel_count != src.subpixel_count) {
    throw new Error(`Inconsistent subpixel_count in set(dest[${dest.subpixel_count}], src[${src.subpixel_count}])`);
  }

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
  if (dest.subpixel_count != src1.subpixel_count ||
      dest.subpixel_count != src2.subpixel_count ||
      dest.subpixel_count != weights.subpixel_count) {
    throw new Error(`Inconsistent subpixel_count in weighted_blend(dest[${dest.subpixel_count}], src1[${src.subpixel_count}], src2[${src.subpixel_count}], weights[${src.subpixel_count}])`);
  }

  for (let iy = 0; iy < src1.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src1.width; ix++) {
      const ox = ix + offset[0];

      const p1 = src1.get_pixel([ix, iy]);
      const p2 = src2.get_pixel([ox, oy]);
      const w =  weights.get_pixel([ix, iy]);
      for (let i = 0; i < p1.length; i++) {
        p1[i] = p1[i] * w[i] + p2[i] * (1.0 - w[i]);
      }

      dest.set_pixel([ox, oy], p1);
    }
  }
};


/**
 * Similar to weighted_blend, but ratchets towards src1. If dest is closer to src1 (in same sign)
 * before application then no change is made to that pixel. This determination is made at the
 * sub-pixel level.
 * @param {sc_edit_view_base} dest Destination view
 * @param {position} offset The offset into destionat/src2 to use
 * @param {sc_edit_view_base} src1 A region with which to blend (usually smaller than dest)
 * @param {sc_edit_view_base} src2 The second source to blend with. Typically the same size as dest, or may be dest
 * @param {sc_edit_view_base} weights Weighting array. Should be same size of src1
 */
let ratcheted_weighted_blend = function(dest, offset, src1, src2, weights) {
  if (dest.subpixel_count != src1.subpixel_count ||
      dest.subpixel_count != src2.subpixel_count ||
      dest.subpixel_count != weights.subpixel_count) {
    throw new Error(`Inconsistent subpixel_count in ratcheted_weighted_blend(dest[${dest.subpixel_count}], src1[${src.subpixel_count}], src2[${src.subpixel_count}], weights[${src.subpixel_count}])`);
  }

  for (let iy = 0; iy < src1.height; iy++) {
    const oy = iy + offset[1];
    for (let ix = 0; ix < src1.width; ix++) {
      const ox = ix + offset[0];

      const p1 = src1.get_pixel([ix, iy]);
      const p2 = src2.get_pixel([ox, oy]);
      const w =  weights.get_pixel([ix, iy]);
      const current = dest.get_pixel([ox, oy]);

      for (let i = 0; i < current.length; i++) {
        const candidate = p1[i] * w[i] + p2[i] * (1.0 - w[i]);
        const current_delta = current[i] - p1[i];
        const candidate_delta = candidate - p1[i];

        if (candidate_delta == 0 ||
            (candidate_delta < 0 && candidate_delta > current_delta) ||
            (candidate_delta > 0 && candidate_delta < current_delta)) {
          current[i] = candidate;
        }
      }

      dest.set_pixel([ox, oy], current);
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
  if (dest.subpixel_count != inner_value.length ||
      dest.subpixel_count != outer_value.length) {
    throw new Error(`Inconsistent subpixel_count in radial_fill(dest[${dest.subpixel_count}], inner_radius[${inner_radius.length}], outer_radius[${outer_radius.length}])`);
  }

  // A patch 33 pixels across has centre bin at 16
  const cx = (dest.width - 1) / 2;
  const cy = (dest.height - 1) / 2;
  // Obtain a scratch area of correct dimensions, value not actually used
  const interpolated_value = make_pixel(dest.subpixel_count, 0);

  for (let oy = 0; oy < dest.height; oy++) {
    for (let ox = 0; ox < dest.width; ox++) {
      const r = Math.sqrt((ox - cx) * (ox - cx) + (oy - cy) * (oy - cy));
      if (r < inner_radius) {
        dest.set_pixel([ox, oy], inner_value);
      } else if (r < outer_radius) {
        for (let i = 0; i < interpolated_value.length; i++) {
          interpolated_value[i] = inner_value[i] +  // 1
                                  (outer_value[i] - inner_value[i]) * // -1
                                  ((r - inner_radius) / (outer_radius - inner_radius)); // 1 at outer_radius, 0 at inner_radius
        }
        dest.set_pixel([ox, oy], interpolated_value);
      } else {
        dest.set_pixel([ox, oy], outer_value);
      }
    }
  }
};


const sc_edit_view_methods = {
  make_pixel:               make_pixel,
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
