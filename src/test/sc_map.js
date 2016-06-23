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

      // DDS header + 256x256 * 4 (512x512 with 4:1 compression)
      assert.equal(map.preview_image.data.remaining(), 128 + 256 * 256 * 4);
    });

    it('should load heightmap', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.heightmap.width, 256);
      assert.equal(map.heightmap.height, 256);
      assert.closeTo(map.heightmap.scale, 1/128, 1/409600);
      assert.equal(map.heightmap.data.remaining(), 257 * 257 * 2);
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
      assert.closeTo(map.water.water_sun_strength, 0, 10.001);

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

      assert.equal(map.normalmap.data.remaining(), 256 * 256 * 4)
      // TODO: first normal check
    });

    it('should load texture maps', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.texturemap.chan0_3.remaining(), 128 * 128 * 4)
      assert.equal(map.texturemap.chan4_7.remaining(), 128 * 128 * 4)
      // TODO: first pixel test
    });

    it('should load water maps', function() {
      let map_data_bb = ByteBuffer.wrap(map_data, ByteBuffer.LITTLE_ENDIAN);
      let map = new sc.map();
      map.load(map_data_bb);

      assert.equal(map.watermap.watermap_width, 128);
      assert.equal(map.watermap.watermap_height, 128);
      assert.equal(map.watermap.foam_mask_width, 128);
      assert.equal(map.watermap.foam_mask_height, 128);
      assert.equal(map.watermap.flatness_width, 128);
      assert.equal(map.watermap.flatness_height, 128);
      assert.equal(map.watermap.depth_bias_width, 128);
      assert.equal(map.watermap.depth_bias_height, 128);
      assert.equal(map.watermap.terrain_type_width, 256);
      assert.equal(map.watermap.terrain_type_height, 256);

      // TODO: first pixel test
    });
  });
});
