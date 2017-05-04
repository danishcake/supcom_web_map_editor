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
 * The data is downloaded from URLs that exactly match the name except the extension is changed
 * from .dds to .png
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
    {name: "Default",    value: "/textures/environment/DefaultBackground.dds"},
    {name: "Black",      value: "/textures/environment/blackbackground.dds"},
    {name: "Thiban",     value: "/textures/environment/Thiban_bmp.dds"},
    {name: "Rigel",      value: "/textures/environment/Rigel_bmp.dds"},
    {name: "Zeta Canis", value: "/textures/environment/Zeta Canis_bmp.dds"},
    {name: "Pollux",     value: "/textures/environment/Pollux_bmp.dds"},
    {name: "Pixces IV",  value: "/textures/environment/Pisces IV_bmp.dds"},
    {name: "Orionis",    value: "/textures/environment/Orionis_bmp.dds"},
    {name: "Minerva",    value: "/textures/environment/Minerva_bmp.dds"},
    {name: "Matar",      value: "/textures/environment/Matar_bmp.dds"},
    {name: "Luthien",    value: "/textures/environment/Luthien_bmp.dds"},
    {name: "Eridani",    value: "/textures/environment/Eridani_bmp.dds"},
    {name: "Procyon",    value: "/textures/environment/Procyon_bmp.dds"},
    {name: "Earth",      value: "/textures/environment/Earth_bmp.dds"},
    {name: "Capella",    value: "/textures/environment/Capella_bmp.dds"}
  ];

  service.sky_cubemaps = [
    {name: "Default",       value: "/textures/environment/DefaultSkyCube.dds"},
    {name: "Blue",          value: "/textures/environment/SkyCube_blue.dds"},
    {name: "Desert 1",      value: "/textures/environment/SkyCube_Desert01.dds"},
    {name: "Desert 1a",     value: "/textures/environment/SkyCube_Desert01a.dds"},
    {name: "Desert 2",      value: "/textures/environment/SkyCube_Desert02.dds"},
    {name: "Desert 2a",     value: "/textures/environment/SkyCube_Desert02a.dds"},
    {name: "Desert 3a",     value: "/textures/environment/SkyCube_Desert03a.dds"},
    {name: "Evergreen 1",   value: "/textures/environment/SkyCube_Evergreen01.dds"},
    {name: "Evergreen 1a",  value: "/textures/environment/SkyCube_Evergreen01a.dds"},
    {name: "Evergreen 2",   value: "/textures/environment/SkyCube_Evergreen02.dds"},
    {name: "Evergreen 3",   value: "/textures/environment/SkyCube_Evergreen03.dds"},
    {name: "Evergreen 3a",  value: "/textures/environment/SkyCube_Evergreen03a.dds"},
    {name: "Evergreen 4a",  value: "/textures/environment/SkyCube_Evergreen05a.dds"},
    {name: "Stormy",        value: "/textures/environment/SkyCube_EvStormy.dds"},
    {name: "Geothermal 1",  value: "/textures/environment/SkyCube_Geothermal01.dds"},
    {name: "Geothermal 2",  value: "/textures/environment/SkyCube_Geothermal02.dds"},
    {name: "Geothermal 2a", value: "/textures/environment/SkyCube_Geothermal02a.dds"},
    {name: "Lava 1",        value: "/textures/environment/SkyCube_Lava01.dds"},
    {name: "Lava 1a",       value: "/textures/environment/SkyCube_Lava01a.dds"},
    {name: "Leipzig demo",  value: "/textures/environment/SkyCube_Leipzig_Demo.dds"},
    {name: "Redrocks 3",    value: "/textures/environment/SkyCube_RedRock03.dds"},
    {name: "Redrocks 1",    value: "/textures/environment/SkyCube_RedRocks01.dds"},
    {name: "Redrocks 2",    value: "/textures/environment/SkyCube_RedRocks02.dds"},
    {name: "Redrocks 2a",   value: "/textures/environment/SkyCube_RedRocks02a.dds"},
    {name: "Redrocks 3",    value: "/textures/environment/SkyCube_RedRocks03.dds"},
    {name: "Redrocks 4",    value: "/textures/environment/SkyCube_RedRocks04.dds"},
    {name: "Redrocks 5",    value: "/textures/environment/SkyCube_RedRocks05.dds"},
    {name: "Redrocks 5a",   value: "/textures/environment/SkyCube_RedRocks05a.dds"},
    {name: "Redrocks 6",    value: "/textures/environment/SkyCube_RedRocks06.dds"},
    {name: "Redrocks 8a",   value: "/textures/environment/SkyCube_RedRocks08a.dds"},
    {name: "Redrocks 9a",   value: "/textures/environment/SkyCube_RedRocks09a.dds"},
    {name: "Redrocks 10",   value: "/textures/environment/SkyCube_RedRocks10.dds"},
    {name: "Scx1 1",        value: "/textures/environment/SkyCube_Scx1Proto01.dds"},
    {name: "Scx1 2",         value: "/textures/environment/SkyCube_Scx1Proto02.dds"},
    {name: "Tropical 1",    value: "/textures/environment/SkyCube_Tropical01.dds"},
    {name: "Tropical 1a",   value: "/textures/environment/SkyCube_Tropical01a.dds"},
    {name: "Tropical 4",    value: "/textures/environment/SkyCube_Tropical04.dds"},
    {name: "Tropical 6",    value: "/textures/environment/SkyCube_TropicalOp06.dds"},
    {name: "Tropical 6a",   value: "/textures/environment/SkyCube_TropicalOp06a.dds"},
    {name: "Tundra 1",      value: "/textures/environment/SkyCube_Tundra01.dds"},
    {name: "Tundra 2",      value: "/textures/environment/SkyCube_Tundra02.dds"},
    {name: "Tundra 2a",     value: "/textures/environment/SkyCube_Tundra02a.dds"},
    {name: "Tundra 3",      value: "/textures/environment/SkyCube_Tundra03.dds"},
    {name: "Tundra 3a",     value: "/textures/environment/SkyCube_Tundra03a.dds"},
    {name: "Tundra 4a",     value: "/textures/environment/SkyCube_Tundra04a.dds"}
  ];

  service.environment_cubemaps = [
    {name: "Default",                 value: "/textures/environment/DefaultEnvCube.dds"},
    {name: "Aeon alien crystal",      value: "/textures/environment/EnvCube_aeon_aliencrystal.dds"},
    {name: "Aeon desert",             value: "/textures/environment/EnvCube_aeon_desert.dds"},
    {name: "Aeon evergreen",          value: "/textures/environment/EnvCube_aeon_Evergreen.dds"},
    {name: "Aeon geothermal",         value: "/textures/environment/EnvCube_aeon_geothermal.dds"},
    {name: "Aeon lava",               value: "/textures/environment/EnvCube_aeon_lava.dds"},
    {name: "Aeon redrocks",           value: "/textures/environment/EnvCube_aeon_RedRocks.dds"},
    {name: "Aeon tropical",           value: "/textures/environment/EnvCube_aeon_tropical.dds"},
    {name: "Aeon tundra",             value: "/textures/environment/EnvCube_aeon_tundra.dds"},
    {name: "Desert 1",                value: "/textures/environment/EnvCube_Desert01a.dds"},
    {name: "Desert 2",                value: "/textures/environment/EnvCube_Desert02a.dds"},
    {name: "Desert 3",                value: "/textures/environment/EnvCube_Desert03a.dds"},
    {name: "Evergreen 1",             value: "/textures/environment/EnvCube_Evergreen01a.dds"},
    {name: "Evergreen 2",             value: "/textures/environment/EnvCube_Evergreen03a.dds"},
    {name: "Evergreen 3",             value: "/textures/environment/EnvCube_Evergreen05a.dds"},
    {name: "Geothermal",              value: "/textures/environment/EnvCube_Geothermal02a.dds"},
    {name: "Lava",                    value: "/textures/environment/EnvCube_Lava01a.dds"},
    {name: "Redrocks 5",              value: "/textures/environment/EnvCube_RedRocks05a.dds"},
    {name: "Redrocks 6",              value: "/textures/environment/EnvCube_RedRocks06.dds"},
    {name: "Redrocks 8",              value: "/textures/environment/EnvCube_RedRocks08a.dds"},
    {name: "Redrocks 9",              value: "/textures/environment/EnvCube_RedRocks09a.dds"},
    {name: "Redrocks 10",             value: "/textures/environment/EnvCube_RedRocks10.dds"},
    {name: "Scx1",                    value: "/textures/environment/EnvCube_Scx1Proto02.dds"}, // TODO: Better name!
    {name: "Seraphim alient crystal", value: "/textures/environment/EnvCube_seraphim_aliencrystal.dds"},
    {name: "Seraphim desert",         value: "/textures/environment/EnvCube_seraphim_desert.dds"},
    {name: "Seraphim evergreen",      value: "/textures/environment/EnvCube_seraphim_Evergreen.dds"},
    {name: "Seraphim geothermal",     value: "/textures/environment/EnvCube_seraphim_geothermal.dds"},
    {name: "Seraphim lava",           value: "/textures/environment/EnvCube_seraphim_lava.dds"},
    {name: "Seraphim redrocks",       value: "/textures/environment/EnvCube_seraphim_redrocks.dds"},
    {name: "Seraphim tropical",       value: "/textures/environment/EnvCube_seraphim_tropical.dds"},
    {name: "Seraphim tundra",         value: "/textures/environment/EnvCube_seraphim_tundra.dds"},
    {name: "Tropical 1",              value: "/textures/environment/EnvCube_Tropical01a.dds"},
    {name: "Tropical 6",              value: "/textures/environment/EnvCube_TropicalOp06a.dds"},
    {name: "Tundra 2",                value: "/textures/environment/EnvCube_Tundra02a.dds"},
    {name: "Tundra 3",                value: "/textures/environment/EnvCube_Tundra03a.dds"},
    {name: "Tundra 4",                value: "/textures/environment/EnvCube_Tundra04a.dds"}
  ];

  service.albedo_textures = [
    // Desert tileset
    {name: "Gravel",        tileset: "Desert", value: "/env/Desert/Layers/Des_Gravel_albedo.dds"},
    {name: "Gravel 1",      tileset: "Desert", value: "/env/Desert/Layers/Des_Gravel01_albedo.dds"},
    {name: "Rock",          tileset: "Desert", value: "/env/Desert/Layers/Des_Rock_albedo.dds"},
    {name: "Rock 1",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock01_albedo.dds"},
    {name: "Rock 2",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock02_albedo.dds"},
    {name: "Rock 3",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock03_albedo.dds"},
    {name: "Rock 4",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock04_albedo.dds"},
    {name: "Rock 5",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock05_albedo.dds"},
    {name: "Rock 6",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock06_albedo.dds"},
    {name: "Dark sand",     tileset: "Desert", value: "/env/Desert/Layers/Des_SandDark_albedo.dds"},
    {name: "Dark sand 2",   tileset: "Desert", value: "/env/Desert/Layers/Des_SandDark02_albedo.dds"},
    {name: "Light sand",    tileset: "Desert", value: "/env/Desert/Layers/Des_sandLight_albedo.dds"},
    {name: "Medium sand",   tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed_albedo.dds"},
    {name: "Medium sand 1", tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed01_albedo.dds"},
    {name: "Medium sand 2", tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed02_albedo.dds"},
    {name: "Wet sand",      tileset: "Desert", value: "/env/Desert/Layers/Des_Sandwet_albedo.dds"}
  ];

  service.normal_textures = [
    // Desert tileset
    {name: "Gravel",      tileset: "Desert", value: "/env/Desert/Layers/Des_Gravel_normal.dds"},
    {name: "None",        tileset: "Desert", value: "/env/Desert/Layers/Des_None_Normal.dds"},
    {name: "Rock",        tileset: "Desert", value: "/env/Desert/Layers/Des_Rock_normal.dds"},
    {name: "Rock 1",      tileset: "Desert", value: "/env/Desert/Layers/Des_Rock01_normal.dds"},
    {name: "Rock 2",      tileset: "Desert", value: "/env/Desert/Layers/Des_Rock02_normal.dds"},
    {name: "Rock 3a",     tileset: "Desert", value: "/env/Desert/Layers/Des_Rock03a_normal.dds"},
    {name: "Dark sand",   tileset: "Desert", value: "/env/Desert/Layers/Des_SandDark_normal.dds"},
    {name: "Light sand",  tileset: "Desert", value: "/env/Desert/Layers/Des_sandLight_normal.dds"},
    {name: "Medium sand", tileset: "Desert", value: "/env/Desert/Layers/Des_SandMed_normal.dds"},
    {name: "Wet sand",    tileset: "Desert", value: "/env/Desert/Layers/Des_Sandwet_normal.dds"},
  ];


  service.markers = [
    {name: "Mass",    value: "/editor_icons/Mass_icon.dds"},
    {name: "Energy",  value: "/editor_icons/Energy_icon.dds"},
    {name: "Unknown", value: "/editor_icons/Unknown_icon.dds"},
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
      img.src = `gamedata${texture.value.replace(".dds", ".png")}`;
      texture.img = img;
    }
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

    let total_work = service.backgrounds.length +
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
      cb => download_texture_set(service.backgrounds,          report_progress, cb),
      cb => download_texture_set(service.sky_cubemaps,         report_progress, cb),
      cb => download_texture_set(service.environment_cubemaps, report_progress, cb),
      cb => download_texture_set(service.albedo_textures,      report_progress, cb),
      cb => build_webgl_textures(service.albedo_textures,      gl, report_progress, cb),
      cb => download_texture_set(service.markers,              report_progress, cb),
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
