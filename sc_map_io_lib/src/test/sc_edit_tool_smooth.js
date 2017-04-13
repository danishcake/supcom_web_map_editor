import { sc } from '../lib/sc';
import { sc_edit_tool_smooth } from '../lib/tools/sc_edit_tool_smooth.js';
const assert = require('chai').assert;

describe('sc_edit_tool_smooth', function() {
  beforeEach('create a steppy map', function() {
    this.hm = new sc.edit.view.patch([256, 256]);

    // Change the heightmap to step every 32px
    for (let y = 0; y < this.hm.height; y++) {
      for (let x = 0; x < this.hm.width; x++) {
        if (y < 64) {
          this.hm.set_pixel([x, y], 500);
        } else {
          this.hm.set_pixel([x, y], 1000);
        }
      }
    }
  });

  it('moves inner region towards average', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 64);
    tool.start(this.hm, null, [128, 64]);
    tool.end(this.hm, null, [0, 0]);

    // Average at this region is 16 scanlines of 500 and 17 scanlines of 1000
    // -> (16 * 500 + 17 * 1000) / 33 = 757
    // We're applying at 25% intensity, so 0.25 * 757 + 0.75 * X
    assert.closeTo(564, this.hm.get_pixel([128, 63]), 1, `Pixel at [128, 63] smoothed`); // 63- start at 500
    assert.closeTo(939, this.hm.get_pixel([128, 64]), 1, `Pixel at [128, 64] smoothed`); // 64+ start at 1000
  });

  it('has full effect at 255 intensity', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 255);
    tool.start(this.hm, null, [128, 64]);
    tool.end(this.hm, null, [0, 0]);
    
    // 100% intensity, so move to average of 757
    assert.closeTo(757, this.hm.get_pixel([128, 63]), 1, `Pixel at [128, 63] fully smoothed`); // 63- start at 500
    assert.closeTo(757, this.hm.get_pixel([128, 64]), 1, `Pixel at [128, 64] fully smoothed`); // 64+ start at 1000
  });

  it('has radial falloff in the effect around periphery', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 255);
    tool.start(this.hm, null, [128, 64]);
    tool.end(this.hm, null, [0, 0]);

    // 50% effect, so (500 + 757) / 2 = 628
    // 50% effect, so (1000 + 757) / 2 = 878
    assert.closeTo(628, this.hm.get_pixel([128 - 12, 63]), 1, `Pixel at [128 - 12, 63] half smoothed`); // 63- start at 500
    assert.closeTo(878, this.hm.get_pixel([128 - 12, 64]), 1, `Pixel at [128 - 12, 64] half smoothed`); // 64+ start at 1000
  });

  it('has no effect at 0 intensity', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 0);
    tool.start(this.hm, null, [128, 64]);
    tool.end(this.hm, null, [0, 0]);

    assert.closeTo(500, this.hm.get_pixel([128, 63]), 1, `Pixel at [128, 63] unchanged`); // 63- start at 500
    assert.closeTo(1000, this.hm.get_pixel([128, 64]), 1, `Pixel at [128, 64] unchanged`); // 64+ start at 1000
  });

  it('ratchets towards smoothness', function() {
    let tool = new sc_edit_tool_smooth(16, 8, 255);
    tool.start(this.hm, null, [128, 64]);
    // 4 pixels into falloff region on left should be 50% effect
    assert.closeTo(628, this.hm.get_pixel([128-12, 63]), 1, `Pixel at [128 - 12, 63] half smoothed`);

    // Applying again 8 pixels right doesn't un-smooth the left pixels due to ratchet
    tool.apply(this.hm, null, [136, 64]);
    assert.closeTo(628, this.hm.get_pixel([128-12, 63]), 1, `Pixel at [128 - 12, 63] still half smoothed`);
    
    // Applying again 8 pixels left fully smooths
    tool.apply(this.hm, null, [120, 64]);
    assert.closeTo(757, this.hm.get_pixel([128-12, 63]), 1, `Pixel at [128 - 12, 63] still half smoothed`);
    tool.end(this.hm, null, [0, 0]);
  });
});
