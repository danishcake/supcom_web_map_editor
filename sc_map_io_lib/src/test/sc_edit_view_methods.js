import { sc_edit_view_methods } from '../lib/views/sc_edit_view_methods';
import { sc_edit_patch } from '../lib/views/sc_edit_patch';
const assert = require('chai').assert;

describe('sc_edit_view_methods', function() {
  describe('fill', function() {
    it('should fill an entire view with a solid value', function() {
      let patch_dest = new sc_edit_patch([32, 32], 1, 255);
      sc_edit_view_methods.fill(patch_dest, [12]);

      assert.equal(12, patch_dest.get_pixel([0,   0])[0]);
      assert.equal(12, patch_dest.get_pixel([16, 16])[0]);
      assert.equal(12, patch_dest.get_pixel([31, 31])[0]);
      assert.equal(12, patch_dest.get_pixel([4,  27])[0]);
    });
  });


  describe('add', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32], 1, 255);
      this.patch_src = new sc_edit_patch([16, 16], 1, 255);
      sc_edit_view_methods.fill(this.patch_dest, [10]);
      sc_edit_view_methods.fill(this.patch_src,  [20]);
      sc_edit_view_methods.add(this.patch_dest, [8, 8], this.patch_src);
    });

    it('should add to destination at offset', function () {
      assert.equal(30, this.patch_dest.get_pixel([8,   8])[0]);
      assert.equal(30, this.patch_dest.get_pixel([16, 16])[0]);
      assert.equal(30, this.patch_dest.get_pixel([23, 23])[0]);
    });

    it('should not affect area outside offset/offset+src.size', function () {
      assert.equal(10, this.patch_dest.get_pixel([0,   0])[0]);
      assert.equal(10, this.patch_dest.get_pixel([31, 31])[0]);
      assert.equal(10, this.patch_dest.get_pixel([7,   7])[0]);
      assert.equal(10, this.patch_dest.get_pixel([24, 24])[0]);
    });
  });

  describe('sub', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32], 1, 255);
      this.patch_src = new sc_edit_patch([16, 16], 1, 255);
      sc_edit_view_methods.fill(this.patch_dest, [50]);
      sc_edit_view_methods.fill(this.patch_src,  [10]);
      sc_edit_view_methods.sub(this.patch_dest, [8, 8], this.patch_src);
    });

    it('should sub from destination at offset', function () {
      assert.equal(40, this.patch_dest.get_pixel([8,  8])[0]);
      assert.equal(40, this.patch_dest.get_pixel([16, 16])[0]);
      assert.equal(40, this.patch_dest.get_pixel([23, 23])[0]);
    });
  });

  describe('set', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32], 1, 255);
      this.patch_src = new sc_edit_patch([16, 16], 1, 255);
      sc_edit_view_methods.fill(this.patch_dest, [50]);
      sc_edit_view_methods.fill(this.patch_src,  [10]);
      sc_edit_view_methods.set(this.patch_dest, [8, 8], this.patch_src);
    });

    it('should overwrite destination at offset', function () {
      assert.equal(10, this.patch_dest.get_pixel([8,  8])[0]);
      assert.equal(10, this.patch_dest.get_pixel([16, 16])[0]);
      assert.equal(10, this.patch_dest.get_pixel([23, 23])[0]);
    });
  });


  describe('copy', function() {
    beforeEach(function() {
      this.patch_dest = new sc_edit_patch([32, 32], 1, 255);
      this.patch_src = new sc_edit_patch([16, 16], 1, 255);
      sc_edit_view_methods.fill(this.patch_dest, [50]);
      sc_edit_view_methods.fill(this.patch_src,  [10]);
    });

    it('should copy the specified region to the specified destination', function () {
      // Copy an 8x8 region starting at [4,4] to [9, 9] at dest
      this.patch_src.set_pixel([4, 4], [11]);
      sc_edit_view_methods.copy(this.patch_dest, [9, 9], this.patch_src, [4, 4], [8, 8]);

      assert.equal(50, this.patch_dest.get_pixel([8, 8])[0]);
      assert.equal(11, this.patch_dest.get_pixel([9, 9])[0]);
      assert.equal(10, this.patch_dest.get_pixel([10, 10])[0]);
      assert.equal(10, this.patch_dest.get_pixel([16, 16])[0]);
      assert.equal(50, this.patch_dest.get_pixel([17, 17])[0]);
    });

    it('should not write out of bounds pixels from source', function () {
      // Copy an 4x4 region starting at [12,12] to [9, 9] at dest
      // Not copying an 8x8 region, which would set OOB pixels to the right/below the 4x4 area
      sc_edit_view_methods.copy(this.patch_dest, [9, 9], this.patch_src, [12, 12], [8, 8]);
      assert.equal(50, this.patch_dest.get_pixel([8, 8])[0]);
      assert.equal(10, this.patch_dest.get_pixel([9, 9])[0]);
      assert.equal(10, this.patch_dest.get_pixel([12, 12])[0]);
      assert.equal(50, this.patch_dest.get_pixel([13, 13])[0]);
    });
  });


  describe('weighted_blend', function() {
    before(function() {
      this.patch_dest = new sc_edit_patch([32, 32], 1, 255);
      this.patch_src = new sc_edit_patch([16, 16], 1, 255);
      this.patch_weight = new sc_edit_patch([16, 16], 1, 1);
      sc_edit_view_methods.fill(this.patch_dest, [50]);
      sc_edit_view_methods.fill(this.patch_src, [10]);
      sc_edit_view_methods.fill(this.patch_weight, [0.5]);
      // Blends a 50% of src into dest at [8, 8]
      sc_edit_view_methods.weighted_blend(this.patch_dest, [8, 8], this.patch_src, this.patch_dest, this.patch_weight);
    });

    it('should blends src into dest by weight', function () {
      assert.equal(30, this.patch_dest.get_pixel([ 8,  8])[0]);
      assert.equal(30, this.patch_dest.get_pixel([23, 23])[0]);
    });

    it('should not change are outside patch', function () {
      assert.equal(50, this.patch_dest.get_pixel([ 7,  7])[0]);
      assert.equal(50, this.patch_dest.get_pixel([24, 24])[0]);
    });
  });


  describe('radial_fill', function() {
    before(function() {
      this.patch = new sc_edit_patch([33, 33], 1, 255);
      this.inner_radius = 8;
      this.outer_radius = 16;
      this.inner_value = [80];
      this.outer_value = [40];
      sc_edit_view_methods.radial_fill(this.patch, this.inner_value, this.inner_radius, this.outer_value, this.outer_radius);
    });

    it('fills the centre radius with centre_value', function() {
      for (let y = -this.outer_radius; y <= this.outer_radius; y++) {
        const iy = y + this.outer_radius;
        for (let x = -this.outer_radius; x <= this.outer_radius; x++) {
          const ix = x + this.outer_radius;
          const r = Math.sqrt(x * x + y * y);

          if (r < this.inner_radius) {
            assert.equal(this.inner_value, this.patch.get_pixel([ix, iy])[0]);
          }
        }
      }
    });

    it('falls off linearly towards outer edge', function() {
      for (let y = -this.outer_radius; y <= this.outer_radius; y++) {
        const iy = y + this.outer_radius;
        for (let x = -this.outer_radius; x <= this.outer_radius; x++) {
          const ix = x + this.outer_radius;
          const r = Math.sqrt(x * x + y * y);

          if (r >= this.inner_radius && r < this.outer_radius) {
            const expected_value = this.inner_value[0] +
                                   (this.outer_value[0] - this.inner_value[0]) *
                                   ((r - this.inner_radius) / (this.outer_radius - this.inner_radius));
            assert.closeTo(expected_value, this.patch.get_pixel([ix, iy])[0], 1);
          }
        }
      }
    });

    it('fills outer ring with outer_value', function() {
      for (let y = -this.outer_radius; y <= this.outer_radius; y++) {
        const iy = y + this.outer_radius;
        for (let x = -this.outer_radius; x <= this.outer_radius; x++) {
          const ix = x + this.outer_radius;
          const r = Math.sqrt(x * x + y * y);

          if (r >= this.outer_radius) {
            assert.equal(this.outer_value, this.patch.get_pixel([ix, iy])[0]);
          }
        }
      }
    });
  });

  describe('calculate_histogram', function () {
    it('returns one histogram per subpixel', function() {
      const patch = new sc_edit_patch([32, 32], 3, 255);
      const histogram = sc_edit_view_methods.calculate_histogram(patch);
      assert.equal(3, histogram.length);
    });

    it('populates histogram with correct values in logp1 domain', function() {
      const patch = new sc_edit_patch([32, 32], 1, 255);
      const brush = new sc_edit_patch([16, 16], 1, 255);
      sc_edit_view_methods.fill(brush, [64]);
      sc_edit_view_methods.set(patch, [16, 0], brush);
      sc_edit_view_methods.fill(brush, [128]);
      sc_edit_view_methods.set(patch, [0, 16], brush);
      // Patch is now 50% 0, 25% 64 and 25% 128
      // Counting correctly should find logp1(512), logp1(256) and logp1(256)

      const histogram = sc_edit_view_methods.calculate_histogram(patch);

      assert.closeTo(Math.log1p(512), histogram[0][0], 0.0001);
      assert.closeTo(Math.log1p(256), histogram[0][64], 0.0001);
      assert.closeTo(Math.log1p(256), histogram[0][128], 0.0001);
      // Remaining bins should all be zero
      for (let i = 1; i < 64; i++) {
        assert.closeTo(0, histogram[0][i], 0.0001);
      }
      for (let i = 65; i < 128; i++) {
        assert.closeTo(0, histogram[0][i], 0.0001);
      }
      for (let i = 129; i < 256; i++) {
        assert.closeTo(0, histogram[0][i], 0.0001);
      }
    });

    it('returns correct number of bins', function() {
      const patch = new sc_edit_patch([32, 32], 1, 511);
      const histogram = sc_edit_view_methods.calculate_histogram(patch);
      assert.equal(512, histogram[0].length);
    });
  });
});
