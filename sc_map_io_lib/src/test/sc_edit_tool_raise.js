import { sc } from '../lib/sc';
import { sc_edit_tool_raise } from '../lib/tools/sc_edit_tool_raise.js';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args.js"
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool_raise', function() {
  beforeEach('create a flat map', function() {
    const map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0, // 5x5.
      default_height: 1000
    };

    this.map = new sc.map();
    this.map.create(map_args);
    this.hm = new sc.edit.heightmap(this.map.heightmap);
  });

  it('raises terrain within inner radius by strength', function() {
    assert.equal(1000, this.hm.get_pixel([128, 128])[0]);

    let tool = new sc_edit_tool_raise(16, 8, 10);
    tool.start(new sc_edit_tool_data(this.hm, null),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.hm, null),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));

    // All pixels within radius 8 of centre will now be raised by 10
    for (let y = -8; y <= 8; y++) {
      for (let x = -8; x <= 8; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 8) {
          const height = this.hm.get_pixel([128 + x, 128 + y])[0];
          assert.equal(1010, height, `Pixel at [${128+x}. ${128+y}] raised`);
        }
      }
    }
  });


  it('raises terrain outside outer radius by nothing', function() {
    let tool = new sc_edit_tool_raise(16, 8, 10);
    tool.start(new sc_edit_tool_data(this.hm, null),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.hm, null),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));

    // All pixels outside radius 16 of centre will be unchanged
    for (let y = -8; y <= 8; y++) {
      for (let x = -8; x <= 8; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r > 16) {
          const height = this.hm.get_pixel([128 + x, 128 + y])[0];
          assert.equal(1000, height, `Pixel at [${128+x}. ${128+y}] not changed`);
        }
      }
    }
  });


  it('raises terrain between inner and outer radius by amount between nothing and stength', function() {
    let tool = new sc_edit_tool_raise(16, 8, 8);
    tool.start(new sc_edit_tool_data(this.hm, null),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.hm, null),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));


    // 0 128 -> 1008

    // 1 127 -> 1008
    // 2 126 -> 1008
    // 3 125 -> 1008
    // 4 124 -> 1008
    // 5 123 -> 1008
    // 6 122 -> 1008
    // 7 121 -> 1008

    // 8 120 -> 1008 Math.floor(8 * (16 -  8) / 8);
    // 9 119 -> 1007 Math.floor(8 * (16 -  9) / 8);
    // 9 118 -> 1006 Math.floor(8 * (16 - 10) / 8);
    // 9 117 -> 1005 Math.floor(8 * (16 - 11) / 8);
    // 9 116 -> 1004 Math.floor(8 * (16 - 12) / 8);
    // 9 115 -> 1003 Math.floor(8 * (16 - 13) / 8);
    // 9 114 -> 1002 Math.floor(8 * (16 - 14) / 8);
    // 9 113 -> 1001 Math.floor(8 * (16 - 15) / 8);
    // 9 112 -> 1000 Math.floor(8 * (16 - 16) / 8);

    assert.closeTo(1008, this.hm.get_pixel([120, 128])[0], 0.0001);
    assert.closeTo(1007, this.hm.get_pixel([119, 128])[0], 0.0001);
    assert.closeTo(1006, this.hm.get_pixel([118, 128])[0], 0.0001);
    assert.closeTo(1005, this.hm.get_pixel([117, 128])[0], 0.0001);
    assert.closeTo(1004, this.hm.get_pixel([116, 128])[0], 0.0001);
    assert.closeTo(1003, this.hm.get_pixel([115, 128])[0], 0.0001);
    assert.closeTo(1002, this.hm.get_pixel([114, 128])[0], 0.0001);
    assert.closeTo(1001, this.hm.get_pixel([113, 128])[0], 0.0001);
    assert.closeTo(1000, this.hm.get_pixel([112, 128])[0], 0.0001);
    assert.closeTo(1000, this.hm.get_pixel([111, 128])[0], 0.0001);
  });


  it('marks the affected region as dirty', function() {
    this.hm.reset_dirty_region();
    let tool = new sc_edit_tool_raise(16, 8, 8);
    tool.start(new sc_edit_tool_data(this.hm, null),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.hm, null),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none));

    assert.equal(128 - 16, this.hm.dirty_region.left);
    assert.equal(128 + 16, this.hm.dirty_region.right);
    assert.equal(128 - 16, this.hm.dirty_region.top);
    assert.equal(128 + 16, this.hm.dirty_region.bottom);
    assert.equal(33,       this.hm.dirty_region.width);
    assert.equal(33,       this.hm.dirty_region.height);

    tool.start(new sc_edit_tool_data(this.hm, null),
               new sc_edit_tool_args([64, 128], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(this.hm, null),
             new sc_edit_tool_args([64, 128], sc_edit_tool_args.modifier_none));

    assert.equal(64  - 16, this.hm.dirty_region.left);
    assert.equal(128 + 16, this.hm.dirty_region.right);
    assert.equal(128 - 16, this.hm.dirty_region.top);
    assert.equal(128 + 16, this.hm.dirty_region.bottom);
  });
});
