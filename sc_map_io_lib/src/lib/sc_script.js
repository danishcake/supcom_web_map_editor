/**
 * Supreme Command Forged Alliance Map scripts
 * A map will typically consist of a .scmap (see sc_map.js) and
 * three acompanying scripts
 *
 * mymap.scmap          // Binary blob
 * mymap_scenario.lua   // Top level script defining name, description and linking to other scripts
 * mymap_save.lua       // Script defining team, spawn positions, mass points, AI markers etc
 * mymap_script.lua     // Scripts associated with the map. Usually fixed contents that can be ignored
 */
const ByteBuffer = require('bytebuffer');
const Lua5_1 = require('../thirdparty/lua5.1.5.min').Lua5_1;
const lua = Lua5_1.C;
const _ = require('underscore');

/**
 * Base script class
 * Provides common lua state initialisation, script execution and state query helpers
 */
export class sc_script_base {
  constructor() {
    // Initialise lua state
    this.__lua_state = lua.lua_open();
    this.__c_functions = [];

    this.__c_functions.push(Lua5_1.Runtime.addFunction(lua_state => {
      lua.luaopen_base(lua_state);
      lua.luaopen_table(lua_state);
      lua.luaopen_io(lua_state);
      lua.luaopen_string(lua_state);
      lua.luaopen_math(lua_state);
    }));

    lua.lua_pushcfunction(this.__lua_state, this.__c_functions[this.__c_functions.length - 1]);
    lua.lua_call(this.__lua_state, 0, 0);

    // Bind the basic types that are used in the FA lua scripts
    // Aide memoir:
    // C api functions must NOT pop values from the stack
    // Arguments are addressed absolutely (1 is first, 2 is second)
    // Results should be pushed onto the stack and the number of results returned

    // FLOAT
    this.register_function("FLOAT", lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });

    // BOOLEAN
    this.register_function("BOOLEAN", lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });

    // STRING
    this.register_function("STRING", lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });

    // Vector3
    this.register_function("VECTOR3", lua_state => {
      let x = lua.luaL_checknumber(lua_state, 1);
      let y = lua.luaL_checknumber(lua_state, 2);
      let z = lua.luaL_checknumber(lua_state, 3);

      lua.lua_newtable(lua_state);
      lua.lua_pushnumber(lua_state, x);
      lua.lua_setfield(lua_state, -2, "x");
      lua.lua_pushnumber(lua_state, y);
      lua.lua_setfield(lua_state, -2, "y");
      lua.lua_pushnumber(lua_state, z);
      lua.lua_setfield(lua_state, -2, "z");

      return 1;
    });

    // GROUP
    this.register_function("GROUP", lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });
  }


  /**
   * Registers a function to be run_script
   * This function MUST be deregistered by calling close_lua later
   */
   register_function(name, fn) {
     this.__c_functions.push(Lua5_1.Runtime.addFunction(fn));
     lua.lua_pushcfunction(this.__lua_state, this.__c_functions[this.__c_functions.length - 1]);
     lua.lua_setglobal(this.__lua_state, name);
   }


  /**
   * Frees lua state
   * If not done these leak and once enough pile up you get errors from
   * exhausting RESERVED_FUNCTION_POINTER warnings
   *
   * Obviously you can't use any Lua state related bits after calling this.
   */
  close_lua() {
    if (this.__lua_state) {
      lua.lua_close(this.__lua_state);

      // Just closing the state doesn't free the C functions registered with the lua runtime
      // I need to remove these manually.
      for (let c_function of this.__c_functions) {
        //console.log(`Removing ${c_function}`);
        Lua5_1.Runtime.removeFunction(c_function);
      }

      this.__lua_state = null;
    }
  }


  /**
   * Runs the provided input if it is a string.
   * If it is a ByteBuffer then a single null terminated string is read and executed.
   */
  run_script(input) {
    if (typeof input === 'string') {
      lua.luaL_dostring(this.__lua_state, input);
    } else if (input instanceof ByteBuffer || (dcodeIO && dcodeIO.ByteBuffer && input instanceof dcodeIO.ByteBuffer)) {
      // The above is a nasty hack to get this working in the browser
      // It would be better to not have a second version of ByteBuffer kicking around!

      // It's weirdly hard to convert the entire ByteBuffer to a String.
      // Copy the entire thing, append a NULL byte and read a NULL terminated string
      let input_copy = new ByteBuffer(input.capacity() + 1);
      input.copyTo(input_copy, 0, 0, input.capacity());
      input_copy.writeByte(0, input.capacity());
      lua.luaL_dostring(this.__lua_state, input_copy.readCString());
    }
  }

  /**
   * Obtains a global variable.
   * @param path_elements {String} A globally acccessible value, potentially nested.
   * eg ScenarioInfo.name
   */
  query_global(path) {
    let path_elements = path.split(".");
    let first_element = path_elements[0];
    let remaining_elements = path_elements.slice(1);
    let result = undefined;

    // Push first element onto stack
    lua.lua_getglobal(this.__lua_state, first_element);

    // Push the remaining elements onto the stack
    for (let i = 0 ; i < remaining_elements.length; i++){
      if (!lua.lua_istable(this.__lua_state, -1)) {
        throw new Error(`Expected a table at the top of the stack but found ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -1))}. Path was ${first_element}.${path_elements.slice(0, i)}`);
      }

      lua.lua_getfield(this.__lua_state, -1, remaining_elements[i]);
    }

    // Convert the result
    result = this.convert_top_of_stack();

    // Balance the stack by popping an equal number of elements
    for (let i = 0 ; i < path_elements.length; i++) {
      lua.lua_pop(this.__lua_state, 1);
    }

    return result;
  }


  /**
   * Converts the object at the top of the stack into its Javascript
   * equivalent. Throws on contact with functions and userdata.
   * Naively assumes no loops!
   * Only supports string keys
   * Stack is left balanced (eg the top will still be there and need removing)
   */
  convert_top_of_stack() {
    if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TSTRING) {
      return lua.lua_tostring(this.__lua_state, -1);
    } else if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TNUMBER) {
      return lua.lua_tonumber(this.__lua_state, -1);
    } else if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TBOOLEAN) {
      return lua.lua_toboolean(this.__lua_state, -1);
    } else if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TTABLE) {
      // Iterate over keys and create object
      let ret = {};

      lua.lua_pushnil(this.__lua_state);
      while (lua.lua_next(this.__lua_state, -2)) {
        // Stack now has -3: table
        //               -2: key
        //               -1: value
        // While Lua is rather forgiving in what can be a key in a table (hint: anything)
        // I'm only going to support numbers and strings
        let key = null;
        if (lua.lua_type(this.__lua_state, -2) === lua.LUA_TSTRING) {
          key = lua.lua_tostring(this.__lua_state, -2);
        } else if (lua.lua_type(this.__lua_state, -2) === lua.LUA_TNUMBER) {
          key = lua.lua_tonumber(this.__lua_state, -2);
        } else {
          console.log(`Not key is not a string or a number`);
          throw new Error(`Table key must be a string but found ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -2))}`);
        }

        ret[key] = this.convert_top_of_stack();

        // Pop value, leave key for next iteration
        // lua_next pushed nothing on last iteration, so stack balanced
        lua.lua_pop(this.__lua_state, 1);
      }

      return ret;
    } else {
      throw new Error(`Unsupported type ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -1))}`);
    }
  }
}


