const angular = require('angular');
const _ = require('underscore');

angular.module('sc_map_edit_bin.controllers').controller("configure-textures",
["$scope", "$uibModalInstance", "dialogs", "game_resources", "data", function($scope, $uibModalInstance, dialogs, game_resources, data) {

  /**
   * Textures contains the basic common textures and shaders
   * Layers contains the actual textures applied to each layer
   */
  $scope.data = {
    textures: data.textures,
    layers: data.layers,
    selected_preset: null,
  };

  $scope.game_resources = game_resources;


  /**
   * Fixed presets of textures.
   * These are lifted from other maps
   */
  $scope.presets = [
    {
      name: "Setons Clutch",
      textures: {
        terrain_shader: "TTerrain",
        background_texture_path: "/textures/environment/defaultbackground.dds",
        sky_cubemap_texture_path: "/textures/environment/defaultskycube.dds",
        environment_cubemaps: [
          { name: "<default>", file: "/textures/environment/defaultenvcube.dds" }
        ]
      },
      layers: {
        albedo_data: [
          {scale: 10,  texture_file: "/env/evergreen/layers/rockmed_albedo.dds"},
          {scale: 4,   texture_file: "/env/swamp/layers/sw_sphagnum_03_albedo.dds"},
          {scale: 4,   texture_file: "/env/evergreen2/layers/eg_grass001_albedo.dds"},
          {scale: 10,  texture_file: "/env/evergreen/layers/rockmed_albedo.dds"},
          {scale: 15,  texture_file: "/env/evergreen2/layers/eg_rock_albedo.dds"},
          {scale: 4,   texture_file: ""},
          {scale: 4,   texture_file: ""},
          {scale: 4,   texture_file: ""},
          {scale: 4,   texture_file: ""},
          {scale: 128, texture_file: "/env/evergreen/layers/macrotexture000_albedo.dds"}
        ],
        normal_data: [
          {scale: 1, texture_file: "/env/evergreen/layers/sandlight_normals.dds"},
          {scale: 1, texture_file: "/env/evergreen/layers/grass001_normals.dds"},
          {scale: 1, texture_file: "/env/evergreen/layers/dirt001_normals.dds"},
          {scale: 1, texture_file: "/env/evergreen/layers/rockmed_normals.dds"},
          {scale: 1, texture_file: "/env/evergreen/layers/snow001_normals.dds"},
          {scale: 1, texture_file: ""},
          {scale: 1, texture_file: ""},
          {scale: 1, texture_file: ""},
          {scale: 1, texture_file: ""}
        ]
      }
    },
    {
      name: "Icy World",
      textures: {
        terrain_shader: "TTerrain",
        background_texture_path: "/textures/environment/defaultbackground.dds",
        sky_cubemap_texture_path: "/textures/environment/defaultskycube.dds",
        environment_cubemaps: [
          { name: "<default>", file: "/textures/environment/defaultenvcube.dds" }
        ]
      },
      layers: {
        albedo_data: [
          {scale: 10,  texture_file: "/env/Tundra/Layers/Tund_Rock_albedo.dds"},
          {scale: 4,   texture_file: "/env/Tundra/Layers/Tund_Rock03_albedo.dds"},
          {scale: 4,   texture_file: "/env/Tundra/Layers/Tund_ice006_albedo.dds"},
          {scale: 10,  texture_file: "/env/Tundra/Layers/Tund_Rock03_albedo.dds"},
          {scale: 15,  texture_file: "/env/Tundra/Layers/Tund_Snow_albedo.dds"},
          {scale: 4,   texture_file: "/env/Evergreen/layers/Dirt001_albedo.dds"},
          {scale: 4,   texture_file: "/env/Evergreen2/Layers/EG_Snow.dds"},
          {scale: 4,   texture_file: "/env/Tundra/Layers/Tund_iceRock_albedo.dds"},
          {scale: 4,   texture_file: ""},
          {scale: 128, texture_file: "/env/evergreen/layers/macrotexture000_albedo.dds"}
        ],
        normal_data: [ // Some of these are incorrect normals, as textures do not appear to have an obvious normal
          {scale: 1, texture_file: "/env/Tundra/Layers/Tund_Rock_normal.dds"},
          {scale: 1, texture_file: "/env/Tundra/Layers/Tund_Rock_normal.dds"},
          {scale: 1, texture_file: "/env/paradise/layers/Ice002_normals.dds"},
          {scale: 1, texture_file: "/env/Tundra/Layers/Tund_Rock_normal.dds"},
          {scale: 1, texture_file: "/env/Tundra/Layers/Tund_Snow_normal.dds"},
          {scale: 1, texture_file: "/env/Evergreen/layers/Dirt001_normals.dds"},
          {scale: 1, texture_file: "/env/Evergreen2/Layers/EG_Snow_normal.dds"},
          {scale: 1, texture_file: "/env/Tundra/Layers/Tund_Rock_normal.dds"},
          {scale: 1, texture_file: ""}
        ]
      }
    }
  ];


  $scope.use_preset = function() {
    const preset = _.findWhere($scope.presets, {name: $scope.data.selected_preset});
    if (preset) {
      $scope.data.textures.terrain_shader           = preset.textures.terrain_shader;
      $scope.data.textures.background_texture_path  = preset.textures.background_texture_path;
      $scope.data.textures.sky_cubemap_texture_path = preset.textures.sky_cubemap_texture_path;
      $scope.data.textures.environment_cubemaps     = preset.textures.environment_cubemaps;

      // Properties copied in manually as the preset is a different type to a real sc_map_layer
      _.each(preset.layers.albedo_data, (layer, index) => {
        $scope.data.layers.albedo_data[index].scale        = layer.scale;
        $scope.data.layers.albedo_data[index].texture_file = layer.texture_file;
      });

      _.each(preset.layers.normal_data, (layer, index) => {
        $scope.data.layers.normal_data[index].scale        = layer.scale;
        $scope.data.layers.normal_data[index].texture_file = layer.texture_file;
      });
    }
  };


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  $scope.accept = function() {
    $uibModalInstance.close({
      textures: $scope.data.textures,
      layers: $scope.data.layers
    });
  };
}]).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/dialogs/configure-textures.html', require('../../../templates/dialogs/configure-textures.html'));
}]);
