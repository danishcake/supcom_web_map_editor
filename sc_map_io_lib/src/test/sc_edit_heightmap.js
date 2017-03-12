import { sc_edit_heightmap } from '../lib/sc_edit_heightmap';
import { sc_map } from '../lib/sc_map';
import { sc_rect } from '../lib/sc_rect';
const assert = require('chai').assert;

describe('sc_edit_heightmap', function() {
  describe('imports existing heightmap', function() {
    let map = new sc_map();
    map.create({size: 0, default_height: 1000});
    let edit_heightmap = new sc_edit_heightmap(map.heightmap);

    it('should have same size', function () {
      assert.equal(257, edit_heightmap.width);
      assert.equal(257, edit_heightmap.height);
    });

    it('should have same heights', function () {
      assert.equal(1000, edit_heightmap.working_heightmap[0]);
      assert.equal(1000, edit_heightmap.working_heightmap[257 * 257 - 1]);
    });
  });

  describe('exports to existing heightmap', function() {
    let map = new sc_map();
    map.create({size: 0, default_height: 1000});
    let edit_heightmap = new sc_edit_heightmap(map.heightmap);
    edit_heightmap.set_pixel([0, 0], 50);
    edit_heightmap.export_to_heightmap(map.heightmap);

    it('should have same heights', function () {
      assert.equal(50, edit_heightmap.working_heightmap[0]);
      assert.equal(50, map.heightmap.data.readUint16(0));
      assert.equal(1000, edit_heightmap.working_heightmap[1]);
      assert.equal(1000, map.heightmap.data.readUint16(2));
    });
  });

  describe('dirty region tracking', function() {
    let map = new sc_map();
    map.create({size: 0, default_height: 1000});
    let edit_heightmap = new sc_edit_heightmap(map.heightmap);

    it('should initially be entirely dirty', function() {
      assert.equal(0, edit_heightmap.dirty_region.top);
      assert.equal(0, edit_heightmap.dirty_region.left);
      assert.equal(256, edit_heightmap.dirty_region.bottom);
      assert.equal(256, edit_heightmap.dirty_region.right);
    });

    it('should be clean after reset is called', function() {
      edit_heightmap.reset_dirty_region();
      assert.isNull(edit_heightmap.dirty_region);
    });

    it('should track dirty regions when marked', function() {
      edit_heightmap.mark_dirty_region(new sc_rect(0, 0, 10, 10));
      assert.equal(0, edit_heightmap.dirty_region.top);
      assert.equal(0, edit_heightmap.dirty_region.left);
      assert.equal(9, edit_heightmap.dirty_region.bottom);
      assert.equal(9, edit_heightmap.dirty_region.right);
    });

    it('should merge dirty regions', function() {
      edit_heightmap.mark_dirty_region(new sc_rect(100, 100, 20, 20));
      assert.equal(0, edit_heightmap.dirty_region.top);
      assert.equal(0, edit_heightmap.dirty_region.left);
      assert.equal(119, edit_heightmap.dirty_region.bottom);
      assert.equal(119, edit_heightmap.dirty_region.right);
    });
  });
});
