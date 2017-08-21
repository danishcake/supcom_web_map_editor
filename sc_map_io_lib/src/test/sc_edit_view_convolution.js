import { sc_edit_patch } from '../lib/views/sc_edit_patch';
import { sc_edit_view_convolution } from '../lib/views/sc_edit_view_convolution';
import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods';
const assert = require('chai').assert;

describe('sc_edit_view_convolution', function() {
  it('should throw if passed invalid array size', function () {
    const patch = new sc_edit_patch([128, 128], 1, 255);
    for (let i = 1; i < 99; i += 2) {
      new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(i * i, 1));
    }

    assert.throws(() => new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(2, 1)));
    assert.throws(() => new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(3, 1)));
    assert.throws(() => new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(4, 1)));
    assert.throws(() => new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(6, 1)));
    assert.throws(() => new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(7, 1)));
    assert.throws(() => new sc_edit_view_convolution(patch, sc_edit_view_methods.make_pixel(8, 1)));
  });


  it('should return convolution of pixels', function() {
    const patch = new sc_edit_patch([128, 128], 1, 255);
    const conv = new sc_edit_view_convolution(patch, [-1, -1, -1, -1, 9, -1, -1, -1, -1]);
    patch.set_pixel([10, 10], [10]);

    assert.closeTo(conv.get_pixel([5,   5])[0], 0,  0.0001);
    assert.closeTo(conv.get_pixel([15, 15])[0], 0,  0.0001);
    assert.closeTo(conv.get_pixel([10, 10])[0], 90, 0.0001);
    assert.closeTo(conv.get_pixel([9,  10])[0], 0,  0.0001); // Actual calculated value is -10, but clamped
  });


  it('should exclude OOB regions from the calculation', function() {
    const patch = new sc_edit_patch([128, 128], 1, 255);
    const conv = new sc_edit_view_convolution(patch, [-1, -1, -1, -1, 9, -1, -1, -1, -1]);
    patch.set_pixel([0, 0], [10]);
    patch.set_pixel([1, 0], [10]);

    // 9 * 10  - 4 * 0 - 1 * 10. Ignore the ones to the left/above
    // = 80
    assert.closeTo(conv.get_pixel([0, 0])[0], 80, 0.0001);

    // Totally out of bounds
    assert.closeTo(conv.get_pixel([-5, -5])[0], 0, 0.0001);
  });
});
