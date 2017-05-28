angular.module('sc_map_edit_bin.controllers').controller("top-menu",
["$scope", "editor_state", "dialogs", function($scope, editor_state, dialogs) {
  $scope.editor_state = editor_state;

  $scope.new_map = function() {
    let dlg = dialogs.create("templates/dialogs/new-map.html", "new-map", {}, modal_dlg_opts);
    dlg.result.then(function(map_parameters) {
      editor_state.create_map(map_parameters);
    });
  };
  $scope.open_map = function() {
    let dlg = dialogs.create("templates/dialogs/open-map.html", "open-map", {}, modal_dlg_opts);
    dlg.result.then(function(map) {
      try {
        editor_state.load_map(map);
      } catch(error) {
        dialogs.error('Failed to open map', error.message);
      }
    });
  };
  $scope.save_map = function() {
    switch(editor_state.get_save_location()) {
      case "unsaved":
        dialogs.create("templates/dialogs/save-as.html", "save-as", {}, modal_dlg_opts);
        break;

      default:
        dialogs.create("templates/dialogs/save-progress.html",
                       "save-progress",
                       {
                         dest: editor_state.get_save_location(),
                         map: editor_state.map,
                         edit_heightmap: editor_state.edit_heightmap,
                         scripts: editor_state.scripts
                       },
                       modal_dlg_opts);
        break;
    }
  };
  $scope.save_map_as = function() {
    dialogs.create("templates/dialogs/save-as.html", "save-as", {}, modal_dlg_opts);
  };
  $scope.edit_metadata = function() {
    dialogs.error('Metadata','Not implemented.');
  };
  $scope.edit_textures = function() {
    let dlg = dialogs.create("templates/dialogs/configure-textures.html",
                             "configure-textures",
                             {
                               textures: editor_state.map.textures,
                               layers: editor_state.map.layers
                             },
                             modal_dlg_opts);

    dlg.result.then((result) => {
      const textures = result.textures;
      const layers = result.layers;

      // Persist changes made to textures
      editor_state.map.textures.terrain_shader           = textures.terrain_shader;
      editor_state.map.textures.background_texture_path  = textures.background_texture_path;
      editor_state.map.textures.sky_cubemap_texture_path = textures.sky_cubemap_texture_path;
      editor_state.map.textures.environment_cubemaps.length = 0;
      _.each(textures.environment_cubemaps, environment_cubemap => {
        editor_state.map.textures.environment_cubemaps.push(environment_cubemap);
      });

      // Persist changes made to layers
      _.each(layers.normal_data, (layer, index) => {
        editor_state.map.layers.normal_data[index].texture_file  = layer.texture_file;
        editor_state.map.layers.normal_data[index].texture_scale = layer.texture_scale;
      });
      _.each(layers.albedo_data, (layer, index) => {
        editor_state.map.layers.albedo_data[index].texture_file  = layer.texture_file;
        editor_state.map.layers.albedo_data[index].texture_scale = layer.texture_scale;
      });
    },
    () => {});
  };
  $scope.edit_water = function() {
    dialogs.error('Water','Not implemented.');
  };
  $scope.edit_forces = function() {
    let dlg = dialogs.create("templates/dialogs/configure-forces.html",
                             "configure-forces",
                             {
                               scripts: editor_state.scripts
                             },
                             modal_dlg_opts);
    dlg.result.then(armies => {
      editor_state.scripts.scenario.armies.length = 0;
      _.each(armies, army => editor_state.scripts.scenario.armies.push(army));
    },
    () => {});
  };

}]);
