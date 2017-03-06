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
import {sc_dds, sc_dds_pixelformat} from "./sc_dds";
import {_} from "underscore";
const ByteBuffer = require('bytebuffer');


/*
 * Used to determine valid dds texture sizes
 * These are square, with a fixed size header
 * Used by the texturemap and water maps
 */
const dds_dxt5_sz2 = function(x, y) { return x * y + 128; };
const dds_dxt5_sz = function(d) { return dds_dxt5_sz2(d, d); };
const dds_raw_sz2 = function(x, y) { return 4 * x * y + 128; };
const dds_raw_sz = function(d) { return dds_raw_sz2(d, d); };

/* Used to determine height map size from a zero based size enum */
const hm_sz = function(idx) {
  check.between(0, 4, idx, "Invalid map size");
  const lut = [256, 512, 1024, 2048, 4096];
  return lut[idx];
};

/* Used to determine texture map size from a zero based size enum */
const tm_sz = function(idx) {
  check.between(0, 4, idx, "Invalid map size");
  const lut = [128, 256, 512, 1024, 2048];
  return lut[idx];
};

/* Used to determine normal map size from a zero based size enum */
const nm_sz = hm_sz;
/* Used to determine water map size from a zero based size enum */
const wmwm_sz = tm_sz;
/* Used to determine foam mask size from a zero based size enum */
const wmfm_sz = tm_sz;
/* Used to determine water flatness data size from a zero based size enum */
const wmfl_sz = tm_sz;
/* Used to determine water depth bias size from a zero based size enum */
const wmdb_sz = tm_sz;
/* Used to determine terrain type size from a zero based size enum */
const wmtt_sz = hm_sz;


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

  save() {
    const output = new ByteBuffer(30, ByteBuffer.LITTLE_ENDIAN);
    output.writeInt32(0x1a70614d);                  // Magic
    output.writeInt32(2);                           // Major version
    output.writeInt32(2);                           // Unknown 1
    output.writeInt32(0xEDFEEFBE);                  // Unknown 2 - Endianness check?
    output.writeFloat32(this.__width);
    output.writeFloat32(this.__height);
    output.writeInt32(0);                           // Unknown 3
    output.writeInt16(0);                           // Unknown 4

    return output;
  }

  create(map_args) {
    this.__width = hm_sz(map_args.size);
    this.__height = hm_sz(map_args.size);
  }
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
    // Sanity check the preview image length
    check.between(0, 256*256*4+128, preview_image_length, "Invalid preview image length");

    let starting_remaining = input.remaining();
    let preview_image_data = sc_dds.load(input);

    // Sanity check correct number of bytes read
    let bytes_read = starting_remaining - input.remaining();
    check.equal(bytes_read, preview_image_length, `Wrong number of bytes read extracting preview image (req ${preview_image_length} found ${bytes_read}`);

    // Minor version is included in this section for lack of a better place to put it
    let minor_version = input.readInt32();
    check.equal(56, minor_version, "Incorrect minor version in header");

    // Record fields
    this.__data = preview_image_data.data;
  }

  save() {
    const output = new ByteBuffer(4 + 256 * 256 * 4 + 128 + 4, ByteBuffer.LITTLE_ENDIAN);
    output.writeInt32(256 * 256 * 4 + 128);                                   // Length of DDS texture

    sc_dds.save(output, this.data, 256, 256, sc_dds_pixelformat.RawARGB);     // Preview image (Uncompressed DDS)

    output.writeInt32(56);                                                    // Minor version

    return output;
  }

  create(map_args) {
    // Blank dds, excluding header
    // TBD: Change this to store the DDS header and ARGB data (as is available post load?)
    this.__data = new ByteBuffer(256 * 256 * 4, ByteBuffer.LITTLE_ENDIAN);
  }
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
    let scale = input.readFloat32();     // Vertical scale (typically 1/128)

    // Sanity checks
    check.one_of([hm_sz(0), hm_sz(1), hm_sz(2), hm_sz(3), hm_sz(4)], width, "Invalid heightmap width");
    check.one_of([hm_sz(0), hm_sz(1), hm_sz(2), hm_sz(3), hm_sz(4)], height, "Invalid heightmap height");

    let data = input.readBytes((width + 1) * (height + 1) * 2).compact();

    // Record fields
    this.__width = width;
    this.__height = height;
    this.__scale = scale;
    this.__data = data;
  }

  save() {
    const hm_count = (this.__width + 1) * (this.__height + 1);

    // 2 ints, 1 float and hm_count shorts
    const output = new ByteBuffer(12 + hm_count * 2, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__width);
    output.writeInt32(this.__height);
    output.writeFloat32(this.__scale);

    output.append(this.__data);

    return output;
  }

  create(map_args) {
    this.__width = hm_sz(map_args.size);
    this.__height = hm_sz(map_args.size);
    this.__scale = 1 / 128;
    const hm_count = (this.__width + 1) * (this.__height + 1);
    this.__data = new ByteBuffer(hm_count * 2, ByteBuffer.LITTLE_ENDIAN);

    const hm_default = map_args.default_height || 32 * 1024;
    // Fill with some default height
    for (let i = 0; i < hm_count; i++) {
      this.__data.writeUint16(hm_default);
    }
    this.__data.reset();
  }
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeByte(0);
    output.writeCString(this.__terrain_shader);
    output.writeCString(this.__background_texture_path);
    output.writeCString(this.__sky_cubemap_texture_path);

    output.writeInt32(this.__environment_cubemaps.length);
    for (let i = 0; i < this.__environment_cubemaps.length; i++) {
      output.writeCString(this.__environment_cubemaps[i].name);
      output.writeCString(this.__environment_cubemaps[i].file);
    }

    return output;
  }

  create(map_args) {
    this.__terrain_shader = "TTerrain";
    this.__background_texture_path = "/textures/environment/defaultbackground.dds";
    this.__sky_cubemap_texture_path = "/textures/environment/defaultskycube.dds";
    this.__environment_cubemaps = [
      new sc_map_environment_cubemap("<default>", "/textures/environment/defaultenvcube.dds")
    ];
  }
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

  save() {
    const output = new ByteBuffer(23 * 4, ByteBuffer.LITTLE_ENDIAN);

    output.writeFloat32(this.__lighting_multiplier);
    output.writeFloat32(this.__lighting_sun_direction[0]);
    output.writeFloat32(this.__lighting_sun_direction[1]);
    output.writeFloat32(this.__lighting_sun_direction[2]);
    output.writeFloat32(this.__lighting_sun_ambience[0]);
    output.writeFloat32(this.__lighting_sun_ambience[1]);
    output.writeFloat32(this.__lighting_sun_ambience[2]);
    output.writeFloat32(this.__lighting_sun_colour[0]);
    output.writeFloat32(this.__lighting_sun_colour[1]);
    output.writeFloat32(this.__lighting_sun_colour[2]);
    output.writeFloat32(this.__shadow_fill_colour[0]);
    output.writeFloat32(this.__shadow_fill_colour[1]);
    output.writeFloat32(this.__shadow_fill_colour[2]);
    output.writeFloat32(this.__specular_colour[0]);
    output.writeFloat32(this.__specular_colour[1]);
    output.writeFloat32(this.__specular_colour[2]);
    output.writeFloat32(this.__specular_colour[3]);
    output.writeFloat32(this.__bloom);
    output.writeFloat32(this.__fog_colour[0]);
    output.writeFloat32(this.__fog_colour[1]);
    output.writeFloat32(this.__fog_colour[2]);
    output.writeFloat32(this.__fog_start);
    output.writeFloat32(this.__fog_end);

    return output;
  }

  create(map_args) {
    this.__lighting_multiplier = 1.5;
    this.__lighting_sun_direction[0] = 0.7071;
    this.__lighting_sun_direction[1] = 0.7071;
    this.__lighting_sun_direction[2] = 0;
    this.__lighting_sun_ambience[0] = 0.2;
    this.__lighting_sun_ambience[1] = 0.2;
    this.__lighting_sun_ambience[2] = 0.2;
    this.__lighting_sun_colour[0] = 1;
    this.__lighting_sun_colour[1] = 1;
    this.__lighting_sun_colour[2] = 1;
    this.__shadow_fill_colour[0] = 0.7;
    this.__shadow_fill_colour[1] = 0.7;
    this.__shadow_fill_colour[2] = 0.75;
    this.__specular_colour[0] = 0;
    this.__specular_colour[1] = 0;
    this.__specular_colour[2] = 0;
    this.__specular_colour[3] = 0;
    this.__bloom = 0.08;
    this.__fog_colour[0] = 0.8;
    this.__fog_colour[1] = 1;
    this.__fog_colour[2] = 0.8;
    this.__fog_start = 1000;
    this.__fog_end = 1000;
  }
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeFloat32(this.__normal_movement[0]);
    output.writeFloat32(this.__normal_movement[1]);
    output.writeCString(this.__texture_file);

    return output;
  }
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeCString(this.__texture_file);
    output.writeCString(this.__ramp_file);
    output.writeFloat32(this.__position[0]);
    output.writeFloat32(this.__position[1]);
    output.writeFloat32(this.__position[2]);
    output.writeFloat32(this.__rotation);
    output.writeFloat32(this.__velocity[0]);
    output.writeFloat32(this.__velocity[1]);
    output.writeFloat32(this.__velocity[2]);
    output.writeFloat32(this.__lifetime_first);
    output.writeFloat32(this.__lifetime_last);
    output.writeFloat32(this.__period_first);
    output.writeFloat32(this.__period_last);
    output.writeFloat32(this.__scale_first);
    output.writeFloat32(this.__scale_last);
    output.writeFloat32(this.__frame_count); // TODO: This cannot really be a float can it?
    output.writeFloat32(this.__frame_rate_first);
    output.writeFloat32(this.__frame_rate_second);
    output.writeFloat32(this.__strip_count);

    return output;
  }
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
                          input.readFloat32(),
                          input.readFloat32()];
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeByte(this.__has_water ? 1 : 0);
    output.writeFloat32(this.__elevation);
    output.writeFloat32(this.__elevation_deep);
    output.writeFloat32(this.__elevation_abyss);
    output.writeFloat32(this.__surface_colour[0]);
    output.writeFloat32(this.__surface_colour[1]);
    output.writeFloat32(this.__surface_colour[2]);
    output.writeFloat32(this.__colour_lerp[0]);
    output.writeFloat32(this.__colour_lerp[1]);
    output.writeFloat32(this.__refraction_scale);
    output.writeFloat32(this.__fresnel_bias);
    output.writeFloat32(this.__fresnel_power);
    output.writeFloat32(this.__unit_reflection);
    output.writeFloat32(this.__sky_reflection);
    output.writeFloat32(this.__water_sun_shininess);
    output.writeFloat32(this.__water_sun_strength);
    output.writeFloat32(this.__water_sun_direction[0]);
    output.writeFloat32(this.__water_sun_direction[1]);
    output.writeFloat32(this.__water_sun_direction[2]);
    output.writeFloat32(this.__water_sun_colour[0]);
    output.writeFloat32(this.__water_sun_colour[1]);
    output.writeFloat32(this.__water_sun_colour[2]);
    output.writeFloat32(this.__water_sun_reflection);
    output.writeFloat32(this.__water_sun_glow);
    output.writeCString(this.__water_cubemap_file);
    output.writeCString(this.__water_ramp_file);
    output.writeFloat32(this.__normal_repeat[0]);
    output.writeFloat32(this.__normal_repeat[1]);
    output.writeFloat32(this.__normal_repeat[2]);
    output.writeFloat32(this.__normal_repeat[3]);

    for (let i = 0; i < this.__water_textures.length; i++) {
      output.append(this.__water_textures[i].save().flip().compact());
    }

    output.writeInt32(this.__wave_generators.length);
    for (let i = 0; i < this.__wave_generators.length; i++) {
      output.append(this.__wave_generators[i].save().flip().compact());
    }

    return output;
  }

  create(map_args) {
    this.__has_water = true;
    let terrain_height = map_args.default_height || 32 * 1024;

    // TODO: Figure out a nice way to do the below bit
    this.__elevation = terrain_height * 0.75 / 128;
    this.__elevation_deep = terrain_height * 0.50 / 128;
    this.__elevation_abyss = terrain_height * 0.25 / 128;
    this.__surface_colour[0] = 0.0;
    this.__surface_colour[1] = 0.7;
    this.__surface_colour[2] = 1.5;
    this.__colour_lerp[0] = 0.064;
    this.__colour_lerp[1] = 0.119;
    this.__refraction_scale = 0.375;
    this.__fresnel_bias = 0.15;
    this.__fresnel_power = 1.5;
    this.__unit_reflection = 0.5;
    this.__sky_reflection = 1.5;
    this.__water_sun_shininess = 50;
    this.__water_sun_strength = 10;
    this.__water_sun_direction[0] = 0.0999;
    this.__water_sun_direction[1] = -0.9626;
    this.__water_sun_direction[2] = 0.2519;
    this.__water_sun_colour[0] = 0.8127;
    this.__water_sun_colour[1] = 0.4741;
    this.__water_sun_colour[2] = 0.3386;
    this.__water_sun_reflection = 5;
    this.__water_sun_glow = 0.1;
    this.__water_cubemap_file = "/textures/engine/waterCubemap.dds";
    this.__water_ramp_file = "/textures/engine/waterramp.dds";
    this.__normal_repeat[0] = 0.0009;
    this.__normal_repeat[1] = 0.0090;
    this.__normal_repeat[2] = 0.0500;
    this.__normal_repeat[3] = 0.5000;

    for (let i = 0; i < 4; i++) {
      let water_texture = new sc_map_water_texture([0.5000, -0.9500], "/textures/engine/waves.dds");
      this.__water_textures[i] = water_texture;
    }
  }
}

