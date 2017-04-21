angular.module('sc_map_edit_bin.controllers').controller("configure-textures",
["$scope", "$uibModalInstance", "dialogs", "data", function($scope, $uibModalInstance, dialogs, data) {

  /**
   * Textures contains the basic common textures and shaders
   * Layers contains the actual textures applied to each layer
   */
  $scope.data = {
    textures: data.textures,
    layers: data.layers,
    selected_preset: null,
  };


  // TODO: Move this stuff to a service
  $scope.resources = {
    terrain_shaders: ["TTerrain"],
    background_textures: ["/textures/environment/defaultbackground.dds"],
    sky_cubemap_textures: ["/textures/environment/defaultskycube.dds"],
    environment_cubemaps: [
      { name: "<default>", file: "/textures/environment/defaultenvcube.dds" }
    ],
    albedo_textures: [
      "",
      "/env/evergreen/layers/macrotexture000_albedo.dds",
      "/env/evergreen/layers/rockmed_albedo.dds",
      "/env/evergreen2/layers/eg_grass001_albedo.dds",
      "/env/evergreen2/layers/eg_rock_albedo.dds",
      "/env/swamp/layers/sw_sphagnum_03_albedo.dds",
    ],
    normal_textures: [
      "",
      "/env/evergreen/layers/SandLight_normals.dds",
      "/env/evergreen/layers/grass001_normals.dds",
      "/env/evergreen/layers/Dirt001_normals.dds",
      "/env/evergreen/layers/RockMed_normals.dds",
      "/env/evergreen/layers/snow001_normals.dds",
    ],
  };


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
        environment_cubemaps: {
          name: "<default>",
          file: "/textures/environment/defaultenvcube.dds"
        }
      },
      albedo_layers: [
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
      normal_layers: [
        {scale: 1, texture_file: "/env/evergreen/layers/SandLight_normals.dds"},
        {scale: 1, texture_file: "/env/evergreen/layers/grass001_normals.dds"},
        {scale: 1, texture_file: "/env/evergreen/layers/Dirt001_normals.dds"},
        {scale: 1, texture_file: "/env/evergreen/layers/RockMed_normals.dds"},
        {scale: 1, texture_file: "/env/evergreen/layers/snow001_normals.dds"},
        {scale: 1, texture_file: ""},
        {scale: 1, texture_file: ""},
        {scale: 1, texture_file: ""},
        {scale: 1, texture_file: ""}
      ]
    },
  ];


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };


  $scope.accept = function() {
    $uibModalInstance.close($scope.data.textures, $scope.data.layers);
  };
}]);
