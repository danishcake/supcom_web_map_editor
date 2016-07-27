import { sc } from '../lib/sc';
const assert = require('chai').assert;
const fs = require('fs');
const ByteBuffer = require('bytebuffer');



describe('sc_script', function() {
  describe('sc_script_scenario', function() {
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

  describe('loading', function() {
    let scenario_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_scenario.lua");
    let save_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_save.lua");
    let script_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley_script.lua");

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
});
