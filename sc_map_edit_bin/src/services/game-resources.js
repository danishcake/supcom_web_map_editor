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
 * These are loaded asynchronously, so various parts of the UI must be blocked until this has
 * finished loading
 *
 * The data is downloaded from URLs that exactly match the name of the texture in the game data libary.
 * The value property is what is actually serialised, and is calculated from the URL by ensuring lowercase
 * and changing a .png extension to .dds
 */
angular.module('sc_map_edit_bin.services').factory('game_resources', ["$timeout", function($timeout) {
  let service = {};

  service.loaded = false;
  service.callbacks = {
    on_loaded: []
  };

  // Are there other shaders? I don;t think so! I guess you could set LowFidelityTerrain? The cartographic Terrain_Stage0/1?
  service.shaders = [{
    name: "Default",
    value: "TTerrain",
    url: ""
  }];

  service.backgrounds = [
    {name: "Default",    url: "/textures/environment/DefaultBackground.png"},
    {name: "Black",      url: "/textures/environment/blackbackground.png"},
    {name: "Thiban",     url: "/textures/environment/Thiban_bmp.png"},
    {name: "Rigel",      url: "/textures/environment/Rigel_bmp.png"},
    {name: "Zeta Canis", url: "/textures/environment/Zeta Canis_bmp.png"},
    {name: "Pollux",     url: "/textures/environment/Pollux_bmp.png"},
    {name: "Pixces IV",  url: "/textures/environment/Pisces IV_bmp.png"},
    {name: "Orionis",    url: "/textures/environment/Orionis_bmp.png"},
    {name: "Minerva",    url: "/textures/environment/Minerva_bmp.png"},
    {name: "Matar",      url: "/textures/environment/Matar_bmp.png"},
    {name: "Luthien",    url: "/textures/environment/Luthien_bmp.png"},
    {name: "Eridani",    url: "/textures/environment/Eridani_bmp.png"},
    {name: "Procyon",    url: "/textures/environment/Procyon_bmp.png"},
    {name: "Earth",      url: "/textures/environment/Earth_bmp.png"},
    {name: "Capella",    url: "/textures/environment/Capella_bmp.png"}
  ];

  service.sky_cubemaps = [
    {name: "Default",       url: "/textures/environment/DefaultSkyCube.png"},
    {name: "Blue",          url: "/textures/environment/SkyCube_blue.png"},
    {name: "Desert 1",      url: "/textures/environment/SkyCube_Desert01.png"},
    {name: "Desert 1a",     url: "/textures/environment/SkyCube_Desert01a.png"},
    {name: "Desert 2",      url: "/textures/environment/SkyCube_Desert02.png"},
    {name: "Desert 2a",     url: "/textures/environment/SkyCube_Desert02a.png"},
    {name: "Desert 3a",     url: "/textures/environment/SkyCube_Desert03a.png"},
    {name: "Evergreen 1",   url: "/textures/environment/SkyCube_Evergreen01.png"},
    {name: "Evergreen 1a",  url: "/textures/environment/SkyCube_Evergreen01a.png"},
    {name: "Evergreen 2",   url: "/textures/environment/SkyCube_Evergreen02.png"},
    {name: "Evergreen 3",   url: "/textures/environment/SkyCube_Evergreen03.png"},
    {name: "Evergreen 3a",  url: "/textures/environment/SkyCube_Evergreen03a.png"},
    {name: "Evergreen 4a",  url: "/textures/environment/SkyCube_Evergreen05a.png"},
    {name: "Stormy",        url: "/textures/environment/SkyCube_EvStormy.png"},
    {name: "Geothermal 1",  url: "/textures/environment/SkyCube_Geothermal01.png"},
    {name: "Geothermal 2",  url: "/textures/environment/SkyCube_Geothermal02.png"},
    {name: "Geothermal 2a", url: "/textures/environment/SkyCube_Geothermal02a.png"},
    {name: "Lava 1",        url: "/textures/environment/SkyCube_Lava01.png"},
    {name: "Lava 1a",       url: "/textures/environment/SkyCube_Lava01a.png"},
    {name: "Leipzig demo",  url: "/textures/environment/SkyCube_Leipzig_Demo.png"},
    {name: "Redrocks 3",    url: "/textures/environment/SkyCube_RedRock03.png"},
    {name: "Redrocks 1",    url: "/textures/environment/SkyCube_RedRocks01.png"},
    {name: "Redrocks 2",    url: "/textures/environment/SkyCube_RedRocks02.png"},
    {name: "Redrocks 2a",   url: "/textures/environment/SkyCube_RedRocks02a.png"},
    {name: "Redrocks 3",    url: "/textures/environment/SkyCube_RedRocks03.png"},
    {name: "Redrocks 4",    url: "/textures/environment/SkyCube_RedRocks04.png"},
    {name: "Redrocks 5",    url: "/textures/environment/SkyCube_RedRocks05.png"},
    {name: "Redrocks 5a",   url: "/textures/environment/SkyCube_RedRocks05a.png"},
    {name: "Redrocks 6",    url: "/textures/environment/SkyCube_RedRocks06.png"},
    {name: "Redrocks 8a",   url: "/textures/environment/SkyCube_RedRocks08a.png"},
    {name: "Redrocks 9a",   url: "/textures/environment/SkyCube_RedRocks09a.png"},
    {name: "Redrocks 10",   url: "/textures/environment/SkyCube_RedRocks10.png"},
    {name: "Scx1 1",        url: "/textures/environment/SkyCube_Scx1Proto01.png"},
    {name: "Scx1 2",         url: "/textures/environment/SkyCube_Scx1Proto02.png"},
    {name: "Tropical 1",    url: "/textures/environment/SkyCube_Tropical01.png"},
    {name: "Tropical 1a",   url: "/textures/environment/SkyCube_Tropical01a.png"},
    {name: "Tropical 4",    url: "/textures/environment/SkyCube_Tropical04.png"},
    {name: "Tropical 6",    url: "/textures/environment/SkyCube_TropicalOp06.png"},
    {name: "Tropical 6a",   url: "/textures/environment/SkyCube_TropicalOp06a.png"},
    {name: "Tundra 1",      url: "/textures/environment/SkyCube_Tundra01.png"},
    {name: "Tundra 2",      url: "/textures/environment/SkyCube_Tundra02.png"},
    {name: "Tundra 2a",     url: "/textures/environment/SkyCube_Tundra02a.png"},
    {name: "Tundra 3",      url: "/textures/environment/SkyCube_Tundra03.png"},
    {name: "Tundra 3a",     url: "/textures/environment/SkyCube_Tundra03a.png"},
    {name: "Tundra 4a",     url: "/textures/environment/SkyCube_Tundra04a.png"}
  ];

  service.environment_cubemaps = [
    {name: "Default",                 url: "/textures/environment/DefaultEnvCube.png"},
    {name: "Aeon alien crystal",      url: "/textures/environment/EnvCube_aeon_aliencrystal.png"},
    {name: "Aeon desert",             url: "/textures/environment/EnvCube_aeon_desert.png"},
    {name: "Aeon evergreen",          url: "/textures/environment/EnvCube_aeon_Evergreen.png"},
    {name: "Aeon geothermal",         url: "/textures/environment/EnvCube_aeon_geothermal.png"},
    {name: "Aeon lava",               url: "/textures/environment/EnvCube_aeon_lava.png"},
    {name: "Aeon redrocks",           url: "/textures/environment/EnvCube_aeon_RedRocks.png"},
    {name: "Aeon tropical",           url: "/textures/environment/EnvCube_aeon_tropical.png"},
    {name: "Aeon tundra",             url: "/textures/environment/EnvCube_aeon_tundra.png"},
    {name: "Desert 1",                url: "/textures/environment/EnvCube_Desert01a.png"},
    {name: "Desert 2",                url: "/textures/environment/EnvCube_Desert02a.png"},
    {name: "Desert 3",                url: "/textures/environment/EnvCube_Desert03a.png"},
    {name: "Evergreen 1",             url: "/textures/environment/EnvCube_Evergreen01a.png"},
    {name: "Evergreen 2",             url: "/textures/environment/EnvCube_Evergreen03a.png"},
    {name: "Evergreen 3",             url: "/textures/environment/EnvCube_Evergreen05a.png"},
    {name: "Geothermal",              url: "/textures/environment/EnvCube_Geothermal02a.png"},
    {name: "Lava",                    url: "/textures/environment/EnvCube_Lava01a.png"},
    {name: "Redrocks 5",              url: "/textures/environment/EnvCube_RedRocks05a.png"},
    {name: "Redrocks 6",              url: "/textures/environment/EnvCube_RedRocks06.png"},
    {name: "Redrocks 8",              url: "/textures/environment/EnvCube_RedRocks08a.png"},
    {name: "Redrocks 9",              url: "/textures/environment/EnvCube_RedRocks09a.png"},
    {name: "Redrocks 10",             url: "/textures/environment/EnvCube_RedRocks10.png"},
    {name: "Scx1",                    url: "/textures/environment/EnvCube_Scx1Proto02.png"}, // TODO: Better name!
    {name: "Seraphim alient crystal", url: "/textures/environment/EnvCube_seraphim_aliencrystal.png"},
    {name: "Seraphim desert",         url: "/textures/environment/EnvCube_seraphim_desert.png"},
    {name: "Seraphim evergreen",      url: "/textures/environment/EnvCube_seraphim_Evergreen.png"},
    {name: "Seraphim geothermal",     url: "/textures/environment/EnvCube_seraphim_geothermal.png"},
    {name: "Seraphim lava",           url: "/textures/environment/EnvCube_seraphim_lava.png"},
    {name: "Seraphim redrocks",       url: "/textures/environment/EnvCube_seraphim_redrocks.png"},
    {name: "Seraphim tropical",       url: "/textures/environment/EnvCube_seraphim_tropical.png"},
    {name: "Seraphim tundra",         url: "/textures/environment/EnvCube_seraphim_tundra.png"},
    {name: "Tropical 1",              url: "/textures/environment/EnvCube_Tropical01a.png"},
    {name: "Tropical 6",              url: "/textures/environment/EnvCube_TropicalOp06a.png"},
    {name: "Tundra 2",                url: "/textures/environment/EnvCube_Tundra02a.png"},
    {name: "Tundra 3",                url: "/textures/environment/EnvCube_Tundra03a.png"},
    {name: "Tundra 4",                url: "/textures/environment/EnvCube_Tundra04a.png"}
  ];

  service.albedo_textures = [
    // Special unused texture slot.
    // The value is set manually to blank and will not be overriden
    {name: "Unused",        tileset: "Unused", url: "/editor_icons/Unused_texture.png", value: ""},

    // Desert tileset
    {name: "Gravel",        tileset: "Desert", url: "/env/Desert/Layers/Des_Gravel_albedo.png"},
    {name: "Gravel 1",      tileset: "Desert", url: "/env/Desert/Layers/Des_Gravel01_albedo.png"},
    {name: "Rock",          tileset: "Desert", url: "/env/Desert/Layers/Des_Rock_albedo.png"},
    {name: "Rock 1",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock01_albedo.png"},
    {name: "Rock 2",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock02_albedo.png"},
    {name: "Rock 3",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock03_albedo.png"},
    {name: "Rock 4",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock04_albedo.png"},
    {name: "Rock 5",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock05_albedo.png"},
    {name: "Rock 6",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock06_albedo.png"},
    {name: "Dark sand",     tileset: "Desert", url: "/env/Desert/Layers/Des_SandDark_albedo.png"},
    {name: "Dark sand 2",   tileset: "Desert", url: "/env/Desert/Layers/Des_SandDark02_albedo.png"},
    {name: "Light sand",    tileset: "Desert", url: "/env/Desert/Layers/Des_sandLight_albedo.png"},
    {name: "Medium sand",   tileset: "Desert", url: "/env/Desert/Layers/Des_SandMed_albedo.png"},
    {name: "Medium sand 1", tileset: "Desert", url: "/env/Desert/Layers/Des_SandMed01_albedo.png"},
    {name: "Medium sand 2", tileset: "Desert", url: "/env/Desert/Layers/Des_SandMed02_albedo.png"},
    {name: "Wet sand",      tileset: "Desert", url: "/env/Desert/Layers/Des_Sandwet_albedo.png"},

    // Evergreen tileset
    {name: "Dirt 1",         tileset: "Evergreen", url: "/env/Evergreen/layers/Dirt001_albedo.png"},
    {name: "Grass 0",        tileset: "Evergreen", url: "/env/Evergreen/layers/grass000_albedo.png"},
    {name: "Grass 1",        tileset: "Evergreen", url: "/env/Evergreen/layers/grass001_albedo.png"},
    {name: "Macrotexture 0", tileset: "Evergreen", url: "/env/Evergreen/layers/macrotexture000_albedo.png"},
    {name: "Macrotexture 1", tileset: "Evergreen", url: "/env/Evergreen/layers/macrotexture001_albedo.png"},
    {name: "Light rock",     tileset: "Evergreen", url: "/env/Evergreen/layers/RockLight_albedo.png"},
    {name: "Medium rock",    tileset: "Evergreen", url: "/env/Evergreen/layers/RockMed_albedo.png"},
    {name: "Light sand",     tileset: "Evergreen", url: "/env/Evergreen/layers/SandLight_albedo.png"},
    {name: "Light sand 2",   tileset: "Evergreen", url: "/env/Evergreen/layers/SandLight002_albedo.png"},
    {name: "Sand rock",      tileset: "Evergreen", url: "/env/Evergreen/layers/SandRock_albedo.png"},
    {name: "Sand wet",       tileset: "Evergreen", url: "/env/Evergreen/layers/Sandwet_albedo.png"},
    {name: "Snow",           tileset: "Evergreen", url: "/env/Evergreen/layers/snow001_albedo.png"},

    // Evergreen 2 tileset
    {name: "Dirt 1",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Dirt001_albedo.png"},
    {name: "Dirt 2",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Dirt002_albedo.png"},
    {name: "Dirt 3",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Dirt003_albedo.png"},
    {name: "Grass 1",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Grass001_albedo.png"},
    {name: "Grass 2",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Grass002_albedo.png"},
    {name: "Grass 2b",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Grass002b_albedo.png"},
    {name: "Grass 2c",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Grass002c_albedo.png"},
    {name: "Gravel",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Gravel_albedo.png"},
    {name: "Gravel 1",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Gravel01_albedo.png"},
    {name: "Gravel 2",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Gravel002_albedo.png"},
    {name: "Gravel 2b",    tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Gravel2_albedo.png"},
    {name: "Gravel 3",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Gravel003_albedo.png"},
    {name: "Gravel 4",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Gravel004_albedo.png"},
    {name: "Gravel 5",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Gravel005_albedo.png"},
    {name: "Rock",         tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Rock_albedo.png"},
    {name: "Snow",         tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Snow.png"},
    {name: "Snow 2",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Snow_albedo.png"},
    {name: "Coral reef",   tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EV_Reef_Coral_albedo.png"},
    {name: "Reef sand",    tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EV_Reef_sand_albedo.png"},
    {name: "Grass 3",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass003_albedo.png"},
    {name: "Grass 4",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass004_albedo.png"},
    {name: "Grass 5",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass005_albedo.png"},
    {name: "Grass 5a",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass005a_albedo.png"},
    {name: "Grass 6",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass006_albedo.png"},
    {name: "Grass 7",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass007_albedo.png"},
    {name: "Grass 8",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass008_albedo.png"},
    {name: "Grass 9",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass009_albedo.png"},
    {name: "Grass 10",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass010_albedo.png"},
    {name: "Grass 10a",    tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvGrass010a_albedo.png"},
    {name: "Hostas 1",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvHostas001_albedo.png"},
    {name: "Rock 2",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock002_albedo.png"},
    {name: "Rock 2b",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock002b_albedo.png"},
    {name: "Rock 3",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock003_albedo.png"},
    {name: "Rock 4",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock004_albedo.png"},
    {name: "Rock 5",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock005_albedo.png"},
    {name: "Rock 6",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock006_albedo.png"},
    {name: "Rock 6b",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock006b_albedo.png"},
    {name: "Rock 6c",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock006c_albedo.png"},
    {name: "Rock 7",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock007_albedo.png"},
    {name: "Rock 7c",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock007c_albedo.png"},
    {name: "Rock 8",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock008_albedo.png"},
    {name: "Snow 3",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvSnow003_albedo.png"},
    {name: "Transition 1", tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvTrans01_albedo.png"},
    {name: "Transition 2", tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvTrans02_albedo.png"},
    {name: "Transition 3", tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvTrans03_albedo.png"},

    // Common tileset
    {name: "None",         tileset: "Common",      url: "/env/Common/layers/None_albedo.png"},
    {name: "Wet Rock 1",   tileset: "Common",      url: "/env/Common/layers/WetRock001_albedo.png"},
    {name: "Wet Rock 2",   tileset: "Common",      url: "/env/Common/layers/WetRock002_albedo.png"},

    // Crystalline tilset
    {name: "Crystalline 1-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_01_01_albedo.png"},
    {name: "Crystalline 2-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_02_01_albedo.png"},
    {name: "Crystalline 3-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_03_01_albedo.png"},
    {name: "Crystalline 4-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_04_01_albedo.png"},
    {name: "Crystalline 5-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_05_01_albedo.png"},
    {name: "Crystalline 6-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_06_01_albedo.png"},
    {name: "Crystalline 7-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_07_01_albedo.png"},
    {name: "Crystalline 7-1b copy", tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_07_01b_albedo copy.png"}, // Derp
    {name: "Crystalline 7-1b",      tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_07_01b_albedo.png"},
    {name: "Crystalline 8-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_08_01_albedo.png"},
    {name: "Crystalline 8-1",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_09_01_albedo.png"},
    {name: "Crystalline rock 1",    tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Rock001_albedo.png"},
    {name: "Crystalline rock 1b",   tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Rock001b_albedo.png"},
    {name: "Crystalline rock 2b",   tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Rock002b_albedo.png"},
    {name: "Crystalline rock 4",    tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Rock004_albedo.png"},
    {name: "Crystalline rock 5",    tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Rock05_albedo.png"},
    {name: "Crystalline wet sand",  tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Sandwet_albedo.png"},
    {name: "Crystalline rock 1c",   tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst_Rock01_albedo.png"},
    {name: "Crystalline 9",         tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst009_albedo.png"},
    {name: "Crystalline 10",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst010_albedo.png"},
    {name: "Crystalline 11",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst011_albedo.png"},
    {name: "Crystalline 12",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst012_albedo.png"},
    {name: "Crystalline 13",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst013_albedo.png"},
    {name: "Crystalwerk 1",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk01_albedo.png"},
    {name: "Crystalwerk 2",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk02_albedo.png"},
    {name: "Crystalwerk 2b",        tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk02b_albedo.png"},
    {name: "Crystalwerk 3",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk03_albedo.png"},
    {name: "Crystalwerk 4",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk04_albedo.png"},
    {name: "Crystalwerk 4b",        tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk04_b_albedo.png"},
    {name: "Crystalwerk 5",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk05_albedo.png"},
    {name: "Crystalwerk 6",         tileset: "Crystalline", url: "/env/Crystalline/layers/CrystalWerk06_albedo.png"},
    {name: "Crystalwerk 7",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk07_albedo.png"},

    // Geothermal tilset
    {name: "Ashley",        tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_Ashley_01_albedo.png"},
    {name: "Dirt 1",        tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_Dirt_01_albedo.png"},
    {name: "Dark lava 1",   tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_LavaDk_01_albedo.png"},
    {name: "Light lava 1",  tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_LavaLt_01_albedo.png"},
    {name: "Medium lava 1", tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_LavaMd_01_albedo.png"},
    {name: "Medium lava 2", tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_LavaMd_02_albedo.png"},
    {name: "Medium lava 3", tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_LavaMd_03_albedo.png"},
    {name: "Rock 1",        tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_Rock001_albedo.png"},
    {name: "Rock 2",        tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_Rock002_albedo.png"},

    // Lava tileset
    {name: "Cracked",         tileset: "Lava", url: "/env/Lava/Layers/LAV_Cracked_albedo.png"},
    {name: "Cracked 2",       tileset: "Lava", url: "/env/Lava/Layers/Lav_Cracked02_albedo.png"},
    {name: "Cracked 2b",      tileset: "Lava", url: "/env/Lava/Layers/Lav_Cracked02b_albedo.png"},
    {name: "Gravel",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Gravel_albedo.png"},
    {name: "Lava 1",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Lava01_albedo.png"},
    {name: "Lava 2",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Lava02_albedo.png"},
    {name: "Macrotexture 0",  tileset: "Lava", url: "/env/Lava/Layers/LAV_macrotexture000_albedo.png"},
    {name: "Macrotexture 0b", tileset: "Lava", url: "/env/Lava/Layers/LAV_macrotexture000b_albedo.png"},
    {name: "Ribbon",          tileset: "Lava", url: "/env/Lava/Layers/Lav_Ribbon_albedo.png"},
    {name: "Ribbon 1",        tileset: "Lava", url: "/env/Lava/Layers/LAV_Ribbon01_albedo.png"},
    {name: "Rock 1",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock01_albedo.png"},
    {name: "Rock 2",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock02_albedo.png"},
    {name: "Rock 2b",         tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock02b_albedo.png"},
    {name: "Rock 3",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock03_albedo.png"},
    {name: "Rock 3b",         tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock03b_albedo.png"},
    {name: "Rock 4",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock04_albedo.png"},
    {name: "Rock 5",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock05_albedo.png"},
    {name: "Rock 6",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock06_albedo.png"},
    {name: "Rock 7",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock07_albedo.png"},
    {name: "Rock 7b",         tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock07b_albedo.png"},
    {name: "Rock 8",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock08_albedo.png"},
    {name: "Rock 9",          tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock09_albedo.png"},
    {name: "Rock 9b",         tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock09b_albedo.png"},
    {name: "Rock 10",         tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock10_albedo.png"},
    {name: "Tech wiers",      tileset: "Lava", url: "/env/Lava/Layers/LAV_TECH_WIERS_albedo.png"},
    {name: "Macrotexture 0c", tileset: "Lava", url: "/env/Lava/Layers/macrotexture000_albedo.png"},
    {name: "Macrotexture 2",  tileset: "Lava", url: "/env/Lava/Layers/macrotexture002_albedo.png"},
    {name: "Macrotexture 2b", tileset: "Lava", url: "/env/Lava/Layers/macrotexture002b_albedo.png"},

    // Paradise tileset
    {name: "Dirt 0",         tileset: "Paradise", url: "/env/paradise/layers/dirt000_albedo.png"},
    {name: "Dirt 1",         tileset: "Paradise", url: "/env/paradise/layers/dirt001_albedo.png"},
    {name: "Grass 0",        tileset: "Paradise", url: "/env/paradise/layers/grass000_albedo.png"},
    {name: "Grass 1",        tileset: "Paradise", url: "/env/paradise/layers/grass001_albedo.png"},
    {name: "Grass 2",        tileset: "Paradise", url: "/env/paradise/layers/grass002_albedo.png"},
    {name: "Grass jung",     tileset: "Paradise", url: "/env/paradise/layers/GrassJung_albedo.png"},
    {name: "Ice 1",          tileset: "Paradise", url: "/env/paradise/layers/Ice001_albedo.png"},
    {name: "Ice 2",          tileset: "Paradise", url: "/env/paradise/layers/Ice002_albedo.png"},
    {name: "Lava rock",      tileset: "Paradise", url: "/env/paradise/layers/LavaRock_albedo.png"},
    {name: "Macrotexture 0", tileset: "Paradise", url: "/env/paradise/layers/macrotexture000_albedo.png"},
    {name: "Macrotexture 1", tileset: "Paradise", url: "/env/paradise/layers/macrotexture001_albedo.png"},
    {name: "Rock 1",         tileset: "Paradise", url: "/env/paradise/layers/Rock001_albedo.png"},
    {name: "Sand 0",         tileset: "Paradise", url: "/env/paradise/layers/sand000_albedo.png"},
    {name: "Sand 1",         tileset: "Paradise", url: "/env/paradise/layers/sand001_albedo.png"},
    {name: "Light sand",     tileset: "Paradise", url: "/env/paradise/layers/SandLight002.png"},
    {name: "Medium sand",    tileset: "Paradise", url: "/env/paradise/layers/SandMed_albedo.png"},
    {name: "Snow 1",         tileset: "Paradise", url: "/env/paradise/layers/snow001_albedo.png"},

    // Red Barrens tileset
    {name: "Macrotexture 1", tileset: "Red Barrens", url: "/env/Red Barrens/Layers/macrotexture001_albedo.png"},
    {name: "Cracked",        tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Cracked_albedo.png"},
    {name: "Cracked 2",      tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Cracked02_albedo.png"},
    {name: "Gravel 1",       tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_gravel01_albedo.png"},
    {name: "Red mud",        tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_RedMud_albedo.png"},
    {name: "Rock",           tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock_albedo.png"},
    {name: "Rock 2",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock02_albedo.png"},
    {name: "Rock 3",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock03_albedo.png"},
    {name: "Rock 4",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock04_albedo.png"},
    {name: "Rock 6",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock06_albedo.png"},
    {name: "Rock 7",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock07_albedo.png"},
    {name: "Rock 8",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock08_albedo.png"},
    {name: "Rock 9",         tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock09_albedo.png"},
    {name: "Sand",           tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Sand_albedo.png"},
    {name: "Wet sand",       tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Sandwet.png"},
    {name: "Wet sand 1",     tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Sandwet01_albedo.png"},
    {name: "Wet sand 2",     tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Sandwet_albedo.png"},

    // Swamp tileset
    {name: "Creepers",   tileset: "Swamp", url: "/env/Swamp/layers/Sw_Creeper_01_albedo.png"},
    {name: "Ferns 1",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Ferns_01_albedo.png"},
    {name: "Ferns 2",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Ferns_02_albedo.png"},
    {name: "Grass 1",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Grass_01_albedo.png"},
    {name: "Grass 2",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Grass_02_albedo.png"},
    {name: "Grass 3",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Grass_03_albedo.png"},
    {name: "Mossy",      tileset: "Swamp", url: "/env/Swamp/layers/Sw_Mossy_01_albedo.png"},
    {name: "Mudder 1",   tileset: "Swamp", url: "/env/Swamp/layers/Sw_Mudder_01_albedo.png"},
    {name: "Mudder 2",   tileset: "Swamp", url: "/env/Swamp/layers/Sw_Mudder_02_albedo.png"},
    {name: "Mudder 3",   tileset: "Swamp", url: "/env/Swamp/layers/Sw_Mudder_03_albedo.png"},
    {name: "Mudder 4",   tileset: "Swamp", url: "/env/Swamp/layers/Sw_Mudder_04_albedo.png"},
    {name: "Rocky 1",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Rocky_01_albedo.png"},
    {name: "Rocky 2",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Rocky_02_albedo.png"},
    {name: "Rocky 3",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Rocky_03_albedo.png"},
    {name: "Sphagnum 1", tileset: "Swamp", url: "/env/Swamp/layers/Sw_Sphagnum_01_albedo.png"},
    {name: "Sphagnum 2", tileset: "Swamp", url: "/env/Swamp/layers/Sw_Sphagnum_02_albedo.png"},
    {name: "Sphagnum 3", tileset: "Swamp", url: "/env/Swamp/layers/Sw_Sphagnum_03_albedo.png"},

    // Tropical tileset
    {name: "Dry sand 1",    tileset: "Tropical", url: "/env/Tropical/Layers/DrySand001_albedo.png"},
    {name: "Dry sand 2",    tileset: "Tropical", url: "/env/Tropical/Layers/DrySand002_albedo.png"},
    {name: "Coral",         tileset: "Tropical", url: "/env/Tropical/Layers/Tr_Coral_albedo.png"},
    {name: "Grass hills",   tileset: "Tropical", url: "/env/Tropical/Layers/Tr_GrassHills_albedo.png"},
    {name: "Ground 0",      tileset: "Tropical", url: "/env/Tropical/Layers/Tr_ground001_albedo.png"},
    {name: "Coral reef",    tileset: "Tropical", url: "/env/Tropical/Layers/Tr_Reef_Coral_albedo.png"},
    {name: "Coral reef 2",  tileset: "Tropical", url: "/env/Tropical/Layers/Tr_Reef_Coral2_albedo.png"},
    {name: "Rock wall 1",   tileset: "Tropical", url: "/env/Tropical/Layers/Tr_RockWall001.png"},
    {name: "Rock",          tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Rock_albedo.png"},
    {name: "Rock 2b",       tileset: "Tropical", url: "/env/Tropical/Layers/TrRock002b_albedo.png"},
    {name: "Rock 3",        tileset: "Tropical", url: "/env/Tropical/Layers/TrRock003_albedo.png"},
    {name: "Rock 5",        tileset: "Tropical", url: "/env/Tropical/Layers/TrRock005_albedo.png"},
    {name: "Rock 6",        tileset: "Tropical", url: "/env/Tropical/Layers/TrRock006_albedo.png"},
    {name: "Rock 7",        tileset: "Tropical", url: "/env/Tropical/Layers/TrRock007_albedo.png"},
    {name: "Moss bush",     tileset: "Tropical", url: "/env/Tropical/Layers/TrBush_moss_albedo.png"},
    {name: "Bushy 1",       tileset: "Tropical", url: "/env/Tropical/Layers/TrBushy001_albedo.png"},
    {name: "Grass 1",       tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Grass_albedo.png"},
    {name: "Grass 2",       tileset: "Tropical", url: "/env/Tropical/Layers/TrGrass002_albedo.png"},
    {name: "Grass 3",       tileset: "Tropical", url: "/env/Tropical/Layers/TrGrass003_albedo.png"},
    {name: "Grass 4",       tileset: "Tropical", url: "/env/Tropical/Layers/TrGrass004_albedo.png"},
    {name: "Grass 5",       tileset: "Tropical", url: "/env/Tropical/Layers/TrGrass005_albedo.png"},
    {name: "Grass 6",       tileset: "Tropical", url: "/env/Tropical/Layers/TrGrass006_albedo.png"},
    {name: "Grass 7",       tileset: "Tropical", url: "/env/Tropical/Layers/TrGrass007_albedo.png"},
    {name: "Grass jung",    tileset: "Tropical", url: "/env/Tropical/Layers/Trop_GrassJung_albedo.png"},
    {name: "Dirt",          tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Dirt_albedo.png"},
    {name: "Rock 2",        tileset: "Tropical", url: "/env/Tropical/Layers/TrRock002_albedo.png"},
    {name: "Sand 1",        tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Sand01_albedo.png"},
    {name: "Sand 1b",       tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Sand.png"},
    {name: "Sand 2",        tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Sand_albedo.png"},
    {name: "Raw ground",    tileset: "Tropical", url: "/env/Tropical/Layers/TrRawGround01_albedo.png"},
    {name: "Transition 1",  tileset: "Tropical", url: "/env/Tropical/Layers/TrTrans001_albedo.png"},
    {name: "Transition 2",  tileset: "Tropical", url: "/env/Tropical/Layers/TrTrans002_albedo.png"},
    {name: "Transition 3",  tileset: "Tropical", url: "/env/Tropical/Layers/TrTrans003_albedo.png"},
    {name: "Transition 4",  tileset: "Tropical", url: "/env/Tropical/Layers/TrTrans004_albedo.png"},
    {name: "Transition 5",  tileset: "Tropical", url: "/env/Tropical/Layers/TrTrans005_albedo.png"},
    {name: "Wet sand 1",    tileset: "Tropical", url: "/env/Tropical/Layers/WetSand001_albedo.png"},
    {name: "Wet sand 2",    tileset: "Tropical", url: "/env/Tropical/Layers/WetSand002_albedo.png"},
    {name: "Wet sand 2b",   tileset: "Tropical", url: "/env/Tropical/Layers/WetSand002b_albedo.png"},

    // Tundra tileset
    {name: "Dirt 1",       tileset: "Tundra", url: "/env/Tundra/Layers/_TundraDirt001_albedo.png"},
    {name: "Macro ice",    tileset: "Tundra", url: "/env/Tundra/Layers/MacroIce_albedo.png"},
    {name: "Grass",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Grass_albedo.png"},
    {name: "Gravil",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_gravil_albedo.png"},
    {name: "Ice 1",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Ice001_albedo.png"},
    {name: "Ice 2",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Ice002_albedo.png"},
    {name: "Ice 3",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Ice003_albedo.png"},
    {name: "Ice 3b",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Ice003b_albedo.png"},
    {name: "Ice 4",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Ice004_albedo.png"},
    {name: "Ice 4a",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_ice004a_albedo.png"},
    {name: "Ice 5",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_ice005_albedo.png"},
    {name: "Ice 6",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_ice006_albedo.png"},
    {name: "Ice rock",     tileset: "Tundra", url: "/env/Tundra/Layers/Tund_iceRock_albedo.png"},
    {name: "Melt 1",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_melt001_albedo.png"},
    {name: "Melt 2",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_melt002_albedo.png"},
    {name: "Melt 3",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_melt003_albedo.png"},
    {name: "Rock",         tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Rock_albedo.png"},
    {name: "Rock 2",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Rock02_albedo.png"},
    {name: "Rock 3",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Rock03_albedo.png"},
    {name: "Light sand",   tileset: "Tundra", url: "/env/Tundra/Layers/Tund_sandLight2_albedo.png"},
    {name: "Snow",         tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Snow_albedo.png"},
    {name: "Transition 4", tileset: "Tundra", url: "/env/Tundra/Layers/TundraTrans004_albedo.png"},
    {name: "Transition b", tileset: "Tundra", url: "/env/Tundra/Layers/TundraTrans004b_albedo.png"},

    // Utility tileset
    {name: "Farms 1", tileset: "Utility", url: "/env/Utility/Layers/farms001_albedo.png"},
  ];

  // Note the URLs are not actually downloaded, and images are only specified
  // thus so that the name normalisation can be reused.
  service.normal_textures = [
    // Special unused texture slot.
    // The value is set manually to blank and will not be overriden
    {name: "Unused",      tileset: "Unused", url: "/editor_icons/Unused_texture.png", value: ""},

    // Desert tileset
    {name: "Gravel",      tileset: "Desert", url: "/env/Desert/Layers/Des_Gravel_normal.png"},
    {name: "None",        tileset: "Desert", url: "/env/Desert/Layers/Des_None_Normal.png"},
    {name: "Rock",        tileset: "Desert", url: "/env/Desert/Layers/Des_Rock_normal.png"},
    {name: "Rock 1",      tileset: "Desert", url: "/env/Desert/Layers/Des_Rock01_normal.png"},
    {name: "Rock 2",      tileset: "Desert", url: "/env/Desert/Layers/Des_Rock02_normal.png"},
    {name: "Rock 3a",     tileset: "Desert", url: "/env/Desert/Layers/Des_Rock03a_normal.png"},
    {name: "Dark sand",   tileset: "Desert", url: "/env/Desert/Layers/Des_SandDark_normal.png"},
    {name: "Light sand",  tileset: "Desert", url: "/env/Desert/Layers/Des_sandLight_normal.png"},
    {name: "Medium sand", tileset: "Desert", url: "/env/Desert/Layers/Des_SandMed_normal.png"},
    {name: "Wet sand",    tileset: "Desert", url: "/env/Desert/Layers/Des_Sandwet_normal.png"},

    // Evergreen tileset
    {name: "Dirt 1",       tileset: "Evergreen", url: "/env/Evergreen/layers/Dirt001_normals.png"},
    {name: "Grass 0",      tileset: "Evergreen", url: "/env/Evergreen/layers/grass000_normals.png"},
    {name: "Grass 1",      tileset: "Evergreen", url: "/env/Evergreen/layers/grass001_normals.png"},
    {name: "Light rock",   tileset: "Evergreen", url: "/env/Evergreen/layers/RockLight_normals.png"},
    {name: "Medium rock",  tileset: "Evergreen", url: "/env/Evergreen/layers/RockMed_normals.png"},
    {name: "Light sand",   tileset: "Evergreen", url: "/env/Evergreen/layers/SandLight_normals.png"},
    {name: "Light sand 2", tileset: "Evergreen", url: "/env/Evergreen/layers/SandLight002_normals.png"},
    {name: "Sand rock",    tileset: "Evergreen", url: "/env/Evergreen/layers/SandRock_normals.png"},
    {name: "Sand wet",     tileset: "Evergreen", url: "/env/Evergreen/layers/Sandwet_normals.png"},
    {name: "Snow",         tileset: "Evergreen", url: "/env/Evergreen/layers/snow001_normals.png"},

    // Evergreen 2 tileset
    {name: "Transition 1", tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvTrans01_normals.png"},
    {name: "Transition 2", tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvTrans02_normals.png"},
    {name: "Rock 3",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Rock003_normal.png"},
    {name: "Rock 4",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Rock004_normal.png"},
    {name: "Rock 6",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock006_normal.png"},
    {name: "Rock 7",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EvRock007_normal.png"},
    {name: "Snow",         tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Snow_normal.png"},
    {name: "Normal",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Rock_normal.png"},
    {name: "Gravel 2",     tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/Eg_Gravel2_normal.png"},
    {name: "None",         tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_None_Normal.png"},
    {name: "Gravel",       tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Gravel_normal.png"},
    {name: "Grass 1",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Grass001_normal.png"},
    {name: "Grass 2",      tileset: "Evergreen 2", url: "/env/Evergreen2/Layers/EG_Grass002_normal.png"},

    // Common tileset
    {name: "None",         tileset: "Common",      url: "/env/Common/layers/None_normal.png"},

    // Crystalline tileset
    {name: "Crystalline 2-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_02_01_normal.png"},
    {name: "Crystalline 1-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_01_01_normal.png"},
    {name: "Crystalline 3-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_03_01_normal.png"},
    {name: "Crystalline 4-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_04_01_normal.png"},
    {name: "Crystalline 5-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_05_01_normal.png"},
    {name: "Crystalline 6-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_06_01_normal.png"},
    {name: "Crystalline 7-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_07_01_normal.png"},
    {name: "Crystalline 7-1b",       tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_07_01b_normal.png"},
    {name: "Crystalline 8-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_08_01_normal.png"},
    {name: "Crystalline 9-1",        tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_09_01_normal.png"},
    {name: "Crystalline rock 2b",    tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_Rock002b_normal.png"},
    {name: "Crystalline light sand", tileset: "Crystalline", url: "/env/Crystalline/layers/Cr_sandLight_normal.png"},
    {name: "Crystalline rock 1",     tileset: "Crystalline", url: "/env/Crystalline/layers/Cryst_Rock01_normal.png"},
    {name: "Crystalwerk 2",          tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk02_normal.png"},
    {name: "Crystalwerk 2b",         tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk02b_normal.png"},
    {name: "Crystalwerk 4",          tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk04_normals.png"},
    {name: "Crystalwerk 5",          tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk05_normal.png"},
    {name: "Crystalwerk 6",          tileset: "Crystalline", url: "/env/Crystalline/layers/CrystalWerk06_normal.png"},
    {name: "Crystalwerk 7",          tileset: "Crystalline", url: "/env/Crystalline/layers/crystalWerk07_normal.png"},

    // Geothermal tileset
    {name: "Dark lava 1", tileset: "Geothermal", url: "/env/Geothermal/layers/Geo_LavaDk_01_normals.png"},
    {name: "Nun",         tileset: "Geothermal", url: "/env/Geothermal/layers/Nun_normal.png"},

    // Lava tileset
    {name: "Cracked 2",  tileset: "Lava", url: "/env/Lava/Layers/Lav_Cracked02_normals.png"},
    {name: "Gravel",     tileset: "Lava", url: "/env/Lava/Layers/LAV_Gravel_normals.png"},
    {name: "Ribbon",     tileset: "Lava", url: "/env/Lava/Layers/Lav_Ribbon_normals.png"},
    {name: "Rock 1",     tileset: "Lava", url: "/env/Lava/Layers/Lav_Rock01_normals.png"},
    {name: "Rock 4",     tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock04_normals.png"},
    {name: "Tech wiers", tileset: "Lava", url: "/env/Lava/Layers/LAV_TECH_WIERS_normal.png"},
    {name: "Rock 9",     tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock09_nornals.png"}, // NORNALS :p
    {name: "Rock 10",    tileset: "Lava", url: "/env/Lava/Layers/LAV_Rock10_nornals.png"},

    // Paradise tileset
    {name: "Dirt 0",      tileset: "Paradise", url: "/env/paradise/layers/dirt000_normals.png"},
    {name: "Grass 0",     tileset: "Paradise", url: "/env/paradise/layers/grass000_normals.png"},
    {name: "Grass 1",     tileset: "Paradise", url: "/env/paradise/layers/grass001_normals.png"},
    {name: "Ice 1",       tileset: "Paradise", url: "/env/paradise/layers/Ice001_normals.png"},
    {name: "Ice 2",       tileset: "Paradise", url: "/env/paradise/layers/Ice002_normals.png"},
    {name: "Rock 1",      tileset: "Paradise", url: "/env/paradise/layers/Rock001_normals.png"},
    {name: "Sand 0",      tileset: "Paradise", url: "/env/paradise/layers/sand000_normals.png"},
    {name: "Medium sand", tileset: "Paradise", url: "/env/paradise/layers/SandMed_normals.png"},
    {name: "Snow 1",      tileset: "Paradise", url: "/env/paradise/layers/snow001_normals.png"},

    // Red Barrens tileset
    {name: "Cracked",   tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Cracked_normal.png"},
    {name: "Cracked 2", tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Cracked02_normal.png"},
    {name: "None",      tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_None_Normal.png"},
    {name: "Red mud",   tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_RedMud_normal.png"},
    {name: "Rock",      tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock_normal.png"},
    {name: "Rock 6",    tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock06_normal.png"},
    {name: "Rock 9",    tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Rock09_normal.png"},
    {name: "Sand",      tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Sand_normal.png"},
    {name: "Wet sand",  tileset: "Red Barrens", url: "/env/Red Barrens/Layers/RB_Sandwet_normal.png"},

    // Swamp tileset
    {name: "Nun",        tileset: "Swamp", url: "/env/Swamp/layers/Nun_normal.png"},
    {name: "Grass 3",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Grass_03_normals.png"},
    {name: "Mudder 3",   tileset: "Swamp", url: "/env/Swamp/layers/Sw_Mudder_03_normals.png"},
    {name: "Rocky 1",    tileset: "Swamp", url: "/env/Swamp/layers/Sw_Rocky_01_normals.png"},
    {name: "Sphagnum 2", tileset: "Swamp", url: "/env/Swamp/layers/Sw_Sphagnum_02_normals.png"},

    // Tropical tileset
    {name: "Dry sand 1",   tileset: "Tropical", url: "/env/Tropical/Layers/DrySand001_normals.png"},
    {name: "Grass hills",  tileset: "Tropical", url: "/env/Tropical/Layers/Tr_GrassHills_normal.png"},
    {name: "Coral reef",   tileset: "Tropical", url: "/env/Tropical/Layers/Tr_Reef_Coral_normal.png"},
    {name: "Mossy bush",   tileset: "Tropical", url: "/env/Tropical/Layers/TrBush_moss_Normal.png"},
    {name: "Grass jung",   tileset: "Tropical", url: "/env/Tropical/Layers/Trop_GrassJung_normal.png"},
    {name: "None",         tileset: "Tropical", url: "/env/Tropical/Layers/Trop_None_Normal.png"},
    {name: "Rock",         tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Rock_Normal.png"},
    {name: "Sand",         tileset: "Tropical", url: "/env/Tropical/Layers/Trop_Sand_normal.png"},
    {name: "Rock 6",       tileset: "Tropical", url: "/env/Tropical/Layers/TrRock006_normal.png"},
    {name: "Transition 2", tileset: "Tropical", url: "/env/Tropical/Layers/TrTrans002_Normal.png"},

    // Tundra tileset
    {name: "Ice 3",        tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Ice003_normal.png"},
    {name: "None",         tileset: "Tundra", url: "/env/Tundra/Layers/Tund_None_Normal.png"},
    {name: "Rock",         tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Rock_normal.png"},
    {name: "Rock 2",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Rock02_normal.png"},
    {name: "Dark sand",    tileset: "Tundra", url: "/env/Tundra/Layers/Tund_SandDark_normal.png"},
    {name: "Light sand",   tileset: "Tundra", url: "/env/Tundra/Layers/Tund_sandLight_normal.png"},
    {name: "Light sand 2", tileset: "Tundra", url: "/env/Tundra/Layers/Tund_sandLight2_normal.png"},
    {name: "Medium sand",  tileset: "Tundra", url: "/env/Tundra/Layers/Tund_SandMed_normal.png"},
    {name: "Wet sand",     tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Sandwet_normal.png"},
    {name: "Snow",         tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Snow_normal.png"},
    {name: "Snow 2",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Snow02_normal.png"},
    {name: "Snow 3",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Snow03_normal.png"},
    {name: "Snow 4",       tileset: "Tundra", url: "/env/Tundra/Layers/Tund_Snow04_normal.png"},
    {name: "Transition 4", tileset: "Tundra", url: "/env/Tundra/Layers/TundraTrans004_normal.png"},

    // Utiliy tileset
    {name: "Farms 1", tileset: "Utility", url: "/env/Utility/Layers/farms001_normals.png"},
  ];


  service.markers = [
    {name: "Mass",    url: "/editor_icons/Mass_icon.png"},
    {name: "Energy",  url: "/editor_icons/Energy_icon.png"},
    {name: "Unknown", url: "/editor_icons/Unknown_icon.png"},
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
  service.img_url_lookup = function(img_value) {
    const texture_sets = [
      service.backgrounds,
      service.sky_cubemaps,
      service.albedo_textures,
      service.markers
    ];

    let matching_texture = _.chain(texture_sets)
      .flatten()
      .findWhere({value: img_value})
      .value();

    if (matching_texture) {
      return matching_texture.img.src;
    } else {
      return "";
    }
  };


  /**
   * Retrieves the WebGL texture ID for a texture
   *
   * Currently only albedo textures are required.
   * @param {string} img_value The name of the texture as recorded in the map file
   * @return {WebGLTexture} The corresponding WebGL texture. If not available then the unused
   * texture is returned
   *
   * TODO: Case insensitive lookups
   */
  service.gl_texture_lookup = function(img_value) {
    const texture_sets = [
      service.albedo_textures,
    ];

    let matching_texture = _.chain(texture_sets)
      .flatten()
      .findWhere({value: img_value})
      .value();

    if (matching_texture) {
      return matching_texture.texture_id;
    } else {
      // This better work or I'll recurse to death
      if (img_value !== '') {
        console.log(`Texture lookup failed: '${img_value}'`);
      }
      return service.gl_texture_lookup('');
    }
  };


  /**
   * The texture URL matches the Supreme Commander gamedata structure,
   * but filenames in the serialised maps are lowercase.
   * This does not report progress as it should be more or less free
   */
  const normalise_texture_set = function(texture_set, done_cb) {
    for (let texture of texture_set) {
      if (!texture.hasOwnProperty("value")) {
        texture.value = texture.url.toLowerCase().replace(".png", ".dds");
      }
    }
    done_cb();
  };


  /**
   * Download a set of textures
   */
  const download_texture_set = function(texture_set, progress_cb, done_cb) {
    let loaded_image_count = 0;

    for (let texture of texture_set) {
      let img = new Image();
      img.onload = () => {
        loaded_image_count++;
        if (loaded_image_count === texture_set.length) {
          // Report completion
          done_cb(null);
        } else {
          // Report progress
          progress_cb(`Downloaded ${texture.value}`);
        }
      };
      // TODO: Load errors
      img.src = `gamedata${texture.url}`;
      texture.img = img;
    }
  };


  /**
   * Build webgl textures from a set of textures
   */
  const build_webgl_textures = function(texture_set, gl, progress_cb, done_cb) {
    const build_webgl_texture = function(index) {
      const texture = texture_set[index];
      // Create an OpenGL texture
      texture.texture_id = gl.createTexture();

      // Setup texture parameters
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

      if ((texture.img.width & (texture.img.width - 1)) == 0) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.GL_NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.GL_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // NPOT texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      gl.bindTexture(gl.TEXTURE_2D, null);

      index++;
      if (index === texture_set.length) {
        // Report completion
        done_cb();
      } else {
        // Report progress & trigger next
        progress_cb(`Loaded ${texture.value}`);
        $timeout(() => build_webgl_texture(index));
      }
    };

    // Kick off first. Each one uses $timeout to trigger the next
    build_webgl_texture(0);
  };


  // Start loading
  service.load_resources = _.once(function(gl, progress_callback, completion_callback) {
    service.on_loaded(completion_callback);

    /**
     * Allow a frame or so for progress to be updated in the UI via broadcast.
     * Without this the progress broadcasts aren't handled before loading finished (locally)
     */
    const intra_group_gap = 100;
    const total_work = service.backgrounds.length +
                       service.sky_cubemaps.length +
                       service.environment_cubemaps.length +
                       service.albedo_textures.length * 2 +
                       service.markers.length * 2;
    let work_done = 0;

    const report_progress = function(description) {
      work_done++;
      progress_callback(description, work_done / total_work);
    };

    async.series([
      cb => normalise_texture_set(service.backgrounds,          cb),
      cb => normalise_texture_set(service.sky_cubemaps,         cb),
      cb => normalise_texture_set(service.environment_cubemaps, cb),
      cb => normalise_texture_set(service.albedo_textures,      cb),
      cb => normalise_texture_set(service.normal_textures,      cb),
      cb => download_texture_set(service.backgrounds,          report_progress,     cb),
      cb => $timeout(cb, intra_group_gap),
      cb => download_texture_set(service.sky_cubemaps,         report_progress,     cb),
      cb => $timeout(cb, intra_group_gap),
      cb => download_texture_set(service.environment_cubemaps, report_progress,     cb),
      cb => $timeout(cb, intra_group_gap),
      cb => download_texture_set(service.albedo_textures,      report_progress,     cb),
      cb => $timeout(cb, intra_group_gap),
      cb => build_webgl_textures(service.albedo_textures,      gl, report_progress, cb),
      cb => $timeout(cb, intra_group_gap),
      cb => download_texture_set(service.markers,              report_progress,     cb),
      cb => $timeout(cb, intra_group_gap),
      cb => build_webgl_textures(service.markers,              gl, report_progress, cb),
    ], (err) => {
      if (err) {
      } else {
        service.loaded = true;
        service.dispatch_on_loaded();
      }
    });
  });

  return service;
}]);
