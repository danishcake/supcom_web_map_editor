/**
 * Supreme Command Forged Alliance Map format
 * Loads and saves scmap files and associated lua scripts
 * Derived from my C++ port of the C# HarzardX map parsing code
 * As such it's not very Javascript-y code. THIS IS A GOOD THING,
 * JAVASCRIPT IS A BULLSHIT LANGUAGE THAT SHOULD HAVE BEEN DROWNED
 * A LONG TIME AGO.
 *
 * TODO: Add readFloat32Array helper function
 */
import check from "./sc_check";
import {sc_dds} from "./sc_dds";


/**
 * Initial header
 */
class sc_map_header {
  constructor() {
    this.__width = undefined;
    this.__height = undefined;
  }

  get width() { return this.__width; }
  get height() { return this.__height; }

  load(input) {
    let magic = input.readInt32();                  // Must be 0x1a70614d
    let major_version = input.readInt32();          // Always 2?
    let unknown_1 = input.readInt32();              // Always 2
    let unknown_2 = input.readInt32();              // Always 0xEDFEEFBE
    let width = input.readFloat32();
    let height = input.readFloat32();
    let unknown_3 = input.readInt32();              // Always 0
    let unknown_4 = input.readInt16();              // Always 0

    // Sanity checks
    check.equal(magic, 0x1a70614d, "Incorrect magic number in header");
    check.equal(major_version, 2, "Incorrect major version in header");

    // Record fields
    this.__width = width;
    this.__height = height;
  }
  save(output) {} // TODO: Add serialise to ByteBuffer
}

/**
 * Preview image
 */
class sc_map_preview_image {
  constructor() {
    this.__data = undefined;
  }

  get data() { return this.__data; }

  load(input) {
    let preview_image_length = input.readInt32();
    check.between(0, 256*256*4+128, preview_image_length, "Invalid preview image length");
    let data = input.readBytes(preview_image_length);

    // Minor version is included in this section for lack of a better place to put it
    // TODO: Restore this to 56 when I find some good test data
    let minor_version = input.readInt32();
    check.equal(56, minor_version, "Incorrect minor version in header");

    // Record fields
    this.__data = data;
  }
  save(output) {} // TODO: Add serialise to ByteBuffer
}

/**
 * Heightmap
 */
class sc_map_heightmap {
  constructor() {
    this.__width = undefined;
    this.__height = undefined;
    this.__scale = undefined;
    this.__data = undefined;
  }

  get width() { return this.__width; }
  get height() { return this.__height; }
  get scale() { return this.__scale; }
  get data() { return this.__data; }

  load(input) {
    let width = input.readInt32();
    let height = input.readInt32();
    let scale = input.readFloat32();     // Vertical scale (typicaly 1/128)

    // Sanity checks
    check.one_of([256, 512, 1024, 2048, 4096], width, "Invalid heightmap width");
    check.one_of([256, 512, 1024, 2048, 4096], height, "Invalid heightmap height");

    let data = input.readBytes((width + 1) * (height + 1) * 2);

    // Record fields
    this.__width = width;
    this.__height = height;
    this.__scale = scale;
    this.__data = data;
  }
  save(output) {} // TODO: Add serialise to ByteBuffer
}

/**
 * Environment cubemap definition
 */
class sc_map_environment_cubemap
{
  constructor(name, file) {
    this.__name = name;
    this.__file = file;
  }

  get name() { return this.__name; }
  get file() { return this.__file; }
};

/**
 * Textures and cubemaps
 */
class sc_map_textures {
  constructor() {
    this.__terrain_shader = undefined;
    this.__background_texture_path = undefined;
    this.__sky_cubemap_texture_path = undefined;
    this.__environment_cubemaps = [];
  }

  get terrain_shader() { return this.__terrain_shader; }
  get background_texture_path() { return this.__background_texture_path; }
  get sky_cubemap_texture_path() { return this.__sky_cubemap_texture_path; }
  get environment_cubemaps() { return this.__environment_cubemaps; }