/**
 * Layer entry
 */
class sc_map_layer {
  constructor(texture_file, texture_scale) {
    this.__texture_file = texture_file;
    this.__texture_scale = texture_scale;
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeCString(this.__texture_file);
    output.writeFloat32(this.__texture_scale);

    return output;
  }
}

/**
 * Layers
 */
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    // Write 24 mystery bytes
    for (let i = 0; i < 24; i++) {
      output.writeByte(0);
    }

    for (let i = 0; i < 10; i++) {
      output.append(this.__albedo_data[i].save().flip().compact());
    }

    for (let i = 0; i < 9; i++) {
      output.append(this.__normal_data[i].save().flip().compact());
    }

    return output;
  }

  create(map_args) {
    // TODO: Fully specify layers. What do blank layers even mean? No albedo/normals applied?
    // entirely unused?
    this.__albedo_data[0] = new sc_map_layer("/env/evergreen/layers/rockmed_albedo.dds", 10);
    this.__albedo_data[1] = new sc_map_layer("/env/swamp/layers/sw_sphagnum_03_albedo.dds", 4);
    this.__albedo_data[2] = new sc_map_layer("/env/evergreen2/layers/eg_grass001_albedo.dds", 4);
    this.__albedo_data[3] = new sc_map_layer("/env/evergreen/layers/rockmed_albedo.dds", 10);
    this.__albedo_data[4] = new sc_map_layer("/env/evergreen2/layers/eg_rock_albedo.dds", 15);
    this.__albedo_data[5] = new sc_map_layer("", 4);
    this.__albedo_data[6] = new sc_map_layer("", 4);
    this.__albedo_data[7] = new sc_map_layer("", 4);
    this.__albedo_data[8] = new sc_map_layer("", 4);
    this.__albedo_data[9] = new sc_map_layer("/env/evergreen/layers/macrotexture000_albedo.dds", 128);

    this.__normal_data[0] = new sc_map_layer("/env/evergreen/layers/SandLight_normals.dds", 4);
    this.__normal_data[1] = new sc_map_layer("/env/evergreen/layers/grass001_normals.dds", 4);
    this.__normal_data[2] = new sc_map_layer("/env/evergreen/layers/Dirt001_normals.dds", 4);
    this.__normal_data[3] = new sc_map_layer("/env/evergreen/layers/RockMed_normals.dds", 4);
    this.__normal_data[4] = new sc_map_layer("/env/evergreen/layers/snow001_normals.dds", 4);
    this.__normal_data[5] = new sc_map_layer("", 4);
    this.__normal_data[6] = new sc_map_layer("", 4);
    this.__normal_data[7] = new sc_map_layer("", 4);
    this.__normal_data[8] = new sc_map_layer("", 4);
  }
}

