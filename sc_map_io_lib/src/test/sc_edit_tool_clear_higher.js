import { sc } from '../lib/sc';
import { sc_edit_tool_clear_higher } from '../lib/tools/sc_edit_tool_clear_higher.js';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args.js"
import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods.js'
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool_clear_higher', function() {
  beforeEach('create a half saturated map with 8 channels', function() {
    this.tm = new sc.edit.view.patch([256, 256], 8, 256);
    sc_edit_view_methods.fill(this.tm, sc_edit_view_methods.make_pixel(8, 127));
  });

  it('zeroes all higher channels within inner radius', function() {
    let tool = new sc_edit_tool_clear_higher(16, 8, 4);
    tool.start(new sc_edit_tool_data(this.tm, null, null),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.tm, null, null),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));

    // Pixels in channels 5, 6 and 7 will be zero if within 8 pixels
    for (let y = -8; y <= 8; y++) {
      for (let x = -8; x <= 8; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 8) {
          assert.equal(127, this.tm.get_pixel([128 + x, 128 + y])[0], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([128 + x, 128 + y])[1], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([128 + x, 128 + y])[2], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([128 + x, 128 + y])[3], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([128 + x, 128 + y])[4], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(0,   this.tm.get_pixel([128 + x, 128 + y])[5], `Pixel at [${128+x}, ${128+y}] zeroed`);
          assert.equal(0,   this.tm.get_pixel([128 + x, 128 + y])[6], `Pixel at [${128+x}, ${128+y}] zeroed`);
          assert.equal(0,   this.tm.get_pixel([128 + x, 128 + y])[7], `Pixel at [${128+x}, ${128+y}] zeroed`);
        }
      }
    }
  });


  it('Falls off to no effect at outer radius', function() {
    let tool = new sc_edit_tool_clear_higher(16, 8, 4);
    tool.start(new sc_edit_tool_data(this.tm, null, null),
      new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.tm, null, null),
      new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));

    // Pixels in channels 5, 6 and 7 will be zero if within 8 pixels
    for (let y = -16; y <= 16; y++) {
      for (let x = -16; x <= 16; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 16 && r > 8) {
          const expected = ((r - 8) / 8) * 127;

          assert.equal(127,      this.tm.get_pixel([128 + x, 128 + y])[0], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([128 + x, 128 + y])[1], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([128 + x, 128 + y])[2], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([128 + x, 128 + y])[3], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([128 + x, 128 + y])[4], `Pixel at [${128+x}, ${128+y}] unchanged`);
          assert.closeTo(expected, this.tm.get_pixel([128 + x, 128 + y])[5], 0.001, `Pixel at [${128+x}, ${128+y}] blended towards zero`);
          assert.closeTo(expected, this.tm.get_pixel([128 + x, 128 + y])[6], 0.001, `Pixel at [${128+x}, ${128+y}] blended towards zero`);
          assert.closeTo(expected, this.tm.get_pixel([128 + x, 128 + y])[7], 0.001, `Pixel at [${128+x}, ${128+y}] blended towards zero`);
        }
      }
    }
  });
});
