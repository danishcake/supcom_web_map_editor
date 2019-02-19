import { sc_edit_patch } from '../lib/views/sc_edit_patch';
import { sc_edit_view_symmetry } from '../lib/views/sc_edit_view_symmetry';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;

describe('sc_edit_view_symmetry', function() {
  it('should have same size', function () {
    const source = new sc_edit_patch([128, 128], 1, 65535);
    const symmetry = new sc_edit_symmetry.horizontal();
    const symmetry_view = new sc_edit_view_symmetry(source, symmetry);

    assert.equal(source.width, symmetry_view.width);
    assert.equal(source.height, symmetry_view.height);
  });


  it('should have same values', function () {
    const source = new sc_edit_patch([128, 128], 1, 65535);
    const symmetry = new sc_edit_symmetry.horizontal();
    const symmetry_view = new sc_edit_view_symmetry(source, symmetry);

    source.set_pixel([25, 20], [100]);
    assert.equal(100, symmetry_view.get_pixel([25, 20])[0]);
  });


  it('should write all secondary pixels', function () {
    const source = new sc_edit_patch([128, 128], 1, 65535);
    const symmetry = new sc_edit_symmetry.horizontal();
    const symmetry_view = new sc_edit_view_symmetry(source, symmetry);

    symmetry_view.set_pixel([0, 0], [500]);
    assert.equal(500, symmetry_view.get_pixel([0, 0])[0]);
    assert.equal(500, symmetry_view.get_pixel([127, 0])[0]);
  });

});