  load(input) {
    let null_byte = input.readByte(); // Random null byte
    let terrain_shader = input.readCString(); // Null terminated strings
    let background_texture_path = input.readCString();
    let sky_cubemap_texture_path = input.readCString();

    // Sanity checks
    check.between(1, 512, terrain_shader.length, "Suspicious terrain shader name length");
    check.between(1, 512, background_texture_path.length, "Suspicious background texture name length");
    check.between(1, 512, sky_cubemap_texture_path.length, "Suspicious sky cubemap texture name length");

    // Environment cubemaps
    let environment_cubemaps_count = input.readInt32();
    let environment_cubemaps = [];
    check.between(0, 51200, environment_cubemaps_count, "Suspicious number of environment cubemaps");
    for (let i = 0; i < environment_cubemaps_count; i++) {
      let name = input.readCString();
      let file = input.readCString();
      check.between(1, 512, background_texture_path.length, "Suspicious environment cubemap name length");
      check.between(1, 512, background_texture_path.length, "Suspicious environment cubemap filename length");
      environment_cubemaps.push(new sc_map_environment_cubemap(name, file));
    }

    // Record fields
    this.__terrain_shader = terrain_shader;
    this.__background_texture_path = background_texture_path;
    this.__sky_cubemap_texture_path = sky_cubemap_texture_path;
    this.__environment_cubemaps = environment_cubemaps;
  }
  save(output) {} // TODO: Add serialise to ByteBuffer
}

/**
 * Lighting
 */
class sc_map_lighting {
  constructor() {
    this.__lighting_multiplier = undefined;
    this.__lighting_sun_direction = [undefined, undefined, undefined];
    this.__lighting_sun_ambience = [undefined, undefined, undefined];
    this.__lighting_sun_colour = [undefined, undefined, undefined];
    this.__shadow_fill_colour = [undefined, undefined, undefined];
    this.__specular_colour = [undefined, undefined, undefined, undefined];
    this.__bloom = undefined;
    this.__fog_colour = [undefined, undefined, undefined];
    this.__fog_start = undefined;
    this.__fog_end = undefined;
  }

  get lighting_multiplier() { return this.__lighting_multiplier; }
  get lighting_sun_direction() { return this.__lighting_sun_direction; }
  get lighting_sun_ambience() { return this.__lighting_sun_ambience; }
  get lighting_sun_colour(){ return this.__lighting_sun_colour; }
  get shadow_fill_colour() { return this.__shadow_fill_colour; }
  get specular_colour() { return this.__specular_colour; }
  get bloom() { return this.__bloom; }
  get fog_colour() { return this.__fog_colour; }
  get fog_start() { return this.__fog_start; }
  get fog_end() { return this.__fog_end; }

  load(input) {
    let lighting_multipler = input.readFloat32();
    let lighting_sun_direction = [input.readFloat32(),
                                  input.readFloat32(),
                                  input.readFloat32()];
    let lighting_sun_ambience = [input.readFloat32(),
                                 input.readFloat32(),
                                 input.readFloat32()];
    let lighting_sun_colour = [input.readFloat32(),
                               input.readFloat32(),
                               input.readFloat32()];
    let shadow_fill_colour = [input.readFloat32(),
                              input.readFloat32(),
                              input.readFloat32()];
    let specular_colour = [input.readFloat32(),
                           input.readFloat32(),
                           input.readFloat32(),
                           input.readFloat32()];
    let bloom = input.readFloat32();
    let fog_colour = [input.readFloat32(),
                      input.readFloat32(),
                      input.readFloat32()];
    let fog_start = input.readFloat32();
    let fog_end = input.readFloat32();

    // Can't think of any good sanity checks to run
    // Record fields
    this.__lighting_multiplier = lighting_multipler;
    this.__lighting_sun_direction = lighting_sun_direction;
    this.__lighting_sun_ambience = lighting_sun_ambience;
    this.__lighting_sun_colour = lighting_sun_colour;
    this.__shadow_fill_colour = shadow_fill_colour;
    this.__specular_colour = specular_colour;
    this.__bloom = bloom;
    this.__fog_colour = fog_colour;
    this.__fog_start = fog_start;
    this.__fog_end = fog_end;
  }
  save(output) {} // TODO: Add serialise to ByteBuffer
}

