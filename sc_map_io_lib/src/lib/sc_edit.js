/**
 * Provides editing functionality for heightmaps, texture maps etc
 * and intermediate representations
 */
import {sc_edit_heightmap} from "./sc_edit_heightmap"
import {sc_edit_tool_args, sc_edit_tool_data} from "./tools/sc_edit_tool_args"
import {sc_edit_tool_raise, sc_edit_tool_lower} from "./tools/sc_edit_tool_raise"
import {sc_edit_tool_flatten} from "./tools/sc_edit_tool_flatten"
import {sc_edit_tool_smooth} from "./tools/sc_edit_tool_smooth"
import {sc_edit_tool_select_marker} from "./tools/sc_edit_tool_select_marker"
import {sc_edit_tool_add_marker} from "./tools/sc_edit_tool_add_marker"
import {sc_edit_symmetry} from "./sc_edit_symmetry"
import {sc_edit_view_symmetry} from "./views/sc_edit_view_symmetry"
import {sc_edit_patch} from "./views/sc_edit_patch"
import {sc_edit_view_snapshot} from "./views/sc_edit_view_snapshot"

let sc_edit = {
  heightmap: sc_edit_heightmap,
  tool: {
    args: sc_edit_tool_args,
    data: sc_edit_tool_data,
    raise: sc_edit_tool_raise,
    lower: sc_edit_tool_lower,
    flatten: sc_edit_tool_flatten,
    smooth: sc_edit_tool_smooth,
    select_marker: sc_edit_tool_select_marker,
    add_marker: sc_edit_tool_add_marker
  },
  symmetry: sc_edit_symmetry,
  view: {
    symmetry: sc_edit_view_symmetry,
    patch: sc_edit_patch,
    snapshot: sc_edit_view_snapshot
  }
};

export { sc_edit }
