import { sc_edit_heightmap } from '../lib/sc_edit_heightmap';
import { sc_edit_tool_base } from '../lib/tools/sc_edit_tool';
import { sc_edit_tool_data, sc_edit_tool_args } from '../lib/tools/sc_edit_tool_args'
import { sc_map } from '../lib/sc_map';
import { sc_edit_texturemap } from '../lib/sc_edit_texturemap';
import { sc_script_save } from '../lib/script/sc_script_save';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
import { sc_map_args } from '../lib/sc_map_args';
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool', function() {
  beforeEach('build a flat heightmap', function() {
    const default_5x5_map_args: sc_map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0, // 5x5
      default_height: 10000
    };
    let map = sc_map.create(default_5x5_map_args);
    this.hm = new sc_edit_heightmap(this.map.heightmap);
    this.tm = new sc_edit_texturemap(this.map.texturemap);
  });


  describe('heightmap tool construction', function() {
    it('stores radii and stength', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      assert.equal(16, tool.outer_radius);
      assert.equal(8,  tool.inner_radius);
      assert.equal(10, tool.strength);
    });
  });


  describe('heightmap tool lifecycle methods', function() {
    it('should call __start_impl immediately on start', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let start_impl_spy = sinon.spy(tool, '__start_impl');

      tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      assert(start_impl_spy.withArgs(this.hm, [0, 0]).calledOnce);
    });

    it('should call __apply_impl immediately on start', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      assert(apply_impl_spy.withArgs(this.hm, [0, 0]).calledOnce);
    });

    it('should call __end_impl on end call', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let end_impl_spy = sinon.spy(tool, '__end_impl');

      tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      assert(end_impl_spy.calledOnce);
    });

    it('should only call __apply_impl on apply call if active', function() {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      assert(!apply_impl_spy.called);
    });

    it('should only call __end_impl on end call if active', function () {
      let tool = new sc_edit_tool_base(16, 8, 10);
      let end_impl_spy = sinon.spy(tool, '__end_impl');

      tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      assert(!end_impl_spy.called);
    });
  });


  describe('application interpolation', function() {
    it('should apply intermediate points equally along line', function () {
        // 25% spacing of inner radius -> ideal spacing is 2px
      let tool = new sc_edit_tool_base(16, 8, 10);
      let apply_impl_spy = sinon.spy(tool, '__apply_impl');

      tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([10, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
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

      tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      tool.apply(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
                 new sc_edit_tool_args([9, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
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