/**
 * Scenario script class
 * Loads and parses a map _scenario.lua file
 * Limitation: Only the first configuration listed will be used
 * Limitation: No rush offsets are ignored and will be written as zero
 */
export class sc_script_scenario extends sc_script_base {
  constructor() {
    super();
    this.__name = undefined;
    this.__description = undefined;
    this.__map_filename = undefined;
    this.__save_filename = undefined;
    this.__script_filename = undefined;
    this.__armies = [];
    this.__map_size = [undefined, undefined];
  }

  get name() { return this.__name; }
  get description() { return this.__description; }
  get map_filename() { return this.__map_filename; }
  get save_filename() { return this.__save_filename; }
  get script_filename() { return this.__script_filename; }
  get armies() { return this.__armies; }
  get map_size() { return this.__map_size; }

  /**
   * Executes input as a Lua script and extracts scenario fields
   */
  load(input) {
    // 1. Load the script into the Lua state
    super.run_script(input);

    // Query the resulting globals
    let name = this.query_global("ScenarioInfo.name");
    let description = this.query_global("ScenarioInfo.description");
    let map_filename = this.query_global("ScenarioInfo.map");
    let save_filename = this.query_global("ScenarioInfo.save");
    let script_filename = this.query_global("ScenarioInfo.script");
    let army_configurations = this.query_global("ScenarioInfo.Configurations");
    let map_size = this.query_global("ScenarioInfo.size");

    if (Object.keys(army_configurations).length != 1) {
      console.log(`Only a single army configuration is supported, the first will be used`);
    }

    let army_configuration = army_configurations[Object.keys(army_configurations)[0]];
    let teams = army_configuration.teams;

    if (Object.keys(teams).length != 1) {
      console.log(`Only a single team is supported, the first will be used`);
    }

    let team = teams[Object.keys(teams)[0]];
    let armies = _.values(team.armies);

    // Record fields
    this.__name = name;
    this.__description = description;
    this.__map_filename = map_filename;
    this.__save_filename = save_filename;
    this.__script_filename = script_filename;
    this.__armies = armies;
    this.__map_size = [map_size[1], map_size[2]];

    super.close_lua();
  }

