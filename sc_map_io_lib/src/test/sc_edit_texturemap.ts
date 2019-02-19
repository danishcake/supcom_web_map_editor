import { sc_edit_texturemap } from '../lib/sc_edit_texturemap';
import { sc_map } from '../lib/sc_map';
import { sc_rect } from '../lib/sc_rect';
import { sc_map_args } from '../lib/sc_map_args';
const assert = require('chai').assert;

describe('sc_edit_texturemap', function() {
  const default_5x5_map_args: sc_map_args = {
    name: 'x',
    author: 'x',
    description: 'x',
    size: 0, // 5x5
    default_height: 10000
  };

  describe('basic characteristics', function() {
    let map = sc_map.create(default_5x5_map_args);
    let edit_texturemap = new sc_edit_texturemap(map.texturemap);

    it('should have 8 subpixels', function() {
      assert.equal(8, edit_texturemap.subpixel_count);
    });

    it('should have a maximum subpixel value of 255', function() {
      assert.equal(255, edit_texturemap.subpixel_max);
    });
  });

  describe('imports existing texturemap', function() {
    let map = sc_map.create(default_5x5_map_args);
    let edit_texturemap = new sc_edit_texturemap(map.texturemap);

    it('should have same size', function () {
      assert.equal(128, edit_texturemap.width);
      assert.equal(128, edit_texturemap.height);
      assert.equal(128, edit_texturemap.height);
    });

    it('should have same values', function () {
      assert.equal(0, map.texturemap.chan0_3.readUint8(0));
      assert.equal(0, map.texturemap.chan0_3.readUint8(1));
      assert.equal(0, map.texturemap.chan0_3.readUint8(2));
      assert.equal(0, map.texturemap.chan0_3.readUint8(3));

      assert.equal(0, map.texturemap.chan4_7.readUint8(0));
      assert.equal(0, map.texturemap.chan4_7.readUint8(1));
      assert.equal(0, map.texturemap.chan4_7.readUint8(2));
      assert.equal(0, map.texturemap.chan4_7.readUint8(3));
    });
  });

  describe('writes directly to existing texturemap', function() {
    let map = sc_map.create(default_5x5_map_args);
    let edit_texturemap = new sc_edit_texturemap(map.texturemap);
    edit_texturemap.set_pixel([0, 0], [1, 2, 3, 4, 5, 6, 7, 8]);

    it('should have same values', function () {
      assert.equal(1, edit_texturemap.get_pixel([0, 0])[0]);
      assert.equal(1, map.texturemap.chan0_3.readUint8(0));
      assert.equal(2, edit_texturemap.get_pixel([0, 0])[1]);
      assert.equal(2, map.texturemap.chan0_3.readUint8(1));
      assert.equal(3, edit_texturemap.get_pixel([0, 0])[2]);
      assert.equal(3, map.texturemap.chan0_3.readUint8(2));
      assert.equal(4, edit_texturemap.get_pixel([0, 0])[3]);
      assert.equal(4, map.texturemap.chan0_3.readUint8(3));
      assert.equal(5, edit_texturemap.get_pixel([0, 0])[4]);
      assert.equal(5, map.texturemap.chan4_7.readUint8(0));
      assert.equal(6, edit_texturemap.get_pixel([0, 0])[5]);
      assert.equal(6, map.texturemap.chan4_7.readUint8(1));
      assert.equal(7, edit_texturemap.get_pixel([0, 0])[6]);
      assert.equal(7, map.texturemap.chan4_7.readUint8(2));
      assert.equal(8, edit_texturemap.get_pixel([0, 0])[7]);
      assert.equal(8, map.texturemap.chan4_7.readUint8(3));
    });
  });

  describe('dirty region tracking', function() {
    let map = sc_map.create(default_5x5_map_args);
    let edit_texturemap = new sc_edit_texturemap(map.texturemap);

    it('should initially be entirely dirty', function() {
      if (edit_texturemap.dirty_region != null) {
        assert.equal(0, edit_texturemap.dirty_region.top);
        assert.equal(0, edit_texturemap.dirty_region.left);
        assert.equal(127, edit_texturemap.dirty_region.bottom);
        assert.equal(127, edit_texturemap.dirty_region.right);
      } else {
        assert.fail('Empty dirty region');
      }
    });

    it('should be clean after reset is called', function() {
      edit_texturemap.reset_dirty_region();
      assert.isNull(edit_texturemap.dirty_region);
    });

    it('should track dirty regions when marked', function() {
      edit_texturemap.mark_dirty_region(new sc_rect(0, 0, 10, 10));
      if (edit_texturemap.dirty_region != null) {
        assert.equal(0, edit_texturemap.dirty_region.top);
        assert.equal(0, edit_texturemap.dirty_region.left);
        assert.equal(9, edit_texturemap.dirty_region.bottom);
        assert.equal(9, edit_texturemap.dirty_region.right);
      } else {
        assert.fail('Empty dirty region');
      }
    });

    it('should merge dirty regions', function() {
      edit_texturemap.mark_dirty_region(new sc_rect(100, 100, 20, 20));
      if (edit_texturemap.dirty_region != null) {
        assert.equal(0, edit_texturemap.dirty_region.top);
        assert.equal(0, edit_texturemap.dirty_region.left);
        assert.equal(119, edit_texturemap.dirty_region.bottom);
        assert.equal(119, edit_texturemap.dirty_region.right);
      } else {
        assert.fail('Empty dirty region');
      }
    });
  });
});
