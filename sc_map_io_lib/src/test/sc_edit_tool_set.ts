import { sc_edit_tool_set } from '../lib/tools/sc_edit_tool_set';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args"
import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods'
import { sc_edit_patch } from '../lib/views/sc_edit_patch';
import { sc_script_save } from '../lib/sc_script';
import { sc_map } from '../lib/sc_map';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;

describe('sc_edit_tool_set', function() {
  beforeEach('create a half saturated map with 8 channels', function() {
    this.hm = new sc_edit_patch([512, 512], 8, 256);
    this.tm = new sc_edit_patch([256, 256], 8, 256); // Texturemap made as required by sc_edit_tool_data
    sc_edit_view_methods.fill(this.hm, sc_edit_view_methods.make_pixel(8, 127));
  });

  it('sets all pixels within outer radius', function() {
    let tool = new sc_edit_tool_set(16, 1, 10);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // All pixels within radius 16 of centre will now be set to 10
    for (let y = -16; y <= 16; y++) {
      for (let x = -16; x <= 16; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 16) {
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[0], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[1], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[2], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[3], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[4], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[5], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[6], `Pixel at [${128+x}, ${128+y}] set`);
          assert.equal(10, this.hm.get_pixel([128 + x, 128 + y])[7], `Pixel at [${128+x}, ${128+y}] set`);
        }
      }
    }
  });
});
