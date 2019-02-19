/**
 * Supreme Command Forged Alliance Map scripts
 * A map will typically consist of a .scmap (see sc_map.js) and
 * three acompanying scripts
 *
 * mymap.scmap          //  Binary blob
 * mymap_scenario.lua   //< Top level script defining name, description and linking to other scripts
 * mymap_save.lua       //  Script defining team, spawn positions, mass points, AI markers etc
 * mymap_script.lua     //  Scripts associated with the map. Usually fixed contents that can be ignored
 */
import * as ByteBuffer from "bytebuffer";
import * as _ from "underscore";
import { sc_script_base, sc_script_lua_array, sc_script_lua_table } from "./sc_script_base";
import { sc_vec2 } from "../sc_vec";
import { sc_map_args } from "../sc_map_args";


/**
 * Scenario script class
 * Loads and parses a map _scenario.lua file
 * Limitation: Only the first configuration listed will be used
 * Limitation: No rush offsets are ignored and will be written as zero
 */
export class sc_script_scenario extends sc_script_base {
  private __name: string;
  private __description: string;
  private __map_filename: string;
  private __save_filename: string;
  private __script_filename: string;
  private __armies: string[];
  private __map_size: sc_vec2;

  constructor() {
    super();

    // Odd look: This is design to explode early
    this.__name = undefined as any as string;
    this.__description = undefined as any as string;
    this.__map_filename = undefined as any as string;
    this.__save_filename = undefined as any as string;
    this.__script_filename = undefined as any as string;
    this.__armies = [];
    this.__map_size = [undefined, undefined] as any as sc_vec2;
  }

  public get name(): string { return this.__name; }
  public set name(value: string) { this.__name = value; }
  public get description(): string { return this.__description; }
  public set description(value: string) { this.__description = value; }
  public get map_filename(): string { return this.__map_filename; }
  public get save_filename(): string { return this.__save_filename; }
  public get script_filename(): string { return this.__script_filename; }
  public get armies(): string[] { return this.__armies; }
  public get map_size(): sc_vec2 { return this.__map_size; }


  /**
   * Executes input as a Lua script and extracts scenario fields
   */
  public load(input: string | ByteBuffer): void {
    // 1. Load the script into the Lua state
    super.run_script(input);

    // Query the resulting globals
    let name = this.query_global("ScenarioInfo.name") as string;
    let description = this.query_global("ScenarioInfo.description") as string;
    let map_filename = this.query_global("ScenarioInfo.map") as string;
    let save_filename = this.query_global("ScenarioInfo.save") as string;
    let script_filename = this.query_global("ScenarioInfo.script") as string;
    let army_configurations = this.query_global("ScenarioInfo.Configurations") as sc_script_lua_table;
    let map_size = this.query_global("ScenarioInfo.size") as sc_script_lua_array;

    if (Object.keys(army_configurations).length != 1) {
      console.log(`Only a single army configuration is supported, the first will be used`);
    }

    let army_configuration = army_configurations[Object.keys(army_configurations)[0]] as sc_script_lua_table;
    let teams = army_configuration.teams as sc_script_lua_table;

    if (Object.keys(teams).length != 1) {
      console.log(`Only a single team is supported, the first will be used`);
    }

    let team = teams[Object.keys(teams)[0]] as sc_script_lua_table;
    let armies = _.values(team.armies);

    // Record fields
    this.__name = name;
    this.__description = description;
    this.__map_filename = map_filename;
    this.__save_filename = save_filename;
    this.__script_filename = script_filename;
    this.__armies = armies;
    this.__map_size = [map_size[1] as number, map_size[2] as number];

    super.close_lua();
  }

  save() {
    /** We're aiming for this:
     *
     * version = 3
     * ScenarioInfo = {
     *     name = 'Shuriken Valley',
     *     description = 'Ai Markers. By Claimer9',
     *     type = 'skirmish',
     *     starts = true,
     *     preview = '',
     *     size = {256, 256},
     *     map = '/maps/Shuriken_Valley/Shuriken_Valley.scmap',
     *     save = '/maps/Shuriken_Valley/Shuriken_Valley_save.lua',
     *     script = '/maps/Shuriken_Valley/Shuriken_Valley_script.lua',
     *     norushradius = 0.000000,
     *     norushoffsetX_ARMY_1 = 0.000000,
     *     norushoffsetY_ARMY_1 = 0.000000,
     *     norushoffsetX_ARMY_2 = 0.000000,
     *     norushoffsetY_ARMY_2 = 0.000000,
     *     Configurations = {
     *         ['standard'] = {
     *             teams = {
     *                 { name = 'FFA', armies = {'ARMY_1','ARMY_2',} },
     *             },
     *             customprops = {
     *             },
     *         },
     *     }
     * }
     */

    let output =
      `version = 3\n`                                                               +
      `ScenarioInfo = {\n`                                                          +
      `    name                 = '${this.__name}',\n`                              +
      `    description          = '${this.__description}',\n`                       +
      `    type                 = 'skirmish',\n`                                    +
      `    starts               = true,\n`                                          +
      `    preview              = '',\n`                                            +
      `    size                 = {${this.__map_size[0]},${this.__map_size[1]}},\n` +
      `    map                  = '${this.__map_filename}',\n`                      +
      `    save                 = '${this.__save_filename}',\n`                     +
      `    script               = '${this.__script_filename}',\n`                   +
      `    norushradius         = 0.0,\n`;

    // Add armies norushoffsets
    for (let i = 0; i < this.__armies.length; i++) {
      output = output +
        `    norushoffsetX_ARMY_${i + 1} = 0.0,\n` +
        `    norushoffsetY_ARMY_${i + 1} = 0.0,\n`;
    }

      // Add the army configuration
    output = output                         +
      `    Configurations = {\n`            +
      `        ['standard'] = {\n`          +
      `            teams = {\n`             +
      `                {\n`                 +
      `                    name = 'FFA',\n` +
      `                    armies = {`;

    for (let i = 0; i < this.__armies.length; i++) {
      output = output +
        `'ARMY_${i + 1}', `;
    }

    output = output + `}\n`           +
      `                },\n`          +
      `            },\n`              +
      `            customprops = {\n` +
      `            }\n`               +
      `        }\n`                   +
      `    }\n`                       +
      `}\n`;

    return ByteBuffer.wrap(output, ByteBuffer.LITTLE_ENDIAN);
  }


  /**
   * Creates a new scenario script.
   * @param script_args {Object}
   * At a minimum map_args must contain the size field.
   * {
   *   name: "Name of map",               // Used to determine filenames
   *   author: "Name of author",
   *   description: "Description of map",
   *   size: integer,                     // Not used by script serialisation
   *   default_height: Uint16             // Not used by script serialisation
   * }
   */
  public create(map_args: sc_map_args): void {
    const filename_stem = `/maps/${map_args.name.replace(' ', '_')}/${map_args.name.replace(' ', '_')}`;

    this.__name = map_args.name;
    this.__description = map_args.description;
    this.__map_filename = `${filename_stem}.scmap`;
    this.__save_filename = `${filename_stem}_save.lua`;
    this.__script_filename = `${filename_stem}_script.lua`;

    const map_scale = Math.pow(2, map_args.size);
    this.__map_size = [map_scale * 256, map_scale * 256];

    super.close_lua();
  }
}