/**
 * Water texture
 */
class sc_map_water_texture {
  constructor(normal_movement, texture_file){
    this.__normal_movement = normal_movement;
    this.__texture_file = texture_file;
  }

  get normal_movement() { return this.__normal_movement; }
  get texture_file() { return this.__texture_file; }

  load(input) {
    this.__normal_movement = [input.readFloat32(), input.readFloat32()];
    this.__texture_file = input.readCString();

    // Sanity checks
    check.between(1, 512, this.__texture_file.length, "Suspicious water texture filename length");
  }
  save(output) {}
}

/**
 * Wave generator
 */
class sc_map_wave_generator {
  constructor() {
    this.__texture_file = undefined;
    this.__ramp_file = undefined;
    this.__position = [undefined, undefined, undefined];
    this.__rotation = undefined;
    this.__velocity = [undefined, undefined, undefined];
    this.__lifetime_first = undefined;
    this.__lifetime_last = undefined;
    this.__period_first = undefined;
    this.__period_second = undefined;
    this.__scale_first = undefined;
    this.__scale_second = undefined;
    this.__frame_count = undefined;
    this.__frame_rate_first = undefined;
    this.__frame_rate_second = undefined;
    this.__strip_count = undefined;
  }

  get texture_file() { return this.__texture_file; }
  get ramp_file() { return this.__ramp_file; }
  get position() { return this.__position; }
  get rotation() { return this.__rotation; }
  get velocity() { return this.__velocity; }
  get lifetime_first() { return this.__lifetime_first; }
  get lifetime_last() { return this.__lifetime_last; }
  get period_first() { return this.__period_first; }
  get period_second() { return this.__period_second; }
  get scale_first() { return this.__scale_first; }
  get scale_second() { return this.__scale_second; }
  get frame_count() { return this.__frame_count; }
  get frame_rate_first() { return this.__frame_rate_first; }
  get frame_rate_second() { return this.__frame_rate_second; }
  get strip_count() { return this.__strip_count; }

  load(input) {
    this.__texture_file = input.readCString();
    this.__ramp_file = input.readCString();

    this.__position = [input.readFloat32(),
                       input.readFloat32(),
                       input.readFloat32()];
    this.__rotation = input.readFloat32();
    this.__velocity = [input.readFloat32(),
                       input.readFloat32(),
                       input.readFloat32()];
    this.__lifetime_first = input.readFloat32();
    this.__lifetime_last = input.readFloat32();
    this.__period_first = input.readFloat32();
    this.__period_last = input.readFloat32();
    this.__scale_first = input.readFloat32();
    this.__scale_last = input.readFloat32();
    this.__frame_count = input.readFloat32(); // TODO: Check these are not int32_t
    this.__frame_rate_first = input.readFloat32();
    this.__frame_rate_second = input.readFloat32();
    this.__strip_count = input.readFloat32();

    // Sanity checks
    check.between(1, 512, this.__texture_file.length, "Suspicious wave texture filename length");
    check.between(1, 512, this.__ramp_file.length, "Suspicious ramp filename length");
  }

  save(output) {}
}

/**
 * Water
 */
