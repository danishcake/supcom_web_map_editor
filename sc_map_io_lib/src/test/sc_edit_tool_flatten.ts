import { sc_edit_tool_flatten } from '../lib/tools/sc_edit_tool_flatten';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args"
import { sc_edit_patch } from "../lib/views/sc_edit_patch";
import { sc_map } from '../lib/sc_map';
import { sc_script_save } from '../lib/sc_script';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;


describe('sc_edit_tool_flatten', function() {
  beforeEach('create a ramping map', function() {
    this.hm = new sc_edit_patch([256, 256], 1, 65535);
    this.tm = new sc_edit_patch([128, 128], 8, 255);

    // Change the heightmap to contain a ramp up the vertical axis
    for (let y = 0; y < this.hm.height; y++) {
      for (let x = 0; x < this.hm.width; x++) {
        this.hm.set_pixel([x, y], [y * 10]);
      }
    }
  });

  it('sets pixels within inner radius to the height at centre of application', function() {
    assert.equal(1270, this.hm.get_pixel([128, 127])[0]);
    assert.equal(1280, this.hm.get_pixel([128, 128])[0]);
    assert.equal(1290, this.hm.get_pixel([128, 129])[0]);

    let tool = new sc_edit_tool_flatten(16, 8, 10);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // All pixels within radius 8 of centre will now be set to 100
    for (let y = -8; y <= 8; y++) {
      for (let x = -8; x <= 8; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r < 8) {
          const height = this.hm.get_pixel([128 + x, 128 + y])[0];
          assert.equal(1280, height, `Pixel at [${128+x}, ${128+y}] flattened`);
        }
      }
    }
  });


  it('blends pixels within outer radius', function() {
    let tool = new sc_edit_tool_flatten(16, 8, 10);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // The region between 8 and 16 pixels radius will fall off towards the original value
    for (let y = -16; y <= 16; y++) {
      for (let x = -16; x <= 16; x++) {
        const r = Math.sqrt(x * x + y * y);
        if (r > 8 && r < 16) {
          const height = this.hm.get_pixel([128 + x, 128 + y])[0];
          const interpolation_factor = (16 - r) / 8;
          const expected_height = (128 + y) * 10 * (1 - interpolation_factor) +
                                  1280 * interpolation_factor;

          assert.closeTo(expected_height, height, 1, `Pixel at [${128+x}, ${128+y}] smoothed towards flattness`);
        }
      }
    }
  });


  it('ratchets pixels closer to the target value', function() {
    // As you move the cursor it shouldn't revert pixels to their old values around the edge
    let tool = new sc_edit_tool_flatten(16, 8, 10);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([132, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([136, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([140, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 128], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    assert.closeTo(1280, this.hm.get_pixel([128 - 17, 128])[0], 1, `Pixel at [${128-17}, 128] unchanged`);
    assert.closeTo(1280, this.hm.get_pixel([128 - 7, 128])[0], 1, `Pixel at [${128-7}, 128] not unflattened by later applications`);
  });
});
