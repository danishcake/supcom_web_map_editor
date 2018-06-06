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

/**
 * Calculates a log domain histogram of the specified view.
 * Each subpixel has a histogram calculated, so the result is returned as an array
 * even if there is only one subpixel
 * @param {sc_edit_view_base} src The view
 */
let calculate_histogram = function(src) {
  const result = [];

  // Create histogram storage
  for (let subpixel = 0; subpixel < src.subpixel_count; subpixel++) {
    const histogram = new Array(src.subpixel_max + 1);
    histogram.fill(0);
    result.push(histogram);
  }


  // Builds linear histogram
  const h = src.height;
  const w = src.width;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const value = src.get_pixel([x,y]);
      for (let subpixel = 0; subpixel < src.subpixel_count; subpixel++) {
        // TBD: I don't think we need to apply any clamping here but I could be wrong!
        const bin = Math.floor(value[subpixel]);
        result[subpixel][bin]++;
      }
    }
  }

  // Transform into log domain
  for (let subpixel = 0; subpixel < src.subpixel_count; subpixel++) {
    for (let i = 0; i < result[subpixel].length; i++) {
      result[subpixel][i] = Math.log1p(result[subpixel][i]);
    }
  }

  return result;
};

/**
 * Extracts the peaks from a histogram
 * @param {Array<number>} histogram
 * @param {number} signals_to_find The number of singals to attempt to find
 * @param {number} min_bin The bin at which to start looking (eg to avoid looking under water)
 * @returns {Array.<*>} Array of not more than signals_to_find signals, defined by {left_edge, right_edge, population}.
 * The returned signals will be sorted so that the highest population signals are returned first
 */
let find_histogram_signals = (histogram, signals_to_find, min_bin) => {
  // Operate on bins above the min_bin
  min_bin = Math.round(min_bin);

  // We're going to calculate this only counting non-zero cells as most bins are unoccupied
  // TBD: Does this work better if the range is max_bin - min_bin?
  const occupied_bin_count = histogram.map(term => term !== 0 ? 1 : 0)
    .reduce((sum, term) => sum + term);

  // Early exit if occupied bins will be empty
  if (occupied_bin_count === 0) {
    return [];
  }

  // Calculate the mean population (which is less trivial than it sounds due to log domain)
  const mean = histogram.reduce((sum, term) => sum + term) / occupied_bin_count;
  // TBD: Check I can still remember how to calculate standard deviation!
  const sd = Math.sqrt(histogram.reduce((sum, term) => sum + Math.pow(term - mean, 2))) / occupied_bin_count;

  // Now walk the bins. Any time the population changes by 1sd declare an edge start
  // Any time it drops by 1sd declare an edge end

  let theshold_scalar = 0;
  let best_result = []; // We'll keep increasing the threshold until we have too few results, then return the previous result
  let merged_signals = [];

  do {
    best_result = [...merged_signals];

    const threshold_change = sd * theshold_scalar;
    const threshold_down = Math.max(0, mean + threshold_change);
    const threshold_up = mean + threshold_change;
    let left_edge = -1;
    const signals = [];
    merged_signals = [];

    for (let i = 0; i < histogram.length; i++) {
      if (left_edge === -1) {
        if (histogram[i] >= threshold_up) {
          left_edge = i;
        }
      } else {
        // TBD: Detect right edge if this persists for N steps?
        if (histogram[i] <= threshold_down) {
          const right_edge = i;
          const population = Math.log1p(histogram.slice(left_edge, right_edge)
            .map(p => Math.expm1(p))
            .reduce((sum, term) => sum + term));
          signals.push({left_edge, right_edge, population});
          left_edge = -1;
        }
      }
    }
    theshold_scalar += 0.1;

    // If left edge and right edge are closer than some small threshold (eg 5 bins) merge them
    // FIXME: Potential bounds checking falls over here
    merged_signals.push(signals[0]);
    for (let i = 1; i < signals.length; i++) {
      if (merged_signals[merged_signals.length - 1].right_edge + 5 > signals[i].left_edge) {
        merged_signals[merged_signals.length - 1].right_edge = signals[i].right_edge;
        merged_signals[merged_signals.length - 1].population = Math.log1p(
          Math.expm1(merged_signals[merged_signals.length - 1].population) + Math.expm1(signals[i].population));
      } else {
        merged_signals.push(signals[i]);
      }
    }

    // Ignore signals that overlap min_bin
    merged_signals = merged_signals.filter(signal => signal.left_edge > min_bin);
  } while (merged_signals.length > signals_to_find);

  // Add the minimum bin back on to the results and sort by population
  return best_result.sort((lhs, rhs) => rhs.population - lhs.population);
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
  radial_fill:              radial_fill,
  calculate_histogram:      calculate_histogram,
  find_histogram_signals:   find_histogram_signals
};

export { sc_edit_view_methods };