class sc_map_water {
  constructor() {
    this.__has_water = undefined;
    this.__elevation = undefined;
    this.__elevation_deep = undefined;
    this.__elevation_abyss = undefined;
    this.__surface_colour = [undefined, undefined, undefined];
    this.__colour_lerp = [undefined, undefined];
    this.__refraction_scale = undefined;
    this.__fresnel_bias = undefined;
    this.__fresnel_power = undefined;
    this.__unit_reflection = undefined;
    this.__sky_reflection = undefined;
    this.__water_sun_shininess = undefined;
    this.__water_sun_strength = undefined;
    this.__water_sun_direction = [undefined, undefined, undefined];
    this.__water_sun_colour = [undefined, undefined, undefined];
    this.__water_sun_reflection = undefined;
    this.__water_sun_glow = undefined;
    this.__water_cubemap_file = undefined;
    this.__water_ramp_file = undefined;
    this.__normal_repeat = [undefined, undefined, undefined, undefined];
    this.__water_textures = [undefined, undefined, undefined, undefined];
    this.__wave_generators = [];
  }

  get has_water() { return this.__has_water; }
  get elevation() { return this.__elevation; }
  get elevation_deep() { return this.__elevation_deep; }
  get elevation_abyss() { return this.__elevation_abyss; }
  get surface_colour() { return this.__surface_colour; }
  get colour_lerp() { return this.__colour_lerp; }
  get refraction_scale() { return this.__refraction_scale; }
  get fresnel_bias() { return this.__fresnel_bias; }
  get fresnel_power() { return this.__fresnel_power; }
  get unit_reflection() { return this.__unit_reflection; }
  get sky_reflection() { return this.__sky_reflection; }
  get water_sun_shininess() { return this.__water_sun_shininess; }
  get water_sun_strength() { return this.__water_sun_strength; }
  get water_sun_direction() { return this.__water_sun_direction; }
  get water_sun_colour() { return this.__water_sun_colour; }
  get water_sun_reflection() { return this.__water_sun_reflection; }
  get water_sun_glow() { return this.__water_sun_glow; }
  get water_cubemap_file() { return this.__water_cubemap_file; }
  get water_ramp_file() { return this.__water_ramp_file; }
  get normal_repeat() { return this.__normal_repeat; }
  get water_textures() { return this.__water_textures; }
  get wave_generators() { return this.__wave_generators; }

  load(input) {
    let has_water = input.readByte() !== 0;
    let elevation = input.readFloat32();
    let elevation_deep = input.readFloat32();
    let elevation_abyss = input.readFloat32();
    let surface_colour = [input.readFloat32(),
                          input.readFloat32(), input.readFloat32()];
    let colour_lerp = [input.readFloat32(),
                       input.readFloat32()];
    let refraction_scale = input.readFloat32();
    let fresnel_bias = input.readFloat32();
    let fresnel_power = input.readFloat32();
    let unit_reflection = input.readFloat32();
    let sky_reflection = input.readFloat32();
    let water_sun_shininess = input.readFloat32();
    let water_sun_strength = input.readFloat32();
    let water_sun_direction = [input.readFloat32(),
                               input.readFloat32(),
                               input.readFloat32()];
    let water_sun_colour = [input.readFloat32(),
                            input.readFloat32(),
                            input.readFloat32()];
    let water_sun_reflection = input.readFloat32();
    let water_sun_glow = input.readFloat32();
    let water_cubemap_file = input.readCString();
    let water_ramp_file = input.readCString();
    let normal_repeat = [input.readFloat32(),
                         input.readFloat32(),
                         input.readFloat32(),
                         input.readFloat32()];
    let water_textures = [];
    for (let i = 0; i < 4; i++) {
      let water_texture = new sc_map_water_texture();
      water_texture.load(input);
      water_textures.push(water_texture);
    }

    let wave_generator_count = input.readInt32();
    let wave_generators = [];
    for (let i = 0; i < wave_generator_count; i++) {
      let wave_generator = new sc_map_wave_generator();
      wave_generator.load(input);
      wave_generators.push(wave_generator);
    }


    // Sanity checks
    check.between(0, elevation, elevation_deep, "Deep elevation higher than elevation");
    check.between(0, elevation_deep, elevation_abyss, "Abyss elevation higher than deep elevation");
    
    // Record fields
    this.__has_water = has_water;
    this.__elevation = elevation;
    this.__elevation_deep = elevation_deep;
    this.__elevation_abyss = elevation_abyss;
    this.__surface_colour = surface_colour;
    this.__colour_lerp = colour_lerp;
    this.__refraction_scale = refraction_scale;
    this.__fresnel_bias = fresnel_bias;
    this.__fresnel_power = fresnel_power;
    this.__unit_reflection = unit_reflection;
    this.__sky_reflection = sky_reflection;
    this.__water_sun_shininess = water_sun_shininess;
    this.__water_sun_strength = water_sun_strength;
    this.__water_sun_direction = water_sun_direction;
    this.__water_sun_colour = water_sun_colour;
    this.__water_sun_reflection = water_sun_reflection;
    this.__water_sun_glow = water_sun_glow;
    this.__water_cubemap_file = water_cubemap_file;
    this.__water_ramp_file = water_ramp_file;
    this.__normal_repeat = normal_repeat;
    this.__water_textures = water_textures;
    this.__wave_generators = wave_generators;
  }
  save(output) {} // TODO: Add serialise to ByteBuffer
}

