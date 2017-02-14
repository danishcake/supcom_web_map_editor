/**
 * Some basic assert functions for sanity checking input
 * Usage:
 * check.equal(A, B, "A != B, OH NOES"); // Throws an error if A != B
 */
import {_} from "underscore";

let check = {
  equal: function(expected, found, message) {
    if (expected !== found) {
       throw new Error(`${message} (required ${expected} found ${found})`);
    }
  },

  between: function(minimum, maximum, found, message) {
    if (found < minimum || found > maximum) {
       throw new Error(`${message} (${found} not between ${minimum} and ${maximum})`);
    }
  },

  one_of: function(values, found, message) {
    if (!_.contains(values, found)) {
      let values_str = _.reduce(values, (memo, it) => { memo = `${memo}, ${it}`; });
      throw new Error(`${message} (${found} not in ${values_str})`)
    }
  },

  bits_set: function(value, bits, message) {
    if ((value & bits) !== bits) {
      throw new Error(`${message} (not all bits of ${bits} set in ${value})`)
    }
  },

  bits_not_set: function(value, bits, message) {
    if ((value & bits) !== 0) {
      throw new Error(`${message} (one or more bits of ${bits} set in ${value})`)
    }
  },

  type_is(expected_type, object, message) {
    if (!(typeof object === expected_type)) {
      throw new Error(`${message} (type of object is ${typeof object} not ${expected_type})`);
    }
  }
};

export default check;