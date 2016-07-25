import { sc } from '../lib/sc';
const assert = require('chai').assert;
const fs = require('fs');
const ByteBuffer = require('bytebuffer');



describe('sc_script', function() {
  describe('sc_script_scenario', function() {
    it('should support FLOAT', function() {
      let scenario_script = new sc.script.scenario();
      scenario_script.load("FLOAT(1)")
    });

    it('should support BOOLEAN', function() {
      let scenario_script = new sc.script.scenario();
      scenario_script.load("BOOLEAN(false)")
    });

    it('should support STRING', function() {
      let scenario_script = new sc.script.scenario();
      scenario_script.load('STRING("rabbit")')
    });

    it('should support GROUP', function() {
      let scenario_script = new sc.script.scenario();
      scenario_script.load('GROUP({})')
    });

    it('should support VECTOR3', function() {
      let scenario_script = new sc.script.scenario();
      scenario_script.load('VECTOR3(0, 0, 0)')
    });
  });
});
