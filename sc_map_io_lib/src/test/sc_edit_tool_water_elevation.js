import { sc } from '../lib/sc';
import { sc_edit_tool_water_elevation } from '../lib/tools/sc_edit_tool_water_elevation.js';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args.js"
const assert = require('chai').assert;

describe('sc_edit_tool_water_elevation', function() {
  beforeEach('create a map with height ramp', function () {
    this.map = new sc.map();
    this.map.create({
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0 // 5x5
    });

    this.edit_heightmap = new sc.edit.heightmap(this.map.heightmap);
    for (let i = 0; i < this.edit_heightmap.height; i++) {
      this.edit_heightmap.set_pixel([i, 0], [i]);
    }

    // Force known heights
    this.map.water.elevation = 30;
    this.map.water.elevation_deep = 20;
    this.map.water.elevation_abyss = 10;
    // Force 1:1 scale for water, making the water height use same usits as terrain height
    this.map.heightmap.scale = 1;
  });

  describe('applying tool', function() {
    const tool = new sc_edit_tool_water_elevation(sc_edit_tool_water_elevation.shallow);

    it('enables water', function () {
      this.map.water.has_water = false;

      tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
        new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
      tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
        new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

      assert.equal(true, this.map.water.has_water);
    });
  });


  describe('changing shallow', function() {
    const tool = new sc_edit_tool_water_elevation(sc_edit_tool_water_elevation.shallow);
    describe('lowering shallow', function() {

      it('should lower the shallow elevation', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(5, this.map.water.elevation);
      });

      it('should prevent deeper elevations being higher', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(5, this.map.water.elevation_deep);
        assert.equal(5, this.map.water.elevation_abyss);
      });
    });


    describe('raising shallow', function() {
      it('should raise the shallow elevation', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(50, this.map.water.elevation);
      });

      it('should not change deeper elevations', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(20, this.map.water.elevation_deep);
        assert.equal(10, this.map.water.elevation_abyss);
      });
    });
  });

  describe('changing deep', function() {
    const tool = new sc_edit_tool_water_elevation(sc_edit_tool_water_elevation.deep);
    describe('lowering deep', function() {

      it('should lower the deep elevation', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(5, this.map.water.elevation_deep);
      });

      it('should not change higher elevations', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(30, this.map.water.elevation);
      });

      it('should prevent deeper elevations being higher', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(5, this.map.water.elevation_abyss);
      });
    });


    describe('raising deep', function() {

      it('should raise the deep elevation', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(50, this.map.water.elevation_deep);
      });

      it('should not change deeper elevations', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(10, this.map.water.elevation_abyss);
      });

      it('should prevent higher elevations being lower', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(50, this.map.water.elevation);
      });
    });

  });

  describe('changing abyssal', function() {
    const tool = new sc_edit_tool_water_elevation(sc_edit_tool_water_elevation.abyssal);
    describe('lowering abyssal', function() {
      it('should lower the abyssal elevation', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(5, this.map.water.elevation_abyss);
      });

      it('should not change the higher elevations', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([5, 0], sc_edit_tool_args.modifier_none));

        assert.equal(30, this.map.water.elevation);
        assert.equal(20, this.map.water.elevation_deep);
      });
    });

    describe('raising abyssal', function() {

      it('should raise the abyssal elevation', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(50, this.map.water.elevation_abyss);
      });

      it('should prevent higher elevations being lower', function() {
        tool.start(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));
        tool.end(new sc_edit_tool_data(this.edit_heightmap, null, null, null, this.map),
          new sc_edit_tool_args([50, 0], sc_edit_tool_args.modifier_none));

        assert.equal(50, this.map.water.elevation);
        assert.equal(50, this.map.water.elevation_abyss);
      });
    });
  });
});

