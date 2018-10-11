import { sc_edit_patch } from '../lib/views/sc_edit_patch';
const assert = require('chai').assert;

describe('sc_edit_view_patch', function() {
  it('should clamp values', function () {
    const view = new sc_edit_patch([128, 128], 1, 255);
    view.set_pixel([0,0], [500]);
    view.set_pixel([1,0], [-500]);

    assert.equal(view.get_pixel([0, 0]), 255);
    assert.equal(view.get_pixel([1, 0]), 0);
  });
});
