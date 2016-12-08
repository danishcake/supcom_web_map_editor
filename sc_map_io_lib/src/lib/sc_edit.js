/**
 * Provides editing functionality for heightmaps, texture maps etc
 * and intermediate representations
 */
import {sc_edit_heightmap} from "./sc_edit_heightmap"
import {sc_edit_tool_raise, sc_edit_tool_lower} from "./tools/sc_edit_tool_raise"
import {sc_edit_symmetry} from "./sc_edit_symmetry"

let sc_edit = {
  heightmap: sc_edit_heightmap,
  tool: {
    raise: sc_edit_tool_raise,
    lower: sc_edit_tool_lower
  },
  symmetry: sc_edit_symmetry
};

// TODO: Add sc_edit_heightmap_tools as heightmap_tools
export { sc_edit }