/**
 * Decal entry
 */
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__id);
    output.writeInt32(this.__decal_type);
    output.writeInt32(this.__texture_count);
    output.writeCString(this.__texture_file);
    output.writeFloat32(this.__scale[0]);
    output.writeFloat32(this.__scale[1]);
    output.writeFloat32(this.__scale[2]);
    output.writeFloat32(this.__position[0]);
    output.writeFloat32(this.__position[1]);
    output.writeFloat32(this.__position[2]);
    output.writeFloat32(this.__rotation[0]);
    output.writeFloat32(this.__rotation[1]);
    output.writeFloat32(this.__rotation[2]);

    output.writeFloat32(this.__cutoff_lod);
    output.writeFloat32(this.__near_cutoff_lod);
    output.writeInt32(this.__owner_army);

    return output;
  }

  create(map_args) {

  }
}

/**
 * Decal group entry
 */
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

    this.__id = id;
    this.__name = name;
    this.__data = data;
  }

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__id);
    output.writeCString(this.__name);
    output.writeInt32(this.__data.length);

    for (let i = 0; i < this.__data.length; i++) {
      output.writeInt32(this.__data[i]);
    }

    return output;
  }

  create(map_args) {

  }
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

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    // Write 8 unknown bytes
    for (let i = 0; i < 8; i++) {
      output.writeByte(0);
    }

    output.writeInt32(this.__decals.length);
    for (let i = 0; i < this.__decals.length; i++) {
      output.append(this.__decals[i].save().flip().compact());
    }

    output.writeInt32(this.__decal_groups.length);
    for (let i = 0; i < this.__decal_groups.length; i++) {
      output.append(this.__decal_groups[i].save().flip().compact());
    }

    return output;
  }

  create(map_args) {

  }
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
    check.one_of([256, 512, 1024, 2048, 4096], width, "Suspicious normal map width"); // TODO: Check it should be 128-2048
    check.one_of([256, 512, 1024, 2048, 4096], height, "Suspicious normal map width");
    check.equal(1, count, "Suspicious normal map count");
    check.equal(width * height * 4 / 4 + 128, data_length, "Suspicious normal map length"); // DXT5 achieves 4:1 compression, plus some header

    let normal_map = sc_dds.load(input);

    // Record fields
    this.__width = width;
    this.__height = height;
    this.__data = normal_map.data;
  }

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__width);
    output.writeInt32(this.__height);
    output.writeInt32(1); // Normal map count
    output.writeInt32(this.__width * this.__height  * 4 / 4 + 128);
    sc_dds.save(output, this.__data, this.__width, this.__height, sc_dds_pixelformat.DXT5);

    return output;
  }

  create(map_args) {
    this.__width = nm_sz(map_args.size);
    this.__height = nm_sz(map_args.size);
    this.__data = new ByteBuffer(this.__width * this.__height * 4, ByteBuffer.LITTLE_ENDIAN);

    // Fill normalmap with 'pointing up' vector.
    // TODO: Check this is up!
    for (let i = 0; i < this.__width * this.__height; i++) {
      this.__data.writeUint8(0);
      this.__data.writeUint8(0);
      this.__data.writeUint8(1);
      this.__data.writeUint8(0);
    }
   }
}

