import { sc } from '../lib/sc';
import { sc_edit_tool_set } from '../lib/tools/sc_edit_tool_set.js';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args.js"
import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods.js'
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool_set', function() {
  beforeEach('create a half saturated map with 8 channels', function() {
    this.tm = new sc.edit.view.patch([256, 256], 8, 256);
    sc_edit_view_methods.fill(this.tm, sc_edit_view_methods.make_pixel(8, 127));
  });

  it('sets all pixels within outer radius', function() {
    let tool = new sc_edit_tool_set(16, 1, 10);
    tool.start(new sc_edit_tool_data(this.tm, null, null),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.tm, null, null),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));

    // All pixels within radius 16 of centre will now be set to 10
    for (let y = -16; y <= 16; y++) {
      for (let x = -16; x <= 16; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 16) {
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[0], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[1], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[2], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[3], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[4], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[5], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[6], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.tm.get_pixel([128 + x, 128 + y])[7], `Pixel at [${128+x}, ${128+y}] set`);
        }
      }
    }
  });
});
