import { sc_edit_heightmap } from '../lib/sc_edit_heightmap';
import { sc_edit_tool_base } from '../lib/tools/sc_edit_tool.js';
import { sc_map } from '../lib/sc_map';
import { sc_rect } from '../lib/sc_rect';
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool', function() {
  beforeEach('build a flat heightmap', function() {
    let map = new sc_map();
    map.create({size: 0, default_height: 1000});
    this.edit_heightmap = new sc_edit_heightmap(map.heightmap);
  });


  describe('heightmap tool construction', function() {
    it('stores radii and stength', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      assert.equal(16, tool.__outer_radius);
      assert.equal(8,  tool.__inner_radius);
      assert.equal(10, tool.__strength);
    });
  });


  describe('heightmap tool lifecycle methods', function() {
    it('should call __start_impl immediately on start', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let start_impl_spy = sinon.spy(tool, '__start_impl');

      tool.start(this.edit_heightmap, null, [0, 0]);
      assert(start_impl_spy.withArgs(this.edit_heightmap, [0, 0]).calledOnce);
    });

    it('should call __apply_impl immediately on start', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.start(this.edit_heightmap, null, [0, 0]);
      assert(apply_impl_spy.withArgs(this.edit_heightmap, [0, 0]).calledOnce);
    });

    it('should call __end_impl on end call', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let end_impl_spy = sinon.spy(tool, '__end_impl');

      tool.start(this.edit_heightmap, null, [0, 0]);
      tool.end(this.edit_heightmap, null, [0, 0]);
      assert(end_impl_spy.calledOnce);
    });

    it('should only call __apply_impl on apply call if active', function() {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.apply(this.edit_heightmap, null, [0, 0]);
      assert(!apply_impl_spy.called);
    });

    it('should only call __end_impl on end call if active', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let end_impl_spy = sinon.spy(tool, '__end_impl');

      tool.end(this.edit_heightmap, null, [0, 0]);
      assert(!end_impl_spy.called);
    });
  });


  describe('application interpolation', function() {
    it('should apply intermediate points equally along line', function () {
        // 25% spacing of inner radius -> ideal spacing is 2px
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.start(this.edit_heightmap, null, [0, 0]);
      tool.apply(this.edit_heightmap, null, [10, 0]);
      assert.equal(apply_impl_spy.callCount, 6);

      assert.closeTo(apply_impl_spy.getCall(0).args[1][0], 0,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(0).args[1][1], 0,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(1).args[1][0], 2,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(1).args[1][1], 0,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(2).args[1][0], 4,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(2).args[1][1], 0,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(3).args[1][0], 6,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(3).args[1][1], 0,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(4).args[1][0], 8,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(4).args[1][1], 0,  0.0001);
      assert.closeTo(apply_impl_spy.getCall(5).args[1][0], 10, 0.0001);
      assert.closeTo(apply_impl_spy.getCall(5).args[1][1], 0,  0.0001);
    });

    it('should round down number of applications', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.start(this.edit_heightmap, null, [0, 0]);
      tool.apply(this.edit_heightmap, null, [9, 0]);
      assert.equal(apply_impl_spy.callCount, 5);
    });
  });

  describe('tool sizing', function() {
    it('is reflected in minimum spacing', function() {
      let tool = new sc_edit_tool_base(32, 24, 10);
      assert.closeTo(tool.ideal_spacing, 6, 0.001);

      tool.set_inner_radius(16);
      assert.closeTo(tool.ideal_spacing, 4, 0.001);
    });

    it('cannot lower minimum spacing below 2', function() {
      let tool = new sc_edit_tool_base(32, 4, 10);
      assert.closeTo(tool.ideal_spacing, 2, 0.001);
    });
  });
});
