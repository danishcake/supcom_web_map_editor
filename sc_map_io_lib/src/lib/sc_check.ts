/**
 * Some basic assert functions for sanity checking input
 * Usage:
 * check.equal(A, B, "A != B, OH NOES"); // Throws an error if A != B
 */
import * as _ from "underscore";

let check = {
  equal: function<T>(expected: T, found: T, message: string): void {
    if (expected !== found) {
       throw new Error(`${message} (required ${expected} found ${found})`);
    }
  },

  not_equal: function<T>(expected: T, found: T, message: string): void {
    if (expected === found) {
       throw new Error(`${message} (must not be ${expected})`);
    }
  },

  between: function(minimum: number, maximum: number, found: number, message: string): void {
    if (found < minimum || found > maximum) {
       throw new Error(`${message} (${found} not between ${minimum} and ${maximum})`);
    }
  },

  one_of: function<T>(values: T[], found: T, message: string): void {
    if (!_.contains(values, found)) {
      let values_str = _.reduce(values, (memo: string, it: T) => { return `${memo}, ${it}`; });
      throw new Error(`${message} (${found} not in ${values_str})`)
    }
  },

  bits_set: function(value: number, bits: number, message: string): void {
    if ((value & bits) !== bits) {
      throw new Error(`${message} (not all bits of ${bits} set in ${value})`)
    }
  },

  bits_not_set: function(value: number, bits: number, message: string): void {
    if ((value & bits) !== 0) {
      throw new Error(`${message} (one or more bits of ${bits} set in ${value})`)
    }
  },

  type_is(expected_type: "string" | "number" | "boolean" | "symbol" | "undefined" | "object" | "function",
          value: any,
          message: string): void {
    if (!(typeof value === expected_type)) {
      throw new Error(`${message} (type of value is ${typeof value} not ${expected_type})`);
    }
  }
};

export default check;