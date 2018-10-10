import { sc_edit_symmetry, sc_edit_symmetry_base } from '../lib/sc_edit_symmetry';
import * as _ from 'underscore';
import { sc_vec2 } from '../lib/sc_vec';
const assert = require('chai').assert;

/**
 * @param symmetry {sc_edit_symmetry_base} Type of symmetry
 * @param size {Array} 2D size of the complete region
 * @param points {Array} Array of points to checked
 *
 * Checks every point maps is considered primary
 */
const all_map_to_primary = function(symmetry: sc_edit_symmetry_base, size: sc_vec2, points: sc_vec2[]) {
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
const none_map_to_primary = function(symmetry: sc_edit_symmetry_base, size: sc_vec2, points: sc_vec2[]) {
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
const maps_to_all = function(symmetry: sc_edit_symmetry_base, size: sc_vec2, point: sc_vec2, results: sc_vec2[]) {
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
        const size: sc_vec2 = [257, 257];
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
        const size: sc_vec2 = [256, 256];
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
        const size: sc_vec2 = [257, 257];

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
        const size: sc_vec2 = [256, 256];
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


  /* 120000
   * 235000
   * 456000
   * 456000
   * 230000
   * 100000
   *
   *
   *
   * 1247000
   * 2358000
   * 4569000
   * 789A000
   * 4560000
   * 2300000
   * 1000000
   */
  describe('Octants', function() {
    const sym = new sc_edit_symmetry.octants();
    describe('get_primary_pixel', function() {
      describe('odd dimensions', function() {
        const size: sc_vec2 = [257, 257];

        it('should consider the top-left octant primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [0,   127],
            [127, 127]]);
        });

        it('should consider x=y lines as primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [0,   128],
            [128, 128]]);
        });

        it('should not consider any other octant as primary', function() {
          none_map_to_primary(sym, size, [
            [127,   0],
            [129,   0],
            [0,   129],
            [129, 129]]);
        });
      });


      describe('even dimensions', function() {
        const size: sc_vec2 = [256, 256];

        it('should consider the top-left octant as primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [0,   127],
            [127, 127]]);
        });

        it('should not consider any other octant as primary', function() {
          none_map_to_primary(sym, size, [
            [127,   0],
            [128,   0],
            [0,   128],
            [128, 128]]);
        });
      });
    });


    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
        const size: sc_vec2 = [257, 257];

        it('should map corners to other corners', function() {
          maps_to_all(sym, size, [0, 0], [
            [0,   256],
            [256, 0],
            [256, 256]]);
        });

        it('should map non-degenerate points to other octants', function() {
          maps_to_all(sym, size, [0, 5], [
            [5,     0],
            [251,   0],
            [256,   5],
            [256, 251],
            [251, 256],
            [5,   256],
            [0,   251]]);
        });
      });


      describe('even dimensions', function() {
        it('should map corners to other corners', function() {
          // TODO: Write some tests. My head hurts thinking about this without paper :(
          //maps_to_all(sym, size, [0, 0], [
          //  [0,   255],
          //  [255, 0],
          //  [256, 256]]);
        });
      });
    });
  });


  describe('XY', function() {
    const sym = new sc_edit_symmetry.xy();
    describe('get_primary_pixel', function() {
      /**
       * 1247BGM
       * 235000N
       * 456900O
       * 789AE0P
       * BCDEFKQ
       * GHIJKLR
       * MNOPQRS
       */
      describe('odd dimensions', function() {
        const size: sc_vec2 = [257, 257];

        it('should consider x <= y primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [25,   26],
            [0,   128],
            [128, 128],
            [128, 256],
            [256, 256]]);
        });

        it('should consider x > y secondary', function() {
          none_map_to_primary(sym, size, [
            [1,     0],
            [27,   26],
            [129, 128],
            [256, 128],
            [256, 255]]);
        });
      });


      describe('even dimensions', function() {
        const size: sc_vec2 = [256, 256];

        it('should consider x <= y primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [25,   26],
            [0,   128],
            [128, 128],
            [128, 255],
            [255, 255]]);
        });

        it('should consider x > y secondary', function() {
          none_map_to_primary(sym, size, [
            [1,     0],
            [27,   26],
            [129, 128],
            [255, 128],
            [255, 254]]);
        });
      });
    });


    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
        const size: sc_vec2 = [257, 257];

        it('should mirror about x==y', function() {
          maps_to_all(sym, size, [0,   5], [[5,     0]]);
          maps_to_all(sym, size, [0, 256], [[256,   0]]);
          maps_to_all(sym, size, [25, 64], [[64,   25]]);
        });

        it('should not return secondaries if x==y', function() {
          maps_to_all(sym, size, [0,     0], []);
          maps_to_all(sym, size, [256, 256], []);
        });
      });


      describe('even dimensions', function() {
        const size: sc_vec2 = [256, 256];

        it('should mirror about x==y', function() {
          maps_to_all(sym, size, [0,   5], [[5,     0]]);
          maps_to_all(sym, size, [0, 255], [[255,   0]]);
          maps_to_all(sym, size, [25, 64], [[64,   25]]);
        });

        it('should not return secondaries if x==y', function() {
          maps_to_all(sym, size, [0,     0], []);
          maps_to_all(sym, size, [255, 255], []);
        });
      });
    });
  });


  describe('YX', function() {
    const sym = new sc_edit_symmetry.yx();

    describe('get_primary_pixel', function() {
      describe('odd dimensions', function() {
        let size: sc_vec2 = [257, 257];

        // Note title ignores a translation
        // Although untested, the line runs through [size.x, 0]
        it('should consider x + y < size.x primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [256,   0],
            [0,   256],
            [128, 128]]);
        });

        it('should consider x + y >= size.x secondary', function() {
          none_map_to_primary(sym, size, [
            [129, 128],
            [128, 129],
            [256,   1],
            [1,   256]]);
        });
      });


      describe('even dimensions', function() {
        let size: sc_vec2 = [256, 256];

        it('should consider x + y < size.x primary', function() {
          all_map_to_primary(sym, size, [
            [0,     0],
            [255,   0],
            [0,   255],
            [128, 127],
            [127, 128]]);
        });

        it('should consider x + y >= size.x secondary', function() {
          none_map_to_primary(sym, size, [
            [128, 128],
            [255,   1],
            [1,   255]]);
        });
      });
    });


    describe('get_secondary_pixels', function() {
      describe('odd dimensions', function() {
        let size: sc_vec2 = [257, 257];

        it('should mirror about x + y = size.x', function() {
          maps_to_all(sym, size, [0,    0], [[256, 256]]);
          maps_to_all(sym, size, [0,  255], [[1,   256]]);
          maps_to_all(sym, size, [255,  0], [[256,   1]]);
        });

        it('should not return secondaries if x + y = size.x - 1', function() {
          maps_to_all(sym, size, [256,   0], []);
          maps_to_all(sym, size, [0,   256], []);
          maps_to_all(sym, size, [128, 128], []);
        });
      });


      describe('even dimensions', function() {
        let size: sc_vec2 = [256, 256];

        it('should mirror about x + y = size.x', function() {
          maps_to_all(sym, size, [0,    0], [[255, 255]]);
          maps_to_all(sym, size, [0,  254], [[1,   255]]);
          maps_to_all(sym, size, [254,  0], [[255,   1]]);
        });

        it('should not return secondaries if x + y = size.x - 1', function() {
          maps_to_all(sym, size, [255,   0], []);
          maps_to_all(sym, size, [0,   255], []);
          maps_to_all(sym, size, [128, 127], []);
          maps_to_all(sym, size, [127, 128], []);
        });
      });
    });
  });
});
