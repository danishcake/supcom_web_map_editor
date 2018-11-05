import { sc_edit_tool_smooth, blur_type } from '../lib/tools/sc_edit_tool_smooth';
import { sc_edit_tool_data, sc_edit_tool_args } from '../lib/tools/sc_edit_tool_args'
import { sc_edit_patch } from '../lib/views/sc_edit_patch';
import { sc_script_save } from '../lib/sc_script';
import { sc_map } from '../lib/sc_map';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;

describe('sc_edit_tool_smooth', function() {
  beforeEach('create a steppy map', function() {
    this.hm = new sc_edit_patch([256, 256], 1, 65535);
    this.tm = new sc_edit_patch([128, 128], 8, 255);

    // Change the heightmap to step every 32px
    for (let y = 0; y < this.hm.height; y++) {
      for (let x = 0; x < this.hm.width; x++) {
        if (y < 64) {
          this.hm.set_pixel([x, y], [500]);
        } else {
          this.hm.set_pixel([x, y], [1000]);
        }
      }
    }
  });

  it('moves inner region towards average', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 64, blur_type.average);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // Average at this region is 16 scanlines of 500 and 17 scanlines of 1000
    // -> (16 * 500 + 17 * 1000) / 33 = 757
    // We're applying at 25% intensity, so 0.25 * 757 + 0.75 * X
    assert.closeTo(564, this.hm.get_pixel([128, 63])[0], 1, `Pixel at [128, 63] smoothed`); // 63- start at 500
    assert.closeTo(939, this.hm.get_pixel([128, 64])[0], 1, `Pixel at [128, 64] smoothed`); // 64+ start at 1000
  });

  it('has full effect at 255 intensity', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 255, blur_type.average);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // 100% intensity, so move to average of 757
    assert.closeTo(757, this.hm.get_pixel([128, 63])[0], 1, `Pixel at [128, 63] fully smoothed`); // 63- start at 500
    assert.closeTo(757, this.hm.get_pixel([128, 64])[0], 1, `Pixel at [128, 64] fully smoothed`); // 64+ start at 1000
  });

  it('has radial falloff in the effect around periphery', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 255, blur_type.average);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    // 50% effect, so (500 + 757) / 2 = 628
    // 50% effect, so (1000 + 757) / 2 = 878
    assert.closeTo(628, this.hm.get_pixel([128 - 12, 63])[0], 1, `Pixel at [128 - 12, 63] half smoothed`); // 63- start at 500
    assert.closeTo(878, this.hm.get_pixel([128 - 12, 64])[0], 1, `Pixel at [128 - 12, 64] half smoothed`); // 64+ start at 1000
  });

  it('has no effect at 0 intensity', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 0, blur_type.average);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    assert.closeTo(500, this.hm.get_pixel([128, 63])[0], 1, `Pixel at [128, 63] unchanged`); // 63- start at 500
    assert.closeTo(1000, this.hm.get_pixel([128, 64])[0], 1, `Pixel at [128, 64] unchanged`); // 64+ start at 1000
  });

  it('ratchets towards smoothness', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 255, blur_type.average);
    tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([128, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    // 4 pixels into falloff region on left should be 50% effect
    assert.closeTo(628, this.hm.get_pixel([128-12, 63])[0], 1, `Pixel at [128 - 12, 63] half smoothed`);

    // Applying again 8 pixels right doesn't un-smooth the left pixels due to ratchet
    tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([136, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    assert.closeTo(628, this.hm.get_pixel([128-12, 63])[0], 1, `Pixel at [128 - 12, 63] still half smoothed`);

    // Applying again 8 pixels left fully smooths
    tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
               new sc_edit_tool_args([120, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    assert.closeTo(757, this.hm.get_pixel([128-12, 63])[0], 1, `Pixel at [128 - 12, 63] still half smoothed`);
    tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, null as any as sc_map),
             new sc_edit_tool_args([120, 64], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
  });
});