class sc_map_layer {
  constructor() {
    this.__texture_file = undefined;
    this.__texture_scale = undefined;
  }

  get texture_file() { return this.__texture_file; }
  get texture_scale() { return this.__texture_scale; }

  load(input) {
    let texture_file = input.readCString();
    let texture_scale = input.readFloat32();

    // Sanity checks
    check.between(0, 512, texture_file.length, "Suspicious layer texture filename length");

    // Record fields
    this.__texture_file = texture_file;
    this.__texture_scale = texture_scale;
  }
  save(output) {}
}


class sc_map_layers {
  constructor() {
    this.__albedo_data = [];
    this.__normal_data = [];
  }

  get albedo_data() { return this.__albedo_data; }
  get normal_data() { return this.__normal_data; }

  load(input) {
    // Skip 24 unknown purpose char
    input.readBytes(24);

    let albedo_data = [];
    for (let i = 0; i < 10; i++) {
      let layer = new sc_map_layer();
      layer.load(input);
      albedo_data.push(layer)
    }

    let normal_data = [];
    for (let i = 0; i < 9; i++) {
      let layer = new sc_map_layer();
      layer.load(input);
      normal_data.push(layer)
    }

    
    // Record fields
    this.__albedo_data = albedo_data;
    this.__normal_data = normal_data;
  }
  save(output) {}
}

class sc_map_decal {
  constructor() {
    this.__id = undefined;
    this.__decal_type = undefined;
    this.__texture_count = undefined;
    this.__texture_file = undefined;
    this.__scale = [undefined, undefined, undefined];
    this.__position = [undefined, undefined, undefined];
    this.__rotation = [undefined, undefined, undefined];
    this.__cutoff_lod = undefined;
    this.__near_cutoff_lod = undefined;
    this.__owner_army = undefined;
  }
  
  get id() { return this.__id; }
  get decal_type() { return this.__decal_type; }
  get texture_count() { return this.__texture_count; }
  get texture_file() { return this.__texture_file; }
  get scale() { return this.__scale; }
  get position() { return this.__position; }
  get rotation() { return this.__rotation; }
  get cutoff_lod() { return this.__cutoff_lod; }
  get near_cutoff_lod() { return this.__near_cutoff_lod; }
  get owner_army() { return this.__owner_army; }
  