/**
 * Texturemap
 * Formed of two individual texturemaps for a total of 8 layers
 * TODO: Document the slightly fruity blending and layer priority
 */
class sc_map_texturemap {
  constructor() {
    this.__chan0_3 = undefined;
    this.__chan4_7 = undefined;
    this.__width = undefined;
    this.__height = undefined;
  }

  get chan0_3() { return this.__chan0_3; }
  get chan4_7() { return this.__chan4_7; }
  get width() { return this.__width; }
  get height() { return this.__height; }

  load(input) {
    let chan_data = [undefined, undefined];
    for (let chan = 0; chan < 2; chan++) {
      let chan_length = input.readInt32();
      // Sanity check texture map length
      check.one_of([dds_raw_sz(tm_sz(0)), dds_raw_sz(tm_sz(1)), dds_raw_sz(tm_sz(2)), dds_raw_sz(tm_sz(3)), dds_raw_sz(tm_sz(4))], chan_length, "Suspicious texture map length");

      let starting_remaining = input.remaining();
      let chan_dds = sc_dds.load(input);
      let bytes_read = starting_remaining - input.remaining();
      // Sanity check correct number of bytes read
      check.equal(bytes_read, chan_length, `Wrong number of bytes read extracting texture map ${chan} (req ${chan_length} found ${bytes_read}`);

      chan_data[chan] = chan_dds.data;
    }

    // Record fields
    this.__chan0_3 = chan_data[0];
    this.__chan4_7 = chan_data[1];
  }

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(dds_raw_sz(this.__width, this.__height));
    sc_dds.save(output, this.__chan0_3, this.__width, this.__height, sc_dds_pixelformat.RawARGB);

