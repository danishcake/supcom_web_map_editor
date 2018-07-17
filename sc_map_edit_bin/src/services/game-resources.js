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
    value: "TTerrain",
    url: ""
  }];

  // TODO: id should be lowercase
  service.backgrounds = [
    {name: "Default",    data_url: require("../../gamedata/textures/environment/DefaultBackground.png"), id: "/textures/environment/DefaultBackground.dds"},
    {name: "Black",      data_url: require("../../gamedata/textures/environment/blackbackground.png"),   id: "/textures/environment/blackbackground.dds"},
    {name: "Thiban",     data_url: require("../../gamedata/textures/environment/Thiban_bmp.png"),        id: "/textures/environment/Thiban_bmp.dds"},
    {name: "Rigel",      data_url: require("../../gamedata/textures/environment/Rigel_bmp.png"),         id: "/textures/environment/Rigel_bmp.dds"},
    {name: "Zeta Canis", data_url: require("../../gamedata/textures/environment/Zeta Canis_bmp.png"),    id: "/textures/environment/Zeta Canis_bmp.dds"},
    {name: "Pollux",     data_url: require("../../gamedata/textures/environment/Pollux_bmp.png"),        id: "/textures/environment/Pollux_bmp.dds"},
    {name: "Pixces IV",  data_url: require("../../gamedata/textures/environment/Pisces IV_bmp.png"),     id: "/textures/environment/Pisces IV_bmp.dds"},
    {name: "Orionis",    data_url: require("../../gamedata/textures/environment/Orionis_bmp.png"),       id: "/textures/environment/Orionis_bmp.dds"},
    {name: "Minerva",    data_url: require("../../gamedata/textures/environment/Minerva_bmp.png"),       id: "/textures/environment/Minerva_bmp.dds"},
    {name: "Matar",      data_url: require("../../gamedata/textures/environment/Matar_bmp.png"),         id: "/textures/environment/Matar_bmp.dds"},
    {name: "Luthien",    data_url: require("../../gamedata/textures/environment/Luthien_bmp.png"),       id: "/textures/environment/Luthien_bmp.dds"},
    {name: "Eridani",    data_url: require("../../gamedata/textures/environment/Eridani_bmp.png"),       id: "/textures/environment/Eridani_bmp.dds"},
    {name: "Procyon",    data_url: require("../../gamedata/textures/environment/Procyon_bmp.png"),       id: "/textures/environment/Procyon_bmp.dds"},
    {name: "Earth",      data_url: require("../../gamedata/textures/environment/Earth_bmp.png"),         id: "/textures/environment/Earth_bmp.dds"},
    {name: "Capella",    data_url: require("../../gamedata/textures/environment/Capella_bmp.png"),       id: "/textures/environment/Capella_bmp.dds"}
  ];

  service.sky_cubemaps = [
    {name: "Default",       data_url: require("../../gamedata/textures/environment/DefaultSkyCube.png"), id: "/textures/environment/DefaultSkyCube.dds"},
    {name: "Blue",          data_url: require("../../gamedata/textures/environment/SkyCube_blue.png"), id: "/textures/environment/SkyCube_blue.dds"},
    {name: "Desert 1",      data_url: require("../../gamedata/textures/environment/SkyCube_Desert01.png"), id: "/textures/environment/SkyCube_Desert01.dds"},
    {name: "Desert 1a",     data_url: require("../../gamedata/textures/environment/SkyCube_Desert01a.png"), id: "/textures/environment/SkyCube_Desert01a.dds"},
    {name: "Desert 2",      data_url: require("../../gamedata/textures/environment/SkyCube_Desert02.png"), id: "/textures/environment/SkyCube_Desert02.dds"},
    {name: "Desert 2a",     data_url: require("../../gamedata/textures/environment/SkyCube_Desert02a.png"), id: "/textures/environment/SkyCube_Desert02a.dds"},
    {name: "Desert 3a",     data_url: require("../../gamedata/textures/environment/SkyCube_Desert03a.png"), id: "/textures/environment/SkyCube_Desert03a.dds"},
    {name: "Evergreen 1",   data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen01.png"), id: "/textures/environment/SkyCube_Evergreen01.dds"},
    {name: "Evergreen 1a",  data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen01a.png"), id: "/textures/environment/SkyCube_Evergreen01a.dds"},
    {name: "Evergreen 2",   data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen02.png"), id: "/textures/environment/SkyCube_Evergreen02.dds"},
    {name: "Evergreen 3",   data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen03.png"), id: "/textures/environment/SkyCube_Evergreen03.dds"},
    {name: "Evergreen 3a",  data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen03a.png"), id: "/textures/environment/SkyCube_Evergreen03a.dds"},
    {name: "Evergreen 4a",  data_url: require("../../gamedata/textures/environment/SkyCube_Evergreen05a.png"), id: "/textures/environment/SkyCube_Evergreen05a.dds"},
    {name: "Stormy",        data_url: require("../../gamedata/textures/environment/SkyCube_EvStormy.png"), id: "/textures/environment/SkyCube_EvStormy.dds"},
    {name: "Geothermal 1",  data_url: require("../../gamedata/textures/environment/SkyCube_Geothermal01.png"), id: "/textures/environment/SkyCube_Geothermal01.dds"},
    {name: "Geothermal 2",  data_url: require("../../gamedata/textures/environment/SkyCube_Geothermal02.png"), id: "/textures/environment/SkyCube_Geothermal02.dds"},
    {name: "Geothermal 2a", data_url: require("../../gamedata/textures/environment/SkyCube_Geothermal02a.png"), id: "/textures/environment/SkyCube_Geothermal02a.dds"},
    {name: "Lava 1",        data_url: require("../../gamedata/textures/environment/SkyCube_Lava01.png"), id: "/textures/environment/SkyCube_Lava01.dds"},
    {name: "Lava 1a",       data_url: require("../../gamedata/textures/environment/SkyCube_Lava01a.png"), id: "/textures/environment/SkyCube_Lava01a.dds"},
    {name: "Leipzig demo",  data_url: require("../../gamedata/textures/environment/SkyCube_Leipzig_Demo.png"), id: "/textures/environment/SkyCube_Leipzig_Demo.dds"},
    {name: "Redrocks 3",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRock03.png"), id: "/textures/environment/SkyCube_RedRock03.dds"},
    {name: "Redrocks 1",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks01.png"), id: "/textures/environment/SkyCube_RedRocks01.dds"},
    {name: "Redrocks 2",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks02.png"), id: "/textures/environment/SkyCube_RedRocks02.dds"},
    {name: "Redrocks 2a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks02a.png"), id: "/textures/environment/SkyCube_RedRocks02a.dds"},
    {name: "Redrocks 3",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks03.png"), id: "/textures/environment/SkyCube_RedRocks03.dds"},
    {name: "Redrocks 4",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks04.png"), id: "/textures/environment/SkyCube_RedRocks04.dds"},
    {name: "Redrocks 5",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks05.png"), id: "/textures/environment/SkyCube_RedRocks05.dds"},
    {name: "Redrocks 5a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks05a.png"), id: "/textures/environment/SkyCube_RedRocks05a.dds"},
    {name: "Redrocks 6",    data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks06.png"), id: "/textures/environment/SkyCube_RedRocks06.dds"},
    {name: "Redrocks 8a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks08a.png"), id: "/textures/environment/SkyCube_RedRocks08a.dds"},
    {name: "Redrocks 9a",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks09a.png"), id: "/textures/environment/SkyCube_RedRocks09a.dds"},
    {name: "Redrocks 10",   data_url: require("../../gamedata/textures/environment/SkyCube_RedRocks10.png"), id: "/textures/environment/SkyCube_RedRocks10.dds"},
    {name: "Scx1 1",        data_url: require("../../gamedata/textures/environment/SkyCube_Scx1Proto01.png"), id: "/textures/environment/SkyCube_Scx1Proto01.dds"},
    {name: "Scx1 2",         data_url: require("../../gamedata/textures/environment/SkyCube_Scx1Proto02.png"), id: "/textures/environment/SkyCube_Scx1Proto02.dds"},
    {name: "Tropical 1",    data_url: require("../../gamedata/textures/environment/SkyCube_Tropical01.png"), id: "/textures/environment/SkyCube_Tropical01.dds"},
    {name: "Tropical 1a",   data_url: require("../../gamedata/textures/environment/SkyCube_Tropical01a.png"), id: "/textures/environment/SkyCube_Tropical01a.dds"},
    {name: "Tropical 4",    data_url: require("../../gamedata/textures/environment/SkyCube_Tropical04.png"), id: "/textures/environment/SkyCube_Tropical04.dds"},
    {name: "Tropical 6",    data_url: require("../../gamedata/textures/environment/SkyCube_TropicalOp06.png"), id: "/textures/environment/SkyCube_TropicalOp06.dds"},
    {name: "Tropical 6a",   data_url: require("../../gamedata/textures/environment/SkyCube_TropicalOp06a.png"), id: "/textures/environment/SkyCube_TropicalOp06a.dds"},
    {name: "Tundra 1",      data_url: require("../../gamedata/textures/environment/SkyCube_Tundra01.png"), id: "/textures/environment/SkyCube_Tundra01.dds"},
    {name: "Tundra 2",      data_url: require("../../gamedata/textures/environment/SkyCube_Tundra02.png"), id: "/textures/environment/SkyCube_Tundra02.dds"},
    {name: "Tundra 2a",     data_url: require("../../gamedata/textures/environment/SkyCube_Tundra02a.png"), id: "/textures/environment/SkyCube_Tundra02a.dds"},
    {name: "Tundra 3",      data_url: require("../../gamedata/textures/environment/SkyCube_Tundra03.png"), id: "/textures/environment/SkyCube_Tundra03.dds"},
    {name: "Tundra 3a",     data_url: require("../../gamedata/textures/environment/SkyCube_Tundra03a.png"), id: "/textures/environment/SkyCube_Tundra03a.dds"},
    {name: "Tundra 4a",     data_url: require("../../gamedata/textures/environment/SkyCube_Tundra04a.png"), id: "/textures/environment/SkyCube_Tundra04a.dds"}
  ];

  service.environment_cubemaps = [
    {name: "Default",                 data_url: require("../../gamedata/textures/environment/DefaultEnvCube.png"), id: "/textures/environment/DefaultEnvCube.dds"},
    {name: "Aeon alien crystal",      data_url: require("../../gamedata/textures/environment/EnvCube_aeon_aliencrystal.png"), id: "/textures/environment/EnvCube_aeon_aliencrystal.dds"},
    {name: "Aeon desert",             data_url: require("../../gamedata/textures/environment/EnvCube_aeon_desert.png"), id: "/textures/environment/EnvCube_aeon_desert.dds"},
    {name: "Aeon evergreen",          data_url: require("../../gamedata/textures/environment/EnvCube_aeon_Evergreen.png"), id: "/textures/environment/EnvCube_aeon_Evergreen.dds"},
    {name: "Aeon geothermal",         data_url: require("../../gamedata/textures/environment/EnvCube_aeon_geothermal.png"), id: "/textures/environment/EnvCube_aeon_geothermal.dds"},
    {name: "Aeon lava",               data_url: require("../../gamedata/textures/environment/EnvCube_aeon_lava.png"), id: "/textures/environment/EnvCube_aeon_lava.dds"},
    {name: "Aeon redrocks",           data_url: require("../../gamedata/textures/environment/EnvCube_aeon_RedRocks.png"), id: "/textures/environment/EnvCube_aeon_RedRocks.dds"},
    {name: "Aeon tropical",           data_url: require("../../gamedata/textures/environment/EnvCube_aeon_tropical.png"), id: "/textures/environment/EnvCube_aeon_tropical.dds"},
    {name: "Aeon tundra",             data_url: require("../../gamedata/textures/environment/EnvCube_aeon_tundra.png"), id: "/textures/environment/EnvCube_aeon_tundra.dds"},
    {name: "Desert 1",                data_url: require("../../gamedata/textures/environment/EnvCube_Desert01a.png"), id: "/textures/environment/EnvCube_Desert01a.dds"},
    {name: "Desert 2",                data_url: require("../../gamedata/textures/environment/EnvCube_Desert02a.png"), id: "/textures/environment/EnvCube_Desert02a.dds"},
    {name: "Desert 3",                data_url: require("../../gamedata/textures/environment/EnvCube_Desert03a.png"), id: "/textures/environment/EnvCube_Desert03a.dds"},
    {name: "Evergreen 1",             data_url: require("../../gamedata/textures/environment/EnvCube_Evergreen01a.png"), id: "/textures/environment/EnvCube_Evergreen01a.dds"},
    {name: "Evergreen 2",             data_url: require("../../gamedata/textures/environment/EnvCube_Evergreen03a.png"), id: "/textures/environment/EnvCube_Evergreen03a.dds"},
    {name: "Evergreen 3",             data_url: require("../../gamedata/textures/environment/EnvCube_Evergreen05a.png"), id: "/textures/environment/EnvCube_Evergreen05a.dds"},
    {name: "Geothermal",              data_url: require("../../gamedata/textures/environment/EnvCube_Geothermal02a.png"), id: "/textures/environment/EnvCube_Geothermal02a.dds"},
    {name: "Lava",                    data_url: require("../../gamedata/textures/environment/EnvCube_Lava01a.png"), id: "/textures/environment/EnvCube_Lava01a.dds"},
    {name: "Redrocks 5",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks05a.png"), id: "/textures/environment/EnvCube_RedRocks05a.dds"},
    {name: "Redrocks 6",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks06.png"), id: "/textures/environment/EnvCube_RedRocks06.dds"},
    {name: "Redrocks 8",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks08a.png"), id: "/textures/environment/EnvCube_RedRocks08a.dds"},
    {name: "Redrocks 9",              data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks09a.png"), id: "/textures/environment/EnvCube_RedRocks09a.dds"},
    {name: "Redrocks 10",             data_url: require("../../gamedata/textures/environment/EnvCube_RedRocks10.png"), id: "/textures/environment/EnvCube_RedRocks10.dds"},
    {name: "Scx1",                    data_url: require("../../gamedata/textures/environment/EnvCube_Scx1Proto02.png"), id: "/textures/environment/EnvCube_Scx1Proto02.dds"}, // TODO: Better name!
    {name: "Seraphim alient crystal", data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_aliencrystal.png"), id: "/textures/environment/EnvCube_seraphim_aliencrystal.dds"},
    {name: "Seraphim desert",         data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_desert.png"), id: "/textures/environment/EnvCube_seraphim_desert.dds"},
    {name: "Seraphim evergreen",      data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_Evergreen.png"), id: "/textures/environment/EnvCube_seraphim_Evergreen.dds"},
    {name: "Seraphim geothermal",     data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_geothermal.png"), id: "/textures/environment/EnvCube_seraphim_geothermal.dds"},
    {name: "Seraphim lava",           data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_lava.png"), id: "/textures/environment/EnvCube_seraphim_lava.dds"},
    {name: "Seraphim redrocks",       data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_redrocks.png"), id: "/textures/environment/EnvCube_seraphim_redrocks.dds"},
    {name: "Seraphim tropical",       data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_tropical.png"), id: "/textures/environment/EnvCube_seraphim_tropical.dds"},
    {name: "Seraphim tundra",         data_url: require("../../gamedata/textures/environment/EnvCube_seraphim_tundra.png"), id: "/textures/environment/EnvCube_seraphim_tundra.dds"},
    {name: "Tropical 1",              data_url: require("../../gamedata/textures/environment/EnvCube_Tropical01a.png"), id: "/textures/environment/EnvCube_Tropical01a.dds"},
    {name: "Tropical 6",              data_url: require("../../gamedata/textures/environment/EnvCube_TropicalOp06a.png"), id: "/textures/environment/EnvCube_TropicalOp06a.dds"},
    {name: "Tundra 2",                data_url: require("../../gamedata/textures/environment/EnvCube_Tundra02a.png"), id: "/textures/environment/EnvCube_Tundra02a.dds"},
    {name: "Tundra 3",                data_url: require("../../gamedata/textures/environment/EnvCube_Tundra03a.png"), id: "/textures/environment/EnvCube_Tundra03a.dds"},
    {name: "Tundra 4",                data_url: require("../../gamedata/textures/environment/EnvCube_Tundra04a.png"), id: "/textures/environment/EnvCube_Tundra04a.dds"}
  ];

  service.albedo_textures = [
    // Special unused texture slot.
    // This will be rendered when a texture cannot be found, or a texture isn't defined
    {name: "Unused",        tileset: "Unused", data_url: require("../../gamedata/editor_icons/Unused_texture.png"), id: ""},

    // Desert tileset
    {name: "Gravel",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Gravel_albedo.png"), id: "/env/Desert/Layers/Des_Gravel_albedo.dds"},
    {name: "Gravel 1",      tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Gravel01_albedo.png"), id: "/env/Desert/Layers/Des_Gravel01_albedo.dds"},
    {name: "Rock",          tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock_albedo.png"), id: "/env/Desert/Layers/Des_Rock_albedo.dds"},
    {name: "Rock 1",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock01_albedo.png"), id: "/env/Desert/Layers/Des_Rock01_albedo.dds"},
    {name: "Rock 2",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock02_albedo.png"), id: "/env/Desert/Layers/Des_Rock02_albedo.dds"},
    {name: "Rock 3",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock03_albedo.png"), id: "/env/Desert/Layers/Des_Rock03_albedo.dds"},
    {name: "Rock 4",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock04_albedo.png"), id: "/env/Desert/Layers/Des_Rock04_albedo.dds"},
    {name: "Rock 5",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock05_albedo.png"), id: "/env/Desert/Layers/Des_Rock05_albedo.dds"},
    {name: "Rock 6",        tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Rock06_albedo.png"), id: "/env/Desert/Layers/Des_Rock06_albedo.dds"},
    {name: "Dark sand",     tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandDark_albedo.png"), id: "/env/Desert/Layers/Des_SandDark_albedo.dds"},
    {name: "Dark sand 2",   tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandDark02_albedo.png"), id: "/env/Desert/Layers/Des_SandDark02_albedo.dds"},
    {name: "Light sand",    tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_sandLight_albedo.png"), id: "/env/Desert/Layers/Des_sandLight_albedo.dds"},
    {name: "Medium sand",   tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandMed_albedo.png"), id: "/env/Desert/Layers/Des_SandMed_albedo.dds"},
    {name: "Medium sand 1", tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandMed01_albedo.png"), id: "/env/Desert/Layers/Des_SandMed01_albedo.dds"},
    {name: "Medium sand 2", tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_SandMed02_albedo.png"), id: "/env/Desert/Layers/Des_SandMed02_albedo.dds"},
    {name: "Wet sand",      tileset: "Desert", data_url: require("../../gamedata/env/Desert/Layers/Des_Sandwet_albedo.png"), id: "/env/Desert/Layers/Des_Sandwet_albedo.dds"},

    // Evergreen tileset
    {name: "Dirt 1",         tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/Dirt001_albedo.png"), id: "/env/Evergreen/layers/Dirt001_albedo.dds"},
    {name: "Grass 0",        tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/grass000_albedo.png"), id: "/env/Evergreen/layers/grass000_albedo.dds"},
    {name: "Grass 1",        tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/grass001_albedo.png"), id: "/env/Evergreen/layers/grass001_albedo.dds"},
    {name: "Macrotexture 0", tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/macrotexture000_albedo.png"), id: "/env/Evergreen/layers/macrotexture000_albedo.dds"},
    {name: "Macrotexture 1", tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/macrotexture001_albedo.png"), id: "/env/Evergreen/layers/macrotexture001_albedo.dds"},
    {name: "Light rock",     tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/RockLight_albedo.png"), id: "/env/Evergreen/layers/RockLight_albedo.dds"},
    {name: "Medium rock",    tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/RockMed_albedo.png"), id: "/env/Evergreen/layers/RockMed_albedo.dds"},
    {name: "Light sand",     tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/SandLight_albedo.png"), id: "/env/Evergreen/layers/SandLight_albedo.dds"},
    {name: "Light sand 2",   tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/SandLight002_albedo.png"), id: "/env/Evergreen/layers/SandLight002_albedo.dds"},
    {name: "Sand rock",      tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/SandRock_albedo.png"), id: "/env/Evergreen/layers/SandRock_albedo.dds"},
    {name: "Sand wet",       tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/Sandwet_albedo.png"), id: "/env/Evergreen/layers/Sandwet_albedo.dds"},
    {name: "Snow",           tileset: "Evergreen", data_url: require("../../gamedata/env/Evergreen/layers/snow001_albedo.png"), id: "/env/Evergreen/layers/snow001_albedo.dds"},

    // Evergreen 2 tileset
    {name: "Dirt 1",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Dirt001_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Dirt001_albedo.dds"},
    {name: "Dirt 2",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Dirt002_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Dirt002_albedo.dds"},
    {name: "Dirt 3",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Dirt003_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Dirt003_albedo.dds"},
    {name: "Grass 1",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass001_albedo.png"), id: "/env/Evergreen2/Layers/EG_Grass001_albedo.dds"},
    {name: "Grass 2",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass002_albedo.png"), id: "/env/Evergreen2/Layers/EG_Grass002_albedo.dds"},
    {name: "Grass 2b",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass002b_albedo.png"), id: "/env/Evergreen2/Layers/EG_Grass002b_albedo.dds"},
    {name: "Grass 2c",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Grass002c_albedo.png"), id: "/env/Evergreen2/Layers/EG_Grass002c_albedo.dds"},
    {name: "Gravel",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Gravel_albedo.png"), id: "/env/Evergreen2/Layers/EG_Gravel_albedo.dds"},
    {name: "Gravel 1",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel01_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Gravel01_albedo.dds"},
    {name: "Gravel 2",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Gravel002_albedo.png"), id: "/env/Evergreen2/Layers/EG_Gravel002_albedo.dds"},
    {name: "Gravel 2b",    tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Gravel2_albedo.png"), id: "/env/Evergreen2/Layers/EG_Gravel2_albedo.dds"},
    {name: "Gravel 3",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel003_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Gravel003_albedo.dds"},
    {name: "Gravel 4",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel004_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Gravel004_albedo.dds"},
    {name: "Gravel 5",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/Eg_Gravel005_albedo.png"), id: "/env/Evergreen2/Layers/Eg_Gravel005_albedo.dds"},
    {name: "Rock",         tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Rock_albedo.png"), id: "/env/Evergreen2/Layers/EG_Rock_albedo.dds"},
    {name: "Snow",         tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Snow.png"), id: "/env/Evergreen2/Layers/EG_Snow.dds"},
    {name: "Snow 2",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EG_Snow_albedo.png"), id: "/env/Evergreen2/Layers/EG_Snow_albedo.dds"},
    {name: "Coral reef",   tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EV_Reef_Coral_albedo.png"), id: "/env/Evergreen2/Layers/EV_Reef_Coral_albedo.dds"},
    {name: "Reef sand",    tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EV_Reef_sand_albedo.png"), id: "/env/Evergreen2/Layers/EV_Reef_sand_albedo.dds"},
    {name: "Grass 3",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass003_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass003_albedo.dds"},
    {name: "Grass 4",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass004_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass004_albedo.dds"},
    {name: "Grass 5",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass005_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass005_albedo.dds"},
    {name: "Grass 5a",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass005a_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass005a_albedo.dds"},
    {name: "Grass 6",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass006_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass006_albedo.dds"},
    {name: "Grass 7",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass007_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass007_albedo.dds"},
    {name: "Grass 8",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass008_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass008_albedo.dds"},
    {name: "Grass 9",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass009_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass009_albedo.dds"},
    {name: "Grass 10",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass010_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass010_albedo.dds"},
    {name: "Grass 10a",    tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvGrass010a_albedo.png"), id: "/env/Evergreen2/Layers/EvGrass010a_albedo.dds"},
    {name: "Hostas 1",     tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvHostas001_albedo.png"), id: "/env/Evergreen2/Layers/EvHostas001_albedo.dds"},
    {name: "Rock 2",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock002_albedo.png"), id: "/env/Evergreen2/Layers/EvRock002_albedo.dds"},
    {name: "Rock 2b",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock002b_albedo.png"), id: "/env/Evergreen2/Layers/EvRock002b_albedo.dds"},
    {name: "Rock 3",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock003_albedo.png"), id: "/env/Evergreen2/Layers/EvRock003_albedo.dds"},
    {name: "Rock 4",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock004_albedo.png"), id: "/env/Evergreen2/Layers/EvRock004_albedo.dds"},
    {name: "Rock 5",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock005_albedo.png"), id: "/env/Evergreen2/Layers/EvRock005_albedo.dds"},
    {name: "Rock 6",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock006_albedo.png"), id: "/env/Evergreen2/Layers/EvRock006_albedo.dds"},
    {name: "Rock 6b",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock006b_albedo.png"), id: "/env/Evergreen2/Layers/EvRock006b_albedo.dds"},
    {name: "Rock 6c",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock006c_albedo.png"), id: "/env/Evergreen2/Layers/EvRock006c_albedo.dds"},
    {name: "Rock 7",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock007_albedo.png"), id: "/env/Evergreen2/Layers/EvRock007_albedo.dds"},
    {name: "Rock 7c",      tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock007c_albedo.png"), id: "/env/Evergreen2/Layers/EvRock007c_albedo.dds"},
    {name: "Rock 8",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvRock008_albedo.png"), id: "/env/Evergreen2/Layers/EvRock008_albedo.dds"},
    {name: "Snow 3",       tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvSnow003_albedo.png"), id: "/env/Evergreen2/Layers/EvSnow003_albedo.dds"},
    {name: "Transition 1", tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvTrans01_albedo.png"), id: "/env/Evergreen2/Layers/EvTrans01_albedo.dds"},
    {name: "Transition 2", tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvTrans02_albedo.png"), id: "/env/Evergreen2/Layers/EvTrans02_albedo.dds"},
    {name: "Transition 3", tileset: "Evergreen 2", data_url: require("../../gamedata/env/Evergreen2/Layers/EvTrans03_albedo.png"), id: "/env/Evergreen2/Layers/EvTrans03_albedo.dds"},

    // Common tileset
    {name: "None",         tileset: "Common",      data_url: require("../../gamedata/env/Common/layers/None_albedo.png"), id: "/env/Common/layers/None_albedo.dds"},
    {name: "Wet Rock 1",   tileset: "Common",      data_url: require("../../gamedata/env/Common/layers/WetRock001_albedo.png"), id: "/env/Common/layers/WetRock001_albedo.dds"},
    {name: "Wet Rock 2",   tileset: "Common",      data_url: require("../../gamedata/env/Common/layers/WetRock002_albedo.png"), id: "/env/Common/layers/WetRock002_albedo.dds"},

    // Crystalline tilset
    {name: "Crystalline 1-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_01_01_albedo.png"), id: "/env/Crystalline/layers/Cr_01_01_albedo.dds"},
    {name: "Crystalline 2-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_02_01_albedo.png"), id: "/env/Crystalline/layers/Cr_02_01_albedo.dds"},
    {name: "Crystalline 3-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_03_01_albedo.png"), id: "/env/Crystalline/layers/Cr_03_01_albedo.dds"},
    {name: "Crystalline 4-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_04_01_albedo.png"), id: "/env/Crystalline/layers/Cr_04_01_albedo.dds"},
    {name: "Crystalline 5-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_05_01_albedo.png"), id: "/env/Crystalline/layers/Cr_05_01_albedo.dds"},
    {name: "Crystalline 6-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_06_01_albedo.png"), id: "/env/Crystalline/layers/Cr_06_01_albedo.dds"},
    {name: "Crystalline 7-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_07_01_albedo.png"), id: "/env/Crystalline/layers/Cr_07_01_albedo.dds"},
    {name: "Crystalline 7-1b copy", tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_07_01b_albedo copy.png"), id: "/env/Crystalline/layers/Cr_07_01b_albedo copy.dds"}, // Derp
    {name: "Crystalline 7-1b",      tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_07_01b_albedo.png"), id: "/env/Crystalline/layers/Cr_07_01b_albedo.dds"},
    {name: "Crystalline 8-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_08_01_albedo.png"), id: "/env/Crystalline/layers/Cr_08_01_albedo.dds"},
    {name: "Crystalline 8-1",       tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_09_01_albedo.png"), id: "/env/Crystalline/layers/Cr_09_01_albedo.dds"},
    {name: "Crystalline rock 1",    tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock001_albedo.png"), id: "/env/Crystalline/layers/Cr_Rock001_albedo.dds"},
    {name: "Crystalline rock 1b",   tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock001b_albedo.png"), id: "/env/Crystalline/layers/Cr_Rock001b_albedo.dds"},
    {name: "Crystalline rock 2b",   tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock002b_albedo.png"), id: "/env/Crystalline/layers/Cr_Rock002b_albedo.dds"},
    {name: "Crystalline rock 4",    tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock004_albedo.png"), id: "/env/Crystalline/layers/Cr_Rock004_albedo.dds"},
    {name: "Crystalline rock 5",    tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Rock05_albedo.png"), id: "/env/Crystalline/layers/Cr_Rock05_albedo.dds"},
    {name: "Crystalline wet sand",  tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cr_Sandwet_albedo.png"), id: "/env/Crystalline/layers/Cr_Sandwet_albedo.dds"},
    {name: "Crystalline rock 1c",   tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst_Rock01_albedo.png"), id: "/env/Crystalline/layers/Cryst_Rock01_albedo.dds"},
    {name: "Crystalline 9",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst009_albedo.png"), id: "/env/Crystalline/layers/Cryst009_albedo.dds"},
    {name: "Crystalline 10",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst010_albedo.png"), id: "/env/Crystalline/layers/Cryst010_albedo.dds"},
    {name: "Crystalline 11",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst011_albedo.png"), id: "/env/Crystalline/layers/Cryst011_albedo.dds"},
    {name: "Crystalline 12",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst012_albedo.png"), id: "/env/Crystalline/layers/Cryst012_albedo.dds"},
    {name: "Crystalline 13",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/Cryst013_albedo.png"), id: "/env/Crystalline/layers/Cryst013_albedo.dds"},
    {name: "Crystalwerk 1",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk01_albedo.png"), id: "/env/Crystalline/layers/crystalWerk01_albedo.dds"},
    {name: "Crystalwerk 2",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk02_albedo.png"), id: "/env/Crystalline/layers/crystalWerk02_albedo.dds"},
    {name: "Crystalwerk 2b",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk02b_albedo.png"), id: "/env/Crystalline/layers/crystalWerk02b_albedo.dds"},
    {name: "Crystalwerk 3",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk03_albedo.png"), id: "/env/Crystalline/layers/crystalWerk03_albedo.dds"},
    {name: "Crystalwerk 4",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk04_albedo.png"), id: "/env/Crystalline/layers/crystalWerk04_albedo.dds"},
    {name: "Crystalwerk 4b",        tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk04_b_albedo.png"), id: "/env/Crystalline/layers/crystalWerk04_b_albedo.dds"},
    {name: "Crystalwerk 5",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk05_albedo.png"), id: "/env/Crystalline/layers/crystalWerk05_albedo.dds"},
    {name: "Crystalwerk 6",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/CrystalWerk06_albedo.png"), id: "/env/Crystalline/layers/CrystalWerk06_albedo.dds"},
    {name: "Crystalwerk 7",         tileset: "Crystalline", data_url: require("../../gamedata/env/Crystalline/layers/crystalWerk07_albedo.png"), id: "/env/Crystalline/layers/crystalWerk07_albedo.dds"},

    // Geothermal tilset
    {name: "Ashley",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Ashley_01_albedo.png"), id: "/env/Geothermal/layers/Geo_Ashley_01_albedo.dds"},
    {name: "Dirt 1",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Dirt_01_albedo.png"), id: "/env/Geothermal/layers/Geo_Dirt_01_albedo.dds"},
    {name: "Dark lava 1",   tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaDk_01_albedo.png"), id: "/env/Geothermal/layers/Geo_LavaDk_01_albedo.dds"},
    {name: "Light lava 1",  tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaLt_01_albedo.png"), id: "/env/Geothermal/layers/Geo_LavaLt_01_albedo.dds"},
    {name: "Medium lava 1", tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaMd_01_albedo.png"), id: "/env/Geothermal/layers/Geo_LavaMd_01_albedo.dds"},
    {name: "Medium lava 2", tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaMd_02_albedo.png"), id: "/env/Geothermal/layers/Geo_LavaMd_02_albedo.dds"},
    {name: "Medium lava 3", tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_LavaMd_03_albedo.png"), id: "/env/Geothermal/layers/Geo_LavaMd_03_albedo.dds"},
    {name: "Rock 1",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Rock001_albedo.png"), id: "/env/Geothermal/layers/Geo_Rock001_albedo.dds"},
    {name: "Rock 2",        tileset: "Geothermal", data_url: require("../../gamedata/env/Geothermal/layers/Geo_Rock002_albedo.png"), id: "/env/Geothermal/layers/Geo_Rock002_albedo.dds"},

    // Lava tileset
    {name: "Cracked",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Cracked_albedo.png"), id: "/env/Lava/Layers/LAV_Cracked_albedo.dds"},
    {name: "Cracked 2",       tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/Lav_Cracked02_albedo.png"), id: "/env/Lava/Layers/Lav_Cracked02_albedo.dds"},
    {name: "Cracked 2b",      tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/Lav_Cracked02b_albedo.png"), id: "/env/Lava/Layers/Lav_Cracked02b_albedo.dds"},
    {name: "Gravel",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Gravel_albedo.png"), id: "/env/Lava/Layers/LAV_Gravel_albedo.dds"},
    {name: "Lava 1",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Lava01_albedo.png"), id: "/env/Lava/Layers/LAV_Lava01_albedo.dds"},
    {name: "Lava 2",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Lava02_albedo.png"), id: "/env/Lava/Layers/LAV_Lava02_albedo.dds"},
    {name: "Macrotexture 0",  tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_macrotexture000_albedo.png"), id: "/env/Lava/Layers/LAV_macrotexture000_albedo.dds"},
    {name: "Macrotexture 0b", tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_macrotexture000b_albedo.png"), id: "/env/Lava/Layers/LAV_macrotexture000b_albedo.dds"},
    {name: "Ribbon",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/Lav_Ribbon_albedo.png"), id: "/env/Lava/Layers/Lav_Ribbon_albedo.dds"},
    {name: "Ribbon 1",        tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Ribbon01_albedo.png"), id: "/env/Lava/Layers/LAV_Ribbon01_albedo.dds"},
    {name: "Rock 1",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock01_albedo.png"), id: "/env/Lava/Layers/LAV_Rock01_albedo.dds"},
    {name: "Rock 2",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock02_albedo.png"), id: "/env/Lava/Layers/LAV_Rock02_albedo.dds"},
    {name: "Rock 2b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock02b_albedo.png"), id: "/env/Lava/Layers/LAV_Rock02b_albedo.dds"},
    {name: "Rock 3",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock03_albedo.png"), id: "/env/Lava/Layers/LAV_Rock03_albedo.dds"},
    {name: "Rock 3b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock03b_albedo.png"), id: "/env/Lava/Layers/LAV_Rock03b_albedo.dds"},
    {name: "Rock 4",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock04_albedo.png"), id: "/env/Lava/Layers/LAV_Rock04_albedo.dds"},
    {name: "Rock 5",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock05_albedo.png"), id: "/env/Lava/Layers/LAV_Rock05_albedo.dds"},
    {name: "Rock 6",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock06_albedo.png"), id: "/env/Lava/Layers/LAV_Rock06_albedo.dds"},
    {name: "Rock 7",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock07_albedo.png"), id: "/env/Lava/Layers/LAV_Rock07_albedo.dds"},
    {name: "Rock 7b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock07b_albedo.png"), id: "/env/Lava/Layers/LAV_Rock07b_albedo.dds"},
    {name: "Rock 8",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock08_albedo.png"), id: "/env/Lava/Layers/LAV_Rock08_albedo.dds"},
    {name: "Rock 9",          tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock09_albedo.png"), id: "/env/Lava/Layers/LAV_Rock09_albedo.dds"},
    {name: "Rock 9b",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock09b_albedo.png"), id: "/env/Lava/Layers/LAV_Rock09b_albedo.dds"},
    {name: "Rock 10",         tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_Rock10_albedo.png"), id: "/env/Lava/Layers/LAV_Rock10_albedo.dds"},
    {name: "Tech wiers",      tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/LAV_TECH_WIERS_albedo.png"), id: "/env/Lava/Layers/LAV_TECH_WIERS_albedo.dds"},
    {name: "Macrotexture 0c", tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/macrotexture000_albedo.png"), id: "/env/Lava/Layers/macrotexture000_albedo.dds"},
    {name: "Macrotexture 2",  tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/macrotexture002_albedo.png"), id: "/env/Lava/Layers/macrotexture002_albedo.dds"},
    {name: "Macrotexture 2b", tileset: "Lava", data_url: require("../../gamedata/env/Lava/Layers/macrotexture002b_albedo.png"), id: "/env/Lava/Layers/macrotexture002b_albedo.dds"},

    // Paradise tileset
    {name: "Dirt 0",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/dirt000_albedo.png"), id: "/env/paradise/layers/dirt000_albedo.dds"},
    {name: "Dirt 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/dirt001_albedo.png"), id: "/env/paradise/layers/dirt001_albedo.dds"},
    {name: "Grass 0",        tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/grass000_albedo.png"), id: "/env/paradise/layers/grass000_albedo.dds"},
    {name: "Grass 1",        tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/grass001_albedo.png"), id: "/env/paradise/layers/grass001_albedo.dds"},
    {name: "Grass 2",        tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/grass002_albedo.png"), id: "/env/paradise/layers/grass002_albedo.dds"},
    {name: "Grass jung",     tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/GrassJung_albedo.png"), id: "/env/paradise/layers/GrassJung_albedo.dds"},
    {name: "Ice 1",          tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/Ice001_albedo.png"), id: "/env/paradise/layers/Ice001_albedo.dds"},
    {name: "Ice 2",          tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/Ice002_albedo.png"), id: "/env/paradise/layers/Ice002_albedo.dds"},
    {name: "Lava rock",      tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/LavaRock_albedo.png"), id: "/env/paradise/layers/LavaRock_albedo.dds"},
    {name: "Macrotexture 0", tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/macrotexture000_albedo.png"), id: "/env/paradise/layers/macrotexture000_albedo.dds"},
    {name: "Macrotexture 1", tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/macrotexture001_albedo.png"), id: "/env/paradise/layers/macrotexture001_albedo.dds"},
    {name: "Rock 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/Rock001_albedo.png"), id: "/env/paradise/layers/Rock001_albedo.dds"},
    {name: "Sand 0",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/sand000_albedo.png"), id: "/env/paradise/layers/sand000_albedo.dds"},
    {name: "Sand 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/sand001_albedo.png"), id: "/env/paradise/layers/sand001_albedo.dds"},
    {name: "Light sand",     tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/SandLight002.png"), id: "/env/paradise/layers/SandLight002.dds"},
    {name: "Medium sand",    tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/SandMed_albedo.png"), id: "/env/paradise/layers/SandMed_albedo.dds"},
    {name: "Snow 1",         tileset: "Paradise", data_url: require("../../gamedata/env/paradise/layers/snow001_albedo.png"), id: "/env/paradise/layers/snow001_albedo.dds"},

    // Red Barrens tileset
    {name: "Macrotexture 1", tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/macrotexture001_albedo.png"), id: "/env/Red Barrens/Layers/macrotexture001_albedo.dds"},
    {name: "Cracked",        tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Cracked_albedo.png"), id: "/env/Red Barrens/Layers/RB_Cracked_albedo.dds"},
    {name: "Cracked 2",      tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Cracked02_albedo.png"), id: "/env/Red Barrens/Layers/RB_Cracked02_albedo.dds"},
    {name: "Gravel 1",       tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_gravel01_albedo.png"), id: "/env/Red Barrens/Layers/RB_gravel01_albedo.dds"},
    {name: "Red mud",        tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_RedMud_albedo.png"), id: "/env/Red Barrens/Layers/RB_RedMud_albedo.dds"},
    {name: "Rock",           tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock_albedo.dds"},
    {name: "Rock 2",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock02_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock02_albedo.dds"},
    {name: "Rock 3",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock03_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock03_albedo.dds"},
    {name: "Rock 4",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock04_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock04_albedo.dds"},
    {name: "Rock 6",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock06_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock06_albedo.dds"},
    {name: "Rock 7",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock07_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock07_albedo.dds"},
    {name: "Rock 8",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock08_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock08_albedo.dds"},
    {name: "Rock 9",         tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Rock09_albedo.png"), id: "/env/Red Barrens/Layers/RB_Rock09_albedo.dds"},
    {name: "Sand",           tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sand_albedo.png"), id: "/env/Red Barrens/Layers/RB_Sand_albedo.dds"},
    {name: "Wet sand",       tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sandwet.png"), id: "/env/Red Barrens/Layers/RB_Sandwet.dds"},
    {name: "Wet sand 1",     tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sandwet01_albedo.png"), id: "/env/Red Barrens/Layers/RB_Sandwet01_albedo.dds"},
    {name: "Wet sand 2",     tileset: "Red Barrens", data_url: require("../../gamedata/env/Red Barrens/Layers/RB_Sandwet_albedo.png"), id: "/env/Red Barrens/Layers/RB_Sandwet_albedo.dds"},

    // Swamp tileset
    {name: "Creepers",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Creeper_01_albedo.png"), id: "/env/Swamp/layers/Sw_Creeper_01_albedo.dds"},
    {name: "Ferns 1",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Ferns_01_albedo.png"), id: "/env/Swamp/layers/Sw_Ferns_01_albedo.dds"},
    {name: "Ferns 2",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Ferns_02_albedo.png"), id: "/env/Swamp/layers/Sw_Ferns_02_albedo.dds"},
    {name: "Grass 1",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Grass_01_albedo.png"), id: "/env/Swamp/layers/Sw_Grass_01_albedo.dds"},
    {name: "Grass 2",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Grass_02_albedo.png"), id: "/env/Swamp/layers/Sw_Grass_02_albedo.dds"},
    {name: "Grass 3",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Grass_03_albedo.png"), id: "/env/Swamp/layers/Sw_Grass_03_albedo.dds"},
    {name: "Mossy",      tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mossy_01_albedo.png"), id: "/env/Swamp/layers/Sw_Mossy_01_albedo.dds"},
    {name: "Mudder 1",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_01_albedo.png"), id: "/env/Swamp/layers/Sw_Mudder_01_albedo.dds"},
    {name: "Mudder 2",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_02_albedo.png"), id: "/env/Swamp/layers/Sw_Mudder_02_albedo.dds"},
    {name: "Mudder 3",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_03_albedo.png"), id: "/env/Swamp/layers/Sw_Mudder_03_albedo.dds"},
    {name: "Mudder 4",   tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Mudder_04_albedo.png"), id: "/env/Swamp/layers/Sw_Mudder_04_albedo.dds"},
    {name: "Rocky 1",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Rocky_01_albedo.png"), id: "/env/Swamp/layers/Sw_Rocky_01_albedo.dds"},
    {name: "Rocky 2",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Rocky_02_albedo.png"), id: "/env/Swamp/layers/Sw_Rocky_02_albedo.dds"},
    {name: "Rocky 3",    tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Rocky_03_albedo.png"), id: "/env/Swamp/layers/Sw_Rocky_03_albedo.dds"},
    {name: "Sphagnum 1", tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Sphagnum_01_albedo.png"), id: "/env/Swamp/layers/Sw_Sphagnum_01_albedo.dds"},
    {name: "Sphagnum 2", tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Sphagnum_02_albedo.png"), id: "/env/Swamp/layers/Sw_Sphagnum_02_albedo.dds"},
    {name: "Sphagnum 3", tileset: "Swamp", data_url: require("../../gamedata/env/Swamp/layers/Sw_Sphagnum_03_albedo.png"), id: "/env/Swamp/layers/Sw_Sphagnum_03_albedo.dds"},

    // Tropical tileset
    {name: "Dry sand 1",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/DrySand001_albedo.png"), id: "/env/Tropical/Layers/DrySand001_albedo.dds"},
    {name: "Dry sand 2",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/DrySand002_albedo.png"), id: "/env/Tropical/Layers/DrySand002_albedo.dds"},
    {name: "Coral",         tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_Coral_albedo.png"), id: "/env/Tropical/Layers/Tr_Coral_albedo.dds"},
    {name: "Grass hills",   tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_GrassHills_albedo.png"), id: "/env/Tropical/Layers/Tr_GrassHills_albedo.dds"},
    {name: "Ground 0",      tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_ground001_albedo.png"), id: "/env/Tropical/Layers/Tr_ground001_albedo.dds"},
    {name: "Coral reef",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_Reef_Coral_albedo.png"), id: "/env/Tropical/Layers/Tr_Reef_Coral_albedo.dds"},
    {name: "Coral reef 2",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_Reef_Coral2_albedo.png"), id: "/env/Tropical/Layers/Tr_Reef_Coral2_albedo.dds"},
    {name: "Rock wall 1",   tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Tr_RockWall001.png"), id: "/env/Tropical/Layers/Tr_RockWall001.dds"},
    {name: "Rock",          tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Rock_albedo.png"), id: "/env/Tropical/Layers/Trop_Rock_albedo.dds"},
    {name: "Rock 2b",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock002b_albedo.png"), id: "/env/Tropical/Layers/TrRock002b_albedo.dds"},
    {name: "Rock 3",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock003_albedo.png"), id: "/env/Tropical/Layers/TrRock003_albedo.dds"},
    {name: "Rock 5",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock005_albedo.png"), id: "/env/Tropical/Layers/TrRock005_albedo.dds"},
    {name: "Rock 6",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock006_albedo.png"), id: "/env/Tropical/Layers/TrRock006_albedo.dds"},
    {name: "Rock 7",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock007_albedo.png"), id: "/env/Tropical/Layers/TrRock007_albedo.dds"},
    {name: "Moss bush",     tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrBush_moss_albedo.png"), id: "/env/Tropical/Layers/TrBush_moss_albedo.dds"},
    {name: "Bushy 1",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrBushy001_albedo.png"), id: "/env/Tropical/Layers/TrBushy001_albedo.dds"},
    {name: "Grass 1",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Grass_albedo.png"), id: "/env/Tropical/Layers/Trop_Grass_albedo.dds"},
    {name: "Grass 2",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass002_albedo.png"), id: "/env/Tropical/Layers/TrGrass002_albedo.dds"},
    {name: "Grass 3",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass003_albedo.png"), id: "/env/Tropical/Layers/TrGrass003_albedo.dds"},
    {name: "Grass 4",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass004_albedo.png"), id: "/env/Tropical/Layers/TrGrass004_albedo.dds"},
    {name: "Grass 5",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass005_albedo.png"), id: "/env/Tropical/Layers/TrGrass005_albedo.dds"},
    {name: "Grass 6",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass006_albedo.png"), id: "/env/Tropical/Layers/TrGrass006_albedo.dds"},
    {name: "Grass 7",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrGrass007_albedo.png"), id: "/env/Tropical/Layers/TrGrass007_albedo.dds"},
    {name: "Grass jung",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_GrassJung_albedo.png"), id: "/env/Tropical/Layers/Trop_GrassJung_albedo.dds"},
    {name: "Dirt",          tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Dirt_albedo.png"), id: "/env/Tropical/Layers/Trop_Dirt_albedo.dds"},
    {name: "Rock 2",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRock002_albedo.png"), id: "/env/Tropical/Layers/TrRock002_albedo.dds"},
    {name: "Sand 1",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Sand01_albedo.png"), id: "/env/Tropical/Layers/Trop_Sand01_albedo.dds"},
    {name: "Sand 1b",       tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Sand.png"), id: "/env/Tropical/Layers/Trop_Sand.dds"},
    {name: "Sand 2",        tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/Trop_Sand_albedo.png"), id: "/env/Tropical/Layers/Trop_Sand_albedo.dds"},
    {name: "Raw ground",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrRawGround01_albedo.png"), id: "/env/Tropical/Layers/TrRawGround01_albedo.dds"},
    {name: "Transition 1",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans001_albedo.png"), id: "/env/Tropical/Layers/TrTrans001_albedo.dds"},
    {name: "Transition 2",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans002_albedo.png"), id: "/env/Tropical/Layers/TrTrans002_albedo.dds"},
    {name: "Transition 3",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans003_albedo.png"), id: "/env/Tropical/Layers/TrTrans003_albedo.dds"},
    {name: "Transition 4",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans004_albedo.png"), id: "/env/Tropical/Layers/TrTrans004_albedo.dds"},
    {name: "Transition 5",  tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/TrTrans005_albedo.png"), id: "/env/Tropical/Layers/TrTrans005_albedo.dds"},
    {name: "Wet sand 1",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/WetSand001_albedo.png"), id: "/env/Tropical/Layers/WetSand001_albedo.dds"},
    {name: "Wet sand 2",    tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/WetSand002_albedo.png"), id: "/env/Tropical/Layers/WetSand002_albedo.dds"},
    {name: "Wet sand 2b",   tileset: "Tropical", data_url: require("../../gamedata/env/Tropical/Layers/WetSand002b_albedo.png"), id: "/env/Tropical/Layers/WetSand002b_albedo.dds"},

    // Tundra tileset
    {name: "Dirt 1",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/_TundraDirt001_albedo.png"), id: "/env/Tundra/Layers/_TundraDirt001_albedo.dds"},
    {name: "Macro ice",    tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/MacroIce_albedo.png"), id: "/env/Tundra/Layers/MacroIce_albedo.dds"},
    {name: "Grass",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Grass_albedo.png"), id: "/env/Tundra/Layers/Tund_Grass_albedo.dds"},
    {name: "Gravil",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_gravil_albedo.png"), id: "/env/Tundra/Layers/Tund_gravil_albedo.dds"},
    {name: "Ice 1",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice001_albedo.png"), id: "/env/Tundra/Layers/Tund_Ice001_albedo.dds"},
    {name: "Ice 2",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice002_albedo.png"), id: "/env/Tundra/Layers/Tund_Ice002_albedo.dds"},
    {name: "Ice 3",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice003_albedo.png"), id: "/env/Tundra/Layers/Tund_Ice003_albedo.dds"},
    {name: "Ice 3b",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice003b_albedo.png"), id: "/env/Tundra/Layers/Tund_Ice003b_albedo.dds"},
    {name: "Ice 4",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Ice004_albedo.png"), id: "/env/Tundra/Layers/Tund_Ice004_albedo.dds"},
    {name: "Ice 4a",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_ice004a_albedo.png"), id: "/env/Tundra/Layers/Tund_ice004a_albedo.dds"},
    {name: "Ice 5",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_ice005_albedo.png"), id: "/env/Tundra/Layers/Tund_ice005_albedo.dds"},
    {name: "Ice 6",        tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_ice006_albedo.png"), id: "/env/Tundra/Layers/Tund_ice006_albedo.dds"},
    {name: "Ice rock",     tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_iceRock_albedo.png"), id: "/env/Tundra/Layers/Tund_iceRock_albedo.dds"},
    {name: "Melt 1",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_melt001_albedo.png"), id: "/env/Tundra/Layers/Tund_melt001_albedo.dds"},
    {name: "Melt 2",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_melt002_albedo.png"), id: "/env/Tundra/Layers/Tund_melt002_albedo.dds"},
    {name: "Melt 3",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_melt003_albedo.png"), id: "/env/Tundra/Layers/Tund_melt003_albedo.dds"},
    {name: "Rock",         tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Rock_albedo.png"), id: "/env/Tundra/Layers/Tund_Rock_albedo.dds"},
    {name: "Rock 2",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Rock02_albedo.png"), id: "/env/Tundra/Layers/Tund_Rock02_albedo.dds"},
    {name: "Rock 3",       tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Rock03_albedo.png"), id: "/env/Tundra/Layers/Tund_Rock03_albedo.dds"},
    {name: "Light sand",   tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_sandLight2_albedo.png"), id: "/env/Tundra/Layers/Tund_sandLight2_albedo.dds"},
    {name: "Snow",         tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/Tund_Snow_albedo.png"), id: "/env/Tundra/Layers/Tund_Snow_albedo.dds"},
    {name: "Transition 4", tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/TundraTrans004_albedo.png"), id: "/env/Tundra/Layers/TundraTrans004_albedo.dds"},
    {name: "Transition b", tileset: "Tundra", data_url: require("../../gamedata/env/Tundra/Layers/TundraTrans004b_albedo.png"), id: "/env/Tundra/Layers/TundraTrans004b_albedo.dds"},

    // Utility tileset
    {name: "Farms 1", tileset: "Utility", data_url: require("../../gamedata/env/Utility/Layers/farms001_albedo.png"), id: "/env/Utility/Layers/farms001_albedo.dds"},
  ];

  // Note the URLs are not actually downloaded, and images are only specified
  // thus so that the name normalisation can be reused.
  service.normal_textures = [
    // Special unused texture slot.
    // The value is set manually to blank and will not be overriden
    {name: "Unused",      tileset: "Unused", id: ""},

    // Desert tileset
    {name: "Gravel",      tileset: "Desert", id: "/env/Desert/Layers/Des_Gravel_normal.dds"},
    {name: "None",        tileset: "Desert", id: "/env/Desert/Layers/Des_None_Normal.dds"},
    {name: "Rock",        tileset: "Desert", id: "/env/Desert/Layers/Des_Rock_normal.dds"},
    {name: "Rock 1",      tileset: "Desert", id: "/env/Desert/Layers/Des_Rock01_normal.dds"},
    {name: "Rock 2",      tileset: "Desert", id: "/env/Desert/Layers/Des_Rock02_normal.dds"},
    {name: "Rock 3a",     tileset: "Desert", id: "/env/Desert/Layers/Des_Rock03a_normal.dds"},
    {name: "Dark sand",   tileset: "Desert", id: "/env/Desert/Layers/Des_SandDark_normal.dds"},
    {name: "Light sand",  tileset: "Desert", id: "/env/Desert/Layers/Des_sandLight_normal.dds"},
    {name: "Medium sand", tileset: "Desert", id: "/env/Desert/Layers/Des_SandMed_normal.dds"},
    {name: "Wet sand",    tileset: "Desert", id: "/env/Desert/Layers/Des_Sandwet_normal.dds"},

    // Evergreen tileset
    {name: "Dirt 1",       tileset: "Evergreen", id: "/env/Evergreen/layers/Dirt001_normals.dds"},
    {name: "Grass 0",      tileset: "Evergreen", id: "/env/Evergreen/layers/grass000_normals.dds"},
    {name: "Grass 1",      tileset: "Evergreen", id: "/env/Evergreen/layers/grass001_normals.dds"},
    {name: "Light rock",   tileset: "Evergreen", id: "/env/Evergreen/layers/RockLight_normals.dds"},
    {name: "Medium rock",  tileset: "Evergreen", id: "/env/Evergreen/layers/RockMed_normals.dds"},
    {name: "Light sand",   tileset: "Evergreen", id: "/env/Evergreen/layers/SandLight_normals.dds"},
    {name: "Light sand 2", tileset: "Evergreen", id: "/env/Evergreen/layers/SandLight002_normals.dds"},
    {name: "Sand rock",    tileset: "Evergreen", id: "/env/Evergreen/layers/SandRock_normals.dds"},
    {name: "Sand wet",     tileset: "Evergreen", id: "/env/Evergreen/layers/Sandwet_normals.dds"},
    {name: "Snow",         tileset: "Evergreen", id: "/env/Evergreen/layers/snow001_normals.dds"},

    // Evergreen 2 tileset
    {name: "Transition 1", tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EvTrans01_normals.dds"},
    {name: "Transition 2", tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EvTrans02_normals.dds"},
    {name: "Rock 3",       tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Rock003_normal.dds"},
    {name: "Rock 4",       tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Rock004_normal.dds"},
    {name: "Rock 6",       tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EvRock006_normal.dds"},
    {name: "Rock 7",       tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EvRock007_normal.dds"},
    {name: "Snow",         tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Snow_normal.dds"},
    {name: "Normal",       tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Rock_normal.dds"},
    {name: "Gravel 2",     tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/Eg_Gravel2_normal.dds"},
    {name: "None",         tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_None_Normal.dds"},
    {name: "Gravel",       tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Gravel_normal.dds"},
    {name: "Grass 1",      tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Grass001_normal.dds"},
    {name: "Grass 2",      tileset: "Evergreen 2", id: "/env/Evergreen2/Layers/EG_Grass002_normal.dds"},

    // Common tileset
    {name: "None",         tileset: "Common",      id: "/env/Common/layers/None_normal.dds"},

    // Crystalline tileset
    {name: "Crystalline 2-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_02_01_normal.dds"},
    {name: "Crystalline 1-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_01_01_normal.dds"},
    {name: "Crystalline 3-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_03_01_normal.dds"},
    {name: "Crystalline 4-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_04_01_normal.dds"},
    {name: "Crystalline 5-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_05_01_normal.dds"},
    {name: "Crystalline 6-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_06_01_normal.dds"},
    {name: "Crystalline 7-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_07_01_normal.dds"},
    {name: "Crystalline 7-1b",       tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_07_01b_normal.dds"},
    {name: "Crystalline 8-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_08_01_normal.dds"},
    {name: "Crystalline 9-1",        tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_09_01_normal.dds"},
    {name: "Crystalline rock 2b",    tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_Rock002b_normal.dds"},
    {name: "Crystalline light sand", tileset: "Crystalline", id: "/env/Crystalline/layers/Cr_sandLight_normal.dds"},
    {name: "Crystalline rock 1",     tileset: "Crystalline", id: "/env/Crystalline/layers/Cryst_Rock01_normal.dds"},
    {name: "Crystalwerk 2",          tileset: "Crystalline", id: "/env/Crystalline/layers/crystalWerk02_normal.dds"},
    {name: "Crystalwerk 2b",         tileset: "Crystalline", id: "/env/Crystalline/layers/crystalWerk02b_normal.dds"},
    {name: "Crystalwerk 4",          tileset: "Crystalline", id: "/env/Crystalline/layers/crystalWerk04_normals.dds"},
    {name: "Crystalwerk 5",          tileset: "Crystalline", id: "/env/Crystalline/layers/crystalWerk05_normal.dds"},
    {name: "Crystalwerk 6",          tileset: "Crystalline", id: "/env/Crystalline/layers/CrystalWerk06_normal.dds"},
    {name: "Crystalwerk 7",          tileset: "Crystalline", id: "/env/Crystalline/layers/crystalWerk07_normal.dds"},

    // Geothermal tileset
    {name: "Dark lava 1", tileset: "Geothermal", id: "/env/Geothermal/layers/Geo_LavaDk_01_normals.dds"},
    {name: "Nun",         tileset: "Geothermal", id: "/env/Geothermal/layers/Nun_normal.dds"},

    // Lava tileset
    {name: "Cracked 2",  tileset: "Lava", id: "/env/Lava/Layers/Lav_Cracked02_normals.dds"},
    {name: "Gravel",     tileset: "Lava", id: "/env/Lava/Layers/LAV_Gravel_normals.dds"},
    {name: "Ribbon",     tileset: "Lava", id: "/env/Lava/Layers/Lav_Ribbon_normals.dds"},
    {name: "Rock 1",     tileset: "Lava", id: "/env/Lava/Layers/Lav_Rock01_normals.dds"},
    {name: "Rock 4",     tileset: "Lava", id: "/env/Lava/Layers/LAV_Rock04_normals.dds"},
    {name: "Tech wiers", tileset: "Lava", id: "/env/Lava/Layers/LAV_TECH_WIERS_normal.dds"},
    {name: "Rock 9",     tileset: "Lava", id: "/env/Lava/Layers/LAV_Rock09_nornals.dds"}, // NORNALS :p
    {name: "Rock 10",    tileset: "Lava", id: "/env/Lava/Layers/LAV_Rock10_nornals.dds"},

    // Paradise tileset
    {name: "Dirt 0",      tileset: "Paradise", id: "/env/paradise/layers/dirt000_normals.dds"},
    {name: "Grass 0",     tileset: "Paradise", id: "/env/paradise/layers/grass000_normals.dds"},
    {name: "Grass 1",     tileset: "Paradise", id: "/env/paradise/layers/grass001_normals.dds"},
    {name: "Ice 1",       tileset: "Paradise", id: "/env/paradise/layers/Ice001_normals.dds"},
    {name: "Ice 2",       tileset: "Paradise", id: "/env/paradise/layers/Ice002_normals.dds"},
    {name: "Rock 1",      tileset: "Paradise", id: "/env/paradise/layers/Rock001_normals.dds"},
    {name: "Sand 0",      tileset: "Paradise", id: "/env/paradise/layers/sand000_normals.dds"},
    {name: "Medium sand", tileset: "Paradise", id: "/env/paradise/layers/SandMed_normals.dds"},
    {name: "Snow 1",      tileset: "Paradise", id: "/env/paradise/layers/snow001_normals.dds"},

    // Red Barrens tileset
    {name: "Cracked",   tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Cracked_normal.dds"},
    {name: "Cracked 2", tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Cracked02_normal.dds"},
    {name: "None",      tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_None_Normal.dds"},
    {name: "Red mud",   tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_RedMud_normal.dds"},
    {name: "Rock",      tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Rock_normal.dds"},
    {name: "Rock 6",    tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Rock06_normal.dds"},
    {name: "Rock 9",    tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Rock09_normal.dds"},
    {name: "Sand",      tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Sand_normal.dds"},
    {name: "Wet sand",  tileset: "Red Barrens", id: "/env/Red Barrens/Layers/RB_Sandwet_normal.dds"},

    // Swamp tileset
    {name: "Nun",        tileset: "Swamp", id: "/env/Swamp/layers/Nun_normal.dds"},
    {name: "Grass 3",    tileset: "Swamp", id: "/env/Swamp/layers/Sw_Grass_03_normals.dds"},
    {name: "Mudder 3",   tileset: "Swamp", id: "/env/Swamp/layers/Sw_Mudder_03_normals.dds"},
    {name: "Rocky 1",    tileset: "Swamp", id: "/env/Swamp/layers/Sw_Rocky_01_normals.dds"},
    {name: "Sphagnum 2", tileset: "Swamp", id: "/env/Swamp/layers/Sw_Sphagnum_02_normals.dds"},

    // Tropical tileset
    {name: "Dry sand 1",   tileset: "Tropical", id: "/env/Tropical/Layers/DrySand001_normals.dds"},
    {name: "Grass hills",  tileset: "Tropical", id: "/env/Tropical/Layers/Tr_GrassHills_normal.dds"},
    {name: "Coral reef",   tileset: "Tropical", id: "/env/Tropical/Layers/Tr_Reef_Coral_normal.dds"},
    {name: "Mossy bush",   tileset: "Tropical", id: "/env/Tropical/Layers/TrBush_moss_Normal.dds"},
    {name: "Grass jung",   tileset: "Tropical", id: "/env/Tropical/Layers/Trop_GrassJung_normal.dds"},
    {name: "None",         tileset: "Tropical", id: "/env/Tropical/Layers/Trop_None_Normal.dds"},
    {name: "Rock",         tileset: "Tropical", id: "/env/Tropical/Layers/Trop_Rock_Normal.dds"},
    {name: "Sand",         tileset: "Tropical", id: "/env/Tropical/Layers/Trop_Sand_normal.dds"},
    {name: "Rock 6",       tileset: "Tropical", id: "/env/Tropical/Layers/TrRock006_normal.dds"},
    {name: "Transition 2", tileset: "Tropical", id: "/env/Tropical/Layers/TrTrans002_Normal.dds"},

    // Tundra tileset
    {name: "Ice 3",        tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Ice003_normal.dds"},
    {name: "None",         tileset: "Tundra", id: "/env/Tundra/Layers/Tund_None_Normal.dds"},
    {name: "Rock",         tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Rock_normal.dds"},
    {name: "Rock 2",       tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Rock02_normal.dds"},
    {name: "Dark sand",    tileset: "Tundra", id: "/env/Tundra/Layers/Tund_SandDark_normal.dds"},
    {name: "Light sand",   tileset: "Tundra", id: "/env/Tundra/Layers/Tund_sandLight_normal.dds"},
    {name: "Light sand 2", tileset: "Tundra", id: "/env/Tundra/Layers/Tund_sandLight2_normal.dds"},
    {name: "Medium sand",  tileset: "Tundra", id: "/env/Tundra/Layers/Tund_SandMed_normal.dds"},
    {name: "Wet sand",     tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Sandwet_normal.dds"},
    {name: "Snow",         tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Snow_normal.dds"},
    {name: "Snow 2",       tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Snow02_normal.dds"},
    {name: "Snow 3",       tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Snow03_normal.dds"},
    {name: "Snow 4",       tileset: "Tundra", id: "/env/Tundra/Layers/Tund_Snow04_normal.dds"},
    {name: "Transition 4", tileset: "Tundra", id: "/env/Tundra/Layers/TundraTrans004_normal.dds"},

    // Utility tileset
    {name: "Farms 1", tileset: "Utility", id: "/env/Utility/Layers/farms001_normals.dds"},
  ];


  service.markers = [
    {name: "Mass",    data_url: require("../../gamedata/editor_icons/Mass_icon.png"), id: "/editor_icons/Mass_icon.dds"},
    {name: "Energy",  data_url: require("../../gamedata/editor_icons/Energy_icon.png"), id: "/editor_icons/Energy_icon.dds"},
    {name: "Unknown", data_url: require("../../gamedata/editor_icons/Unknown_icon.png"), id: "/editor_icons/Unknown_icon.dds"},
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


  /**
   * Build webgl textures from a set of textures
   */
  const build_webgl_textures = function(texture_set, gl) {

    return Promise.all(texture_set.map(texture => new Promise((resolve, reject) => {
      texture.image = new Image();
      texture.image.onload  = () => resolve();
      texture.image.onerror = () => reject(`Failed to load '${texture.id}'`);
      texture.image.src = texture.data_url;
    })))
    .then(() => {
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
    });
  };


  // Start loading.
  // This is called by editor_view, which only starts rendering on success
  service.load_resources = _.once(function(gl) {
    return Promise.resolve()
      .then(() => build_webgl_textures(service.albedo_textures, gl))
      .then(() => build_webgl_textures(service.markers, gl));
  });

  return service;
}]);
