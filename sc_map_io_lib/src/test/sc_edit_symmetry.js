import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
import {_} from 'underscore';
const assert = require('chai').assert;

/**
 * @param symmetry {sc_edit_symmetry_base} Type of symmetry
 * @param size {Array} 2D size of the complete region
 * @param points {Array} Array of points to checked
 *
 * Checks every point maps is considered primary
 */
const all_map_to_primary = function(symmetry, size, points) {
  _.each(points, (point) => {
    assert.deepEqual(symmetry.get_primary_pixel(point, size), point);
  });
};


/**
 * @param symmetry {sc_edit_symmetry_base} Type of symmetry
 * @param size {Array} 2D size of the complete region
 * @param points {Array} Array of points to checked
 *
 * Checks every point maps is considered non-primary
 */
const none_map_to_primary = function(symmetry, size, points) {
  _.each(points, (point) => {
    assert.notDeepEqual(symmetry.get_primary_pixel(point, size), point);
  });
};


/**
 * @param symmetry {sc_edit_symmetry_base} Type of symmetry
 * @param size {Array} 2D size of the complete region
 * @param point {Array} Single input point
 * @param points {Array} Expected output points
 *
 * Checks a single point maps to all expected outputs
 */
const maps_to_all = function(symmetry, size, point, results) {
  const secondary_pixels = symmetry.get_secondary_pixels(point, size);

  for (let i = 0; i < results.length; i++) {
    let result_matched = _.find(secondary_pixels, function(value) {
      let match = value[0] == results[i][0] && value[1] == results[i][1];
      return match;
    });

    assert.isOk(result_matched, `[${results[i]}] should be contained in [${secondary_pixels}] drived from [${point}]`);
  }
};



