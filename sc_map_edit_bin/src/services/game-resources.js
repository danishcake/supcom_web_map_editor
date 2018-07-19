const angular = require('angular');
const _ = require('underscore');
const webgl_texture = require('../webgl/texture').webgl_texture;

/**
 * Contains definitions of various resources extracted from the Forged Alliance installer
 * This includes
 * 1. Shaders
 * 2. Sky and background textures
 * 2. Albedo textures
 * 3. Normal textures
 * 4. Props
 * 5. Editor icons
 * 6. Preset texture sets
 * 7. Preset lighting conditions
 * 8. Preset water conditions
 *
 * These are directly embedded in the output by webpack using url-loader
 */
angular.module('sc_map_edit_bin.services').factory('game_resources', ["$timeout", function($timeout) {
  let service = {};

  // Are there other shaders? I don;t think so! I guess you could set LowFidelityTerrain? The cartographic Terrain_Stage0/1?
  service.shaders = [{
    name: "Default",
    id: "TTerrain",
    url: ""
  }];

  // TODO: id should be lowercase
  service.backgrounds = [
    {name: "Default",    data_url: require("../../gamedata/textures/environment/DefaultBackground.png"), id: "/textures/environment/defaultbackground.dds"},
    {name: "Black",      data_url: require("../../gamedata/textures/environment/blackbackground.png"),   id: "/textures/environment/blackbackground.dds"},
    {name: "Thiban",     data_url: require("../../gamedata/textures/environment/Thiban_bmp.png"),        id: "/textures/environment/thiban_bmp.dds"},
    {name: "Rigel",      data_url: require("../../gamedata/textures/environment/Rigel_bmp.png"),         id: "/textures/environment/rigel_bmp.dds"},
    {name: "Zeta Canis", data_url: require("../../gamedata/textures/environment/Zeta Canis_bmp.png"),    id: "/textures/environment/zeta canis_bmp.dds"},
    {name: "Pollux",     data_url: require("../../gamedata/textures/environment/Pollux_bmp.png"),        id: "/textures/environment/pollux_bmp.dds"},
    {name: "Pixces IV",  data_url: require("../../gamedata/textures/environment/Pisces IV_bmp.png"),     id: "/textures/environment/pisces iv_bmp.dds"},
    {name: "Orionis",    data_url: require("../../gamedata/textures/environment/Orionis_bmp.png"),       id: "/textures/environment/orionis_bmp.dds"},
    {name: "Minerva",    data_url: require("../../gamedata/textures/environment/Minerva_bmp.png"),       id: "/textures/environment/minerva_bmp.dds"},
    {name: "Matar",      data_url: require("../../gamedata/textures/environment/Matar_bmp.png"),         id: "/textures/environment/matar_bmp.dds"},
    {name: "Luthien",    data_url: require("../../gamedata/textures/environment/Luthien_bmp.png"),       id: "/textures/environment/luthien_bmp.dds"},
    {name: "Eridani",    data_url: require("../../gamedata/textures/environment/Eridani_bmp.png"),       id: "/textures/environment/eridani_bmp.dds"},
    {name: "Procyon",    data_url: require("../../gamedata/textures/environment/Procyon_bmp.png"),       id: "/textures/environment/procyon_bmp.dds"},
    {name: "Earth",      data_url: require("../../gamedata/textures/environment/Earth_bmp.png"),         id: "/textures/environment/earth_bmp.dds"},
    {name: "Capella",    data_url: require("../../gamedata/textures/environment/Capella_bmp.png"),       id: "/textures/environment/capella_bmp.dds"}
  ];

  service.sky_cubemaps = [
    {name: "Default",       data_url: require("../../gamedata/textures/environment/DefaultSkyCube.png"), id: "/textures/environment/defaultskycube.dds"},
    {name: "Blue",          data_url: require("../../gamedata/textures/environment/SkyCube_blue.png"), id: "/textures/environment/skycube_blue.dds"},
    {name: "Desert 1",      data_url: require("../../gamedata/textures/environment/SkyCube_Desert01.png"), id: "/textures/environment/skycube_desert01.dds"},
    {name: "Desert 1a",     data_url: require("../../gamedata/textures/environment/SkyCube_Desert01a.png"), id: "/textures/environment/skycube_desert01a.dds"},
    {name: "Desert 2",      data_url: require("../../gamedata/textures/environment/SkyCube_Desert02.png"), id: "/textures/environment/skycube_desert02.dds"},
    {name: "Desert 2a",     data_url: require("../../gamedata/textures/environment/SkyCube_Desert02a.png"), id: "/textures/environment/skycube_desert02a.dds"},
    {name: "Desert 3a",     data_url: require("../../gamedata/textures/environment/SkyCube_Desert03a.png"), id: "/textures/environment/skycube_desert03a.dds"},
    {name: "Evergreen 1",   data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen01.png"), id: "/textures/environment/skycube_evergreen01.dds"},
    {name: "Evergreen 1a",  data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen01a.png"), id: "/textures/environment/skycube_evergreen01a.dds"},
    {name: "Evergreen 2",   data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen02.png"), id: "/textures/environment/skycube_evergreen02.dds"},
    {name: "Evergreen 3",   data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen03.png"), id: "/textures/environment/skycube_evergreen03.dds"},
    {name: "Evergreen 3a",  data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen03a.png"), id: "/textures/environment/skycube_evergreen03a.dds"},
    {name: "Evergreen 4a",  data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen05a.png"), id: "/textures/environment/skycube_evergreen05a.dds"},
    {name: "Stormy",        data_url: require("../../gamedata/textures/environment/SkyCube_EvStormy.png"), id: "/textures/environment/skycube_evstormy.dds"},
    {name: "Geothermal 1",  data_url: require("../../gamedata/textures/environment/SkyCube_Geothermal01.png"), id: "/textures/environment/skycube_geothermal01.dds"},
    {name: "Geothermal 2",  data_url: require("../../gamedata/textures/environment/SkyCube_Geothermal02.png"), id: "/textures/environment/skycube_geothermal02.dds"},
    {name: "Geothermal 2a", data_url: require("../../gamedata/textures/environment/SkyCube_Geothermal02a.png"), id: "/textures/environment/skycube_geothermal02a.dds"},
    {name: "Lava 1",        data_url: require("../../gamedata/textures/environment/SkyCube_Lava01.png"), id: "/textures/environment/skycube_lava01.dds"},
    {name: "Lava 1a",       data_url: require("../../gamedata/textures/environment/SkyCube_Lava01a.png"), id: "/textures/environment/skycube_lava01a.dds"},
    {name: "Leipzig demo",  data_url: require("../../gamedata/textures/environment/SkyCube_Leipzig_Demo.png"), id: "/textures/environment/skycube_leipzig_demo.dds"},
    {name: "Redrocks 3",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRock03.png"), id: "/textures/environment/skycube_redrock03.dds"},
    {name: "Redrocks 1",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks01.png"), id: "/textures/environment/skycube_redrocks01.dds"},
    {name: "Redrocks 2",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks02.png"), id: "/textures/environment/skycube_redrocks02.dds"},
    {name: "Redrocks 2a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks02a.png"), id: "/textures/environment/skycube_redrocks02a.dds"},
    {name: "Redrocks 3",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks03.png"), id: "/textures/environment/skycube_redrocks03.dds"},
    {name: "Redrocks 4",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks04.png"), id: "/textures/environment/skycube_redrocks04.dds"},
    {name: "Redrocks 5",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks05.png"), id: "/textures/environment/skycube_redrocks05.dds"},
    {name: "Redrocks 5a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks05a.png"), id: "/textures/environment/skycube_redrocks05a.dds"},
    {name: "Redrocks 6",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks06.png"), id: "/textures/environment/skycube_redrocks06.dds"},
    {name: "Redrocks 8a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks08a.png"), id: "/textures/environment/skycube_redrocks08a.dds"},
    {name: "Redrocks 9a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks09a.png"), id: "/textures/environment/skycube_redrocks09a.dds"},
    {name: "Redrocks 10",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks10.png"), id: "/textures/environment/skycube_redrocks10.dds"},
    {name: "Scx1 1",        data_url: require("../../gamedata/textures/environment/SkyCube_Scx1Proto01.png"), id: "/textures/environment/skycube_scx1proto01.dds"},
    {name: "Scx1 2",         data_url: require("../../gamedata/textures/environment/SkyCube_Scx1Proto02.png"), id: "/textures/environment/skycube_scx1proto02.dds"},
    {name: "Tropical 1",    data_url: require("../../gamedata/textures/environment/SkyCube_Tropical01.png"), id: "/textures/environment/skycube_tropical01.dds"},
    {name: "Tropical 1a",   data_url: require("../../gamedata/textures/environment/SkyCube_Tropical01a.png"), id: "/textures/environment/skycube_tropical01a.dds"},
    {name: "Tropical 4",    data_url: require("../../gamedata/textures/environment/SkyCube_Tropical04.png"), id: "/textures/environment/skycube_tropical04.dds"},
    {name: "Tropical 6",    data_url: require("../../gamedata/textures/environment/SkyCube_TropicalOp06.png"), id: "/textures/environment/skycube_tropicalop06.dds"},
    {name: "Tropical 6a",   data_url: require("../../gamedata/textures/environment/SkyCube_TropicalOp06a.png"), id: "/textures/environment/skycube_tropicalop06a.dds"},
    {name: "Tundra 1",      data_url: require("../../gamedata/textures/environment/SkyCube_Tundra01.png"), id: "/textures/environment/skycube_tundra01.dds"},
    {name: "Tundra 2",      data_url: require("../../gamedata/textures/environment/SkyCube_Tundra02.png"), id: "/textures/environment/skycube_tundra02.dds"},
    {name: "Tundra 2a",     data_url: require("../../gamedata/textures/environment/SkyCube_Tundra02a.png"), id: "/textures/environment/skycube_tundra02a.dds"},
    {name: "Tundra 3",      data_url: require("../../gamedata/textures/environment/SkyCube_Tundra03.png"), id: "/textures/environment/skycube_tundra03.dds"},
    {name: "Tundra 3a",     data_url: require("../../gamedata/textures/environment/SkyCube_Tundra03a.png"), id: "/textures/environment/skycube_tundra03a.dds"},
    {name: "Tundra 4a",     data_url: require("../../gamedata/textures/environment/SkyCube_Tundra04a.png"), id: "/textures/environment/skycube_tundra04a.dds"}
  ];

  service.environment_cubemaps = [
    {name: "Default",                 data_url: require("../../gamedata/textures/environment/DefaultEnvCube.png"), id: "/textures/environment/defaultenvcube.dds"},
    {name: "Aeon alien crystal",      data_url: require("../../gamedata/textures/environment/EnvCube_aeon_aliencrystal.png"), id: "/textures/environment/envcube_aeon_aliencrystal.dds"},
    {name: "Aeon desert",             data_url: require("../../gamedata/textures/environment/EnvCube_aeon_desert.png"), id: "/textures/environment/envcube_aeon_desert.dds"},
    {name: "Aeon evergreen",          data_url: require("../../gamedata/textures/environment/EnvCube_aeon_Evergreen.png"), id: "/textures/environment/envcube_aeon_evergreen.dds"},
    {name: "Aeon geothermal",         data_url: require("../../gamedata/textures/environment/EnvCube_aeon_geothermal.png"), id: "/textures/environment/envcube_aeon_geothermal.dds"},
    {name: "Aeon lava",               data_url: require("../../gamedata/textures/environment/EnvCube_aeon_lava.png"), id: "/textures/environment/envcube_aeon_lava.dds"},
    {name: "Aeon redrocks",           data_url: require("../../gamedata/textures/environment/EnvCube_aeon_RedRocks.png"), id: "/textures/environment/envcube_aeon_redrocks.dds"},
    {name: "Aeon tropical",           data_url: require("../../gamedata/textures/environment/EnvCube_aeon_tropical.png"), id: "/textures/environment/envcube_aeon_tropical.dds"},
    {name: "Aeon tundra",             data_url: require("../../gamedata/textures/environment/EnvCube_aeon_tundra.png"), id: "/textures/environment/envcube_aeon_tundra.dds"},
    {name: "Desert 1",                data_url: require("../../gamedata/textures/environment/EnvCube_Desert01a.png"), id: "/textures/environment/envcube_desert01a.dds"},
    {name: "Desert 2",                data_url: require("../../gamedata/textures/environment/EnvCube_Desert02a.png"), id: "/textures/environment/envcube_desert02a.dds"},
    {name: "Desert 3",                data_url: require("../../gamedata/textures/environment/EnvCube_Desert03a.png"), id: "/textures/environment/envcube_desert03a.dds"},
    {name: "Evergreen 1",             data_url: require("../../gamedata/textures/environment/EnvCube_Evergreen01a.png"), id: "/textures/environment/envcube_evergreen01a.dds"},
    {name: "Evergreen 2",             data_url: require("../../gamedata/textures/environment/EnvCube_Evergreen03a.png"), id: "/textures/environment/envcube_evergreen03a.dds"},
    {name: "Evergreen 3",             data_url: require("../../gamedata/textures/environment/EnvCube_Evergreen05a.png"), id: "/textures/environment/envcube_evergreen05a.dds"},
    {name: "Geothermal",              data_url: require("../../gamedata/textures/environment/EnvCube_Geothermal02a.png"), id: "/textures/environment/envcube_geothermal02a.dds"},
    {name: "Lava",                    data_url: require("../../gamedata/textures/environment/EnvCube_Lava01a.png"), id: "/textures/environment/envcube_lava01a.dds"},
    {name: "Redrocks 5",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks05a.png"), id: "/textures/environment/envcube_redrocks05a.dds"},
    {name: "Redrocks 6",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks06.png"), id: "/textures/environment/envcube_redrocks06.dds"},
    {name: "Redrocks 8",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks08a.png"), id: "/textures/environment/envcube_redrocks08a.dds"},
    {name: "Redrocks 9",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks09a.png"), id: "/textures/environment/envcube_redrocks09a.dds"},
    {name: "Redrocks 10",             data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks10.png"), id: "/textures/environment/envcube_redrocks10.dds"},
    {name: "Scx1",                    data_url: require("../../gamedata/textures/environment/EnvCube_Scx1Proto02.png"), id: "/textures/environment/envcube_scx1proto02.dds"}, // TODO: Better name!
    {name: "Seraphim alient crystal", data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_aliencrystal.png"), id: "/textures/environment/envcube_seraphim_aliencrystal.dds"},
    {name: "Seraphim desert",         data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_desert.png"), id: "/textures/environment/envcube_seraphim_desert.dds"},
    {name: "Seraphim evergreen",      data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_Evergreen.png"), id: "/textures/environment/envcube_seraphim_evergreen.dds"},
    {name: "Seraphim geothermal",     data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_geothermal.png"), id: "/textures/environment/envcube_seraphim_geothermal.dds"},
    {name: "Seraphim lava",           data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_lava.png"), id: "/textures/environment/envcube_seraphim_lava.dds"},
    {name: "Seraphim redrocks",       data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_redrocks.png"), id: "/textures/environment/envcube_seraphim_redrocks.dds"},
    {name: "Seraphim tropical",       data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_tropical.png"), id: "/textures/environment/envcube_seraphim_tropical.dds"},
    {name: "Seraphim tundra",         data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_tundra.png"), id: "/textures/environment/envcube_seraphim_tundra.dds"},
    {name: "Tropical 1",              data_url: require("../../gamedata/textures/environment/EnvCube_Tropical01a.png"), id: "/textures/environment/envcube_tropical01a.dds"},
    {name: "Tropical 6",              data_url: require("../../gamedata/textures/environment/EnvCube_TropicalOp06a.png"), id: "/textures/environment/envcube_tropicalop06a.dds"},
    {name: "Tundra 2",                data_url: require("../../gamedata/textures/environment/EnvCube_Tundra02a.png"), id: "/textures/environment/envcube_tundra02a.dds"},
    {name: "Tundra 3",                data_url: require("../../gamedata/textures/environment/EnvCube_Tundra03a.png"), id: "/textures/environment/envcube_tundra03a.dds"},
    {name: "Tundra 4",                data_url: require("../../gamedata/textures/environment/EnvCube_Tundra04a.png"), id: "/textures/environment/envcube_tundra04a.dds"}
  ];

  service.albedo_textures = [
    // Special unused texture slot.
    // This will be rendered when a texture cannot be found, or a texture isn't defined
    {name: "Unused",        tileset: "Unused", data_url: require("../../gamedata/editor_icons/Unused_texture.png"), id: ""},

    // Desert tileset
    {name: "Gravel",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Gravel_albedo.png"), id: "/env/desert/layers/des_gravel_albedo.dds"},
    {name: "Gravel 1",      tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Gravel01_albedo.png"), id: "/env/desert/layers/des_gravel01_albedo.dds"},
    {name: "Rock",          tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock_albedo.png"), id: "/env/desert/layers/des_rock_albedo.dds"},
    {name: "Rock 1",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock01_albedo.png"), id: "/env/desert/layers/des_rock01_albedo.dds"},
    {name: "Rock 2",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock02_albedo.png"), id: "/env/desert/layers/des_rock02_albedo.dds"},
    {name: "Rock 3",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock03_albedo.png"), id: "/env/desert/layers/des_rock03_albedo.dds"},
    {name: "Rock 4",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock04_albedo.png"), id: "/env/desert/layers/des_rock04_albedo.dds"},
    {name: "Rock 5",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock05_albedo.png"), id: "/env/desert/layers/des_rock05_albedo.dds"},
    {name: "Rock 6",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock06_albedo.png"), id: "/env/desert/layers/des_rock06_albedo.dds"},
    {name: "Dark sand",     tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandDark_albedo.png"), id: "/env/desert/layers/des_sanddark_albedo.dds"},
    {name: "Dark sand 2",   tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandDark02_albedo.png"), id: "/env/desert/layers/des_sanddark02_albedo.dds"},
    {name: "Light sand",    tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_sandLight_albedo.png"), id: "/env/desert/layers/des_sandlight_albedo.dds"},
    {name: "Medium sand",   tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandMed_albedo.png"), id: "/env/desert/layers/des_sandmed_albedo.dds"},
    {name: "Medium sand 1", tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandMed01_albedo.png"), id: "/env/desert/layers/des_sandmed01_albedo.dds"},
    {name: "Medium sand 2", tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandMed02_albedo.png"), id: "/env/desert/layers/des_sandmed02_albedo.dds"},
    {name: "Wet sand",      tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Sandwet_albedo.png"), id: "/env/desert/layers/des_sandwet_albedo.dds"},

    // Evergreen tileset
    {name: "Dirt 1",         tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/Dirt001_albedo.png"), id: "/env/evergreen/layers/dirt001_albedo.dds"},
    {name: "Grass 0",        tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/grass000_albedo.png"), id: "/env/evergreen/layers/grass000_albedo.dds"},
    {name: "Grass 1",        tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/grass001_albedo.png"), id: "/env/evergreen/layers/grass001_albedo.dds"},
    {name: "Macrotexture 0", tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/macrotexture000_albedo.png"), id: "/env/evergreen/layers/macrotexture000_albedo.dds"},
    {name: "Macrotexture 1", tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/macrotexture001_albedo.png"), id: "/env/evergreen/layers/macrotexture001_albedo.dds"},
    {name: "Light rock",     tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/RockLight_albedo.png"), id: "/env/evergreen/layers/rocklight_albedo.dds"},
    {name: "Medium rock",    tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/RockMed_albedo.png"), id: "/env/evergreen/layers/rockmed_albedo.dds"},
    {name: "Light sand",     tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/SandLight_albedo.png"), id: "/env/evergreen/layers/sandlight_albedo.dds"},
    {name: "Light sand 2",   tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/SandLight002_albedo.png"), id: "/env/evergreen/layers/sandlight002_albedo.dds"},
    {name: "Sand rock",      tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/SandRock_albedo.png"), id: "/env/evergreen/layers/sandrock_albedo.dds"},
    {name: "Sand wet",       tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/Sandwet_albedo.png"), id: "/env/evergreen/layers/sandwet_albedo.dds"},
    {name: "Snow",           tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/snow001_albedo.png"), id: "/env/evergreen/layers/snow001_albedo.dds"},

    // Evergreen 2 tileset
    {name: "Dirt 1",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Dirt001_albedo.png"), id: "/env/evergreen2/layers/eg_dirt001_albedo.dds"},
    {name: "Dirt 2",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Dirt002_albedo.png"), id: "/env/evergreen2/layers/eg_dirt002_albedo.dds"},
    {name: "Dirt 3",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Dirt003_albedo.png"), id: "/env/evergreen2/layers/eg_dirt003_albedo.dds"},
    {name: "Grass 1",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass001_albedo.png"), id: "/env/evergreen2/layers/eg_grass001_albedo.dds"},
    {name: "Grass 2",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass002_albedo.png"), id: "/env/evergreen2/layers/eg_grass002_albedo.dds"},
    {name: "Grass 2b",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass002b_albedo.png"), id: "/env/evergreen2/layers/eg_grass002b_albedo.dds"},
    {name: "Grass 2c",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass002c_albedo.png"), id: "/env/evergreen2/layers/eg_grass002c_albedo.dds"},
    {name: "Gravel",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Gravel_albedo.png"), id: "/env/evergreen2/layers/eg_gravel_albedo.dds"},
    {name: "Gravel 1",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel01_albedo.png"), id: "/env/evergreen2/layers/eg_gravel01_albedo.dds"},
    {name: "Gravel 2",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Gravel002_albedo.png"), id: "/env/evergreen2/layers/eg_gravel002_albedo.dds"},
    {name: "Gravel 2b",    tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Gravel2_albedo.png"), id: "/env/evergreen2/layers/eg_gravel2_albedo.dds"},
    {name: "Gravel 3",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel003_albedo.png"), id: "/env/evergreen2/layers/eg_gravel003_albedo.dds"},
    {name: "Gravel 4",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel004_albedo.png"), id: "/env/evergreen2/layers/eg_gravel004_albedo.dds"},
    {name: "Gravel 5",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel005_albedo.png"), id: "/env/evergreen2/layers/eg_gravel005_albedo.dds"},
    {name: "Rock",         tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Rock_albedo.png"), id: "/env/evergreen2/layers/eg_rock_albedo.dds"},
    {name: "Snow",         tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Snow.png"), id: "/env/evergreen2/layers/eg_snow.dds"},
    {name: "Snow 2",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Snow_albedo.png"), id: "/env/evergreen2/layers/eg_snow_albedo.dds"},
    {name: "Coral reef",   tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EV_Reef_Coral_albedo.png"), id: "/env/evergreen2/layers/ev_reef_coral_albedo.dds"},
    {name: "Reef sand",    tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EV_Reef_sand_albedo.png"), id: "/env/evergreen2/layers/ev_reef_sand_albedo.dds"},
    {name: "Grass 3",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass003_albedo.png"), id: "/env/evergreen2/layers/evgrass003_albedo.dds"},
    {name: "Grass 4",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass004_albedo.png"), id: "/env/evergreen2/layers/evgrass004_albedo.dds"},
    {name: "Grass 5",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass005_albedo.png"), id: "/env/evergreen2/layers/evgrass005_albedo.dds"},
    {name: "Grass 5a",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass005a_albedo.png"), id: "/env/evergreen2/layers/evgrass005a_albedo.dds"},
    {name: "Grass 6",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass006_albedo.png"), id: "/env/evergreen2/layers/evgrass006_albedo.dds"},
    {name: "Grass 7",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass007_albedo.png"), id: "/env/evergreen2/layers/evgrass007_albedo.dds"},
    {name: "Grass 8",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass008_albedo.png"), id: "/env/evergreen2/layers/evgrass008_albedo.dds"},
    {name: "Grass 9",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass009_albedo.png"), id: "/env/evergreen2/layers/evgrass009_albedo.dds"},
    {name: "Grass 10",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass010_albedo.png"), id: "/env/evergreen2/layers/evgrass010_albedo.dds"},
    {name: "Grass 10a",    tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass010a_albedo.png"), id: "/env/evergreen2/layers/evgrass010a_albedo.dds"},
    {name: "Hostas 1",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvHostas001_albedo.png"), id: "/env/evergreen2/layers/evhostas001_albedo.dds"},
    {name: "Rock 2",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock002_albedo.png"), id: "/env/evergreen2/layers/evrock002_albedo.dds"},
    {name: "Rock 2b",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock002b_albedo.png"), id: "/env/evergreen2/layers/evrock002b_albedo.dds"},
    {name: "Rock 3",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock003_albedo.png"), id: "/env/evergreen2/layers/evrock003_albedo.dds"},
    {name: "Rock 4",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock004_albedo.png"), id: "/env/evergreen2/layers/evrock004_albedo.dds"},
    {name: "Rock 5",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock005_albedo.png"), id: "/env/evergreen2/layers/evrock005_albedo.dds"},
    {name: "Rock 6",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock006_albedo.png"), id: "/env/evergreen2/layers/evrock006_albedo.dds"},
    {name: "Rock 6b",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock006b_albedo.png"), id: "/env/evergreen2/layers/evrock006b_albedo.dds"},
    {name: "Rock 6c",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock006c_albedo.png"), id: "/env/evergreen2/layers/evrock006c_albedo.dds"},
    {name: "Rock 7",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock007_albedo.png"), id: "/env/evergreen2/layers/evrock007_albedo.dds"},
    {name: "Rock 7c",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock007c_albedo.png"), id: "/env/evergreen2/layers/evrock007c_albedo.dds"},
    {name: "Rock 8",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock008_albedo.png"), id: "/env/evergreen2/layers/evrock008_albedo.dds"},
    {name: "Snow 3",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvSnow003_albedo.png"), id: "/env/evergreen2/layers/evsnow003_albedo.dds"},
    {name: "Transition 1", tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvTrans01_albedo.png"), id: "/env/evergreen2/layers/evtrans01_albedo.dds"},
    {name: "Transition 2", tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvTrans02_albedo.png"), id: "/env/evergreen2/layers/evtrans02_albedo.dds"},
    {name: "Transition 3", tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvTrans03_albedo.png"), id: "/env/evergreen2/layers/evtrans03_albedo.dds"},

    // Common tileset
    {name: "None",         tileset: "Common",      data_url: require("../../gamedata/env/Common/layers/None_albedo.png"), id: "/env/common/layers/none_albedo.dds"},
    {name: "Wet Rock 1",   tileset: "Common",      data_url: require("../../gamedata/env/Common/layers/WetRock001_albedo.png"), id: "/env/common/layers/wetrock001_albedo.dds"},
    {name: "Wet Rock 2",   tileset: "Common",      data_url: require("../../gamedata/env/Common/layers/WetRock002_albedo.png"), id: "/env/common/layers/wetrock002_albedo.dds"},

    // Crystalline tilset
    {name: "Crystalline 1-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_01_01_albedo.png"), id: "/env/crystalline/layers/cr_01_01_albedo.dds"},
    {name: "Crystalline 2-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_02_01_albedo.png"), id: "/env/crystalline/layers/cr_02_01_albedo.dds"},
    {name: "Crystalline 3-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_03_01_albedo.png"), id: "/env/crystalline/layers/cr_03_01_albedo.dds"},
    {name: "Crystalline 4-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_04_01_albedo.png"), id: "/env/crystalline/layers/cr_04_01_albedo.dds"},
    {name: "Crystalline 5-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_05_01_albedo.png"), id: "/env/crystalline/layers/cr_05_01_albedo.dds"},
    {name: "Crystalline 6-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_06_01_albedo.png"), id: "/env/crystalline/layers/cr_06_01_albedo.dds"},
    {name: "Crystalline 7-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_07_01_albedo.png"), id: "/env/crystalline/layers/cr_07_01_albedo.dds"},
    {name: "Crystalline 7-1b copy", tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_07_01b_albedo copy.png"), id: "/env/crystalline/layers/cr_07_01b_albedo copy.dds"}, // Derp
    {name: "Crystalline 7-1b",      tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_07_01b_albedo.png"), id: "/env/crystalline/layers/cr_07_01b_albedo.dds"},
    {name: "Crystalline 8-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_08_01_albedo.png"), id: "/env/crystalline/layers/cr_08_01_albedo.dds"},
    {name: "Crystalline 8-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_09_01_albedo.png"), id: "/env/crystalline/layers/cr_09_01_albedo.dds"},
    {name: "Crystalline rock 1",    tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock001_albedo.png"), id: "/env/crystalline/layers/cr_rock001_albedo.dds"},
    {name: "Crystalline rock 1b",   tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock001b_albedo.png"), id: "/env/crystalline/layers/cr_rock001b_albedo.dds"},
    {name: "Crystalline rock 2b",   tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock002b_albedo.png"), id: "/env/crystalline/layers/cr_rock002b_albedo.dds"},
    {name: "Crystalline rock 4",    tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock004_albedo.png"), id: "/env/crystalline/layers/cr_rock004_albedo.dds"},
    {name: "Crystalline rock 5",    tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock05_albedo.png"), id: "/env/crystalline/layers/cr_rock05_albedo.dds"},
    {name: "Crystalline wet sand",  tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Sandwet_albedo.png"), id: "/env/crystalline/layers/cr_sandwet_albedo.dds"},
    {name: "Crystalline rock 1c",   tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst_Rock01_albedo.png"), id: "/env/crystalline/layers/cryst_rock01_albedo.dds"},
    {name: "Crystalline 9",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst009_albedo.png"), id: "/env/crystalline/layers/cryst009_albedo.dds"},
    {name: "Crystalline 10",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst010_albedo.png"), id: "/env/crystalline/layers/cryst010_albedo.dds"},
    {name: "Crystalline 11",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst011_albedo.png"), id: "/env/crystalline/layers/cryst011_albedo.dds"},
    {name: "Crystalline 12",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst012_albedo.png"), id: "/env/crystalline/layers/cryst012_albedo.dds"},
    {name: "Crystalline 13",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst013_albedo.png"), id: "/env/crystalline/layers/cryst013_albedo.dds"},
    {name: "Crystalwerk 1",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk01_albedo.png"), id: "/env/crystalline/layers/crystalwerk01_albedo.dds"},
    {name: "Crystalwerk 2",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk02_albedo.png"), id: "/env/crystalline/layers/crystalwerk02_albedo.dds"},
    {name: "Crystalwerk 2b",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk02b_albedo.png"), id: "/env/crystalline/layers/crystalwerk02b_albedo.dds"},
    {name: "Crystalwerk 3",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk03_albedo.png"), id: "/env/crystalline/layers/crystalwerk03_albedo.dds"},
    {name: "Crystalwerk 4",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk04_albedo.png"), id: "/env/crystalline/layers/crystalwerk04_albedo.dds"},
    {name: "Crystalwerk 4b",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk04_b_albedo.png"), id: "/env/crystalline/layers/crystalwerk04_b_albedo.dds"},
    {name: "Crystalwerk 5",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk05_albedo.png"), id: "/env/crystalline/layers/crystalwerk05_albedo.dds"},
    {name: "Crystalwerk 6",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/CrystalWerk06_albedo.png"), id: "/env/crystalline/layers/crystalwerk06_albedo.dds"},
    {name: "Crystalwerk 7",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk07_albedo.png"), id: "/env/crystalline/layers/crystalwerk07_albedo.dds"},

    // Geothermal tilset
    {name: "Ashley",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Ashley_01_albedo.png"), id: "/env/geothermal/layers/geo_ashley_01_albedo.dds"},
    {name: "Dirt 1",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Dirt_01_albedo.png"), id: "/env/geothermal/layers/geo_dirt_01_albedo.dds"},
    {name: "Dark lava 1",   tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaDk_01_albedo.png"), id: "/env/geothermal/layers/geo_lavadk_01_albedo.dds"},
    {name: "Light lava 1",  tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaLt_01_albedo.png"), id: "/env/geothermal/layers/geo_lavalt_01_albedo.dds"},
    {name: "Medium lava 1", tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaMd_01_albedo.png"), id: "/env/geothermal/layers/geo_lavamd_01_albedo.dds"},
    {name: "Medium lava 2", tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaMd_02_albedo.png"), id: "/env/geothermal/layers/geo_lavamd_02_albedo.dds"},
    {name: "Medium lava 3", tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaMd_03_albedo.png"), id: "/env/geothermal/layers/geo_lavamd_03_albedo.dds"},
    {name: "Rock 1",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Rock001_albedo.png"), id: "/env/geothermal/layers/geo_rock001_albedo.dds"},
    {name: "Rock 2",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Rock002_albedo.png"), id: "/env/geothermal/layers/geo_rock002_albedo.dds"},

    // Lava tileset
    {name: "Cracked",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Cracked_albedo.png"), id: "/env/lava/layers/lav_cracked_albedo.dds"},
    {name: "Cracked 2",       tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/Lav_Cracked02_albedo.png"), id: "/env/lava/layers/lav_cracked02_albedo.dds"},
    {name: "Cracked 2b",      tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/Lav_Cracked02b_albedo.png"), id: "/env/lava/layers/lav_cracked02b_albedo.dds"},
    {name: "Gravel",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Gravel_albedo.png"), id: "/env/lava/layers/lav_gravel_albedo.dds"},
    {name: "Lava 1",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Lava01_albedo.png"), id: "/env/lava/layers/lav_lava01_albedo.dds"},
    {name: "Lava 2",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Lava02_albedo.png"), id: "/env/lava/layers/lav_lava02_albedo.dds"},
    {name: "Macrotexture 0",  tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_macrotexture000_albedo.png"), id: "/env/lava/layers/lav_macrotexture000_albedo.dds"},
    {name: "Macrotexture 0b", tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_macrotexture000b_albedo.png"), id: "/env/lava/layers/lav_macrotexture000b_albedo.dds"},
    {name: "Ribbon",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/Lav_Ribbon_albedo.png"), id: "/env/lava/layers/lav_ribbon_albedo.dds"},
    {name: "Ribbon 1",        tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Ribbon01_albedo.png"), id: "/env/lava/layers/lav_ribbon01_albedo.dds"},
    {name: "Rock 1",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock01_albedo.png"), id: "/env/lava/layers/lav_rock01_albedo.dds"},
    {name: "Rock 2",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock02_albedo.png"), id: "/env/lava/layers/lav_rock02_albedo.dds"},
    {name: "Rock 2b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock02b_albedo.png"), id: "/env/lava/layers/lav_rock02b_albedo.dds"},
    {name: "Rock 3",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock03_albedo.png"), id: "/env/lava/layers/lav_rock03_albedo.dds"},
    {name: "Rock 3b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock03b_albedo.png"), id: "/env/lava/layers/lav_rock03b_albedo.dds"},
    {name: "Rock 4",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock04_albedo.png"), id: "/env/lava/layers/lav_rock04_albedo.dds"},
    {name: "Rock 5",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock05_albedo.png"), id: "/env/lava/layers/lav_rock05_albedo.dds"},
    {name: "Rock 6",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock06_albedo.png"), id: "/env/lava/layers/lav_rock06_albedo.dds"},
    {name: "Rock 7",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock07_albedo.png"), id: "/env/lava/layers/lav_rock07_albedo.dds"},
    {name: "Rock 7b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock07b_albedo.png"), id: "/env/lava/layers/lav_rock07b_albedo.dds"},
    {name: "Rock 8",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock08_albedo.png"), id: "/env/lava/layers/lav_rock08_albedo.dds"},
    {name: "Rock 9",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock09_albedo.png"), id: "/env/lava/layers/lav_rock09_albedo.dds"},
    {name: "Rock 9b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock09b_albedo.png"), id: "/env/lava/layers/lav_rock09b_albedo.dds"},
    {name: "Rock 10",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock10_albedo.png"), id: "/env/lava/layers/lav_rock10_albedo.dds"},
    {name: "Tech wiers",      tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_TECH_WIERS_albedo.png"), id: "/env/lava/layers/lav_tech_wiers_albedo.dds"},
    {name: "Macrotexture 0c", tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/macrotexture000_albedo.png"), id: "/env/lava/layers/macrotexture000_albedo.dds"},
    {name: "Macrotexture 2",  tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/macrotexture002_albedo.png"), id: "/env/lava/layers/macrotexture002_albedo.dds"},
    {name: "Macrotexture 2b", tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/macrotexture002b_albedo.png"), id: "/env/lava/layers/macrotexture002b_albedo.dds"},

    // Paradise tileset
    {name: "Dirt 0",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/dirt000_albedo.png"), id: "/env/paradise/layers/dirt000_albedo.dds"},
    {name: "Dirt 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/dirt001_albedo.png"), id: "/env/paradise/layers/dirt001_albedo.dds"},
    {name: "Grass 0",        tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/grass000_albedo.png"), id: "/env/paradise/layers/grass000_albedo.dds"},
    {name: "Grass 1",        tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/grass001_albedo.png"), id: "/env/paradise/layers/grass001_albedo.dds"},
    {name: "Grass 2",        tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/grass002_albedo.png"), id: "/env/paradise/layers/grass002_albedo.dds"},
    {name: "Grass jung",     tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/GrassJung_albedo.png"), id: "/env/paradise/layers/grassjung_albedo.dds"},
    {name: "Ice 1",          tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/Ice001_albedo.png"), id: "/env/paradise/layers/ice001_albedo.dds"},
    {name: "Ice 2",          tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/Ice002_albedo.png"), id: "/env/paradise/layers/ice002_albedo.dds"},
    {name: "Lava rock",      tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/LavaRock_albedo.png"), id: "/env/paradise/layers/lavarock_albedo.dds"},
    {name: "Macrotexture 0", tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/macrotexture000_albedo.png"), id: "/env/paradise/layers/macrotexture000_albedo.dds"},
    {name: "Macrotexture 1", tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/macrotexture001_albedo.png"), id: "/env/paradise/layers/macrotexture001_albedo.dds"},
    {name: "Rock 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/Rock001_albedo.png"), id: "/env/paradise/layers/rock001_albedo.dds"},
    {name: "Sand 0",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/sand000_albedo.png"), id: "/env/paradise/layers/sand000_albedo.dds"},
    {name: "Sand 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/sand001_albedo.png"), id: "/env/paradise/layers/sand001_albedo.dds"},
    {name: "Light sand",     tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/SandLight002.png"), id: "/env/paradise/layers/sandlight002.dds"},
    {name: "Medium sand",    tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/SandMed_albedo.png"), id: "/env/paradise/layers/sandmed_albedo.dds"},
    {name: "Snow 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/snow001_albedo.png"), id: "/env/paradise/layers/snow001_albedo.dds"},

    // Red Barrens tileset
    {name: "Macrotexture 1", tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/macrotexture001_albedo.png"), id: "/env/red barrens/layers/macrotexture001_albedo.dds"},
    {name: "Cracked",        tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Cracked_albedo.png"), id: "/env/red barrens/layers/rb_cracked_albedo.dds"},
    {name: "Cracked 2",      tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Cracked02_albedo.png"), id: "/env/red barrens/layers/rb_cracked02_albedo.dds"},
    {name: "Gravel 1",       tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_gravel01_albedo.png"), id: "/env/red barrens/layers/rb_gravel01_albedo.dds"},
    {name: "Red mud",        tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_RedMud_albedo.png"), id: "/env/red barrens/layers/rb_redmud_albedo.dds"},
    {name: "Rock",           tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock_albedo.png"), id: "/env/red barrens/layers/rb_rock_albedo.dds"},
    {name: "Rock 2",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock02_albedo.png"), id: "/env/red barrens/layers/rb_rock02_albedo.dds"},
    {name: "Rock 3",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock03_albedo.png"), id: "/env/red barrens/layers/rb_rock03_albedo.dds"},
    {name: "Rock 4",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock04_albedo.png"), id: "/env/red barrens/layers/rb_rock04_albedo.dds"},
    {name: "Rock 6",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock06_albedo.png"), id: "/env/red barrens/layers/rb_rock06_albedo.dds"},
    {name: "Rock 7",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock07_albedo.png"), id: "/env/red barrens/layers/rb_rock07_albedo.dds"},
    {name: "Rock 8",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock08_albedo.png"), id: "/env/red barrens/layers/rb_rock08_albedo.dds"},
    {name: "Rock 9",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock09_albedo.png"), id: "/env/red barrens/layers/rb_rock09_albedo.dds"},
    {name: "Sand",           tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sand_albedo.png"), id: "/env/red barrens/layers/rb_sand_albedo.dds"},
    {name: "Wet sand",       tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sandwet.png"), id: "/env/red barrens/layers/rb_sandwet.dds"},
    {name: "Wet sand 1",     tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sandwet01_albedo.png"), id: "/env/red barrens/layers/rb_sandwet01_albedo.dds"},
    {name: "Wet sand 2",     tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sandwet_albedo.png"), id: "/env/red barrens/layers/rb_sandwet_albedo.dds"},

    // Swamp tileset
    {name: "Creepers",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Creeper_01_albedo.png"), id: "/env/swamp/layers/sw_creeper_01_albedo.dds"},
    {name: "Ferns 1",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Ferns_01_albedo.png"), id: "/env/swamp/layers/sw_ferns_01_albedo.dds"},
    {name: "Ferns 2",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Ferns_02_albedo.png"), id: "/env/swamp/layers/sw_ferns_02_albedo.dds"},
    {name: "Grass 1",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Grass_01_albedo.png"), id: "/env/swamp/layers/sw_grass_01_albedo.dds"},
    {name: "Grass 2",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Grass_02_albedo.png"), id: "/env/swamp/layers/sw_grass_02_albedo.dds"},
    {name: "Grass 3",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Grass_03_albedo.png"), id: "/env/swamp/layers/sw_grass_03_albedo.dds"},
    {name: "Mossy",      tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mossy_01_albedo.png"), id: "/env/swamp/layers/sw_mossy_01_albedo.dds"},
    {name: "Mudder 1",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_01_albedo.png"), id: "/env/swamp/layers/sw_mudder_01_albedo.dds"},
    {name: "Mudder 2",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_02_albedo.png"), id: "/env/swamp/layers/sw_mudder_02_albedo.dds"},
    {name: "Mudder 3",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_03_albedo.png"), id: "/env/swamp/layers/sw_mudder_03_albedo.dds"},
    {name: "Mudder 4",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_04_albedo.png"), id: "/env/swamp/layers/sw_mudder_04_albedo.dds"},
    {name: "Rocky 1",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Rocky_01_albedo.png"), id: "/env/swamp/layers/sw_rocky_01_albedo.dds"},
    {name: "Rocky 2",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Rocky_02_albedo.png"), id: "/env/swamp/layers/sw_rocky_02_albedo.dds"},
    {name: "Rocky 3",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Rocky_03_albedo.png"), id: "/env/swamp/layers/sw_rocky_03_albedo.dds"},
    {name: "Sphagnum 1", tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Sphagnum_01_albedo.png"), id: "/env/swamp/layers/sw_sphagnum_01_albedo.dds"},
    {name: "Sphagnum 2", tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Sphagnum_02_albedo.png"), id: "/env/swamp/layers/sw_sphagnum_02_albedo.dds"},
    {name: "Sphagnum 3", tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Sphagnum_03_albedo.png"), id: "/env/swamp/layers/sw_sphagnum_03_albedo.dds"},

    // Tropical tileset
    {name: "Dry sand 1",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/DrySand001_albedo.png"), id: "/env/tropical/layers/drysand001_albedo.dds"},
    {name: "Dry sand 2",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/DrySand002_albedo.png"), id: "/env/tropical/layers/drysand002_albedo.dds"},
    {name: "Coral",         tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_Coral_albedo.png"), id: "/env/tropical/layers/tr_coral_albedo.dds"},
    {name: "Grass hills",   tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_GrassHills_albedo.png"), id: "/env/tropical/layers/tr_grasshills_albedo.dds"},
    {name: "Ground 0",      tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_ground001_albedo.png"), id: "/env/tropical/layers/tr_ground001_albedo.dds"},
    {name: "Coral reef",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_Reef_Coral_albedo.png"), id: "/env/tropical/layers/tr_reef_coral_albedo.dds"},
    {name: "Coral reef 2",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_Reef_Coral2_albedo.png"), id: "/env/tropical/layers/tr_reef_coral2_albedo.dds"},
    {name: "Rock wall 1",   tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_RockWall001.png"), id: "/env/tropical/layers/tr_rockwall001.dds"},
    {name: "Rock",          tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Rock_albedo.png"), id: "/env/tropical/layers/trop_rock_albedo.dds"},
    {name: "Rock 2b",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock002b_albedo.png"), id: "/env/tropical/layers/trrock002b_albedo.dds"},
    {name: "Rock 3",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock003_albedo.png"), id: "/env/tropical/layers/trrock003_albedo.dds"},
    {name: "Rock 5",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock005_albedo.png"), id: "/env/tropical/layers/trrock005_albedo.dds"},
    {name: "Rock 6",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock006_albedo.png"), id: "/env/tropical/layers/trrock006_albedo.dds"},
    {name: "Rock 7",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock007_albedo.png"), id: "/env/tropical/layers/trrock007_albedo.dds"},
    {name: "Moss bush",     tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrBush_moss_albedo.png"), id: "/env/tropical/layers/trbush_moss_albedo.dds"},
    {name: "Bushy 1",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrBushy001_albedo.png"), id: "/env/tropical/layers/trbushy001_albedo.dds"},
    {name: "Grass 1",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Grass_albedo.png"), id: "/env/tropical/layers/trop_grass_albedo.dds"},
    {name: "Grass 2",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass002_albedo.png"), id: "/env/tropical/layers/trgrass002_albedo.dds"},
    {name: "Grass 3",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass003_albedo.png"), id: "/env/tropical/layers/trgrass003_albedo.dds"},
    {name: "Grass 4",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass004_albedo.png"), id: "/env/tropical/layers/trgrass004_albedo.dds"},
    {name: "Grass 5",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass005_albedo.png"), id: "/env/tropical/layers/trgrass005_albedo.dds"},
    {name: "Grass 6",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass006_albedo.png"), id: "/env/tropical/layers/trgrass006_albedo.dds"},
    {name: "Grass 7",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass007_albedo.png"), id: "/env/tropical/layers/trgrass007_albedo.dds"},
    {name: "Grass jung",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_GrassJung_albedo.png"), id: "/env/tropical/layers/trop_grassjung_albedo.dds"},
    {name: "Dirt",          tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Dirt_albedo.png"), id: "/env/tropical/layers/trop_dirt_albedo.dds"},
    {name: "Rock 2",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock002_albedo.png"), id: "/env/tropical/layers/trrock002_albedo.dds"},
    {name: "Sand 1",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Sand01_albedo.png"), id: "/env/tropical/layers/trop_sand01_albedo.dds"},
    {name: "Sand 1b",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Sand.png"), id: "/env/tropical/layers/trop_sand.dds"},
    {name: "Sand 2",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Sand_albedo.png"), id: "/env/tropical/layers/trop_sand_albedo.dds"},
    {name: "Raw ground",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRawGround01_albedo.png"), id: "/env/tropical/layers/trrawground01_albedo.dds"},
    {name: "Transition 1",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans001_albedo.png"), id: "/env/tropical/layers/trtrans001_albedo.dds"},
    {name: "Transition 2",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans002_albedo.png"), id: "/env/tropical/layers/trtrans002_albedo.dds"},
    {name: "Transition 3",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans003_albedo.png"), id: "/env/tropical/layers/trtrans003_albedo.dds"},
    {name: "Transition 4",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans004_albedo.png"), id: "/env/tropical/layers/trtrans004_albedo.dds"},
    {name: "Transition 5",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans005_albedo.png"), id: "/env/tropical/layers/trtrans005_albedo.dds"},
    {name: "Wet sand 1",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/WetSand001_albedo.png"), id: "/env/tropical/layers/wetsand001_albedo.dds"},
    {name: "Wet sand 2",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/WetSand002_albedo.png"), id: "/env/tropical/layers/wetsand002_albedo.dds"},
    {name: "Wet sand 2b",   tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/WetSand002b_albedo.png"), id: "/env/tropical/layers/wetsand002b_albedo.dds"},

    // Tundra tileset
    {name: "Dirt 1",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/_TundraDirt001_albedo.png"), id: "/env/tundra/layers/_tundradirt001_albedo.dds"},
    {name: "Macro ice",    tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/MacroIce_albedo.png"), id: "/env/tundra/layers/macroice_albedo.dds"},
    {name: "Grass",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Grass_albedo.png"), id: "/env/tundra/layers/tund_grass_albedo.dds"},
    {name: "Gravil",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_gravil_albedo.png"), id: "/env/tundra/layers/tund_gravil_albedo.dds"},
    {name: "Ice 1",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice001_albedo.png"), id: "/env/tundra/layers/tund_ice001_albedo.dds"},
    {name: "Ice 2",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice002_albedo.png"), id: "/env/tundra/layers/tund_ice002_albedo.dds"},
    {name: "Ice 3",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice003_albedo.png"), id: "/env/tundra/layers/tund_ice003_albedo.dds"},
    {name: "Ice 3b",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice003b_albedo.png"), id: "/env/tundra/layers/tund_ice003b_albedo.dds"},
    {name: "Ice 4",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice004_albedo.png"), id: "/env/tundra/layers/tund_ice004_albedo.dds"},
    {name: "Ice 4a",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_ice004a_albedo.png"), id: "/env/tundra/layers/tund_ice004a_albedo.dds"},
    {name: "Ice 5",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_ice005_albedo.png"), id: "/env/tundra/layers/tund_ice005_albedo.dds"},
    {name: "Ice 6",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_ice006_albedo.png"), id: "/env/tundra/layers/tund_ice006_albedo.dds"},
    {name: "Ice rock",     tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_iceRock_albedo.png"), id: "/env/tundra/layers/tund_icerock_albedo.dds"},
    {name: "Melt 1",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_melt001_albedo.png"), id: "/env/tundra/layers/tund_melt001_albedo.dds"},
    {name: "Melt 2",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_melt002_albedo.png"), id: "/env/tundra/layers/tund_melt002_albedo.dds"},
    {name: "Melt 3",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_melt003_albedo.png"), id: "/env/tundra/layers/tund_melt003_albedo.dds"},
    {name: "Rock",         tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Rock_albedo.png"), id: "/env/tundra/layers/tund_rock_albedo.dds"},
    {name: "Rock 2",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Rock02_albedo.png"), id: "/env/tundra/layers/tund_rock02_albedo.dds"},
    {name: "Rock 3",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Rock03_albedo.png"), id: "/env/tundra/layers/tund_rock03_albedo.dds"},
    {name: "Light sand",   tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_sandLight2_albedo.png"), id: "/env/tundra/layers/tund_sandlight2_albedo.dds"},
    {name: "Snow",         tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Snow_albedo.png"), id: "/env/tundra/layers/tund_snow_albedo.dds"},
    {name: "Transition 4", tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/TundraTrans004_albedo.png"), id: "/env/tundra/layers/tundratrans004_albedo.dds"},
    {name: "Transition b", tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/TundraTrans004b_albedo.png"), id: "/env/tundra/layers/tundratrans004b_albedo.dds"},

    // Utility tileset
    {name: "Farms 1", tileset: "Utility", data_url: require("../../gamedata/env/Utility/Layers/farms001_albedo.png"), id: "/env/utility/layers/farms001_albedo.dds"},
  ];

  // Note the URLs are not actually downloaded, and images are only specified
  // thus so that the name normalisation can be reused.
  service.normal_textures = [
    // Special unused texture slot.
    // The value is set manually to blank and will not be overriden
    {name: "Unused",      tileset: "Unused", id: ""},

    // Desert tileset
    {name: "Gravel",      tileset: "Desert", id: "/env/desert/layers/des_gravel_normal.dds"},
    {name: "None",        tileset: "Desert", id: "/env/desert/layers/des_none_normal.dds"},
    {name: "Rock",        tileset: "Desert", id: "/env/desert/layers/des_rock_normal.dds"},
    {name: "Rock 1",      tileset: "Desert", id: "/env/desert/layers/des_rock01_normal.dds"},
    {name: "Rock 2",      tileset: "Desert", id: "/env/desert/layers/des_rock02_normal.dds"},
    {name: "Rock 3a",     tileset: "Desert", id: "/env/desert/layers/des_rock03a_normal.dds"},
    {name: "Dark sand",   tileset: "Desert", id: "/env/desert/layers/des_sanddark_normal.dds"},
    {name: "Light sand",  tileset: "Desert", id: "/env/desert/layers/des_sandlight_normal.dds"},
    {name: "Medium sand", tileset: "Desert", id: "/env/desert/layers/des_sandmed_normal.dds"},
    {name: "Wet sand",    tileset: "Desert", id: "/env/desert/layers/des_sandwet_normal.dds"},

    // Evergreen tileset
    {name: "Dirt 1",       tileset: "Evergreen", id: "/env/evergreen/layers/dirt001_normals.dds"},
    {name: "Grass 0",      tileset: "Evergreen", id: "/env/evergreen/layers/grass000_normals.dds"},
    {name: "Grass 1",      tileset: "Evergreen", id: "/env/evergreen/layers/grass001_normals.dds"},
    {name: "Light rock",   tileset: "Evergreen", id: "/env/evergreen/layers/rocklight_normals.dds"},
    {name: "Medium rock",  tileset: "Evergreen", id: "/env/evergreen/layers/rockmed_normals.dds"},
    {name: "Light sand",   tileset: "Evergreen", id: "/env/evergreen/layers/sandlight_normals.dds"},
    {name: "Light sand 2", tileset: "Evergreen", id: "/env/evergreen/layers/sandlight002_normals.dds"},
    {name: "Sand rock",    tileset: "Evergreen", id: "/env/evergreen/layers/sandrock_normals.dds"},
    {name: "Sand wet",     tileset: "Evergreen", id: "/env/evergreen/layers/sandwet_normals.dds"},
    {name: "Snow",         tileset: "Evergreen", id: "/env/evergreen/layers/snow001_normals.dds"},

    // Evergreen 2 tileset
    {name: "Transition 1", tileset: "Evergreen 2", id: "/env/evergreen2/layers/evtrans01_normals.dds"},
    {name: "Transition 2", tileset: "Evergreen 2", id: "/env/evergreen2/layers/evtrans02_normals.dds"},
    {name: "Rock 3",       tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_rock003_normal.dds"},
    {name: "Rock 4",       tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_rock004_normal.dds"},
    {name: "Rock 6",       tileset: "Evergreen 2", id: "/env/evergreen2/layers/evrock006_normal.dds"},
    {name: "Rock 7",       tileset: "Evergreen 2", id: "/env/evergreen2/layers/evrock007_normal.dds"},
    {name: "Snow",         tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_snow_normal.dds"},
    {name: "Normal",       tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_rock_normal.dds"},
    {name: "Gravel 2",     tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_gravel2_normal.dds"},
    {name: "None",         tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_none_normal.dds"},
    {name: "Gravel",       tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_gravel_normal.dds"},
    {name: "Grass 1",      tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_grass001_normal.dds"},
    {name: "Grass 2",      tileset: "Evergreen 2", id: "/env/evergreen2/layers/eg_grass002_normal.dds"},

    // Common tileset
    {name: "None",         tileset: "Common",      id: "/env/common/layers/none_normal.dds"},

    // Crystalline tileset
    {name: "Crystalline 2-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_02_01_normal.dds"},
    {name: "Crystalline 1-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_01_01_normal.dds"},
    {name: "Crystalline 3-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_03_01_normal.dds"},
    {name: "Crystalline 4-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_04_01_normal.dds"},
    {name: "Crystalline 5-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_05_01_normal.dds"},
    {name: "Crystalline 6-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_06_01_normal.dds"},
    {name: "Crystalline 7-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_07_01_normal.dds"},
    {name: "Crystalline 7-1b",       tileset: "Crystalline", id: "/env/crystalline/layers/cr_07_01b_normal.dds"},
    {name: "Crystalline 8-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_08_01_normal.dds"},
    {name: "Crystalline 9-1",        tileset: "Crystalline", id: "/env/crystalline/layers/cr_09_01_normal.dds"},
    {name: "Crystalline rock 2b",    tileset: "Crystalline", id: "/env/crystalline/layers/cr_rock002b_normal.dds"},
    {name: "Crystalline light sand", tileset: "Crystalline", id: "/env/crystalline/layers/cr_sandlight_normal.dds"},
    {name: "Crystalline rock 1",     tileset: "Crystalline", id: "/env/crystalline/layers/cryst_rock01_normal.dds"},
    {name: "Crystalwerk 2",          tileset: "Crystalline", id: "/env/crystalline/layers/crystalwerk02_normal.dds"},
    {name: "Crystalwerk 2b",         tileset: "Crystalline", id: "/env/crystalline/layers/crystalwerk02b_normal.dds"},
    {name: "Crystalwerk 4",          tileset: "Crystalline", id: "/env/crystalline/layers/crystalwerk04_normals.dds"},
    {name: "Crystalwerk 5",          tileset: "Crystalline", id: "/env/crystalline/layers/crystalwerk05_normal.dds"},
    {name: "Crystalwerk 6",          tileset: "Crystalline", id: "/env/crystalline/layers/crystalwerk06_normal.dds"},
    {name: "Crystalwerk 7",          tileset: "Crystalline", id: "/env/crystalline/layers/crystalwerk07_normal.dds"},

    // Geothermal tileset
    {name: "Dark lava 1", tileset: "Geothermal", id: "/env/geothermal/layers/geo_lavadk_01_normals.dds"},
    {name: "Nun",         tileset: "Geothermal", id: "/env/geothermal/layers/nun_normal.dds"},

    // Lava tileset
    {name: "Cracked 2",  tileset: "Lava", id: "/env/lava/layers/lav_cracked02_normals.dds"},
    {name: "Gravel",     tileset: "Lava", id: "/env/lava/layers/lav_gravel_normals.dds"},
    {name: "Ribbon",     tileset: "Lava", id: "/env/lava/layers/lav_ribbon_normals.dds"},
    {name: "Rock 1",     tileset: "Lava", id: "/env/lava/layers/lav_rock01_normals.dds"},
    {name: "Rock 4",     tileset: "Lava", id: "/env/lava/layers/lav_rock04_normals.dds"},
    {name: "Tech wiers", tileset: "Lava", id: "/env/lava/layers/lav_tech_wiers_normal.dds"},
    {name: "Rock 9",     tileset: "Lava", id: "/env/lava/layers/lav_rock09_nornals.dds"}, // NORNALS :p
    {name: "Rock 10",    tileset: "Lava", id: "/env/lava/layers/lav_rock10_nornals.dds"},

    // Paradise tileset
    {name: "Dirt 0",      tileset: "Paradise", id: "/env/paradise/layers/dirt000_normals.dds"},
    {name: "Grass 0",     tileset: "Paradise", id: "/env/paradise/layers/grass000_normals.dds"},
    {name: "Grass 1",     tileset: "Paradise", id: "/env/paradise/layers/grass001_normals.dds"},
    {name: "Ice 1",       tileset: "Paradise", id: "/env/paradise/layers/ice001_normals.dds"},
    {name: "Ice 2",       tileset: "Paradise", id: "/env/paradise/layers/ice002_normals.dds"},
    {name: "Rock 1",      tileset: "Paradise", id: "/env/paradise/layers/rock001_normals.dds"},
    {name: "Sand 0",      tileset: "Paradise", id: "/env/paradise/layers/sand000_normals.dds"},
    {name: "Medium sand", tileset: "Paradise", id: "/env/paradise/layers/sandmed_normals.dds"},
    {name: "Snow 1",      tileset: "Paradise", id: "/env/paradise/layers/snow001_normals.dds"},

    // Red Barrens tileset
    {name: "Cracked",   tileset: "Red Barrens", id: "/env/red barrens/layers/rb_cracked_normal.dds"},
    {name: "Cracked 2", tileset: "Red Barrens", id: "/env/red barrens/layers/rb_cracked02_normal.dds"},
    {name: "None",      tileset: "Red Barrens", id: "/env/red barrens/layers/rb_none_normal.dds"},
    {name: "Red mud",   tileset: "Red Barrens", id: "/env/red barrens/layers/rb_redmud_normal.dds"},
    {name: "Rock",      tileset: "Red Barrens", id: "/env/red barrens/layers/rb_rock_normal.dds"},
    {name: "Rock 6",    tileset: "Red Barrens", id: "/env/red barrens/layers/rb_rock06_normal.dds"},
    {name: "Rock 9",    tileset: "Red Barrens", id: "/env/red barrens/layers/rb_rock09_normal.dds"},
    {name: "Sand",      tileset: "Red Barrens", id: "/env/red barrens/layers/rb_sand_normal.dds"},
    {name: "Wet sand",  tileset: "Red Barrens", id: "/env/red barrens/layers/rb_sandwet_normal.dds"},

    // Swamp tileset
    {name: "Nun",        tileset: "Swamp", id: "/env/swamp/layers/nun_normal.dds"},
    {name: "Grass 3",    tileset: "Swamp", id: "/env/swamp/layers/sw_grass_03_normals.dds"},
    {name: "Mudder 3",   tileset: "Swamp", id: "/env/swamp/layers/sw_mudder_03_normals.dds"},
    {name: "Rocky 1",    tileset: "Swamp", id: "/env/swamp/layers/sw_rocky_01_normals.dds"},
    {name: "Sphagnum 2", tileset: "Swamp", id: "/env/swamp/layers/sw_sphagnum_02_normals.dds"},

    // Tropical tileset
    {name: "Dry sand 1",   tileset: "Tropical", id: "/env/tropical/layers/drysand001_normals.dds"},
    {name: "Grass hills",  tileset: "Tropical", id: "/env/tropical/layers/tr_grasshills_normal.dds"},
    {name: "Coral reef",   tileset: "Tropical", id: "/env/tropical/layers/tr_reef_coral_normal.dds"},
    {name: "Mossy bush",   tileset: "Tropical", id: "/env/tropical/layers/trbush_moss_normal.dds"},
    {name: "Grass jung",   tileset: "Tropical", id: "/env/tropical/layers/trop_grassjung_normal.dds"},
    {name: "None",         tileset: "Tropical", id: "/env/tropical/layers/trop_none_normal.dds"},
    {name: "Rock",         tileset: "Tropical", id: "/env/tropical/layers/trop_rock_normal.dds"},
    {name: "Sand",         tileset: "Tropical", id: "/env/tropical/layers/trop_sand_normal.dds"},
    {name: "Rock 6",       tileset: "Tropical", id: "/env/tropical/layers/trrock006_normal.dds"},
    {name: "Transition 2", tileset: "Tropical", id: "/env/tropical/layers/trtrans002_normal.dds"},

    // Tundra tileset
    {name: "Ice 3",        tileset: "Tundra", id: "/env/tundra/layers/tund_ice003_normal.dds"},
    {name: "None",         tileset: "Tundra", id: "/env/tundra/layers/tund_none_normal.dds"},
    {name: "Rock",         tileset: "Tundra", id: "/env/tundra/layers/tund_rock_normal.dds"},
    {name: "Rock 2",       tileset: "Tundra", id: "/env/tundra/layers/tund_rock02_normal.dds"},
    {name: "Dark sand",    tileset: "Tundra", id: "/env/tundra/layers/tund_sanddark_normal.dds"},
    {name: "Light sand",   tileset: "Tundra", id: "/env/tundra/layers/tund_sandlight_normal.dds"},
    {name: "Light sand 2", tileset: "Tundra", id: "/env/tundra/layers/tund_sandlight2_normal.dds"},
    {name: "Medium sand",  tileset: "Tundra", id: "/env/tundra/layers/tund_sandmed_normal.dds"},
    {name: "Wet sand",     tileset: "Tundra", id: "/env/tundra/layers/tund_sandwet_normal.dds"},
    {name: "Snow",         tileset: "Tundra", id: "/env/tundra/layers/tund_snow_normal.dds"},
    {name: "Snow 2",       tileset: "Tundra", id: "/env/tundra/layers/tund_snow02_normal.dds"},
    {name: "Snow 3",       tileset: "Tundra", id: "/env/tundra/layers/tund_snow03_normal.dds"},
    {name: "Snow 4",       tileset: "Tundra", id: "/env/tundra/layers/tund_snow04_normal.dds"},
    {name: "Transition 4", tileset: "Tundra", id: "/env/tundra/layers/tundratrans004_normal.dds"},

    // Utility tileset
    {name: "Farms 1", tileset: "Utility", id: "/env/utility/layers/farms001_normals.dds"},
  ];


  service.markers = [
    {name: "Mass",    data_url: require("../../gamedata/editor_icons/Mass_icon.png"), id: "/editor_icons/mass_icon.dds"},
    {name: "Energy",  data_url: require("../../gamedata/editor_icons/Energy_icon.png"), id: "/editor_icons/energy_icon.dds"},
    {name: "Unknown", data_url: require("../../gamedata/editor_icons/Unknown_icon.png"), id: "/editor_icons/unknown_icon.dds"},
  ];


  /**
   * Subscribe for a call indicating all resources are loaded.
   * This will be immediate if already loaded
   */
  service.on_loaded = function(callback) {
    if (service.loaded) {
      $timeout(callback(), 50);
    } else {
      // TBD: via $timeout?
      service.callbacks.on_loaded.push(callback)
    }
  };


  /**
   * Callback all loaded subscribers.
   * These will then be cleared
   */
  service.dispatch_on_loaded = function() {
    _.each(service.callbacks.on_loaded, callback => callback());
    service.callbacks.on_loaded.length = 0;
  };


  /**
   * Searches through the available textures for the first with a matching value
   * and returns the image URL, or "" if not found
   *
   * TODO: Case insensitive lookups
   */
  service.img_url_lookup = function(img_id) {
    const texture_sets = [
      service.backgrounds,
      service.sky_cubemaps,
      service.albedo_textures,
      service.markers
    ];

    let matching_texture = _.chain(texture_sets)
      .flatten()
      .find(p => p.id.toLowerCase() === img_id.toLowerCase())
      .value();

    if (matching_texture) {
      return matching_texture.image.src;
    } else {
      return "";
    }
  };


  /**
   * Retrieves the WebGL texture ID for a texture
   *
   * Currently only albedo textures are required.
   * @param {string} img_id The name of the texture as recorded in the map file
   * @return {webgl_texture} The corresponding WebGL texture. If not available then the unused
   * texture is returned
   */
  service.gl_texture_lookup = function(img_id) {
    const texture_sets = [
      service.albedo_textures,
    ];

    let matching_texture = _.chain(texture_sets)
      .flatten()
      .find(p => p.id.toLowerCase() === img_id.toLowerCase())
      .value();

    if (matching_texture) {
      return matching_texture.texture;
    } else {
      // This better work or I'll recurse to death
      if (img_id !== '') {
        console.log(`Texture lookup failed: '${img_id}'`);
      }
      return service.gl_texture_lookup('');
    }
  };


  const load_data_urls = function (texture_set) {
    return Promise.all(texture_set.map(texture => new Promise((resolve, reject) => {
      texture.image = new Image();
      texture.image.onload  = () => {
        // Return some memory
        delete texture.data_url;
        resolve();
      };
      texture.image.onerror = () => reject(`Failed to load '${texture.id}'`);
      texture.image.src = texture.data_url;
    })));
  };

  /**
   * Build webgl textures from a set of textures
   */
  const build_webgl_textures = function(texture_set, gl) {

    return new Promise(resolve => {
      for (const texture of texture_set) {
        // Create an OpenGL texture
        texture.texture = new webgl_texture(gl, []);

        // Setup texture parameters
        texture.texture.bind_to_unit(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        if ((texture.image.width & (texture.image.width - 1)) === 0) {
          texture.texture.tex_parameters_i.push({key: gl.TEXTURE_MIN_FILTER, value: gl.GL_NEAREST_MIPMAP_LINEAR});
          texture.texture.tex_parameters_i.push({key: gl.TEXTURE_MAG_FILTER, value: gl.GL_LINEAR});
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          texture.texture.tex_parameters_i.push({key: gl.TEXTURE_MIN_FILTER, value: gl.NEAREST});
          texture.texture.tex_parameters_i.push({key: gl.TEXTURE_MAG_FILTER, value: gl.NEAREST});
          texture.texture.tex_parameters_i.push({key: gl.TEXTURE_WRAP_S, value: gl.CLAMP_TO_EDGE});
          texture.texture.tex_parameters_i.push({key: gl.TEXTURE_WRAP_T, value: gl.CLAMP_TO_EDGE});
        }
        texture.texture.unbind();
      }
      resolve();
    });
  };


  // Start loading.
  // This is called by editor_view, which only starts rendering on success
  service.load_resources = _.once(function(gl) {
    return Promise.resolve()
      .then(() => load_data_urls(service.backgrounds))
      .then(() => load_data_urls(service.sky_cubemaps))
      .then(() => load_data_urls(service.albedo_textures))
      .then(() => load_data_urls(service.markers))
      .then(() => build_webgl_textures(service.albedo_textures, gl))
      .then(() => build_webgl_textures(service.markers, gl));
  });

  return service;
}]);