    output.writeInt32(dds_raw_sz(this.__width, this.__height));
    sc_dds.save(output, this.__chan4_7, this.__width, this.__height, sc_dds_pixelformat.RawARGB);

    return output;
  }

  create(map_args) {
    this.__chan0_3 = new ByteBuffer(tm_sz(map_args.size) * tm_sz(map_args.size) * 4, ByteBuffer.LITTLE_ENDIAN);
    this.__chan4_7 = new ByteBuffer(tm_sz(map_args.size) * tm_sz(map_args.size) * 4, ByteBuffer.LITTLE_ENDIAN);
    this.__width = tm_sz(map_args.size);
    this.__height = tm_sz(map_args.size);
  }
}

/**
 * Watermap - size coupled to heightmap size
 */
class sc_map_watermap {
  constructor(heightmap) {
    this.__heightmap = heightmap;

    this.__watermap_data = undefined;
    this.__foam_mask_data = undefined;
    this.__flatness_data = undefined;
    this.__depth_bias_data = undefined;
    this.__terrain_type_data = undefined;
  }

  get watermap_data() { return this.__watermap_data; }
  get watermap_width() { return this.__heightmap.width / 2; }
  get watermap_height() { return this.__heightmap.height / 2; }
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

  load(input) {
    input.readBytes(4); // Skip 4 bytes of unknown
    let watermap_length = input.readInt32();

    // Sanity check water map length
    // TBD: Check bounds are correct
    check.equal(dds_dxt5_sz2(this.__heightmap.width / 2, this.__heightmap.height / 2), watermap_length, "Suspicious water map length")

    let starting_remaining = input.remaining();
    let watermap_dds = sc_dds.load(input);
    let bytes_read = starting_remaining - input.remaining();
    // Sanity check correct number of bytes read
    check.equal(bytes_read, watermap_length, `Wrong number of bytes read extracting watermap (req ${watermap_length} found ${bytes_read}`);

    // The remaining buffers are coupled in size to the heightmap
    let half_length = this.__heightmap.width * this.__heightmap.height / 4;
    let full_length = this.__heightmap.width * this.__heightmap.height;

    // Note we compact the buffers to ensure 'capacity' is sane. It's a bit more memory usage
    // however if we ever <i>really</i> need to optimise stuff
    let foam_mask_data = input.readBytes(half_length).compact();
    let flatness_data = input.readBytes(half_length).compact();
    let depth_bias_data = input.readBytes(half_length).compact();
    let terrain_type_data = input.readBytes(full_length).compact();

    // Record fields
    this.__watermap_data = watermap_dds.data;
    this.__foam_mask_data = foam_mask_data;
    this.__flatness_data = flatness_data;
    this.__depth_bias_data = depth_bias_data;
    this.__terrain_type_data = terrain_type_data;
  }

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    // Write 4 unknown bytes
    for (let i = 0; i < 4; i++) {
      output.writeByte(0);
    }