describe('sc_edit_symmetry', function() {
  describe('base', function() {
    it('should throw for OOB access', function () {
    });
  });


  describe('none', function() {
    let sym = new sc_edit_symmetry.none();

    it('should transform all points to same spot', function () {
      assert.deepEqual(sym.get_primary_pixel([0, 0],     [257, 257]), [0,     0]);
      assert.deepEqual(sym.get_primary_pixel([256, 256], [257, 257]), [256, 256]);
      assert.deepEqual(sym.get_primary_pixel([0,   256], [257, 257]), [0,   256]);
      assert.deepEqual(sym.get_primary_pixel([256,   0], [257, 257]), [256,   0]);
    });

    it('should return no secondary pixels', function () {
      assert.deepEqual(sym.get_secondary_pixels([0,     0], [256, 256]), []);
      assert.deepEqual(sym.get_secondary_pixels([255, 255], [256, 256]), []);
      assert.deepEqual(sym.get_secondary_pixels([0,   255], [256, 256]), []);
      assert.deepEqual(sym.get_secondary_pixels([255,   0], [256, 256]), []);
    });
  });

  describe('horizontal', function() {
    let sym = new sc_edit_symmetry.horizontal();

    describe('get primary pixel', function() {
      describe('odd widths', function() {
        // 257 wide. Input 127 should map to 127
        // 257 wide. Input 128 should map to 128
        it('should transform points less than or equal to floor(width / 2) to self', function () {
          assert.deepEqual(sym.get_primary_pixel([0,     0], [257, 257]), [0,    0]);
          assert.deepEqual(sym.get_primary_pixel([1,     0], [257, 257]), [1,    0]);
          assert.deepEqual(sym.get_primary_pixel([127,   0], [257, 257]), [127,  0]);
          assert.deepEqual(sym.get_primary_pixel([128,   0], [257, 257]), [128,  0]);
        });


        // 257 wide. Input 129 should map to 127
        it('should transform points greater than floor(width / 2) to width - x', function() {
          assert.deepEqual(sym.get_primary_pixel([129,   0], [257, 257]), [127,  0]);
          assert.deepEqual(sym.get_primary_pixel([255,   0], [257, 257]), [1,    0]);
          assert.deepEqual(sym.get_primary_pixel([256,   0], [257, 257]), [0,    0]);
        });
      });

      describe('even widths', function() {
        // 256 wide. Input 127 should map to 127
        it('should transform points less than floor(width / 2) to self', function () {
          assert.deepEqual(sym.get_primary_pixel([0,     0], [256, 256]), [0,    0]);
          assert.deepEqual(sym.get_primary_pixel([1,     0], [256, 256]), [1,    0]);
          assert.deepEqual(sym.get_primary_pixel([126,   0], [256, 256]), [126,  0]);
          assert.deepEqual(sym.get_primary_pixel([127,   0], [256, 256]), [127,  0]);
        });

        // 256 wide. Input 128 should map to 127
        // 256 wide. Input 129 should map to 126
        it('should transform points greater than or equal to floor(width / 2) to width - x', function() {
          assert.deepEqual(sym.get_primary_pixel([128,   0], [256, 256]), [127,  0]);
          assert.deepEqual(sym.get_primary_pixel([129,   0], [256, 256]), [126,  0]);
          assert.deepEqual(sym.get_primary_pixel([254,   0], [256, 256]), [1,    0]);
          assert.deepEqual(sym.get_primary_pixel([255,   0], [256, 256]), [0,    0]);
        });
      });
    });


    describe('get_secondary_pixels', function() {
      // Note: Non-primary pixels are undefined but unchecked
      describe('odd widths', function() {
        // 257 wide. Input 0 should map to 256
        // 257 wide. Input 127 should map to 129
        // 257 wide. Input 128 should map to 128
        it('should transform points less than or equal to floor(width / 2) to width - x - 1', function() {
          assert.deepEqual(sym.get_secondary_pixels([0,     0], [257, 257]), [[256,  0]]);
          assert.deepEqual(sym.get_secondary_pixels([127,   0], [257, 257]), [[129,  0]]);
        });

        it('should not map the central line', function() {
          assert.deepEqual(sym.get_secondary_pixels([128,   0], [257, 257]), []);
        });
      });

      describe('even widths', function() {
        // 256 wide. Input 0 should map to 255
        // 256 wide. Input 127 should map to 128
        it('should transform points less than or equal to floor(width / 2) to width - x - 1', function() {
          assert.deepEqual(sym.get_secondary_pixels([0,     0], [256, 256]), [[255,  0]]);
          assert.deepEqual(sym.get_secondary_pixels([127,   0], [256, 256]), [[128,  0]]);
        });
      });
    });
  });

  describe('vertical', function() {
    let sym = new sc_edit_symmetry.vertical();

    describe('odd heights', function() {
      // 257 high. Input 127 should map to 127
      // 257 high. Input 128 should map to 128
      // 257 high. Input 129 should map to 127
      it('should transform points less than or equals to floor(height / 2) to self', function () {
        assert.deepEqual(sym.get_primary_pixel([0, 0],   [257, 257]), [0, 0]);
        assert.deepEqual(sym.get_primary_pixel([0, 1],   [257, 257]), [0, 1]);
        assert.deepEqual(sym.get_primary_pixel([0, 127], [257, 257]), [0, 127]);
        assert.deepEqual(sym.get_primary_pixel([0, 128], [257, 257]), [0, 128]);
        assert.deepEqual(sym.get_primary_pixel([0, 129], [257, 257]), [0, 127]);
        assert.deepEqual(sym.get_primary_pixel([0, 255], [257, 257]), [0, 1]);
        assert.deepEqual(sym.get_primary_pixel([0, 256], [257, 257]), [0, 0]);
      });
    });

    describe('even heights', function() {
        // 256 wide. Input 127 should map to 127
        // 256 wide. Input 128 should map to 127
        // 256 wide. Input 129 should map to 126
      it('should transform points less than or equals to floor(height / 2) to self', function () {
        assert.deepEqual(sym.get_primary_pixel([0, 0],   [256, 256]), [0, 0]);
        assert.deepEqual(sym.get_primary_pixel([0, 1],   [256, 256]), [0, 1]);
        assert.deepEqual(sym.get_primary_pixel([0, 126], [256, 256]), [0, 126]);
        assert.deepEqual(sym.get_primary_pixel([0, 127], [256, 256]), [0, 127]);
        assert.deepEqual(sym.get_primary_pixel([0, 128], [256, 256]), [0, 127]);
        assert.deepEqual(sym.get_primary_pixel([0, 129], [256, 256]), [0, 126]);
        assert.deepEqual(sym.get_primary_pixel([0, 254], [256, 256]), [0, 1]);
        assert.deepEqual(sym.get_primary_pixel([0, 255], [256, 256]), [0, 0]);
      });
    });

    describe('get_secondary_pixels', function() {
      // Note: Non-primary pixels are undefined but unchecked
      describe('odd heights', function() {
        // 257 high. Input 0 should map to 256
        // 257 high. Input 127 should map to 129
        // 257 high. Input 128 should map to 128
        it('should transform points less than or equal to floor(height / 2) to height - y - 1', function() {
          assert.deepEqual(sym.get_secondary_pixels([0,     0], [257, 257]), [[0, 256]]);
          assert.deepEqual(sym.get_secondary_pixels([0,   127], [257, 257]), [[0, 129]]);
        });

        it('should not map the central line', function() {
          assert.deepEqual(sym.get_secondary_pixels([0,   128], [257, 257]), []);
        });
      });

      describe('even heights', function() {
        // 256 wide. Input 0 should map to 255
        // 256 wide. Input 127 should map to 128
        it('should transform points less than or equal to floor(height / 2) to height - y - 1', function() {
          assert.deepEqual(sym.get_secondary_pixels([0,   0], [256, 256]), [[0, 255]]);
          assert.deepEqual(sym.get_secondary_pixels([0, 127], [256, 256]), [[0, 128]]);
        });
      });
    });
  });


  describe('Quadrants', function() {
    const sym = new sc_edit_symmetry.quadrants();

    describe('get_primary_pixel', function() {
      describe('odd dimensions', function() {
        const size = [257, 257];
        it('should consider coordinates < half as primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [127,   0],
            [0,   127],
            [127, 127]]);
        });


        it('should consider coordinates == half as primary', function() {
          all_map_to_primary(sym, size, [
            [128,   0],
            [0,   128],
            [128, 128]]);
        });


        it('should consider coordinates > half as non-primary', function() {
          none_map_to_primary(sym, size, [
            [129, 129],
            [0,   129],
            [129,   0],
            [256, 256]]);
        });
      });


      describe('even dimensions', function() {
        const size = [256, 256];
        it('should consider coordinates < half as primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [127,   0],
            [0,   127],
            [127, 127]]);
        });


        it('should consider coordinates >= half as non-primary', function() {
          none_map_to_primary(sym, size, [
            [128, 128],
            [0,   128],
            [128,   0],
            [255, 255]]);
        });
      });
    });

    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
        const size = [257, 257];

        it('should map to the other quadrants', function() {
          maps_to_all(sym, size, [0, 0], [
            [0,   256],
            [256,   0],
            [256, 256]]);
          maps_to_all(sym, size, [127, 0], [
            [127,   256],
            [129,   0],
            [129, 256]]);
          maps_to_all(sym, size, [0, 127], [
            [0,   129],
            [256, 127],
            [256, 129]]);
          maps_to_all(sym, size, [127, 127], [
            [127, 129],
            [129, 127],
            [129, 129]]);
        });

        it('should not map the central lines', function() {
          maps_to_all(sym, size, [128,   0], []);
          maps_to_all(sym, size, [0,   128], []);
          maps_to_all(sym, size, [128, 128], []);
        });
      });


      describe('even dimensions', function() {
        const size = [256, 256];
        it('should map to the other quadrants', function() {
          maps_to_all(sym, size, [0, 0], [
            [0,   255],
            [255,   0],
            [255, 255]]);
          maps_to_all(sym, size, [127, 0], [
            [128,   0],
            [127, 255],
            [128, 255]]);
          maps_to_all(sym, size, [0, 127], [
            [0,   128],
            [255, 127],
            [255, 128]]);
          maps_to_all(sym, size, [127, 127], [
            [127, 128],
            [128, 127],
            [128, 128]]);
        });
      });
    });
  });


  describe('Octants', function() {
    describe('get_primary_pixel', function() {
      describe('odd dimensions', function() {
      });


      describe('even dimensions', function() {
      });
    });


    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
      });


      describe('even dimensions', function() {
      });
    });
  });


  describe('XY', function() {
    describe('get_primary_pixel', function() {
      describe('odd dimensions', function() {
      });


      describe('even dimensions', function() {
      });
    });


    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
      });


      describe('even dimensions', function() {
      });
    });
  });


  describe('X-Y', function() {
    describe('get_primary_pixel', function() {
      describe('odd dimensions', function() {
      });


      describe('even dimensions', function() {
      });
    });


    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
      });


      describe('even dimensions', function() {
      });
    });
  });
});
