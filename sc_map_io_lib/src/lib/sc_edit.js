/**
 * Provides editing functionality for heightmaps, texture maps etc
 * and intermediate representations
 */
import {sc_edit_heightmap} from "./sc_edit_heightmap"
import {sc_edit_tool_raise, sc_edit_tool_lower} from "./tools/sc_edit_tool_raise"
import {sc_edit_tool_flatten} from "./tools/sc_edit_tool_flatten"
import {sc_edit_symmetry} from "./sc_edit_symmetry"
import {sc_edit_view_symmetry} from "./views/sc_edit_view_symmetry"
import {sc_edit_patch} from "./views/sc_edit_patch"
import {sc_edit_view_snapshot} from "./views/sc_edit_view_snapshot"

let sc_edit = {
  heightmap: sc_edit_heightmap,
  tool: {
    raise: sc_edit_tool_raise,
    lower: sc_edit_tool_lower,
    flatten: sc_edit_tool_flatten
  },
  symmetry: sc_edit_symmetry,
  view: {
    symmetry: sc_edit_view_symmetry,
    patch: sc_edit_patch,
    snapshot: sc_edit_view_snapshot
  }
};

export { sc_edit }
