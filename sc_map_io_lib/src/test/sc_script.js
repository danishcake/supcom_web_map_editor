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
    let scenario_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_scenario.lua");
    let scenario_data_bb = ByteBuffer.wrap(scenario_data, ByteBuffer.LITTLE_ENDIAN);

    describe('loading', function() {
      let scenario_script = new sc.script.scenario();
      scenario_script.load(scenario_data_bb);

      it('should extract name from scenario', function () {
        assert.equal("Shuriken Valley", scenario_script.name);
      });

      it('should extract description from scenario', function () {
        assert.equal("Ai Markers. By Claimer9", scenario_script.description);
      });

      it('should extract other scripts from scenario', function () {
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley.scmap", scenario_script.map_filename);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_save.lua", scenario_script.save_filename);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_script.lua", scenario_script.script_filename);
      });

      it('should extract armies', function() {
        assert.equal(2, scenario_script.armies.length);
        assert.equal("ARMY_1", scenario_script.armies[0]);
        assert.equal("ARMY_2", scenario_script.armies[1]);
      });

      it('should extract map size', function() {
        assert.equal(256, scenario_script.map_size[0]);
        assert.equal(256, scenario_script.map_size[1]);
      });
    });

    describe('creation', function() {
      let script = new sc.script.scenario()
      script.create({
        name: "Awesome Volcano",               // Used to determine filenames
        author: "1337 internet tag",
        description: "Description of map",
        size: 0,
        default_height: 0
      });

      it('should derive filenames from map name', function() {
        assert.equal(script.name,            "Awesome Volcano");
        assert.equal(script.description,     "Description of map");
        assert.equal(script.map_filename,    "/maps/Awesome_Volcano/Awesome_Volcano.scmap");
        assert.equal(script.save_filename,   "/maps/Awesome_Volcano/Awesome_Volcano_save.lua");
        assert.equal(script.script_filename, "/maps/Awesome_Volcano/Awesome_Volcano_script.lua");
      });

      it ('should set map size', function() {
        assert.equal(script.map_size[0], 256);
        assert.equal(script.map_size[1], 256);
      });
    });

    describe('saving', function() {
      let scenario_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_scenario.lua");

      it('should accurately recreate the after a roundtrip', function() {
        let scenario_script = new sc.script.scenario();
        scenario_script.load(scenario_data_bb);

        let roundtrip_scenario_bb = scenario_script.save();
        let roundtrip_scenario_script = new sc.script.scenario();
        roundtrip_scenario_script.load(roundtrip_scenario_bb);

        assert.equal("Shuriken Valley", roundtrip_scenario_script.name);
        assert.equal("Ai Markers. By Claimer9", roundtrip_scenario_script.description);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley.scmap", roundtrip_scenario_script.map_filename);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_save.lua", roundtrip_scenario_script.save_filename);
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_script.lua", roundtrip_scenario_script.script_filename);
        assert.equal(2, roundtrip_scenario_script.armies.length);
        assert.equal("ARMY_1", roundtrip_scenario_script.armies[0]);
        assert.equal("ARMY_2", roundtrip_scenario_script.armies[1]);
      });

      // TODO: It would be good to add tests for all the non-explicitly required fieldss
    });
  });


  describe('sc_script_save', function() {
    describe('loading', function() {
      let save_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_save.lua");
      let save_data_bb = ByteBuffer.wrap(save_data, ByteBuffer.LITTLE_ENDIAN);
      let save_script = new sc.script.save();
      save_script.load(save_data_bb);

      it('should load markers', function() {
        assert.closeTo(35.5000, save_script.markers['ARMY_1'].position.x, 0.00001);
        assert.closeTo(75.9766, save_script.markers['ARMY_1'].position.y, 0.00001);
        assert.closeTo(154.500, save_script.markers['ARMY_1'].position.z, 0.00001);

        assert.closeTo(221.500, save_script.markers['ARMY_2'].position.x, 0.00001);
        assert.closeTo(75.9766, save_script.markers['ARMY_2'].position.y, 0.00001);
        assert.closeTo(95.5000, save_script.markers['ARMY_2'].position.z, 0.00001);

        assert.isTrue(save_script.markers['ARMY_3'] === undefined);
      });

      it('should load all marker attributes', function() {
        assert.equal(true,                               save_script.markers['Mass 00'].resource);
        assert.closeTo(100.0,                            save_script.markers['Mass 00'].amount, 0.00001);
        assert.equal('/textures/editor/marker_mass.bmp', save_script.markers['Mass 00'].editorIcon);
        assert.closeTo(1.0,                              save_script.markers['Mass 00'].size, 0.00001);
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
      let save_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_save.lua");
      let save_data_bb = ByteBuffer.wrap(save_data, ByteBuffer.LITTLE_ENDIAN);
      let save_script = new sc.script.save();
      save_script.load(save_data_bb);

      let save_script_roundtrip_bb = save_script.save();
      let save_script_roundtrip = new sc.script.save();
      save_script_roundtrip.load(save_script_roundtrip_bb);

      it('should persist markers', function() {
        assert.closeTo(35.5000, save_script_roundtrip.markers['ARMY_1'].position.x, 0.00001);
        assert.closeTo(75.9766, save_script_roundtrip.markers['ARMY_1'].position.y, 0.00001);
        assert.closeTo(154.500, save_script_roundtrip.markers['ARMY_1'].position.z, 0.00001);

        assert.closeTo(221.500, save_script_roundtrip.markers['ARMY_2'].position.x, 0.00001);
        assert.closeTo(75.9766, save_script_roundtrip.markers['ARMY_2'].position.y, 0.00001);
        assert.closeTo(95.5000, save_script_roundtrip.markers['ARMY_2'].position.z, 0.00001);

        assert.isTrue(save_script_roundtrip.markers['ARMY_3'] === undefined);
      });

      it ('should persist all marker attributes', function() {
        assert.equal(true,                               save_script_roundtrip.markers['Mass 00'].resource);
        assert.closeTo(100.0,                            save_script_roundtrip.markers['Mass 00'].amount, 0.00001);
        assert.equal('/textures/editor/marker_mass.bmp', save_script_roundtrip.markers['Mass 00'].editorIcon);
        assert.closeTo(1.0,                              save_script_roundtrip.markers['Mass 00'].size, 0.00001);
      });
    });
  });
});
