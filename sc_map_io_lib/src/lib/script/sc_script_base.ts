const Lua5_1 = require('../thirdparty/lua5.1.5.min').Lua5_1;
const lua = Lua5_1.C;
import * as ByteBuffer from "bytebuffer";


/**
 * Lua arrays are tables with numeric keys
 * I would prefer to represent this as {[key: number | string]: sc_script_lua_type}, but
 * Typescript prevents this
 */
export type sc_script_lua_array = {[key: number]: sc_script_lua_type};
export type sc_script_lua_table = {[key: string]: sc_script_lua_type};


/**
 * Represents one of the basic Lua types we support
 */
export type sc_script_lua_type = number | string | boolean | sc_script_lua_array | sc_script_lua_table;


/**
 * Base script class
 * Provides common lua state initialisation, script execution and state query helpers
 *
 * Obviously the lua runtime doesn't have decent Typescript declarations, so the
 * path of least resistance to use any types.
 */
export class sc_script_base {
  private __lua_state: any;
  private __c_functions: any[];

  constructor() {
    // Initialise lua state
    this.__lua_state = lua.lua_open();
    this.__c_functions = [];


    // This defines a callback from Lua to 'C' (Javascript). The callback
    // loads a bunch of standard libraries into the Lua VM
    // These 'C' functions are saved so they can be freed later
    this.__c_functions.push(Lua5_1.Runtime.addFunction((lua_state: any) => {
      lua.luaopen_base(lua_state);
      lua.luaopen_table(lua_state);
      lua.luaopen_io(lua_state);
      lua.luaopen_string(lua_state);
      lua.luaopen_math(lua_state);
    }));

    // Run the 'C' function we created above
    lua.lua_pushcfunction(this.__lua_state, this.__c_functions[this.__c_functions.length - 1]);
    lua.lua_call(this.__lua_state, 0, 0);

    // Bind the basic types that are used in the FA lua scripts
    // Aide memoir:
    // C api functions must NOT pop values from the stack
    // Arguments are addressed absolutely (1 is first, 2 is second)
    // Results should be pushed onto the stack and the number of results returned

    // FLOAT
    this.register_function("FLOAT", (lua_state: any): number => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });

    // BOOLEAN
    this.register_function("BOOLEAN", (lua_state: any): number => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });

    // STRING
    this.register_function("STRING", (lua_state: any): number => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });

    // Vector3
    this.register_function("VECTOR3", (lua_state: any): number => {
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
    this.register_function("GROUP", (lua_state: any): number => {
      lua.lua_pushvalue(lua_state, 1);
      return 1;
    });
  }


  /**
   * Registers a function to be run_script
   * This function MUST be deregistered by calling close_lua later
   */
   protected register_function(name: string, fn: (lua_state: any) => number) {
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
  public close_lua(): void {
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
  public run_script(input: string | ByteBuffer): void {
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
  public query_global(path: string): sc_script_lua_type {
    const path_elements = path.split(".");
    const first_element = path_elements[0];
    const remaining_elements = path_elements.slice(1);

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
    const result: sc_script_lua_type = this.convert_top_of_stack();

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
  private convert_top_of_stack(): sc_script_lua_type {
    if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TSTRING) {
      return lua.lua_tostring(this.__lua_state, -1) as string;
    } else if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TNUMBER) {
      return lua.lua_tonumber(this.__lua_state, -1) as number;
    } else if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TBOOLEAN) {
      return lua.lua_toboolean(this.__lua_state, -1) as boolean;
    } else if (lua.lua_type(this.__lua_state, -1) === lua.LUA_TTABLE) {
      // Iterate over keys and create object
      let ret: any = {};

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
          throw new Error(`Table key must be a string or number but found ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -2))}`);
        }

        ret[key] = this.convert_top_of_stack();

        // Pop value, leave key for next iteration
        // lua_next pushed nothing on last iteration, so stack balanced
        lua.lua_pop(this.__lua_state, 1);
      }

      return ret as sc_script_lua_array | sc_script_lua_table;
    } else {
      throw new Error(`Unsupported type ${lua.lua_typename(this.__lua_state, lua.lua_type(this.__lua_state, -1))}`);
    }
  }
}