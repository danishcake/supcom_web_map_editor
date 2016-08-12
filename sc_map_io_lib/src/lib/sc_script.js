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
const Lua5_1 = require('../thirdparty/lua5.1.5.min');
const lua = Lua5_1.C;

/**
 * Base script class
 * Provides common lua state initialisation, script execution and state query helpers
 */
export class sc_script_base {
  constructor() {
    // Initialise lua state
    this.__lua_state = lua.lua_open();
    lua.lua_pushcfunction(this.__lua_state, Lua5_1.Runtime.addFunction(lua_state => {
      lua.luaopen_base(lua_state);
      lua.luaopen_table(lua_state);
      lua.luaopen_io(lua_state);
      lua.luaopen_string(lua_state);
      lua.luaopen_math(lua_state);
    }));
    lua.lua_call(this.__lua_state, 0, 0);

    // Bind the basic types that are used in the FA lua scripts
    // Aide memoir:
    // C api functions must NOT pop values from the stack
    // Arguments are addressed absolutely (1 is first, 2 is second)
    // Results should be pushed onto the stack and the number of results returned

    // FLOAT
    lua.lua_pushcfunction(this.__lua_state, Lua5_1.Runtime.addFunction(lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    }));
    lua.lua_setglobal(this.__lua_state, "FLOAT");

    // BOOLEAN
    lua.lua_pushcfunction(this.__lua_state, Lua5_1.Runtime.addFunction(lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    }));
    lua.lua_setglobal(this.__lua_state, "BOOLEAN");

    // STRING
    lua.lua_pushcfunction(this.__lua_state, Lua5_1.Runtime.addFunction(lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    }));
    lua.lua_setglobal(this.__lua_state, "STRING");

    // Vector3
    lua.lua_pushcfunction(this.__lua_state, Lua5_1.Runtime.addFunction(lua_state => {
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
    }));
    lua.lua_setglobal(this.__lua_state, "VECTOR3");

    // GROUP
    lua.lua_pushcfunction(this.__lua_state, Lua5_1.Runtime.addFunction(lua_state => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    }));
    lua.lua_setglobal(this.__lua_state, "GROUP");
  }


  /**
   * Runs the provided input if it is a string.
   * If it is a ByteBuffer then a single null terminated string is read and executed.
   */
  run_script(input) {
    if (typeof input === 'string') {
      lua.luaL_dostring(this.__lua_state, input);
    } else if (input instanceof ByteBuffer) {
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
        throw new Error(`Expected a table at the top of the stack but found ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -1))}. Path was ${path_elements.slice(0, i)}`);
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
        if (!lua.lua_type(this.__lua_state, -2) == lua.LUA_TTABLE) {
          throw new Error(`Table key must be a string but found ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -2))}`);
        }
        let key = lua.lua_tostring(this.__lua_state, -2);
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
 */
export class sc_script_scenario extends sc_script_base {
  constructor() {
    super();
    this.__name = undefined;
    this.__description = undefined;
    this.__map_filename = undefined;
    this.__save_filename = undefined;
    this.__script_filename = undefined;
  }

  get name() { return this.__name; }
  get description() { return this.__description; }
  get map_filename() { return this.__map_filename; }
  get save_filename() { return this.__save_filename; }
  get script_filename() { return this.__script_filename; }

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

    // Record fields
    this.__name = name;
    this.__description = description;
    this.__map_filename = map_filename;
    this.__save_filename = save_filename;
    this.__script_filename = script_filename;

    // TODO: Map size and forces
  }

  save(output) {}
  create(script_args) {}
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
    this.__type = undefined;
    this.__orientation = undefined;
    this.__position = undefined;
  }

  get type() { return this.__type; }
  get orientation() { return this.__orientation; }
  get position() { return this.__position; }

  load(name, input) {
    // Load the common fields
    this.__name = name;
    this.__type = input.type;
    this.__orientation = input.orientation;
    this.__position = input.position;

    // TODO: Load the type specific fields
  }
  save(output) {}
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
      console.log(`Loading ${marker_idx}: ${JSON.stringify(scenario_markers[marker_idx])}`);

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
  }

  save(output) {}
  create(script_args) {}
}

