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

  ];

  service.normal_textures = [
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
   * The texture URL matches the Supreme Commander gamedata structure,
   * but filenames in the serialised maps are lowercase.
   * This does not report progress as it should be more or less free
   */
  const normalise_texture_set = function(texture_set, done_cb) {
    for (let texture of texture_set) {
      //
      texture.value = texture.url.toLowerCase().replace(".png", ".dds");
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
