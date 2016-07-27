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
   * @param path_elements A globally acccessible value, potentially nested
   * eg ScenarioInfo.name
   * @param element_type Type to be accessed - String or Number
   * eg lua.lua_tostring
   */
  query_global(path, element_type) {
    let path_elements = path.split(".");
    let first_element = path_elements[0];
    let remaining_elements = path_elements.slice(1);
    let result = undefined;

    // Push first element onto stack
    lua.lua_getglobal(this.__lua_state, first_element);

    if (remaining_elements.length === 0) {
      result = this.__query_top_of_stack(element_type);
    } else {
      if (lua.lua_istable(this.__lua_state, -1)) {
        result = this.__query_nested(remaining_elements, element_type);
      }
    }
    // Balance the stack
    lua.lua_pop(this.__lua_state);

    if (result === undefined) {
      throw new Error(`Unable to find ${path}, or wrong type. Got ${result}`);
    } else {
      console.log(`Returning ${result}`);
    }

    // Consider the result - is an error value?
    return result;
  }

  /**
   * Queries into a table given a broken down path of keys. The
   * queried table is expected to be at the top of the stack
   * TODO: Could this be merged with query_global if I checked the top of the stack
   * for a table?
   */
  __query_nested(path_elements, element_type) {
    let first_element = path_elements[0];
    let remaining_elements = path_elements.slice(1);
    let result = undefined;

    lua.lua_getfield(this.__lua_state, -1, first_element);

    if (remaining_elements.length === 0) {
      result = this.__query_top_of_stack(element_type);
    } else {
      if (lua.lua_istable(this.__lua_state, -1)) {
        result = this.__query_nested(remaining_elements);
      }
    }

    // Balance the stack
    lua.lua_pop(this.__lua_state);
    return result;
  }

  /**
   * Queries the top of the Lua stack for an element of the specified type.
   * Only Number or String are supported.
   * TODO: This is a bit naff, refactor it. Could just evaluate some lua?
   */
  __query_top_of_stack(element_type) {

    switch(element_type)
    {
      case String:
        if (lua.lua_isstring(this.__lua_state, -1)) {
          return lua.lua_tostring(this.__lua_state, -1);
        }
      case Number:
        if (lua.lua_isnumber(this.__lua_state, -1)) {
          return lua.lua_tonumber(this.__lua_state, -1);
        }
      default:
        break;
    }
    return null;
  }
}


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
    let name = this.query_global("ScenarioInfo.name", String);
    let description = this.query_global("ScenarioInfo.description", String);
    let map_filename = this.query_global("ScenarioInfo.map", String);
    let save_filename = this.query_global("ScenarioInfo.save", String);
    let script_filename = this.query_global("ScenarioInfo.script", String);

    // Record fields
    this.__name = name;
    this.__description = description;
    this.__map_filename = map_filename;
    this.__save_filename = save_filename;
    this.__script_filename = script_filename;
  }

  save(output) {}
  create(script_args) {}
}

