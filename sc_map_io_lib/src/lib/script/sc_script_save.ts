/**
 * Supreme Command Forged Alliance Map scripts
 * A map will typically consist of a .scmap (see sc_map.js) and
 * three acompanying scripts
 *
 * mymap.scmap          //  Binary blob
 * mymap_scenario.lua   //  Top level script defining name, description and linking to other scripts
 * mymap_save.lua       //< Script defining team, spawn positions, mass points, AI markers etc
 * mymap_script.lua     //  Scripts associated with the map. Usually fixed contents that can be ignored
 */
import * as ByteBuffer from "bytebuffer";
import * as _ from "underscore";
import { sc_script_marker, sc_script_marker_template } from "./sc_script_marker";
import { sc_script_base, sc_script_lua_table } from "./sc_script_base";
import { sc_edit_heightmap } from "../sc_edit_heightmap";
import { sc_vec2 } from "../sc_vec";
import { sc_map_args } from "../sc_map_args";


export class sc_script_save extends sc_script_base {
  private __markers: {[key: string]: sc_script_marker};

  constructor() {
    super();
    this.__markers = {};
  }

  public get markers(): {[key: string]: sc_script_marker} { return this.__markers; }
  public set markers(value: {[key: string]: sc_script_marker}) { this.__markers = value; }


  /**
   * Executes input as a Lua script and extracts save fields
   */
  load(input: string | ByteBuffer) {
    // 1. Load the script into the Lua state
    super.run_script(input);

    //    MasterChain = {
    //    ['_MASTERCHAIN_'] = {
    //        Markers = {
    //            ['ARMY_1'] = {
    //                ['color'] = STRING( 'ff800080' ),
    //                ['type'] = STRING( 'Blank Marker' ),
    //                ['prop'] = STRING( '/env/common/props/markers/M_Blank_prop.bp' ),
    //                ['orientation'] = VECTOR3( 0, -0, 0 ),
    //                ['position'] = VECTOR3( 35.5, 75.9766, 154.5 ),
    //            },

    // 1. Parse the markers (mass/hydro/spawn points/AI markers etc )
    const scenario_markers: sc_script_lua_table = super.query_global('Scenario.MasterChain._MASTERCHAIN_.Markers') as sc_script_lua_table;

    // 2. Iterate over the markers in Scenario.MasterChain._MASTERCHAIN_.Markers and create objects
    const markers: {[key: string]: sc_script_marker} = {};
    for (let marker_idx in scenario_markers) {
      const marker_template = scenario_markers[marker_idx] as unknown as sc_script_marker_template;
      const marker = new sc_script_marker(marker_idx, marker_template);
      markers[marker_idx] = marker;
    }

    // 3. Now we have to resolve the army spawn locations. The names of these
    // were determined during the parsing of the _scenario.lua files
    // I don't actually need to parse the armies in the save file as we dont support
    // most of the fruity capabilities that provides (prespawned units etc)... yet
    // Record fields
    this.__markers = markers;

    super.close_lua();
  }

  /**
   * Saves the scenario script
   * @param {sc_edit_heightmap} heightmap
   */
  public save(heightmap: sc_edit_heightmap): ByteBuffer {
    let output =
    `Scenario = {\n`              +
    `  MasterChain = {\n`         +
    `    ['_MASTERCHAIN_'] = {\n` +
    `      Markers = {\n`;

    for (let marker_idx of Object.keys(this.__markers))
    {
      let marker = this.__markers[marker_idx];
      // Clamp marker to terrain
      // TBD: Make a Bilinear/trilinear view?
      const marker_position: sc_vec2 = [Math.floor(marker.position.x), Math.floor(marker.position.z)];
      const height_at_position = heightmap.get_pixel(marker_position)[0] * heightmap.scale;
      marker.position.y = height_at_position;
      output = output + marker.save();
    }

    output = output +
    `      }\n` +
    `    }\n`   +
    `  }\n`     +
    `}\n`;

    return ByteBuffer.wrap(output, ByteBuffer.LITTLE_ENDIAN);
  }


  /**
   * Creates a map with no markers - effectively does nothing
   */
  public create(map_args: sc_map_args): void {
    super.close_lua();
  }
}