  load(input) {
    let id = input.readInt32();
    let decal_type = input.readInt32();
    let texture_count = input.readInt32();
    
    // Sanity checks
    check.equal(1, texture_count, "Only single decal textures are supported");
    
    let texture_file = input.readIString();
    let scale = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let position = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let rotation = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let cutoff_lod = input.readFloat32();
    let near_cutoff_lod = input.readFloat32();
    let owner_army = input.readInt32();

    // Sanity checks
    check.between(0, 512, texture_file.length, "Suspicious layer texture filename length");
    check.between(0, 16, owner_army, "Suspicious owner army");
    
    // Record fields
    this.__id = id;
    this.__decal_type = decal_type;
    this.__texture_count = texture_count;
    this.__texture_file = texture_file;
    this.__scale = scale;
    this.__position = position;
    this.__rotation = rotation;
    this.__cutoff_lod = cutoff_lod;
    this.__near_cutoff_lod = near_cutoff_lod;
    this.__owner_army = owner_army;
  }
  save(output) {}
}

class sc_map_decal_group {
  constructor() {
    this.__id = undefined;
    this.__name = undefined;
    this.__data = [];
  }
  
  get id() { return this.__id; }
  get name() { return this.__name; }
  get data() { return this.__data; }
  
  load(input) {
    let id = input.readInt32();
    let name = input.readCString();
    let data_length = input.readInt32();
    let data = [];
    for (let i = 0; i < data_length; i++) {
      let item = input.readInt32();
      data.push(item);
    }
  }
  save(output) {}
}

/**
 * Decals
 */
class sc_map_decals {
  constructor() {
    this.__decals = [];
    this.__decal_groups = [];
  }

  get decals() { return this.__decals; }
  get decal_groups() { return this.__decal_groups; }

  load(input) {
    // Skip 8 bytes of unknown
    input.readBytes(8);
    
    let decal_count = input.readInt32();
    let decals = [];
    for (let i = 0; i < decal_count; i++) {
      let decal = new sc_map_decal();
      decal.load(input);
      decals.push(decal);
    }
    
    let decal_group_count = input.readInt32();
    let decal_groups = [];
    for (let i = 0; i < decal_group_count; i++) {
      let decal_group = new sc_map_decal_group();
      decal_group.load(input);
      decal_groups.push(decal_group);
    }
    
    // TODO: Could do some sanity checks here - if I understand decal groups as some sort of
    // index buffer we could check against the ids in decals
    
    // Record fields
    this.__decals = decals;
    this.__decal_groups = decal_groups;
  }
  save(output) {}
}

/**
 * Normalmap.
 * Only one currently supported
 */
class sc_map_normalmap {
  constructor() {
    this.__width = undefined;
    this.__height = undefined;
    this.__data = undefined;
  }

  get width() { return this.__width; }
  get height() { return this.__height; }
  get data() { return this.__data; }

  load(input) {
    let width = input.readInt32();
    let height = input.readInt32();
    let count = input.readInt32();
    let data_length = input.readInt32();

    // Sanity checks
    check.one_of([256, 512, 1024, 2048, 4096], width, "Suspcious normal map width"); // TODO: Check it should be 128-2048
    check.one_of([256, 512, 1024, 2048, 4096], height, "Suspcious normal map width");
    check.equal(1, count, "Suspicious normal map count");
    check.equal(width * height * 4 / 4 + 128, data_length, "Suspicious normal map length"); // DXT5 achieves 4:1 compression, plus some header

    let normal_map = new sc_dds();
    normal_map.load(input);

    // Record fields
    this.__width = width;
    this.__height = height;
    this.__data = normal_map.data;
  }
  save(output) {}
}

class sc_map_texturemap {
  constructor() {
    this.__chan0_3 = undefined;
    this.__chan4_7 = undefined;
  }

  get chan0_3() { return this.__chan0_3; }
  get chan4_7() { return this.__chan4_7; }

