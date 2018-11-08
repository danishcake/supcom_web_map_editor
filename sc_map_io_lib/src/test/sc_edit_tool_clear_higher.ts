import { sc_edit_tool_clear_higher } from '../lib/tools/sc_edit_tool_clear_higher';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args"
import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods'
import { sc_map } from '../lib/sc_map';
import { sc_edit_heightmap } from '../lib/sc_edit_heightmap';
import { sc_edit_texturemap } from '../lib/sc_edit_texturemap';
import { sc_script_save } from '../lib/script/sc_script_save';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;

describe('sc_edit_tool_clear_higher', function() {
  beforeEach('create a half saturated map with 8 channels', function() {
    const map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0, // 5x5.
      default_height: 1000
    };
    this.map = new sc_map();
    this.map.create(map_args);
    this.hm = new sc_edit_heightmap(this.map.heightmap);
    this.tm = new sc_edit_texturemap(this.map.texturemap);
    this.save_script = new sc_script_save();
    this.save_script.create(map_args);

    sc_edit_view_methods.fill(this.tm, sc_edit_view_methods.make_pixel(8, 127));
  });

  it('zeroes all higher channels within inner radius', function() {
    let tool = new sc_edit_tool_clear_higher(16, 8, 4);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, this.save_script, this.tm, this.map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, this.save_script, this.tm, this.map),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // Note that all input positions are in heightmap space.
    // but are applied in texture map space. As a result we have to divide by 2
    // Pixels in channels 5, 6 and 7 will be zero if within 8 pixels
    for (let y = -8; y <= 8; y++) {
      for (let x = -8; x <= 8; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 8) {
          assert.equal(127, this.tm.get_pixel([64 + x, 64 + y])[0], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([64 + x, 64 + y])[1], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([64 + x, 64 + y])[2], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([64 + x, 64 + y])[3], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127, this.tm.get_pixel([64 + x, 64 + y])[4], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(0,   this.tm.get_pixel([64 + x, 64 + y])[5], `Pixel at [${64+x}, ${64+y}] zeroed`);
          assert.equal(0,   this.tm.get_pixel([64 + x, 64 + y])[6], `Pixel at [${64+x}, ${64+y}] zeroed`);
          assert.equal(0,   this.tm.get_pixel([64 + x, 64 + y])[7], `Pixel at [${64+x}, ${64+y}] zeroed`);
        }
      }
    }
  });


  it('Falls off to no effect at outer radius', function() {
    let tool = new sc_edit_tool_clear_higher(16, 8, 4);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, this.save_script, this.tm, this.map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, this.save_script, this.tm, this.map),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // Pixels in channels 5, 6 and 7 will be zero if within 8 pixels
    for (let y = -16; y <= 16; y++) {
      for (let x = -16; x <= 16; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 16 && r > 8) {
          const expected = Math.floor(((r - 8) / 8) * 127);

          assert.equal(127,      this.tm.get_pixel([64 + x, 64 + y])[0], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([64 + x, 64 + y])[1], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([64 + x, 64 + y])[2], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([64 + x, 64 + y])[3], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(127,      this.tm.get_pixel([64 + x, 64 + y])[4], `Pixel at [${64+x}, ${64+y}] unchanged`);
          assert.equal(expected, this.tm.get_pixel([64 + x, 64 + y])[5], `Pixel at [${64+x}, ${64+y}] blended towards zero`);
          assert.equal(expected, this.tm.get_pixel([64 + x, 64 + y])[6], `Pixel at [${64+x}, ${64+y}] blended towards zero`);
          assert.equal(expected, this.tm.get_pixel([64 + x, 64 + y])[7], `Pixel at [${64+x}, ${64+y}] blended towards zero`);
        }
      }
    }
  });
});
