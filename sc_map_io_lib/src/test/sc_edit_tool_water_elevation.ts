import { sc_edit_tool_water_elevation, water_depth } from '../lib/tools/sc_edit_tool_water_elevation';
import { sc_edit_tool_data, sc_edit_tool_args } from '../lib/tools/sc_edit_tool_args'
import { sc_map } from '../lib/sc_map';
import { sc_edit_heightmap } from '../lib/sc_edit_heightmap';
import { sc_edit_texturemap } from '../lib/sc_edit_texturemap';
import { sc_script_save } from '../lib/script/sc_script_save';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;

describe('sc_edit_tool_water_elevation', function() {
  beforeEach('create a map with height ramp', function () {
    this.map = new sc_map();
    this.map.create({
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0 // 5x5
    });

    this.hm = new sc_edit_heightmap(this.map.heightmap);
    for (let i = 0; i < this.hm.height; i++) {
      this.hm.set_pixel([i, 0], [i]);
    }
    this.tm = new sc_edit_texturemap(this.map.texturemap);

    // Force known heights
    this.map.water.elevation = 30;
    this.map.water.elevation_deep = 20;
    this.map.water.elevation_abyss = 10;
    // Force 1:1 scale for water, making the water height use same usits as terrain height
    this.map.heightmap.scale = 1;
  });

  describe('applying tool', function() {
    const tool = new sc_edit_tool_water_elevation(water_depth.shallow);

    it('enables water', function () {
      this.map.water.has_water = false;

      tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
        new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
      tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
        new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

      assert.equal(true, this.map.water.has_water);
    });
  });


  describe('changing shallow', function() {
    const tool = new sc_edit_tool_water_elevation(water_depth.shallow);
    describe('lowering shallow', function() {

      it('should lower the shallow elevation', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(5, this.map.water.elevation);
      });

      it('should prevent deeper elevations being higher', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(5, this.map.water.elevation_deep);
        assert.equal(5, this.map.water.elevation_abyss);
      });
    });


    describe('raising shallow', function() {
      it('should raise the shallow elevation', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(50, this.map.water.elevation);
      });

      it('should not change deeper elevations', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(20, this.map.water.elevation_deep);
        assert.equal(10, this.map.water.elevation_abyss);
      });
    });
  });

  describe('changing deep', function() {
    const tool = new sc_edit_tool_water_elevation(water_depth.deep);
    describe('lowering deep', function() {

      it('should lower the deep elevation', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(5, this.map.water.elevation_deep);
      });

      it('should not change higher elevations', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(30, this.map.water.elevation);
      });

      it('should prevent deeper elevations being higher', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(5, this.map.water.elevation_abyss);
      });
    });


    describe('raising deep', function() {

      it('should raise the deep elevation', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(50, this.map.water.elevation_deep);
      });

      it('should not change deeper elevations', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(10, this.map.water.elevation_abyss);
      });

      it('should prevent higher elevations being lower', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(50, this.map.water.elevation);
      });
    });

  });

  describe('changing abyssal', function() {
    const tool = new sc_edit_tool_water_elevation(water_depth.abyssal);
    describe('lowering abyssal', function() {
      it('should lower the abyssal elevation', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(5, this.map.water.elevation_abyss);
      });

      it('should not change the higher elevations', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(30, this.map.water.elevation);
        assert.equal(20, this.map.water.elevation_deep);
      });
    });

    describe('raising abyssal', function() {

      it('should raise the abyssal elevation', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(50, this.map.water.elevation_abyss);
      });

      it('should prevent higher elevations being lower', function() {
        tool.start(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
        tool.end(new sc_edit_tool_data(this.hm, this.tm, null as any as sc_script_save, this.hm, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

        assert.equal(50, this.map.water.elevation);
        assert.equal(50, this.map.water.elevation_abyss);
      });
    });
  });
});

