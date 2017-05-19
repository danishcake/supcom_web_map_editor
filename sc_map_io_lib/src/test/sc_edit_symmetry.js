import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;

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
          assert.deepEqual(sym.get_secondary_pixels([128,   0], [257, 257]), [[128,  0]]);
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
          assert.deepEqual(sym.get_secondary_pixels([0,   128], [257, 257]), [[0, 128]]);
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
});
