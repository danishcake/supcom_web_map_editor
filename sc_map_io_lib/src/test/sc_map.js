import { sc } from '../lib/sc';
const assert = require('chai').assert;
const fs = require('fs');
const ByteBuffer = require('bytebuffer');



describe('sc_map', function() {
  describe('loading', function() {
    let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley/Shuriken_Valley.scmap");

    it('should load header', function () {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.header.width, 256);
      assert.equal(map.header.height, 256);
    });

    it('should load preview image', function () {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      // Preview image is a 256x256 image uncompressed DDS image
      assert.equal(map.preview_image.data.capacity(), 256 * 256 * 4);
    });

    it('should load heightmap', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.heightmap.width, 256);
      assert.equal(map.heightmap.height, 256);
      assert.closeTo(map.heightmap.scale, 1/128, 1/409600);
      assert.equal(map.heightmap.data.remaining(), 257 * 257 * 2);
      assert.equal(map.heightmap.data.capacity(), 257 * 257 * 2);
    });

    it('should load textures', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.textures.terrain_shader, "TTerrain");
      assert.equal(map.textures.background_texture_path, "/textures/environment/defaultbackground.dds");
      assert.equal(map.textures.sky_cubemap_texture_path, "/textures/environment/defaultskycube.dds");
      assert.equal(map.textures.environment_cubemaps.length, 1);
      assert.equal(map.textures.environment_cubemaps[0].name, "<default>");
      assert.equal(map.textures.environment_cubemaps[0].file, "/textures/environment/defaultenvcube.dds");
    });

    it('should load lighting', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.closeTo(map.lighting.lighting_multiplier, 1.5, 0.001);

      assert.closeTo(map.lighting.lighting_sun_direction[0], 0.7071, 0.001);
      assert.closeTo(map.lighting.lighting_sun_direction[1], 0.7071, 0.001);
      assert.closeTo(map.lighting.lighting_sun_direction[2], 0, 0.001);

      assert.closeTo(map.lighting.lighting_sun_ambience[0], 0.2, 0.001);
      assert.closeTo(map.lighting.lighting_sun_ambience[1], 0.2, 0.001);
      assert.closeTo(map.lighting.lighting_sun_ambience[2], 0.2, 0.001);

      assert.closeTo(map.lighting.lighting_sun_colour[0], 1, 0.001);
      assert.closeTo(map.lighting.lighting_sun_colour[1], 1, 0.001);
      assert.closeTo(map.lighting.lighting_sun_colour[2], 1, 0.001);

      assert.closeTo(map.lighting.shadow_fill_colour[0], 0.7, 0.001);
      assert.closeTo(map.lighting.shadow_fill_colour[1], 0.7, 0.001);
      assert.closeTo(map.lighting.shadow_fill_colour[2], 0.75, 0.001);

      assert.closeTo(map.lighting.specular_colour[0], 0, 0.001);
      assert.closeTo(map.lighting.specular_colour[1], 0, 0.001);
      assert.closeTo(map.lighting.specular_colour[2], 0, 0.001);
      assert.closeTo(map.lighting.specular_colour[3], 0, 0.001);

      assert.closeTo(map.lighting.bloom, 0.08, 0.001);

      assert.closeTo(map.lighting.fog_colour[0], 0.8, 0.001);
      assert.closeTo(map.lighting.fog_colour[1], 1, 0.001);
      assert.closeTo(map.lighting.fog_colour[2], 0.8, 0.001);

      assert.closeTo(map.lighting.fog_start, 1000, 0.001);

      assert.closeTo(map.lighting.fog_end, 1000, 0.001);
    });

    it('should load water', function(){
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.isTrue(map.water.has_water);
      assert.closeTo(map.water.elevation, 25, 0.001);
      assert.closeTo(map.water.elevation_deep, 20, 0.001);
      assert.closeTo(map.water.elevation_abyss, 10, 0.001);

      assert.closeTo(map.water.surface_colour[0], 0, 0.001);
      assert.closeTo(map.water.surface_colour[1], 0.7, 0.001);
      assert.closeTo(map.water.surface_colour[2], 1.5, 0.001);

      assert.closeTo(map.water.colour_lerp[0], 0.064, 0.001);
      assert.closeTo(map.water.colour_lerp[1], 0.119, 0.001);

      assert.closeTo(map.water.refraction_scale, 0.375, 0.001);
      assert.closeTo(map.water.fresnel_bias, 0.15, 0.001);
      assert.closeTo(map.water.fresnel_power, 1.5, 0.001);
      assert.closeTo(map.water.unit_reflection, 0.5, 0.001);
      assert.closeTo(map.water.sky_reflection, 1.5, 0.001);
      assert.closeTo(map.water.water_sun_shininess, 50, 0.001);
      assert.closeTo(map.water.water_sun_strength, 10, 0.001);

      assert.closeTo(map.water.water_sun_direction[0], 0.0999, 0.001);
      assert.closeTo(map.water.water_sun_direction[1], -0.9626, 0.001);
      assert.closeTo(map.water.water_sun_direction[2], 0.2519, 0.001);

      assert.closeTo(map.water.water_sun_colour[0], 0.8127, 0.001);
      assert.closeTo(map.water.water_sun_colour[1], 0.4741, 0.001);
      assert.closeTo(map.water.water_sun_colour[2], 0.3386, 0.001);

      assert.closeTo(map.water.water_sun_reflection, 5, 0.001);
      assert.closeTo(map.water.water_sun_glow, 0.1, 0.001);
      assert.equal(map.water.water_cubemap_file, "/textures/engine/waterCubemap.dds");
      assert.equal(map.water.water_ramp_file, "/textures/engine/waterramp.dds");

      assert.closeTo(map.water.normal_repeat[0], 0.0009, 0.001);
      assert.closeTo(map.water.normal_repeat[1], 0.0090, 0.001);
      assert.closeTo(map.water.normal_repeat[2], 0.0500, 0.001);
      assert.closeTo(map.water.normal_repeat[3], 0.5000, 0.001);

      assert.closeTo(map.water.water_textures[0].normal_movement[0], 0.5000, 0.001);
      assert.closeTo(map.water.water_textures[0].normal_movement[1], -0.9500, 0.001);
      assert.equal(map.water.water_textures[0].texture_file, "/textures/engine/waves.dds");
      assert.equal(map.water.water_textures[1].texture_file, "/textures/engine/waves.dds");
      assert.equal(map.water.water_textures[2].texture_file, "/textures/engine/waves.dds");
      assert.equal(map.water.water_textures[3].texture_file, "/textures/engine/waves.dds");

      assert.equal(map.water.wave_generators.length, 0);
      /* TODO: Find a map with some wave generators to test

      assert.equal(map.water.wave_generators[0].texture_file, "a");
      assert.equal(map.water.wave_generators[0].ramp_file, "a");
      assert.closeTo(map.water.wave_generators[0].position[0], 0, 0.001);
      assert.closeTo(map.water.wave_generators[0].position[1], 0, 0.001);
      assert.closeTo(map.water.wave_generators[0].position[2], 0, 0.001);
      assert.closeTo(map.water.wave_generators[0].rotation, 0, 0.001);
      assert.closeTo(map.water.wave_generators[0].velocity[0], 0, 0.001);
      assert.closeTo(map.water.wave_generators[0].velocity[1], 0, 0.001);
      assert.closeTo(map.water.wave_generators[0].velocity[2], 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].lifetime_first, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].lifetime_last, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].period_first, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].period_second, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].scale_first, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].scale_second, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].frame_count, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].frame_rate_first, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].frame_rate_second, 0, 0.001);
      assert.closeTo(map.water.wavegenerators[0].strip_count, 0, 0.001);*/
    });

    it('should load layers', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.layers.albedo_data.length, 10);
      assert.equal(map.layers.normal_data.length, 9);

      assert.equal(map.layers.albedo_data[0].texture_file, "/env/evergreen/layers/rockmed_albedo.dds");
      assert.closeTo(map.layers.albedo_data[0].texture_scale, 10.0, 0.001);

      assert.equal(map.layers.normal_data[0].texture_file, "/env/evergreen/layers/SandLight_normals.dds");
      assert.closeTo(map.layers.normal_data[0].texture_scale, 4.0, 0.001);
    });

    it('should load decals', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      // TODO: Find a map with decals to test
      assert.equal(map.decals.decals.length, 0);
      assert.equal(map.decals.decal_groups.length, 0);
    });

    it('should load normal maps', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.normalmap.data.remaining(), 256 * 256 * 4);
      assert.equal(map.normalmap.data.capacity(), 256 * 256 * 4);
      // TODO: first normal check
    });

    it('should load texture maps', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.texturemap.chan0_3.remaining(), 128 * 128 * 4);
      assert.equal(map.texturemap.chan0_3.capacity(), 128 * 128 * 4);
      assert.equal(map.texturemap.chan4_7.remaining(), 128 * 128 * 4);
      assert.equal(map.texturemap.chan4_7.capacity(), 128 * 128 * 4);
      // TODO: first pixel test
    });

    it('should load water maps', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.watermap.watermap_width, 128);
      assert.equal(map.watermap.watermap_height, 128);
      assert.equal(map.watermap.watermap_data.capacity(), 128 * 128 * 4)
      assert.equal(map.watermap.foam_mask_width, 128);
      assert.equal(map.watermap.foam_mask_height, 128);
      assert.equal(map.watermap.foam_mask_data.capacity(), 128 * 128);
      assert.equal(map.watermap.flatness_width, 128);
      assert.equal(map.watermap.flatness_height, 128);
      assert.equal(map.watermap.flatness_data.capacity(), 128 * 128);
      assert.equal(map.watermap.depth_bias_width, 128);
      assert.equal(map.watermap.depth_bias_height, 128);
      assert.equal(map.watermap.depth_bias_data.capacity(), 128 * 128);
      assert.equal(map.watermap.terrain_type_width, 256);
      assert.equal(map.watermap.terrain_type_height, 256);
      assert.equal(map.watermap.terrain_type_data.capacity(), 256 * 256);

      // TODO: first pixel test
    });

    it('should load props', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.props.props.length, 908);
      assert.equal(map.props.props[0].blueprint_path, "/env/evergreen/props/trees/oak01_s2_prop.bp");
      assert.closeTo(map.props.props[0].position[0], 43.70, 0.01);
      assert.closeTo(map.props.props[0].position[1], 75.95, 0.01);
      assert.closeTo(map.props.props[0].position[2], 149.47, 0.01);
      assert.closeTo(map.props.props[0].rotation_x[0], 0.85, 0.01);
      assert.closeTo(map.props.props[0].rotation_x[1], 0.00, 0.01);
      assert.closeTo(map.props.props[0].rotation_x[2], 0.52, 0.01);
      assert.closeTo(map.props.props[0].rotation_y[0], 0.00, 0.01);
      assert.closeTo(map.props.props[0].rotation_y[1], 1.00, 0.01);
      assert.closeTo(map.props.props[0].rotation_y[2], 0, 0.01);
      assert.closeTo(map.props.props[0].rotation_z[0], -0.52, 0.01);
      assert.closeTo(map.props.props[0].rotation_z[1], 0, 0.01);
      assert.closeTo(map.props.props[0].rotation_z[2], 0.85, 0.01);
      assert.closeTo(map.props.props[0].scale[0], 1.00, 0.01);
      assert.closeTo(map.props.props[0].scale[1], 1.00, 0.01);
      assert.closeTo(map.props.props[0].scale[2], 1.00, 0.01);
    });
  });



  describe('creating new', function() {
    const default_5x5_map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 0 // 5x5
    };

    const default_20x20_map_args = {
      name: 'x',
      author: 'x',
      description: 'x',
      size: 2 // 20x20
    };

    it('should create correct size preview image', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      assert.equal(256 * 256 * 4, map.preview_image.data.capacity());
    });

    it('should create correct size heightmap', function() {
      let map_5x5 = new sc.map();
      map_5x5.create(default_5x5_map_args);

      assert.equal(256, map_5x5.header.width);
      assert.equal(256, map_5x5.header.height);

      let map_20x20 = new sc.map();
      map_20x20.create(default_20x20_map_args);

      assert.equal(1024, map_20x20.header.width);
      assert.equal(1024, map_20x20.header.height);
    });

    it('should fill heightmap with default height if not specified', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      assert.equal(1024 * 32, map.heightmap.data.readUint16());
    });

    it('should fill heightmap with custom height if specified', function() {
      const custom_height_map_args = {
        name: 'x',
        author: 'x',
        description: 'x',
        size: 0, // 5x5
        default_height: 42
      };
      let map = new sc.map();
      map.create(custom_height_map_args);

      assert.equal(42, map.heightmap.data.readUint16());
    });

    it('should set default textures if not specified', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      assert.equal(map.textures.terrain_shader, "TTerrain");
      assert.equal(map.textures.background_texture_path, "/textures/environment/defaultbackground.dds");
      assert.equal(map.textures.sky_cubemap_texture_path, "/textures/environment/defaultskycube.dds");
      assert.equal(map.textures.environment_cubemaps.length, 1);
      assert.equal(map.textures.environment_cubemaps[0].name, "<default>");
      assert.equal(map.textures.environment_cubemaps[0].file, "/textures/environment/defaultenvcube.dds");
    });

    it('should set default lighting if not specified', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      assert.closeTo(map.lighting.lighting_multiplier, 1.5, 0.001);

      assert.closeTo(map.lighting.lighting_sun_direction[0], 0.7071, 0.001);
      assert.closeTo(map.lighting.lighting_sun_direction[1], 0.7071, 0.001);
      assert.closeTo(map.lighting.lighting_sun_direction[2], 0, 0.001);

      assert.closeTo(map.lighting.lighting_sun_ambience[0], 0.2, 0.001);
      assert.closeTo(map.lighting.lighting_sun_ambience[1], 0.2, 0.001);
      assert.closeTo(map.lighting.lighting_sun_ambience[2], 0.2, 0.001);

      assert.closeTo(map.lighting.lighting_sun_colour[0], 1, 0.001);
      assert.closeTo(map.lighting.lighting_sun_colour[1], 1, 0.001);
      assert.closeTo(map.lighting.lighting_sun_colour[2], 1, 0.001);

      assert.closeTo(map.lighting.shadow_fill_colour[0], 0.7, 0.001);
      assert.closeTo(map.lighting.shadow_fill_colour[1], 0.7, 0.001);
      assert.closeTo(map.lighting.shadow_fill_colour[2], 0.75, 0.001);

      assert.closeTo(map.lighting.specular_colour[0], 0, 0.001);
      assert.closeTo(map.lighting.specular_colour[1], 0, 0.001);
      assert.closeTo(map.lighting.specular_colour[2], 0, 0.001);
      assert.closeTo(map.lighting.specular_colour[3], 0, 0.001);

      assert.closeTo(map.lighting.bloom, 0.08, 0.001);

      assert.closeTo(map.lighting.fog_colour[0], 0.8, 0.001);
      assert.closeTo(map.lighting.fog_colour[1], 1, 0.001);
      assert.closeTo(map.lighting.fog_colour[2], 0.8, 0.001);

      assert.closeTo(map.lighting.fog_start, 1000, 0.001);

      assert.closeTo(map.lighting.fog_end, 1000, 0.001);
    });

    it('should set default water parameters if not specified', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      // Water levels will default to 75%, 50% and 25% of default height, multiplied
      // by the heightmap scale

      assert.isTrue(map.water.has_water);
      assert.closeTo(map.water.elevation, map.heightmap.scale * map.heightmap.data.readUint16() * 0.75, 0.001);
      assert.closeTo(map.water.elevation_deep, map.heightmap.scale * map.heightmap.data.readUint16() * 0.50, 0.001);
      assert.closeTo(map.water.elevation_abyss, map.heightmap.scale * map.heightmap.data.readUint16() * 0.25, 0.001);

      assert.closeTo(map.water.surface_colour[0], 0, 0.001);
      assert.closeTo(map.water.surface_colour[1], 0.7, 0.001);
      assert.closeTo(map.water.surface_colour[2], 1.5, 0.001);

      assert.closeTo(map.water.colour_lerp[0], 0.064, 0.001);
      assert.closeTo(map.water.colour_lerp[1], 0.119, 0.001);

      assert.closeTo(map.water.refraction_scale, 0.375, 0.001);
      assert.closeTo(map.water.fresnel_bias, 0.15, 0.001);
      assert.closeTo(map.water.fresnel_power, 1.5, 0.001);
      assert.closeTo(map.water.unit_reflection, 0.5, 0.001);
      assert.closeTo(map.water.sky_reflection, 1.5, 0.001);
      assert.closeTo(map.water.water_sun_shininess, 50, 0.001);
      assert.closeTo(map.water.water_sun_strength, 10, 10.001);

      assert.closeTo(map.water.water_sun_direction[0], 0.0999, 0.001);
      assert.closeTo(map.water.water_sun_direction[1], -0.9626, 0.001);
      assert.closeTo(map.water.water_sun_direction[2], 0.2519, 0.001);

      assert.closeTo(map.water.water_sun_colour[0], 0.8127, 0.001);
      assert.closeTo(map.water.water_sun_colour[1], 0.4741, 0.001);
      assert.closeTo(map.water.water_sun_colour[2], 0.3386, 0.001);

      assert.closeTo(map.water.water_sun_reflection, 5, 0.001);
      assert.closeTo(map.water.water_sun_glow, 0.1, 0.001);
      assert.equal(map.water.water_cubemap_file, "/textures/engine/waterCubemap.dds");
      assert.equal(map.water.water_ramp_file, "/textures/engine/waterramp.dds");

      assert.closeTo(map.water.normal_repeat[0], 0.0009, 0.001);
      assert.closeTo(map.water.normal_repeat[1], 0.0090, 0.001);
      assert.closeTo(map.water.normal_repeat[2], 0.0500, 0.001);
      assert.closeTo(map.water.normal_repeat[3], 0.5000, 0.001);

      assert.closeTo(map.water.water_textures[0].normal_movement[0], 0.5000, 0.001);
      assert.closeTo(map.water.water_textures[0].normal_movement[1], -0.9500, 0.001);
      assert.equal(map.water.water_textures[0].texture_file, "/textures/engine/waves.dds");
      assert.equal(map.water.water_textures[1].texture_file, "/textures/engine/waves.dds");
      assert.equal(map.water.water_textures[2].texture_file, "/textures/engine/waves.dds");
      assert.equal(map.water.water_textures[3].texture_file, "/textures/engine/waves.dds");

      assert.equal(map.water.wave_generators.length, 0);
    });

    it('should create default layers if not specified', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      assert.equal(map.layers.albedo_data.length, 10);
      assert.equal(map.layers.normal_data.length, 9);

      assert.equal(map.layers.albedo_data[0].texture_file, "/env/evergreen/layers/rockmed_albedo.dds");
      assert.equal(map.layers.albedo_data[1].texture_file, "/env/swamp/layers/sw_sphagnum_03_albedo.dds");
      assert.equal(map.layers.albedo_data[2].texture_file, "/env/evergreen2/layers/eg_grass001_albedo.dds");
      assert.equal(map.layers.albedo_data[3].texture_file, "/env/evergreen/layers/rockmed_albedo.dds");
      assert.equal(map.layers.albedo_data[4].texture_file, "/env/evergreen2/layers/eg_rock_albedo.dds");
      assert.equal(map.layers.albedo_data[5].texture_file, "");
      assert.equal(map.layers.albedo_data[6].texture_file, "");
      assert.equal(map.layers.albedo_data[7].texture_file, "");
      assert.equal(map.layers.albedo_data[8].texture_file, "");
      assert.equal(map.layers.albedo_data[9].texture_file, "/env/evergreen/layers/macrotexture000_albedo.dds");

      assert.closeTo(map.layers.albedo_data[0].texture_scale, 10.0, 0.001);
      assert.closeTo(map.layers.albedo_data[1].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.albedo_data[2].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.albedo_data[3].texture_scale, 10.0, 0.001);
      assert.closeTo(map.layers.albedo_data[4].texture_scale, 15.0, 0.001);
      assert.closeTo(map.layers.albedo_data[5].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.albedo_data[6].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.albedo_data[7].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.albedo_data[8].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.albedo_data[9].texture_scale, 128.0, 0.001);


      assert.equal(map.layers.normal_data[0].texture_file, "/env/evergreen/layers/SandLight_normals.dds");
      assert.equal(map.layers.normal_data[1].texture_file, "/env/evergreen/layers/grass001_normals.dds");
      assert.equal(map.layers.normal_data[2].texture_file, "/env/evergreen/layers/Dirt001_normals.dds");
      assert.equal(map.layers.normal_data[3].texture_file, "/env/evergreen/layers/RockMed_normals.dds");
      assert.equal(map.layers.normal_data[4].texture_file, "/env/evergreen/layers/snow001_normals.dds");
      assert.equal(map.layers.normal_data[5].texture_file, "");
      assert.equal(map.layers.normal_data[6].texture_file, "");
      assert.equal(map.layers.normal_data[7].texture_file, "");
      assert.equal(map.layers.normal_data[8].texture_file, "");
      assert.closeTo(map.layers.normal_data[0].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[1].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[2].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[3].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[4].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[5].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[6].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[7].texture_scale, 4.0, 0.001);
      assert.closeTo(map.layers.normal_data[8].texture_scale, 4.0, 0.001);
    });

    it('should create customer layers if specified', function() {
      // TODO: This would be useful and relatively easy to implement. It would allow me
      // to define preset texture sets (snowy/desert/setons etc)
    });

    it('should create empty decals', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      assert.equal(map.decals.decals.length, 0);
      assert.equal(map.decals.decal_groups.length, 0);
    });

    it('should create correct size normalmap', function() {
      let map = new sc.map();
      map.create(default_5x5_map_args);

      // TBD - is this the correct direction for the normals?
      assert.equal(256, map.normalmap.width);
      assert.equal(256, map.normalmap.height);
      assert.equal(256 * 256 * 4, map.normalmap.data.capacity());


      let normal = [map.normalmap.data.readUint8(0),
                    map.normalmap.data.readUint8(1),
                    map.normalmap.data.readUint8(2),
                    map.normalmap.data.readUint8(3)];
      assert.equal(0, normal[0]);
      assert.equal(0, normal[1]);
      assert.equal(1, normal[2]);
      assert.equal(0, normal[3]);
    });

    it('should create correct size texturemap', function() {
      let map_5x5 = new sc.map();
      map_5x5.create(default_5x5_map_args);

      assert.equal(128 * 128 * 4, map_5x5.texturemap.chan0_3.capacity());
      assert.equal(128 * 128 * 4, map_5x5.texturemap.chan4_7.capacity());

      let map_20x20 = new sc.map();
      map_20x20.create(default_20x20_map_args);

      assert.equal(512 * 512 * 4, map_20x20.texturemap.chan0_3.capacity());
      assert.equal(512 * 512 * 4, map_20x20.texturemap.chan4_7.capacity());
    });

    it('should create correct watermap', function() {
      let map_5x5 = new sc.map();
      map_5x5.create(default_5x5_map_args);

      assert.equal(128 * 128 * 4, map_5x5.watermap.watermap_data.capacity());
      assert.equal(128, map_5x5.watermap.watermap_width);
      assert.equal(128, map_5x5.watermap.watermap_height);
      assert.equal(128 * 128, map_5x5.watermap.foam_mask_data.capacity());
      assert.equal(128, map_5x5.watermap.foam_mask_width);
      assert.equal(128, map_5x5.watermap.foam_mask_height);
      assert.equal(128 * 128, map_5x5.watermap.flatness_data.capacity());
      assert.equal(128, map_5x5.watermap.flatness_width);
      assert.equal(128, map_5x5.watermap.flatness_height);
      assert.equal(128 * 128, map_5x5.watermap.depth_bias_data.capacity());
      assert.equal(128, map_5x5.watermap.depth_bias_width);
      assert.equal(128, map_5x5.watermap.depth_bias_height);
      assert.equal(256 * 256, map_5x5.watermap.terrain_type_data.capacity());
      assert.equal(256, map_5x5.watermap.terrain_type_width);
      assert.equal(256, map_5x5.watermap.terrain_type_height);

      // Not yet understanding the purpose of these fields, the best I can do is zero their contents.
      assert.equal(0, map_5x5.watermap.watermap_data.readUint8());
      assert.equal(0, map_5x5.watermap.foam_mask_data.readUint8());
      assert.equal(0, map_5x5.watermap.flatness_data.readUint8());
      assert.equal(0, map_5x5.watermap.depth_bias_data.readUint8());
      assert.equal(0, map_5x5.watermap.terrain_type_data.readUint8());
    });

    it('should create empty prop list', function() {
      let map_5x5 = new sc.map();
      map_5x5.create(default_5x5_map_args);

      assert.equal(0, map_5x5.props.props.length);
    });

    it('should create correct metadata', function() {

    });
  });

  describe('saving maps', function() {
    // DXT5 compression in javascript -> slow :(
    this.timeout(10000);

    before('create a map, save it and reload it', function() {
      this.src_map = new sc.map();
      this.src_map.create({
        name: 'x',
        author: 'x',
        description: 'x',
        size: 0 // 5x5
      });

      const roundtrip_buffer = this.src_map.save();

      this.dest_map = new sc.map();
      this.dest_map.load(ByteBuffer.wrap(roundtrip_buffer, ByteBuffer.LITTLE_ENDIAN));
    });

    it('should write header', function() {
      assert.equal(256, this.dest_map.header.width);
      assert.equal(256, this.dest_map.header.height);
    });

    it('should write preview image', function() {
      assert.deepEqual(this.dest_map.preview_image.data.buffer, this.src_map.preview_image.data.buffer);
    });

    it('should write heightmap', function() {
      assert.equal(this.dest_map.heightmap.width, this.src_map.heightmap.width);
      assert.equal(this.dest_map.heightmap.height, this.src_map.heightmap.height);
      assert.closeTo(this.dest_map.heightmap.scale, this.src_map.heightmap.scale, 1/409600);
      assert.deepEqual(this.dest_map.heightmap.data.buffer, this.src_map.heightmap.data.buffer);
    });

    it('should write textures', function() {
      assert.equal(this.dest_map.textures.terrain_shader, this.src_map.textures.terrain_shader);
      assert.equal(this.dest_map.textures.background_texture_path, this.src_map.textures.background_texture_path);
      assert.equal(this.dest_map.textures.sky_cubemap_texture_path, this.src_map.textures.sky_cubemap_texture_path);
      assert.equal(this.dest_map.textures.environment_cubemaps.length, this.src_map.textures.environment_cubemaps.length);

      for (let i = 0; i < this.dest_map.textures.environment_cubemaps.length; i++) {
        assert.equal(this.dest_map.textures.environment_cubemaps[i].name,
                     this.src_map.textures.environment_cubemaps[i].name);
        assert.equal(this.dest_map.textures.environment_cubemaps[i].file,
                     this.src_map.textures.environment_cubemaps[i].file);
      }
    });

    it('should write lighting', function() {
      assert.closeTo(this.dest_map.lighting.lighting_multiplier,       this.src_map.lighting.lighting_multiplier, 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_direction[0], this.src_map.lighting.lighting_sun_direction[0], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_direction[1], this.src_map.lighting.lighting_sun_direction[1], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_direction[2], this.src_map.lighting.lighting_sun_direction[2], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_ambience[0],  this.src_map.lighting.lighting_sun_ambience[0], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_ambience[1],  this.src_map.lighting.lighting_sun_ambience[1], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_ambience[2],  this.src_map.lighting.lighting_sun_ambience[2], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_colour[0],    this.src_map.lighting.lighting_sun_colour[0], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_colour[1],    this.src_map.lighting.lighting_sun_colour[1], 1/409600);
      assert.closeTo(this.dest_map.lighting.lighting_sun_colour[2],    this.src_map.lighting.lighting_sun_colour[2], 1/409600);
      assert.closeTo(this.dest_map.lighting.shadow_fill_colour[0],     this.src_map.lighting.shadow_fill_colour[0], 1/409600);
      assert.closeTo(this.dest_map.lighting.shadow_fill_colour[1],     this.src_map.lighting.shadow_fill_colour[1], 1/409600);
      assert.closeTo(this.dest_map.lighting.shadow_fill_colour[2],     this.src_map.lighting.shadow_fill_colour[2], 1/409600);
      assert.closeTo(this.dest_map.lighting.specular_colour[0],        this.src_map.lighting.specular_colour[0], 1/409600);
      assert.closeTo(this.dest_map.lighting.specular_colour[1],        this.src_map.lighting.specular_colour[1], 1/409600);
      assert.closeTo(this.dest_map.lighting.specular_colour[2],        this.src_map.lighting.specular_colour[2], 1/409600);
      assert.closeTo(this.dest_map.lighting.specular_colour[3],        this.src_map.lighting.specular_colour[3], 1/409600);
      assert.closeTo(this.dest_map.lighting.bloom,                     this.src_map.lighting.bloom, 1/409600);
      assert.closeTo(this.dest_map.lighting.fog_colour[0],             this.src_map.lighting.fog_colour[0], 1/409600);
      assert.closeTo(this.dest_map.lighting.fog_colour[1],             this.src_map.lighting.fog_colour[1], 1/409600);
      assert.closeTo(this.dest_map.lighting.fog_colour[2],             this.src_map.lighting.fog_colour[2], 1/409600);
      assert.closeTo(this.dest_map.lighting.fog_start,                 this.src_map.lighting.fog_start, 1/409600);
      assert.closeTo(this.dest_map.lighting.fog_end,                   this.src_map.lighting.fog_end, 1/409600);
    });

    it('should write water', function() {
      assert.equal(this.dest_map.water.has_water,                               this.src_map.water.has_water);
      assert.closeTo(this.dest_map.water.elevation,                             this.src_map.water.elevation, 1/409600);
      assert.closeTo(this.dest_map.water.elevation_deep,                        this.src_map.water.elevation_deep, 1/409600);
      assert.closeTo(this.dest_map.water.elevation_abyss,                       this.src_map.water.elevation_abyss, 1/409600);
      assert.closeTo(this.dest_map.water.surface_colour[0],                     this.src_map.water.surface_colour[0], 1/409600);
      assert.closeTo(this.dest_map.water.surface_colour[1],                     this.src_map.water.surface_colour[1], 1/409600);
      assert.closeTo(this.dest_map.water.surface_colour[2],                     this.src_map.water.surface_colour[2], 1/409600);
      assert.closeTo(this.dest_map.water.colour_lerp[0],                        this.src_map.water.colour_lerp[0], 1/409600);
      assert.closeTo(this.dest_map.water.colour_lerp[1],                        this.src_map.water.colour_lerp[1], 1/409600);
      assert.closeTo(this.dest_map.water.refraction_scale,                      this.src_map.water.refraction_scale, 1/409600);
      assert.closeTo(this.dest_map.water.fresnel_bias,                          this.src_map.water.fresnel_bias, 1/409600);
      assert.closeTo(this.dest_map.water.fresnel_power,                         this.src_map.water.fresnel_power, 1/409600);
      assert.closeTo(this.dest_map.water.unit_reflection,                       this.src_map.water.unit_reflection, 1/409600);
      assert.closeTo(this.dest_map.water.sky_reflection,                        this.src_map.water.sky_reflection, 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_shininess,                   this.src_map.water.water_sun_shininess, 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_strength,                    this.src_map.water.water_sun_strength, 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_direction[0],                this.src_map.water.water_sun_direction[0], 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_direction[1],                this.src_map.water.water_sun_direction[1], 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_direction[2],                this.src_map.water.water_sun_direction[2], 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_colour[0],                   this.src_map.water.water_sun_colour[0], 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_colour[1],                   this.src_map.water.water_sun_colour[1], 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_colour[2],                   this.src_map.water.water_sun_colour[2], 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_reflection,                  this.src_map.water.water_sun_reflection, 1/409600);
      assert.closeTo(this.dest_map.water.water_sun_glow,                        this.src_map.water.water_sun_glow, 1/409600);
      assert.equal(this.dest_map.water.water_cubemap_file,                      this.src_map.water.water_cubemap_file);
      assert.equal(this.dest_map.water.water_ramp_file,                         this.src_map.water.water_ramp_file);
      assert.closeTo(this.dest_map.water.normal_repeat[0],                      this.src_map.water.normal_repeat[0], 1/409600);
      assert.closeTo(this.dest_map.water.normal_repeat[1],                      this.src_map.water.normal_repeat[1], 1/409600);
      assert.closeTo(this.dest_map.water.normal_repeat[2],                      this.src_map.water.normal_repeat[2], 1/409600);
      assert.closeTo(this.dest_map.water.normal_repeat[3],                      this.src_map.water.normal_repeat[3], 1/409600);
      assert.closeTo(this.dest_map.water.water_textures[0].normal_movement[0],  this.src_map.water.water_textures[0].normal_movement[0], 1/409600);
      assert.closeTo(this.dest_map.water.water_textures[0].normal_movement[1],  this.src_map.water.water_textures[0].normal_movement[1], 1/409600);
      assert.equal(this.dest_map.water.water_textures[0].texture_file,          this.src_map.water.water_textures[0].texture_file);
      assert.equal(this.dest_map.water.water_textures[1].texture_file,          this.src_map.water.water_textures[1].texture_file);
      assert.equal(this.dest_map.water.water_textures[2].texture_file,          this.src_map.water.water_textures[2].texture_file);
      assert.equal(this.dest_map.water.water_textures[3].texture_file,          this.src_map.water.water_textures[3].texture_file);
      assert.equal(this.dest_map.water.wave_generators.length,                  this.src_map.water.wave_generators.length);
    });

    it('should write layers', function() {
      assert.equal(this.dest_map.layers.albedo_data.length, this.src_map.layers.albedo_data.length);
      assert.equal(this.dest_map.layers.normal_data.length, this.src_map.layers.normal_data.length);

      assert.equal(this.dest_map.layers.albedo_data[0].texture_file, this.src_map.layers.albedo_data[0].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[1].texture_file, this.src_map.layers.albedo_data[1].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[2].texture_file, this.src_map.layers.albedo_data[2].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[3].texture_file, this.src_map.layers.albedo_data[3].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[4].texture_file, this.src_map.layers.albedo_data[4].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[5].texture_file, this.src_map.layers.albedo_data[5].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[6].texture_file, this.src_map.layers.albedo_data[6].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[7].texture_file, this.src_map.layers.albedo_data[7].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[8].texture_file, this.src_map.layers.albedo_data[8].texture_file);
      assert.equal(this.dest_map.layers.albedo_data[9].texture_file, this.src_map.layers.albedo_data[9].texture_file);

      assert.equal(this.dest_map.layers.albedo_data[0].texture_scale, this.src_map.layers.albedo_data[0].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[1].texture_scale, this.src_map.layers.albedo_data[1].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[2].texture_scale, this.src_map.layers.albedo_data[2].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[3].texture_scale, this.src_map.layers.albedo_data[3].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[4].texture_scale, this.src_map.layers.albedo_data[4].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[5].texture_scale, this.src_map.layers.albedo_data[5].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[6].texture_scale, this.src_map.layers.albedo_data[6].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[7].texture_scale, this.src_map.layers.albedo_data[7].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[8].texture_scale, this.src_map.layers.albedo_data[8].texture_scale);
      assert.equal(this.dest_map.layers.albedo_data[9].texture_scale, this.src_map.layers.albedo_data[9].texture_scale);


      assert.equal(this.dest_map.layers.normal_data[0].texture_file, this.src_map.layers.normal_data[0].texture_file);
      assert.equal(this.dest_map.layers.normal_data[1].texture_file, this.src_map.layers.normal_data[1].texture_file);
      assert.equal(this.dest_map.layers.normal_data[2].texture_file, this.src_map.layers.normal_data[2].texture_file);
      assert.equal(this.dest_map.layers.normal_data[3].texture_file, this.src_map.layers.normal_data[3].texture_file);
      assert.equal(this.dest_map.layers.normal_data[4].texture_file, this.src_map.layers.normal_data[4].texture_file);
      assert.equal(this.dest_map.layers.normal_data[5].texture_file, this.src_map.layers.normal_data[5].texture_file);
      assert.equal(this.dest_map.layers.normal_data[6].texture_file, this.src_map.layers.normal_data[6].texture_file);
      assert.equal(this.dest_map.layers.normal_data[7].texture_file, this.src_map.layers.normal_data[7].texture_file);
      assert.equal(this.dest_map.layers.normal_data[8].texture_file, this.src_map.layers.normal_data[8].texture_file);

      assert.equal(this.dest_map.layers.normal_data[0].texture_scale, this.src_map.layers.normal_data[0].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[1].texture_scale, this.src_map.layers.normal_data[1].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[2].texture_scale, this.src_map.layers.normal_data[2].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[3].texture_scale, this.src_map.layers.normal_data[3].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[4].texture_scale, this.src_map.layers.normal_data[4].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[5].texture_scale, this.src_map.layers.normal_data[5].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[6].texture_scale, this.src_map.layers.normal_data[6].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[7].texture_scale, this.src_map.layers.normal_data[7].texture_scale);
      assert.equal(this.dest_map.layers.normal_data[8].texture_scale, this.src_map.layers.normal_data[8].texture_scale);
    });

    it('should write decals', function() {
      // Not really testing very well here, but I don't have an input with decals
      assert.equal(this.dest_map.decals.decals.length, this.src_map.decals.decals.length);
      assert.equal(this.dest_map.decals.decal_groups.length, this.src_map.decals.decal_groups.length);
    });

    it('should write normal maps', function() {
      assert.equal(this.dest_map.normalmap.data[0], this.src_map.normalmap.data[0]);
      assert.equal(this.dest_map.normalmap.data[1], this.src_map.normalmap.data[1]);
      assert.equal(this.dest_map.normalmap.data[2], this.src_map.normalmap.data[2]);
      assert.equal(this.dest_map.normalmap.data[3], this.src_map.normalmap.data[3]);

      assert.equal(this.dest_map.normalmap.width, this.src_map.normalmap.width);
      assert.equal(this.dest_map.normalmap.height, this.src_map.normalmap.height);
      assert.equal(this.dest_map.normalmap.data.capacity(), this.src_map.normalmap.data.capacity());
    });

    it('should write texture maps', function() {
      assert.equal(this.dest_map.texturemap.chan0_3.capacity(), this.src_map.texturemap.chan0_3.capacity());
      assert.equal(this.dest_map.texturemap.chan0_3[0], this.src_map.texturemap.chan0_3[0]);
      assert.equal(this.dest_map.texturemap.chan0_3[1], this.src_map.texturemap.chan0_3[1]);
      assert.equal(this.dest_map.texturemap.chan0_3[2], this.src_map.texturemap.chan0_3[2]);
      assert.equal(this.dest_map.texturemap.chan0_3[3], this.src_map.texturemap.chan0_3[3]);

      assert.equal(this.dest_map.texturemap.chan4_7.capacity(), this.src_map.texturemap.chan4_7.capacity());
      assert.equal(this.dest_map.texturemap.chan4_7[0], this.src_map.texturemap.chan4_7[0]);
      assert.equal(this.dest_map.texturemap.chan4_7[1], this.src_map.texturemap.chan4_7[1]);
      assert.equal(this.dest_map.texturemap.chan4_7[2], this.src_map.texturemap.chan4_7[2]);
      assert.equal(this.dest_map.texturemap.chan4_7[3], this.src_map.texturemap.chan4_7[3]);
    });

    it('should write water maps', function() {
      assert.deepEqual(this.dest_map.watermap.watermap_data.buffer,     this.src_map.watermap.watermap_data.buffer.buffer);
      assert.deepEqual(this.dest_map.watermap.foam_mask_data.buffer,    this.src_map.watermap.foam_mask_data.buffer);
      assert.deepEqual(this.dest_map.watermap.flatness_data.buffer,     this.src_map.watermap.flatness_data.buffer);
      assert.deepEqual(this.dest_map.watermap.depth_bias_data.buffer,   this.src_map.watermap.depth_bias_data.buffer);
      assert.deepEqual(this.dest_map.watermap.terrain_type_data.buffer, this.src_map.watermap.terrain_type_data.buffer);
      assert.equal(this.dest_map.watermap.watermap_width,               this.src_map.watermap.watermap_width);
      assert.equal(this.dest_map.watermap.watermap_height,              this.src_map.watermap.watermap_height);
      assert.equal(this.dest_map.watermap.foam_mask_width,              this.src_map.watermap.foam_mask_width);
      assert.equal(this.dest_map.watermap.foam_mask_height,             this.src_map.watermap.foam_mask_height);
      assert.equal(this.dest_map.watermap.flatness_width,               this.src_map.watermap.flatness_width);
      assert.equal(this.dest_map.watermap.flatness_height,              this.src_map.watermap.flatness_height);
      assert.equal(this.dest_map.watermap.depth_bias_width,             this.src_map.watermap.depth_bias_width);
      assert.equal(this.dest_map.watermap.depth_bias_height,            this.src_map.watermap.depth_bias_height);
      assert.equal(this.dest_map.watermap.terrain_type_width,           this.src_map.watermap.terrain_type_width);
      assert.equal(this.dest_map.watermap.terrain_type_height,          this.src_map.watermap.terrain_type_height);
    });

    it('should write props', function() {
      // TODO: Check props are serialised right!
      assert.equal(this.dest_map.props.props.length, this.src_map.props.props.length);
    });
  });

  describe('zip loading', function() {
    it('should load scripts and scmap from zipfile', function() {
    });

    it('should load scenario first, and use that to determine other filenames', function() {
    });
  });

  describe('zip saving', function() {
  });
});
