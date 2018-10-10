import { sc_script_save } from '../lib/sc_script';
import { sc_edit_tool_add_marker } from '../lib/tools/sc_edit_tool_add_marker.js';
import { sc_edit_tool_data, sc_edit_tool_args } from "../lib/tools/sc_edit_tool_args"
import { sc_edit_heightmap } from '../lib/sc_edit_heightmap';
import { sc_map } from '../lib/sc_map';
import { sc_edit_texturemap } from '../lib/sc_edit_texturemap';
import { sc_edit_symmetry } from '../lib/sc_edit_symmetry';
const assert = require('chai').assert;
const sinon = require('sinon');

describe('sc_edit_tool_add_marker', function() {
  beforeEach('create an empty save', function() {
    const map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0, // 5x5.
      default_height: 1000
    };

    this.map = new sc_map();
    this.map.create(map_args);
    this.edit_heightmap = new sc_edit_heightmap(this.map.heightmap);
    this.edit_texturemap = new sc_edit_texturemap(this.map.texturemap);

    this.save_script = new sc_script_save();
    this.save_script.create(map_args);

    this.marker_template = {
      name: "MASSPOINT",
      type: "mass",
      color: "ff000000",
      orientation: {x: 0, y: 0, z: 0},
      position: {x: 0, y: 0, z: 0},
      prop: '/env/common/props/markers/M_Mass_prop.bp'
    };
  });

  it('adds a marker when start called', function() {
    let tool = new sc_edit_tool_add_marker(this.marker_template);
    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    assert.equal(1, Object.keys(this.save_script.markers).length);
  });

  it('only adds a marker on first call to start', function() {
    let tool = new sc_edit_tool_add_marker(this.marker_template);

    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    assert.equal(1, Object.keys(this.save_script.markers).length);

    // .end resets state and allows a second marker
    tool.end(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
             new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    assert.equal(2, Object.keys(this.save_script.markers).length);
  });

  it('ensures marker names are unique', function() {
    let tool = new sc_edit_tool_add_marker(this.marker_template);

    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
             new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));
    tool.end(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
             new sc_edit_tool_args([0, 0], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    assert.property(this.save_script.markers, 'MASSPOINT_0');
    assert.property(this.save_script.markers, 'MASSPOINT_1');
  });

  it('creates marker at specified location', function() {
    let tool = new sc_edit_tool_add_marker(this.marker_template);
    tool.start(new sc_edit_tool_data(this.edit_heightmap, this.edit_texturemap, this.save_script, this.edit_heightmap, this.map),
               new sc_edit_tool_args([25, 15], sc_edit_tool_args.modifier_none, new sc_edit_symmetry.none()));

    assert.equal(25, this.save_script.markers['MASSPOINT_0'].position.x);
    assert.equal(15, this.save_script.markers['MASSPOINT_0'].position.z);
    assert.equal(1, Object.keys(this.save_script.markers).length);
  });

  it('creates extra markers required by symmetry', function() {
    // TODO
  });
});
