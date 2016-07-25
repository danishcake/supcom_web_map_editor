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
const Lua5_1 = require('../thirdparty/lua5.1.5.min');
const lua = Lua5_1.C;


class sc_script_base {
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
}


export class sc_script_scenario extends sc_script_base {
  constructor() {
    super();
  }

  /**
   * Executes input as a Lua script and extracts scenario fields
   *
   */
  load(input) {
    lua.luaL_dostring(this.__lua_state, input);
  }
  save(output) {}
  create(script_args) {}
}