  load(input) {
    let hdr_sz = function(d) { return d * d + 128; };

    let chan_data = [undefined, undefined];
    for (let chan = 0; chan < 2; chan++) {
      let chan_length = input.readInt32();
      // Sanity check texture map length
      check.one_of([hdr_sz(256), hdr_sz(512), hdr_sz(1024), hdr_sz(2048), hdr_sz(4096)], chan_length, "Suspcious texture map length");

      let chan_dds = new sc_dds();
      let starting_remaining = input.remaining();
      chan_dds.load(input);
      let bytes_read = starting_remaining - input.remaining();
      // Sanity check correct number of bytes read
      check.equal(bytes_read, chan_length, `Wrong number of bytes read extracting texture map ${chan} (req ${chan_length} found ${bytes_read}`);

      chan_data[chan] = chan_dds.data;
    }

    // Record fields
    this.__chan0_3 = chan_data[0];
    this.__chan4_7 = chan_data[1];
  }
  save(output) {}
}

/**
 * Watermap - size coupled to heightmap size
 */
class sc_map_watermap {
  constructor(heightmap) {
    this.__heightmap = heightmap;

    this.__watermap_data = undefined;
    this.__watermap_width = undefined;
    this.__watermap_height = undefined
    this.__foam_mask_data = undefined;
    this.__flatness_data = undefined;
    this.__depth_bias_data = undefined;
    this.__terrain_type_data = undefined;
  }

  get watermap_data() { return this.__watermap_data; }
  get watermap_width() { return this.__watermap_width; }
  get watermap_height() { return this.__watermap_height; }
  get foam_mask_data() { return this.__foam_mask_data; }
  get foam_mask_width() { return this.__heightmap.width / 2; }
  get foam_mask_height() { return this.__heightmap.height / 2; }
  get flatness_data() { return this.__flatness_data; }
  get flatness_width() { return this.__heightmap.width / 2; }
  get flatness_height() { return this.__heightmap.height / 2; }
  get depth_bias_data() { return this.__depth_bias_data; }
  get depth_bias_width() { return this.__heightmap.width / 2; }
  get depth_bias_height() { return this.__heightmap.height / 2; }
  get terrain_type_data() { return this.__terrain_type_data; }
  get terrain_type_width() { return this.__heightmap.width; }
  get terrain_type_height() { return this.__heightmap.height; }

  load(input) {}
  save(output) {}
}

class sc_map_prop {

}

class sc_map_props {
  constructor() {
    this.__props = [];
  }

  get props() { return this.__props; }

  load(input) {}
  save(output) {}
}

export class sc_map {
  constructor() {
    this.__header = new sc_map_header();
    this.__preview_image = new sc_map_preview_image();
    this.__heightmap = new sc_map_heightmap();
    this.__textures = new sc_map_textures();
    this.__lighting = new sc_map_lighting();
    this.__water = new sc_map_water();
    this.__layers = new sc_map_layers();
    this.__decals = new sc_map_decals();
    this.__normalmap = new sc_map_normalmap();
    this.__texturemap = new sc_map_texturemap();
  }

  get header() { return this.__header; }
  get preview_image() { return this.__preview_image; }
  get heightmap() { return this.__heightmap; }
  get textures() { return this.__textures; }
  get lighting() { return this.__lighting; }
  get water() { return this.__water; }
  get layers() { return this.__layers; }
  get decals() { return this.__decals; }
  get normalmap() { return this.__normalmap; }
  get texturemap() { return this.__texturemap; }

  load(input) {
    this.header.load(input);
    this.preview_image.load(input);
    this.heightmap.load(input);
    this.textures.load(input);
    this.lighting.load(input);
    this.water.load(input);
    this.layers.load(input);
    this.decals.load(input);
    this.normalmap.load(input);
    this.texturemap.load(input);
  }

  save(output) {
    this.header.save(output);
    this.preview_image.save(output);
    this.heightmap.save(output);
    this.textures.save(output);
    this.lighting.save(output);
    this.water.save(output);
    this.layers.save(output);
    this.decals.save(output);
    this.normalmap.save(output);
    this.texturemap.save(output);
  }
}
