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


  describe('copy', function() {
    beforeEach(function() {
      this.patch_dest = new sc_edit_patch([32, 32]);
      this.patch_src = new sc_edit_patch([16, 16]);
      sc_edit_view_methods.fill(this.patch_dest, 50);
      sc_edit_view_methods.fill(this.patch_src,  10);
    });

    it('should copy the specified region to the specified destination', function () {
      // Copy an 8x8 region starting at [4,4] to [9, 9] at dest
      this.patch_src.set_pixel([4, 4], 11);
      sc_edit_view_methods.copy(this.patch_dest, [9, 9], this.patch_src, [4, 4], [8, 8]);

      assert.equal(50, this.patch_dest.get_pixel([8, 8]));
      assert.equal(11, this.patch_dest.get_pixel([9, 9]));
      assert.equal(10, this.patch_dest.get_pixel([10, 10]));
      assert.equal(10, this.patch_dest.get_pixel([16, 16]));
      assert.equal(50, this.patch_dest.get_pixel([17, 17]));
    });

    it('should not write out of bounds pixels from source', function () {
      // Copy an 4x4 region starting at [12,12] to [9, 9] at dest
      // Not copying an 8x8 region, which would set OOB pixels to the right/below the 4x4 area
      sc_edit_view_methods.copy(this.patch_dest, [9, 9], this.patch_src, [12, 12], [8, 8]);
      assert.equal(50, this.patch_dest.get_pixel([8, 8]));
      assert.equal(10, this.patch_dest.get_pixel([9, 9]));
      assert.equal(10, this.patch_dest.get_pixel([12, 12]));
      assert.equal(50, this.patch_dest.get_pixel([13, 13]));
    });
  });


  describe('weighted_blend', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32]);
      this.patch_src = new sc_edit_patch([16, 16]);
      this.patch_weight = new sc_edit_patch([16, 16]);
      sc_edit_view_methods.fill(this.patch_dest, 50);
      sc_edit_view_methods.fill(this.patch_src, 10);
      sc_edit_view_methods.fill(this.patch_weight, 0.5);
      // Blends a 50% of src into dest at [8, 8]
      sc_edit_view_methods.weighted_blend(this.patch_dest, [8, 8], this.patch_src, this.patch_dest, this.patch_weight);
    });

    it('should blends src into dest by weight', function () {
      assert.equal(30, this.patch_dest.get_pixel([ 8,  8]));
      assert.equal(30, this.patch_dest.get_pixel([23, 23]));
    });

    it('should not change are outside patch', function () {
      assert.equal(50, this.patch_dest.get_pixel([ 7,  7]));
      assert.equal(50, this.patch_dest.get_pixel([24, 24]));
    });
  });
});
