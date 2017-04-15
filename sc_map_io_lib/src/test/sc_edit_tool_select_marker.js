import { sc } from '../lib/sc';
import { sc_edit_tool_select_marker } from '../lib/tools/sc_edit_tool_select_marker.js';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args.js"
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool_select_marker', function() {
  beforeEach('create a save with two mass points', function() {
    const map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0, // 5x5.
      default_height: 1000
    };

    this.save_script = new sc.script.save();
    this.save_script.create(map_args);
    this.save_script.markers["MASSPOINT_0"] = {
      type: "mass",
      position: {x: 50, y: 0, z: 50}
    };

    this.save_script.markers["MASSPOINT_1"] = {
      type: "mass",
      position: {x: 100, y: 0, z: 100}
    };
  });

  it('will select a marker if clicked', function() {
    let tool = new sc_edit_tool_select_marker();
    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));

    assert.isTrue(this.save_script.markers["MASSPOINT_0"].selected);
    assert.isNotOk(this.save_script.markers["MASSPOINT_1"].selected);
  });

  it('will not move in same application as selection', function() {
    let tool = new sc_edit_tool_select_marker();
    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([55, 60], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([60, 70], sc_edit_tool_args.modifier_none));

    assert.isTrue(this.save_script.markers["MASSPOINT_0"].selected);
    assert.closeTo(50, this.save_script.markers["MASSPOINT_0"].position.x, 0.001);
    assert.closeTo(50, this.save_script.markers["MASSPOINT_0"].position.z, 0.001);
  });

  it('will not select a marker if too far away', function() {
    let tool = new sc_edit_tool_select_marker();
    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([75, 75], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([75, 75], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([75, 75], sc_edit_tool_args.modifier_none));

    assert.isNotOk(this.save_script.markers["MASSPOINT_0"].selected);
    assert.isNotOk(this.save_script.markers["MASSPOINT_1"].selected);
  });

  it('will select additional markers if shift held', function() {
  });

  it('will deselect other markers if a new marker is selected and shift not held', function() {
    let tool = new sc_edit_tool_select_marker();
    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));

    assert.isTrue(this.save_script.markers["MASSPOINT_0"].selected);
    assert.isNotOk(this.save_script.markers["MASSPOINT_1"].selected);

    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([100, 100], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([100, 100], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([100, 100], sc_edit_tool_args.modifier_none));

    assert.isNotOk(this.save_script.markers["MASSPOINT_0"].selected);
    assert.isTrue(this.save_script.markers["MASSPOINT_1"].selected);
  });

  it('will deselect all markers if too far away and shift not held', function() {
    let tool = new sc_edit_tool_select_marker();
    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));

    assert.isTrue(this.save_script.markers["MASSPOINT_0"].selected);
    assert.isNotOk(this.save_script.markers["MASSPOINT_1"].selected);

    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([75, 75], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([75, 75], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([75, 75], sc_edit_tool_args.modifier_none));

    assert.isNotOk(this.save_script.markers["MASSPOINT_0"].selected);
    assert.isNotOk(this.save_script.markers["MASSPOINT_1"].selected);
  });

  it('will deselect a selected marker if reselected and shift held', function() {
  });

  it('will start move if a selected marker reselected and shift not held', function() {
    let tool = new sc_edit_tool_select_marker();
    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));

    assert.isTrue(this.save_script.markers["MASSPOINT_0"].selected);

    tool.start(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([50, 50], sc_edit_tool_args.modifier_none));
    tool.apply(new sc_edit_tool_data(null, this.save_script),
               new sc_edit_tool_args([75, 50], sc_edit_tool_args.modifier_none));
    tool.end(new sc_edit_tool_data(null, this.save_script),
             new sc_edit_tool_args([100, 50], sc_edit_tool_args.modifier_none));

    assert.closeTo(75, this.save_script.markers["MASSPOINT_0"].position.x, 0.001);
    assert.closeTo(50, this.save_script.markers["MASSPOINT_0"].position.z, 0.001);
  });
});
