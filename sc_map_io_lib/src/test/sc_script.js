import { sc } from '../lib/sc';
const assert = require('chai').assert;
const fs = require('fs');
const ByteBuffer = require('bytebuffer');



describe('sc_script', function() {
  describe('sc_script_base', function() {
    it('should support FLOAT', function() {
      let script_base = new sc.script.base();
      script_base.run_script("FLOAT(1)")
    });

    it('should support BOOLEAN', function() {
      let script_base = new sc.script.base();
      script_base.run_script("BOOLEAN(false)")
    });

    it('should support STRING', function() {
      let script_base = new sc.script.base();
      script_base.run_script('STRING("rabbit")')
    });

    it('should support GROUP', function() {
      let script_base = new sc.script.base();
      script_base.run_script('GROUP({})')
    });

    it('should support VECTOR3', function() {
      let script_base = new sc.script.base();
      script_base.run_script('VECTOR3(0, 0, 0)')
    });
  });


  describe('sc_script_scenario', function() {
    describe('loading', function() {
      let scenario_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_scenario.lua");

      it('should extract name from scenario', function () {
        let scenario_data_bb = ByteBuffer.wrap(scenario_data, ByteBuffer.LITTLE_ENDIAN);
        let scenario_script = new sc.script.scenario();
        scenario_script.load(scenario_data_bb);

        assert.equal("Shuriken Valley", scenario_script.name);
      });

      it('should extract description from scenario', function () {
        let scenario_data_bb = ByteBuffer.wrap(scenario_data, ByteBuffer.LITTLE_ENDIAN);
        let scenario_script = new sc.script.scenario();
        scenario_script.load(scenario_data_bb);

        assert.equal("Ai Markers. By Claimer9", scenario_script.description);
      });

      it('should extract other scripts from scenario', function () {
        let scenario_data_bb = ByteBuffer.wrap(scenario_data, ByteBuffer.LITTLE_ENDIAN);
        let scenario_script = new sc.script.scenario();
        scenario_script.load(scenario_data_bb);

        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley.scmap", scenario_script.map_filename);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_save.lua", scenario_script.save_filename);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_script.lua", scenario_script.script_filename);
      });
    });

    describe('creation', function() {
      it('should derive filenames from map name', function() {
        let script = new sc.script.scenario()
        script.create({
          name: "Awesome Volcano",               // Used to determine filenames
          author: "1337 internet tag",
          description: "Description of map",
          size: 0,
          default_height: 0
        });

        assert.equal(script.name,            "Awesome Volcano");
        assert.equal(script.description,     "Description of map");
        assert.equal(script.map_filename,    "awesome_volcano.scmap");
        assert.equal(script.save_filename,   "awesome_volcano_save.lua");
        assert.equal(script.script_filename, "awesome_volcano_script.lua");
      });
    });

    describe('saving', function() {

    });
  });


  describe('sc_script_save', function() {
    describe('loading', function() {
      let save_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_save.lua");

      it('should load markers', function() {
        let save_data_bb = ByteBuffer.wrap(save_data, ByteBuffer.LITTLE_ENDIAN);
        let save_script = new sc.script.save();
        save_script.load(save_data_bb);

        assert.closeTo(35.5000, save_script.markers['ARMY_1'].position.x, 0.00001);
        assert.closeTo(75.9766, save_script.markers['ARMY_1'].position.y, 0.00001);
        assert.closeTo(154.500, save_script.markers['ARMY_1'].position.z, 0.00001);

        assert.closeTo(221.500, save_script.markers['ARMY_2'].position.x, 0.00001);
        assert.closeTo(75.9766, save_script.markers['ARMY_2'].position.y, 0.00001);
        assert.closeTo(95.5000, save_script.markers['ARMY_2'].position.z, 0.00001);

        assert.isTrue(save_script.markers['ARMY_3'] === undefined);
      });

      // TODO: Do I actually need to worry about this?
      it('should load armies', function() {
      });
    });

    describe('creation', function() {
      it('should do nothing', function() {
        let script = new sc.script.save()
        script.create({
          name: "Awesome Volcano",               // Used to determine filenames
          author: "1337 internet tag",
          description: "Description of map",
          size: 0,
          default_height: 0
        });

        assert.equal(0, Object.keys(script.markers).length);
      });
    });

    describe('saving', function() {
    });
  });
});
