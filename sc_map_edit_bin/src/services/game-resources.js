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
 * These are loaded asyncronously, so various parts of the UI must be blocked until this has
 * finished loading
 */
angular.module('sc_map_edit_bin.services').factory('game_resources', ["$timeout", function($timeout) {
  let service = {};

  service.loaded = false;
  service.callbacks = {
    on_loaded: [],
    on_progress: []
  };

  // Are there other shaders? I don;t think so! I guess you could set LowFidelityTerrain? The cartographic Terrain_Stage0/1?
  service.shaders = [{
    name: "Default",
    value: "TTerrain",
    url: ""
  }];

  service.backgrounds = [
    {name: "Default",    value: "/textures/environment/DefaultBackground.dds", url: "DefaultBackground"},
    {name: "Black",      value: "/textures/environment/blackbackground.dds",   url: "blackground.png"},
    {name: "Thiban",     value: "/textures/environment/Thiban_bmp.dds",        url: "Thiban_bmp"},
    {name: "Rigel",      value: "/textures/environment/Rigel_bmp.dds",         url: "Rigel_bmp"},
    {name: "Zeta Canis", value: "/textures/environment/Zeta Canis_bmp.dds",    url: "Zeta Canis_bmp"},
    {name: "Pollux",     value: "/textures/environment/Pollux_bmp.dds",        url: "Pollux_bmp"},
    {name: "Pixces IV",  value: "/textures/environment/Pisces IV_bmp.dds",     url: "Pisces IV_bmp"},
    {name: "Orionis",    value: "/textures/environment/Orionis_bmp.dds",       url: "Orionis_bmp"},
    {name: "Minerva",    value: "/textures/environment/Minerva_bmp.dds",       url: "Minerva_bmp"},
    {name: "Matar",      value: "/textures/environment/Matar_bmp.dds",         url: "Matar_bmp"},
    {name: "Luthien",    value: "/textures/environment/Luthien_bmp.dds",       url: "Luthien_bmp"},
    {name: "Eridani",    value: "/textures/environment/Eridani_bmp.dds",       url: "Eridani_bmp"},
    {name: "Procyon",    value: "/textures/environment/Procyon_bmp.dds",       url: "Procyon_bmp"},
    {name: "Earth",      value: "/textures/environment/Earth_bmp.dds",         url: "Earth_bmp"},
    {name: "Capella",    value: "/textures/environment/Capella_bmp.dds",       url: "Capella_bmp"}
  ];

  service.sky_cubemaps = [
    {name: "Default",       value: "/textures/environment/DefaultSkyCube.dds",        url: "DefaultSkyCube.png"},
    {name: "Blue",          value: "/textures/environment/SkyCube_blue.dds",          url: "SkyCube_blue.png"},
    {name: "Desert 1",      value: "/textures/environment/SkyCube_Desert01.dds",      url: "SkyCube_Desert01.png"},
    {name: "Desert 1a",     value: "/textures/environment/SkyCube_Desert01a.dds",     url: "SkyCube_Desert01a.png"},
    {name: "Desert 2",      value: "/textures/environment/SkyCube_Desert02.dds",      url: "SkyCube_Desert02.png"},
    {name: "Desert 2a",     value: "/textures/environment/SkyCube_Desert02a.dds",     url: "SkyCube_Desert02a.png"},
    {name: "Desert 3a",     value: "/textures/environment/SkyCube_Desert03a.dds",     url: "SkyCube_Desert03a.png"},
    {name: "Evergreen 1",   value: "/textures/environment/SkyCube_Evergreen01.dds",   url: "SkyCube_Evergreen01.png"},
    {name: "Evergreen 1a",  value: "/textures/environment/SkyCube_Evergreen01a.dds",  url: "SkyCube_Evergreen01a.png"},
    {name: "Evergreen 2",   value: "/textures/environment/SkyCube_Evergreen02.dds",   url: "SkyCube_Evergreen02.png"},
    {name: "Evergreen 3",   value: "/textures/environment/SkyCube_Evergreen03.dds",   url: "SkyCube_Evergreen03.png"},
    {name: "Evergreen 3a",  value: "/textures/environment/SkyCube_Evergreen03a.dds",  url: "SkyCube_Evergreen03a.png"},
    {name: "Evergreen 4a",  value: "/textures/environment/SkyCube_Evergreen05a.dds",  url: "SkyCube_Evergreen05a.png"},
    {name: "Stormy",        value: "/textures/environment/SkyCube_EvStormy.dds",      url: "SkyCube_EvStormy.png"},
    {name: "Geothermal 1",  value: "/textures/environment/SkyCube_Geothermal01.dds",  url: "SkyCube_Geothermal01.png"},
    {name: "Geothermal 2",  value: "/textures/environment/SkyCube_Geothermal02.dds",  url: "SkyCube_Geothermal02.png"},
    {name: "Geothermal 2a", value: "/textures/environment/SkyCube_Geothermal02a.dds", url: "SkyCube_Geothermal02a.png"},
    {name: "Lava 1",        value: "/textures/environment/SkyCube_Lava01.dds",        url: "SkyCube_Lava01.png"},
    {name: "Lava 1a",       value: "/textures/environment/SkyCube_Lava01a.dds",       url: "SkyCube_Lava01a.png"},
    {name: "Leipzig demo",  value: "/textures/environment/SkyCube_Leipzig_Demo.dds",  url: "SkyCube_Leipzig_Demo.png"},
    {name: "Redrocks 3",    value: "/textures/environment/SkyCube_RedRock03.dds",     url: "SkyCube_RedRock03.png"},
    {name: "Redrocks 1",    value: "/textures/environment/SkyCube_RedRocks01.dds",    url: "SkyCube_RedRocks01.png"},
    {name: "Redrocks 2",    value: "/textures/environment/SkyCube_RedRocks02.dds",    url: "SkyCube_RedRocks02.png"},
    {name: "Redrocks 2a",   value: "/textures/environment/SkyCube_RedRocks02a.dds",   url: "SkyCube_RedRocks02a.png"},
    {name: "Redrocks 3",    value: "/textures/environment/SkyCube_RedRocks03.dds",    url: "SkyCube_RedRocks03.png"},
    {name: "Redrocks 4",    value: "/textures/environment/SkyCube_RedRocks04.dds",    url: "SkyCube_RedRocks04.png"},
    {name: "Redrocks 5",    value: "/textures/environment/SkyCube_RedRocks05.dds",    url: "SkyCube_RedRocks05.png"},
    {name: "Redrocks 5a",   value: "/textures/environment/SkyCube_RedRocks05a.dds",   url: "SkyCube_RedRocks05a.png"},
    {name: "Redrocks 6",    value: "/textures/environment/SkyCube_RedRocks06.dds",    url: "SkyCube_RedRocks06.png"},
    {name: "Redrocks 8a",   value: "/textures/environment/SkyCube_RedRocks08a.dds",   url: "SkyCube_RedRocks08a.png"},
    {name: "Redrocks 9a",   value: "/textures/environment/SkyCube_RedRocks09a.dds",   url: "SkyCube_RedRocks09a.png"},
    {name: "Redrocks 10",   value: "/textures/environment/SkyCube_RedRocks10.dds",    url: "SkyCube_RedRocks10.png"},
    {name: "Scx1 1",        value: "/textures/environment/SkyCube_Scx1Proto01.dds",   url: "SkyCube_Scx1Proto01.png"},
    {name: "Scx1 2",         value: "/textures/environment/SkyCube_Scx1Proto02.dds",   url: "SkyCube_Scx1Proto02.png"},
    {name: "Tropical 1",    value: "/textures/environment/SkyCube_Tropical01.dds",    url: "SkyCube_Tropical01.png"},
    {name: "Tropical 1a",   value: "/textures/environment/SkyCube_Tropical01a.dds",   url: "SkyCube_Tropical01a.png"},
    {name: "Tropical 4",    value: "/textures/environment/SkyCube_Tropical04.dds",    url: "SkyCube_Tropical04.png"},
    {name: "Tropical 6",    value: "/textures/environment/SkyCube_TropicalOp06.dds",  url: "SkyCube_TropicalOp06.png"},
    {name: "Tropical 6a",   value: "/textures/environment/SkyCube_TropicalOp06a.dds", url: "SkyCube_TropicalOp06a.png"},
    {name: "Tundra 1",      value: "/textures/environment/SkyCube_Tundra01.dds",      url: "SkyCube_Tundra01.png"},
    {name: "Tundra 2",      value: "/textures/environment/SkyCube_Tundra02.dds",      url: "SkyCube_Tundra02.png"},
    {name: "Tundra 2a",     value: "/textures/environment/SkyCube_Tundra02a.dds",     url: "SkyCube_Tundra02a.png"},
    {name: "Tundra 3",      value: "/textures/environment/SkyCube_Tundra03.dds",      url: "SkyCube_Tundra03.png"},
    {name: "Tundra 3a",     value: "/textures/environment/SkyCube_Tundra03a.dds",     url: "SkyCube_Tundra03a.png"},
    {name: "Tundra 4a",     value: "/textures/environment/SkyCube_Tundra04a.dds",     url: "SkyCube_Tundra04a.png"}
  ];

  service.environment_cubemaps = [
    {name: "Default",                 value: "/textures/environment/DefaultEnvCube.dds",                url: "DefaultEnvCube.png"},
    {name: "Aeon alien crystal",      value: "/textures/environment/EnvCube_aeon_aliencrystal.dds",     url: "EnvCube_aeon_aliencrystal.png"},
    {name: "Aeon desert",             value: "/textures/environment/EnvCube_aeon_desert.dds",           url: "EnvCube_aeon_desert.png"},
    {name: "Aeon evergreen",          value: "/textures/environment/EnvCube_aeon_Evergreen.dds",        url: "EnvCube_aeon_Evergreen.png"},
    {name: "Aeon geothermal",         value: "/textures/environment/EnvCube_aeon_geothermal.dds",       url: "EnvCube_aeon_geothermal.png"},
    {name: "Aeon lava",               value: "/textures/environment/EnvCube_aeon_lava.dds",             url: "EnvCube_aeon_lava.png"},
    {name: "Aeon redrocks",           value: "/textures/environment/EnvCube_aeon_RedRocks.dds",         url: "EnvCube_aeon_RedRocks.png"},
    {name: "Aeon tropical",           value: "/textures/environment/EnvCube_aeon_tropical.dds",         url: "EnvCube_aeon_tropical.png"},
    {name: "Aeon tundra",             value: "/textures/environment/EnvCube_aeon_tundra.dds",           url: "EnvCube_aeon_tundra.png"},
    {name: "Desert 1",                value: "/textures/environment/EnvCube_Desert01a.dds",             url: "EnvCube_Desert01a.png"},
    {name: "Desert 2",                value: "/textures/environment/EnvCube_Desert02a.dds",             url: "EnvCube_Desert02a.png"},
    {name: "Desert 3",                value: "/textures/environment/EnvCube_Desert03a.dds",             url: "EnvCube_Desert03a.png"},
    {name: "Evergreen 1",             value: "/textures/environment/EnvCube_Evergreen01a.dds",          url: "EnvCube_Evergreen01a.png"},
    {name: "Evergreen 2",             value: "/textures/environment/EnvCube_Evergreen03a.dds",          url: "EnvCube_Evergreen03a.png"},
    {name: "Evergreen 3",             value: "/textures/environment/EnvCube_Evergreen05a.dds",          url: "EnvCube_Evergreen05a.png"},
    {name: "Geothermal",              value: "/textures/environment/EnvCube_Geothermal02a.dds",         url: "EnvCube_Geothermal02a.png"},
    {name: "Lava",                    value: "/textures/environment/EnvCube_Lava01a.dds",               url: "EnvCube_Lava01a.png"},
    {name: "Redrocks 5",              value: "/textures/environment/EnvCube_RedRocks05a.dds",           url: "EnvCube_RedRocks05a.png"},
    {name: "Redrocks 6",              value: "/textures/environment/EnvCube_RedRocks06.dds",            url: "EnvCube_RedRocks06.png"},
    {name: "Redrocks 8",              value: "/textures/environment/EnvCube_RedRocks08a.dds",           url: "EnvCube_RedRocks08a.png"},
    {name: "Redrocks 9",              value: "/textures/environment/EnvCube_RedRocks09a.dds",           url: "EnvCube_RedRocks09a.png"},
    {name: "Redrocks 10",             value: "/textures/environment/EnvCube_RedRocks10.dds",            url: "EnvCube_RedRocks10.png"},
    {name: "Scx1",                    value: "/textures/environment/EnvCube_Scx1Proto02.dds",           url: "EnvCube_Scx1Proto02.png"}, // TODO: Better name!
    {name: "Seraphim alient crystal", value: "/textures/environment/EnvCube_seraphim_aliencrystal.dds", url: "EnvCube_seraphim_aliencrystal.png"},
    {name: "Seraphim desert",         value: "/textures/environment/EnvCube_seraphim_desert.dds",       url: "EnvCube_seraphim_desert.png"},
    {name: "Seraphim evergreen",      value: "/textures/environment/EnvCube_seraphim_Evergreen.dds",    url: "EnvCube_seraphim_Evergreen.png"},
    {name: "Seraphim geothermal",     value: "/textures/environment/EnvCube_seraphim_geothermal.dds",   url: "EnvCube_seraphim_geothermal.png"},
    {name: "Seraphim lava",           value: "/textures/environment/EnvCube_seraphim_lava.dds",         url: "EnvCube_seraphim_lava.png"},
    {name: "Seraphim redrocks",       value: "/textures/environment/EnvCube_seraphim_redrocks.dds",     url: "EnvCube_seraphim_redrocks.png"},
    {name: "Seraphim tropical",       value: "/textures/environment/EnvCube_seraphim_tropical.dds",     url: "EnvCube_seraphim_tropical.png"},
    {name: "Seraphim tundra",         value: "/textures/environment/EnvCube_seraphim_tundra.dds",       url: "EnvCube_seraphim_tundra.png"},
    {name: "Tropical 1",              value: "/textures/environment/EnvCube_Tropical01a.dds",           url: "EnvCube_Tropical01a.png"},
    {name: "Tropical 6",              value: "/textures/environment/EnvCube_TropicalOp06a.dds",         url: "EnvCube_TropicalOp06a.png"},
    {name: "Tundra 2",                value: "/textures/environment/EnvCube_Tundra02a.dds",             url: "EnvCube_Tundra02a.png"},
    {name: "Tundra 3",                value: "/textures/environment/EnvCube_Tundra03a.dds",             url: "EnvCube_Tundra03a.png"},
    {name: "Tundra 4",                value: "/textures/environment/EnvCube_Tundra04a.dds",             url: "EnvCube_Tundra04a.png"}
  ];

  service.albedo_textures = [
    // Desert tileset
    {name: "Gravel",        tileset: "Desert", value: "/env/Desert/Layers/Des_Gravel_albedo.dds",     url: "Des_Gravel_albedo.png"},
    {name: "Gravel 1",      tileset: "Desert", value: "/env/Desert/Layers/Des_Gravel01_albedo.dds",   url: "Des_Gravel01_albedo.png"},
    {name: "Rock",          tileset: "Desert", value: "/env/Desert/Layers/Des_Rock_albedo.dds",       url: "Des_Rock_albedo.png"},
    {name: "Rock 1",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock01_albedo.dds",     url: "Des_Rock01_albedo.png"},
    {name: "Rock 2",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock02_albedo.dds",     url: "Des_Rock02_albedo.png"},
    {name: "Rock 3",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock03_albedo.dds",     url: "Des_Rock03_albedo.png"},
    {name: "Rock 4",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock04_albedo.dds",     url: "Des_Rock04_albedo.png"},
    {name: "Rock 5",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock05_albedo.dds",     url: "Des_Rock05_albedo.png"},
    {name: "Rock 6",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock06_albedo.dds",     url: "Des_Rock06_albedo.png"},
    {name: "Dark sand",     tileset: "Desert", value: "/env/Desert/Layers/Des_SandDark_albedo.dds",   url: "Des_SandDark_albedo.png"},
    {name: "Dark sand 2",   tileset: "Desert", value: "/env/Desert/Layers/Des_SandDark02_albedo.dds", url: "Des_SandDark02_albedo.png"},
    {name: "Light sand",    tileset: "Desert", value: "/env/Desert/Layers/Des_sandLight_albedo.dds",  url: "Des_sandLight_albedo.png"},
    {name: "Medium sand",   tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed_albedo.dds",    url: "Des_SandMed_albedo.png"},
    {name: "Medium sand 1", tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed01_albedo.dds",  url: "Des_SandMed01_albedo.png"},
    {name: "Medium sand 2", tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed02_albedo.dds",  url: "Des_SandMed02_albedo.png"},
    {name: "Wet sand",      tileset: "Desert", value: "/env/Desert/Layers/Des_Sandwet_albedo.dds",    url: "Des_Sandwet_albedo.png"}
  ];

  service.normal_textures = [
    // Desert tileset
    {name: "Gravel",      tileset: "Desert", value: "/env/Desert/Layers/Des_Gravel_normal.dds",    url: ""},
    {name: "None",        tileset: "Desert", value: "/env/Desert/Layers/Des_None_Normal.dds",      url: ""},
    {name: "Rock",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock_normal.dds",      url: ""},
    {name: "Rock 1",      tileset: "Desert", value: "/env/Desert/Layers/Des_Rock01_normal.dds",    url: ""},
    {name: "Rock 2",      tileset: "Desert", value: "/env/Desert/Layers/Des_Rock02_normal.dds",    url: ""},
    {name: "Rock 3a",     tileset: "Desert", value: "/env/Desert/Layers/Des_Rock03a_normal.dds",   url: ""},
    {name: "Dark sand",   tileset: "Desert", value: "/env/Desert/Layers/Des_SandDark_normal.dds",  url: ""},
    {name: "Light sand",  tileset: "Desert", value: "/env/Desert/Layers/Des_sandLight_normal.dds", url: ""},
    {name: "Medium sand", tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed_normal.dds",   url: ""},
    {name: "Wet sand",    tileset: "Desert", value: "/env/Desert/Layers/Des_Sandwet_normal.dds",   url: ""},
  ];

  /**
   * Subscribe for updates to loading progress
   * @param {function} callback Arguments (string: description, number: progress_fraction)
   */
  service.on_progress = function(callback) {
    service.callbacks.on_progress.push(callback);
  };

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
   * Callback all progress subscribers
   */
  service.dispatch_on_progress = function(message, fraction) {
    _.each(service.callbacks.on_progress, callback => callback(message, fraction));
  };

  /**
   * Callback all loaded subscribers.
   * These will then be cleared
   */
  service.dispatch_on_loaded = function() {
    _.each(service.callbacks.on_loaded, callback => callback());
    service.callbacks.on_loaded.length = 0;
  };


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
          progress_cb(`Loaded ${texture.value}`);
        }
      };
      // TODO: Load errors
      img.src = `gamedata${texture.value.replace(".dds", ".png")}`;
      texture.img = img;
    }
  };

  // Start loading
  const download_resources = function() {
    let total_work = service.backgrounds.length +
                     service.sky_cubemaps.length +
                     service.environment_cubemaps.length +
                     service.albedo_textures.length;
    let work_done = 0;

    const report_progress = function(description) {
      work_done++;
      service.dispatch_on_progress(description, work_done / total_work);
    };

    async.series([
      cb => download_texture_set(service.backgrounds, report_progress, cb),
      cb => download_texture_set(service.sky_cubemaps, report_progress, cb),
      cb => download_texture_set(service.environment_cubemaps, report_progress, cb),
      cb => download_texture_set(service.albedo_textures, report_progress, cb)
    ], (err) => {
      if (err) {
      } else {
        service.loaded = true;
        service.dispatch_on_loaded();
      }
    });
  };

  download_resources();

  return service;
}]);
