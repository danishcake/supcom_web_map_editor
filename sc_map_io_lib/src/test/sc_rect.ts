import { sc_rect } from '../lib/sc_rect';
const assert = require('chai').assert;

describe('sc_rect', function() {
  describe('edges', function() {
    let rect = new sc_rect(10, 20, 30, 40);

    it('should have right = left + width - 1', function () {
      assert.equal(rect.right, 39);
    });

    it('should have bottom = top + height - 1', function () {
      assert.equal(rect.bottom, 59);
    });
  });

  describe('merging', function() {
    let rect1 = new sc_rect(10, 10, 10, 10);
    let rect2 = new sc_rect(30, 40, 10, 10);

    rect1.expand(rect2);

    it('should have left = min(rect1.left, rect2.left)', function () {
      assert.equal(rect1.left, 10);
    });

    it('should have right = max(rect1.right, rect2.right)', function () {
      assert.equal(rect1.right, 39);
    });

    it('should have bottom = max(rect1.bottom, rect2.bottom)', function () {
      assert.equal(rect1.bottom, 49);
    });

    it('should have top = min(rect1.top, rect2.top)', function () {
      assert.equal(rect1.top, 10);
    });
  });
});