    output.writeInt32(dds_dxt5_sz2(this.__heightmap.width / 2, this.__heightmap.height / 2));
    sc_dds.save(output, this.__watermap_data, this.__heightmap.width / 2, this.__heightmap.height / 2, sc_dds_pixelformat.DXT5);

    output.append(this.__foam_mask_data);
    output.append(this.__flatness_data);
    output.append(this.__depth_bias_data);
    output.append(this.__terrain_type_data);

    return output;
  }

  create(map_args) {
    this.__watermap_data = new ByteBuffer(wmwm_sz(map_args.size) * wmwm_sz(map_args.size) * 4, ByteBuffer.LITTLE_ENDIAN); // 32bpp
    this.__foam_mask_data = new ByteBuffer(wmfm_sz(map_args.size) * wmfm_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp
    this.__flatness_data = new ByteBuffer(wmfl_sz(map_args.size) * wmfl_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp
    this.__depth_bias_data = new ByteBuffer(wmdb_sz(map_args.size) * wmdb_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp
    this.__terrain_type_data = new ByteBuffer(wmtt_sz(map_args.size) * wmtt_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp

    // On NodeJs I seem to be hitting the Buffer constructor instead of ArrayBuffer, leading to non-zero initialised
    // memory. Explicitly zero to avoid this.
    this.__watermap_data.fill(0).reset();
    this.__foam_mask_data.fill(0).reset();
    this.__flatness_data.fill(0).reset();
    this.__depth_bias_data.fill(0).reset();
    this.__terrain_type_data.fill(0).reset();
  }
}

/**
 * Prop entry
 */
class sc_map_prop {
  constructor() {
    this.__blueprint_path = undefined;
    this.__position = [undefined, undefined, undefined];
    this.__rotation_x = [undefined, undefined, undefined];
    this.__rotation_y = [undefined, undefined, undefined];
    this.__rotation_z = [undefined, undefined, undefined];
    this.__scale = [undefined, undefined, undefined]; // unused
  }

  get blueprint_path() { return this.__blueprint_path; }
  get position() { return this.__position; }
  get rotation_x() { return this.__rotation_x; }
  get rotation_y() { return this.__rotation_y; }
  get rotation_z() { return this.__rotation_z; }
  get scale() { return this.__scale; }

  load(input) {
    let blueprint_path = input.readCString();
    let position = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let rotation_x = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let rotation_y = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let rotation_z = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let scale = [input.readFloat32(), input.readFloat32(), input.readFloat32()];

    // Record fields
    this.__blueprint_path = blueprint_path;
    this.__position = position;
    this.__rotation_x = rotation_x;
    this.__rotation_y = rotation_y;
    this.__rotation_z = rotation_z;
    this.__scale = scale;
  }

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeCString(this.__blueprint_path);
    output.writeFloat32(this.__position[0]);
    output.writeFloat32(this.__position[1]);
    output.writeFloat32(this.__position[2]);
    output.writeFloat32(this.__rotation_x[0]);
    output.writeFloat32(this.__rotation_x[1]);
    output.writeFloat32(this.__rotation_x[2]);
    output.writeFloat32(this.__rotation_y[0]);
    output.writeFloat32(this.__rotation_y[1]);
    output.writeFloat32(this.__rotation_y[2]);
    output.writeFloat32(this.__rotation_z[0]);
    output.writeFloat32(this.__rotation_z[1]);
    output.writeFloat32(this.__rotation_z[2]);
    output.writeFloat32(this.__scale[0]);
    output.writeFloat32(this.__scale[1]);
    output.writeFloat32(this.__scale[2]);

    return output;
  }

  create(map_args) {

  }
}

/**
 * Props
 */
class sc_map_props {
  constructor() {
    this.__props = [];
  }

  get props() { return this.__props; }

  load(input) {
    let prop_count = input.readInt32();
    // Sanity check prop_count
    check.between(0, 102400, prop_count, "Suspicious number of props found");

    let props = [];
    for (let i = 0; i < prop_count; i++) {
      let prop = new sc_map_prop();
      prop.load(input);
      props.push(prop);
    }

    // Record fields
    this.__props = props;
  }

  save() {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__props.length);
    for (let i = 0; i < this.__props.length; i++) {
      output.append(this.__props[i].save().flip().compact());
    }

    return output;
  }

  create(map_args) {

  }
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
    this.__watermap = new sc_map_watermap(this.__heightmap);
    this.__props = new sc_map_props();
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
  get watermap() { return this.__watermap; }
  get props() { return this.__props; }

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
    this.watermap.load(input);
    this.props.load(input);
  }

  save() {
    const buffers = [
      this.header.save(),
      this.preview_image.save(),
      this.heightmap.save(),
      this.textures.save(),
      this.lighting.save(),
      this.water.save(),
      this.layers.save(),
      this.decals.save(),
      this.normalmap.save(),
      this.texturemap.save(),
      this.watermap.save(),
      this.props.save()
    ];

    // Concatenate all of the above to get the output
    let total_length = 0;
    let output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);
    for (const buffer of buffers) {
      // Flip to make buffer ready for reading, compact to get exactly right sized buffer
      buffer.flip().compact();

      total_length += buffer.capacity();

      output.append(buffer);
    }

    // TBD: This will be a Buffer under node, which may not be quite what I want
    return output.flip().compact().buffer;
  }

  /**
   * Creates a new map.
   * @param map_args {Object}
   * At a minimum map_args must contain the size field.
   * {
   *   name: "Name of map",               // not used in this class, serialised by Lua related classes
   *   author: "Name of author",          // not used in this class, serialised by Lua related classes
   *   description: "Description of map", // not used in this class, serialised by Lua related classes
   *   size: integer,                     // 0 -> 5x5, 4 -> 80x80
   *   default_height: Uint16             // Initial value of empty heightmap. Defaults to 16 * 1024
   * }
   */
  create(map_args) {
    this.header.create(map_args);
    this.preview_image.create(map_args);
    this.heightmap.create(map_args);
    this.textures.create(map_args);
    this.lighting.create(map_args);
    this.water.create(map_args);
    this.layers.create(map_args);
    this.decals.create(map_args);
    this.normalmap.create(map_args);
    this.texturemap.create(map_args);
    this.watermap.create(map_args);
    this.props.create(map_args);
  }
}
