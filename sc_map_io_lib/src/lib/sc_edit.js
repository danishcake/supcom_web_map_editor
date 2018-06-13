/**
 * Provides editing functionality for heightmaps, texture maps etc
 * and intermediate representations
 */
import {sc_edit_heightmap} from "./sc_edit_heightmap"
import {sc_edit_texturemap} from "./sc_edit_texturemap"
import {sc_edit_tool_args, sc_edit_tool_data} from "./tools/sc_edit_tool_args"
import {sc_edit_tool_raise, sc_edit_tool_lower} from "./tools/sc_edit_tool_raise"
import {sc_edit_tool_flatten} from "./tools/sc_edit_tool_flatten"
import {sc_edit_tool_smooth} from "./tools/sc_edit_tool_smooth"
import {sc_edit_tool_set} from "./tools/sc_edit_tool_set"
import {sc_edit_tool_clear_higher} from "./tools/sc_edit_tool_clear_higher"
import {sc_edit_tool_select_marker} from "./tools/sc_edit_tool_select_marker"
import {sc_edit_tool_add_marker} from "./tools/sc_edit_tool_add_marker"
import {sc_edit_tool_water_elevation} from "./tools/sc_edit_tool_water_elevation"
import {sc_edit_global_tool_autotexture} from './global_tools/sc_edit_global_tool_autotexture'
import {sc_edit_global_tool_enforce_symmetry} from './global_tools/sc_edit_global_tool_enforce_symmetry'
import {sc_edit_symmetry} from "./sc_edit_symmetry"
import {sc_edit_view_symmetry} from "./views/sc_edit_view_symmetry"
import {sc_edit_patch} from "./views/sc_edit_patch"
import {sc_edit_view_snapshot} from "./views/sc_edit_view_snapshot"
import {sc_edit_view_mask} from "./views/sc_edit_view_mask"
import {sc_edit_view_convolution} from "./views/sc_edit_view_convolution"
import {sc_edit_view_oob_clamp} from "./views/sc_edit_view_oob_clamp"
import {sc_edit_view_methods} from "./views/sc_edit_view_methods"

let sc_edit = {
  heightmap: sc_edit_heightmap,
  texturemap: sc_edit_texturemap,
  tool: {
    args: sc_edit_tool_args,
    data: sc_edit_tool_data,
    raise: sc_edit_tool_raise,
    lower: sc_edit_tool_lower,
    flatten: sc_edit_tool_flatten,
    set: sc_edit_tool_set,
    clear_higher: sc_edit_tool_clear_higher,
    smooth: sc_edit_tool_smooth,
    select_marker: sc_edit_tool_select_marker,
    add_marker: sc_edit_tool_add_marker,
    water_elevation: sc_edit_tool_water_elevation
  },
  global_tool: {
    autotexture: sc_edit_global_tool_autotexture,
    enforce_symmetry: sc_edit_global_tool_enforce_symmetry
  },
  symmetry: sc_edit_symmetry,
  view: {
    symmetry: sc_edit_view_symmetry,
    patch: sc_edit_patch,
    snapshot: sc_edit_view_snapshot,
    mask: sc_edit_view_mask,
    convolution: sc_edit_view_convolution,
    oob_clamp: sc_edit_view_oob_clamp,
    methods: sc_edit_view_methods
  }
};

export { sc_edit }