  save() {
    super.close_lua();

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
  create(map_args) {
    const filename_stem = `/maps/${map_args.name.replace(' ', '_')}/${map_args.name.replace(' ', '_')}`;

    this.__name = map_args.name;
    this.__description = map_args.description;
    this.__map_filename = `${filename_stem}.scmap`;
    this.__save_filename = `${filename_stem}_save.lua`;
    this.__script_filename = `${filename_stem}_script.lua`;

    const map_scale = Math.pow(2, map_args.size);
    this.__map_size = [map_scale * 256, map_scale * 256];
  }
}

/**
 * Script marker. Represents a 'thing' in the map - spawn point,
 * mass, hydrocarbon etc.
 * Does not represent wreckage.
 *
 * Valid types: 'Blank Marker': Spawn point
 *              'Mass': Mass point
 *              'Hydrocarbon': Hydrocarbon point
 *              'Defenive point': AI marker
 *              'Combat Zone': AI marker
 *              'Expansion Area': AI marker
 *              'Rally Point': AI marker
 *              'Protected Experimental Construction': AI marker
 */
class sc_script_marker {
  constructor() {
    this.__name = undefined;
    this.__color = undefined;
    this.__type = undefined;
    this.__orientation = undefined;
    this.__position = undefined;
    this.__prop = undefined;
    this.__resource = undefined;
    this.__amount = undefined;
    this.__editorIcon = undefined;
    this.__size = undefined;
    this.__hint = undefined;
  }

  get name() { return this.__name; }
  get color() { return this.__color; }
  get type() { return this.__type; }
  get orientation() { return this.__orientation; }
  get position() { return this.__position; }
  get prop() { return this.__prop; }
  get resource() { return this.__resource; }
  get amount() { return this.__amount; }
  get editorIcon() { return this.__editorIcon; }
  get size() { return this.__size; }
  get hint() { return this.__hint; }

  load(name, input) {
    // Load the common fields
    this.__name = name;
    this.__color = input.color;
    this.__type = input.type;
    this.__orientation = input.orientation;
    this.__position = input.position;
    this.__prop = input.prop;

    // Load uncommon fields
    // I can't just load all keys as I would lose type information, so instead I'm going to labouriously curate the
    // possible attributes
    // If these are not present then the corresponding getter will return undefined
    // If this gets unweildy I can probably hack some sort of data driven solution together
    this.__resource = input.resource;     // bool
    this.__amount = input.amount;         // float
    this.__editorIcon = input.editorIcon; // string
    this.__size = input.size;             // float
    this.__hint = input.hint;             // bool
  }

  save() {

    // Save common fields
    let output =
    `        ['${this.__name}'] ={\n`                                                                                     +
    `          ['color'] = STRING( '${this.__color}' ),\n`                                                                +
    `          ['type'] = STRING( '${this.__type}' ),\n`                                                                  +
    `          ['orientation'] = VECTOR3( ${this.__orientation.x}, ${this.__orientation.y}, ${this.__orientation.z} ),\n` +
    `          ['position'] = VECTOR3( ${this.__position.x}, ${this.__position.y}, ${this.__position.z} ),\n`             +
    `          ['prop'] = STRING( '${this.__prop}' ),\n`;

    // Save uncommon fields
    if (this.__resource !== undefined) {
      output = output + `          ['resource'] = BOOLEAN( ${this.__resource ? 'true' : 'false'} ),\n`;
    }
    if (this.__amount !== undefined) {
      output = output + `          ['amount'] = FLOAT( ${this.__amount} ),\n`;
    }
    if (this.__editorIcon !== undefined) {
      output = output + `          ['editorIcon'] = STRING( '${this.__editorIcon}' ),\n`;
    }
    if (this.__size !== undefined) {
      output = output + `          ['size'] = FLOAT( ${this.__size} ),\n`;
    }
    if (this.__hint !== undefined) {
      output = output + `          ['hint'] = BOOLEAN( ${this.__hint ? 'true' : 'false'} ),\n`;
    }

    output = output +
    `        },\n`;

    return output;
  }

  create(script_args) {}
}


export class sc_script_save extends sc_script_base {
  constructor() {
    super();
    this.__markers = {};
  }

  get markers() { return this.__markers; }

  /**
   * Executes input as a Lua script and extracts save fields
   */
  load(input) {
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
    let scenario_markers = super.query_global('Scenario.MasterChain._MASTERCHAIN_.Markers');

    // 2. Iterate over the markers in Scenario.MasterChain._MASTERCHAIN_.Markers and create objects
    let markers = {};
    for (let marker_idx in scenario_markers) {

      let marker = new sc_script_marker();
      marker.load(marker_idx, scenario_markers[marker_idx]);
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

  save() {
    let output =
    `Scenario = {\n`            +
    `  MasterChain = {\n`       +
    `    ['_MASTERCHAIN_'] = {\n` +
    `      Markers = {\n`;

    for (let marker_idx of Object.keys(this.__markers))
    {
      let marker = this.__markers[marker_idx];
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
  create(map_args) {
    super.close_lua();
  }
}

/**
 * Script 'script'. This is unlike the other scripts as it doesn't perform any loading
 * and is serialised the same every time
 */
export class sc_script_script {
  constructor() {}

  /**
   * Writes a standard startup script
   */
  save() {
    let output =
      "local ScenarioUtils = import('/lua/sim/ScenarioUtilities.lua')\n" +
      "function OnPopulate()\n"                                          +
      " ScenarioUtils.InitializeArmies()\n"                              +
      "end\n"                                                            +
      "\n"                                                               +
      "function OnStart(self)\n"
      "end\n";

      return ByteBuffer.wrap(output, ByteBuffer.LITTLE_ENDIAN);
  }

  /**
   * Does nothing - present for consistency
   */
  create(map_args) {}
}
