import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods';
import { sc_edit_patch } from '../lib/views/sc_edit_patch';
const assert = require('chai').assert;

describe('sc_edit_view_methods', function() {
  describe('fill', function() {
    it('should fill an entire view with a solid value', function() {
      let patch_dest = new sc_edit_patch([32, 32]);
      sc_edit_view_methods.fill(patch_dest, 12);

      assert.equal(12, patch_dest.get_pixel([0,   0]));
      assert.equal(12, patch_dest.get_pixel([16, 16]));
      assert.equal(12, patch_dest.get_pixel([31, 31]));
      assert.equal(12, patch_dest.get_pixel([4,  27]));
    });
  });


  describe('add', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32]);
      this.patch_src = new sc_edit_patch([16, 16]);
      sc_edit_view_methods.fill(this.patch_dest, 10);
      sc_edit_view_methods.fill(this.patch_src,  20);
      sc_edit_view_methods.add(this.patch_dest, [8, 8], this.patch_src);
    });

    it('should add to destination at offset', function () {
      assert.equal(30, this.patch_dest.get_pixel([8,   8]));
      assert.equal(30, this.patch_dest.get_pixel([16, 16]));
      assert.equal(30, this.patch_dest.get_pixel([23, 23]));
    });

    it('should not affect area outside offset/offset+src.size', function () {
      assert.equal(10, this.patch_dest.get_pixel([0,   0]));
      assert.equal(10, this.patch_dest.get_pixel([31, 31]));
      assert.equal(10, this.patch_dest.get_pixel([7,   7]));
      assert.equal(10, this.patch_dest.get_pixel([24, 24]));
    });

    // TODO: Add clamping to set_pixel
  });

  describe('sub', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32]);
      this.patch_src = new sc_edit_patch([16, 16]);
      sc_edit_view_methods.fill(this.patch_dest, 50);
      sc_edit_view_methods.fill(this.patch_src,  10);
      sc_edit_view_methods.sub(this.patch_dest, [8, 8], this.patch_src);
    });

    it('should sub from destination at offset', function () {
      assert.equal(40, this.patch_dest.get_pixel([8,  8]));
      assert.equal(40, this.patch_dest.get_pixel([16, 16]));
      assert.equal(40, this.patch_dest.get_pixel([23, 23]));
    });
  });

  describe('set', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32]);
      this.patch_src = new sc_edit_patch([16, 16]);
      sc_edit_view_methods.fill(this.patch_dest, 50);
      sc_edit_view_methods.fill(this.patch_src,  10);
      sc_edit_view_methods.set(this.patch_dest, [8, 8], this.patch_src);
    });

    it('should overwrite destination at offset', function () {
      assert.equal(10, this.patch_dest.get_pixel([8,  8]));
      assert.equal(10, this.patch_dest.get_pixel([16, 16]));
      assert.equal(10, this.patch_dest.get_pixel([23, 23]));
    });
  });
});
