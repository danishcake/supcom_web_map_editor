import { sc_edit_patch } from '../lib/views/sc_edit_patch';
import { sc_edit_view_snapshot } from '../lib/views/sc_edit_view_snapshot';
const assert = require('chai').assert;

describe('sc_edit_view_snapshot', function() {
  it('should have same size', function () {
    const source = new sc_edit_patch([128, 128]);
    const cache = new sc_edit_view_snapshot(source);


    assert.equal(source.width, cache.width);
    assert.equal(source.height, cache.height);
  });


  it('should have same values', function () {
    const source = new sc_edit_patch([128, 128]);
    const cache = new sc_edit_view_snapshot(source);

    source.set_pixel([25, 20], 100);
    assert.equal(100, cache.get_pixel([25, 20]));
  });


  it('should initially have nothing cached', function () {
    const source = new sc_edit_patch([128, 128]);
    const cache = new sc_edit_view_snapshot(source);

    assert.equal(0, cache.tile_count);
  });


  it('should cache in chunks of 16x16 on read', function () {
    const source = new sc_edit_patch([128, 128]);
    const cache = new sc_edit_view_snapshot(source);

    // Reading [0, 0] caches [0, 0] to [15, 15]
    cache.get_pixel([0, 0]);
    assert.equal(1, cache.tile_count);
    cache.get_pixel([15, 15]);
    assert.equal(1, cache.tile_count);

    // [16, 16] is outside cache, so another tile is cached
    cache.get_pixel([16, 16]);
    assert.equal(2, cache.tile_count);
  });


  it('should cache on writes too', function () {
    const source = new sc_edit_patch([128, 128]);
    const cache = new sc_edit_view_snapshot(source);

    // Reading [0, 0] caches [0, 0] to [15, 15]
    cache.set_pixel([0, 0], 25);
    assert.equal(1, cache.tile_count);
    cache.set_pixel([15, 15], 200);
    assert.equal(1, cache.tile_count);

    // [16, 16] is outside cache, so another tile is cached
    cache.set_pixel([16, 16], 1000);
    assert.equal(2, cache.tile_count);
  });


  it('should cope with unusual size sources', function () {
    const source = new sc_edit_patch([20, 20]);
    const cache = new sc_edit_view_snapshot(source);

    // Reading [0, 0] caches [0, 0] to [15, 15]
    cache.get_pixel([0, 0]);
    assert.equal(1, cache.tile_count);
    cache.get_pixel([15, 15]);
    assert.equal(1, cache.tile_count);

    // Cache [16, 16] to [19, 19] only
    cache.get_pixel([16, 16]);
    assert.equal(2, cache.tile_count);
  });
});
