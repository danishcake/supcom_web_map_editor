/**
 * Supreme Command Forged Alliance Map format
 * Loads and saves scmap files and associated lua scripts
 * Derived from my C++ port of the C# HarzardX map parsing code
 * As such it's not very Javascript-y code. THIS IS A GOOD THING,
 * JAVASCRIPT IS A BULLSHIT LANGUAGE THAT SHOULD HAVE BEEN DROWNED
 * A LONG TIME AGO.
 *
 * BONUS: I just ported this to Typescript, restoring a bit of sanity
 * but the bullshit JS lives on!
 *
 * TODO: Add readFloat32Array helper function
 */
import check from "./sc_check";
import { sc_dds } from "./dds/sc_dds";
import { sc_dds_pixelformat_argb } from "./dds/pixelformats/sc_dds_pixelformat_argb";
import { sc_dds_pixelformat_dxt5 } from "./dds/pixelformats/sc_dds_pixelformat_dxt5";
import * as _ from "underscore";
import * as ByteBuffer from 'bytebuffer';
import { sc_map_args } from "./sc_map_args";
import { sc_vec3, sc_vec4, sc_vec2 } from "./sc_vec";


/*
 * Used to determine valid dds texture sizes
 * These are square, with a fixed size header
 * Used by the texturemap and water maps
 */
const dds_dxt5_sz2 = function(x: number, y: number): number { return x * y + 128; };
const dds_dxt5_sz = function(d: number): number { return dds_dxt5_sz2(d, d); };
const dds_raw_sz2 = function(x: number, y: number): number { return 4 * x * y + 128; };
const dds_raw_sz = function(d: number): number { return dds_raw_sz2(d, d); };

/**
 * Used to determine height map size from a zero based size enum
 * @param {sc_map_size} idx Map size
 * @return {number} The size of the heightmap for the given size
 */
const hm_sz = function(idx: number): number {
  check.between(0, 4, idx, "Invalid map size");
  const lut = [256, 512, 1024, 2048, 4096];
  return lut[idx];
};

/**
 * Used to determine texture map size from a zero based size enum
 * @param {sc_map_size} idx Map size
 * @return {number} The size of the texturemap for the given size
 */
const tm_sz = function(idx: number): number {
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
 * @class sc_map_header
 * Initial header
 */
class sc_map_header {
  private __width: number;
  private __height: number;

  private constructor(width: number, height: number) {
    this.__width = width;
    this.__height = height;
  }

  /** The width of the map. This corresponds to heightmap size */
  public get width(): number { return this.__width; }
  /** The height of the map. This corresponds to heightmap size */
  public get height(): number { return this.__height; }

  /**
   * Loads the header
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_header {
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

    return new sc_map_header(width, height);
  }

  /**
   * Saves the header
   */
  public save(): ByteBuffer {
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

  /**
   * Creates the header
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_header {
    return new sc_map_header(hm_sz(map_args.size), hm_sz(map_args.size));
  }
}

/**
 * @class sc_map_preview_image
 * Preview image
 */
class sc_map_preview_image {
  private __data: ByteBuffer;

  private constructor(data: ByteBuffer) {
    this.__data = data;
  }

  /** The pixel data for the fixed size 256x256 preview image */
  public get data(): ByteBuffer { return this.__data; }

  /**
   * Loads the preview image
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_preview_image {
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
    return new sc_map_preview_image(preview_image_data.data);
  }

  /**
   * Saves the preview image
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(4 + 256 * 256 * 4 + 128 + 4, ByteBuffer.LITTLE_ENDIAN);
    output.writeInt32(256 * 256 * 4 + 128);                                   // Length of DDS texture

    sc_dds.save(output, this.data, 256, 256, new sc_dds_pixelformat_argb());  // Preview image (Uncompressed DDS)

    output.writeInt32(56);                                                    // Minor version

    return output;
  }

  /**
   * Creates the preview image
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_preview_image {
    // Blank dds, excluding header
    // TBD: Change this to store the DDS header and ARGB data (as is available post load?)
    const data = new ByteBuffer(256 * 256 * 4, ByteBuffer.LITTLE_ENDIAN);
    data.fill(0).reset();
    return new sc_map_preview_image(data);
  }
}

/**
 * @class sc_map_heightmap
 * Heightmap
 */
class sc_map_heightmap {
  private __width: number;
  private __height: number;
  private __scale: number;
  private __data: ByteBuffer;

  private constructor(width: number, height: number, scale: number, data: ByteBuffer) {
    this.__width = width;
    this.__height = height;
    this.__scale = scale;
    this.__data = data;
  }

  /** Width of heightmap */
  public get width(): number { return this.__width; }
  /** Height of heightmap */
  public get height(): number { return this.__height; }
  /** Vertical scaling factor for heightmap */
  public get scale(): number { return this.__scale; }
  public set scale(value: number) { this.__scale = value; }
  /** Heightmap contents */
  public get data(): ByteBuffer { return this.__data; }

  /**
   * Loads the heightmap from the provided input
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_heightmap {
    let width = input.readInt32();
    let height = input.readInt32();
    let scale = input.readFloat32();     // Vertical scale (typically 1/128)

    // Sanity checks
    check.one_of([hm_sz(0), hm_sz(1), hm_sz(2), hm_sz(3), hm_sz(4)], width, "Invalid heightmap width");
    check.one_of([hm_sz(0), hm_sz(1), hm_sz(2), hm_sz(3), hm_sz(4)], height, "Invalid heightmap height");

    let data = input.readBytes((width + 1) * (height + 1) * 2).compact();

    return new sc_map_heightmap(width, height, scale, data);
  }

  /**
   * Saves the heightmap
   */
  public save(): ByteBuffer {
    const hm_count = (this.__width + 1) * (this.__height + 1);

    // 2 ints, 1 float and hm_count shorts
    const output = new ByteBuffer(12 + hm_count * 2, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__width);
    output.writeInt32(this.__height);
    output.writeFloat32(this.__scale);

    output.append(this.__data);

    return output;
  }

  /**
   * Creates a heightmap
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args) {
    const width = hm_sz(map_args.size);
    const height = hm_sz(map_args.size);
    const scale = 1 / 128;
    const hm_count = (width + 1) * (height + 1);
    const data = new ByteBuffer(hm_count * 2, ByteBuffer.LITTLE_ENDIAN);

    // Fill with some default height
    for (let i = 0; i < hm_count; i++) {
      data.writeUint16(map_args.default_height);
    }
    data.reset();

    return new sc_map_heightmap(width, height, scale, data);
  }
}

/**
 * Environment cubemap definition
 */
class sc_map_environment_cubemap
{
  private __name: string;
  private __file: string;

  /**
   * Constructor
   * @param {string} name
   * @param {string} file
   */
  public constructor(name: string, file: string) {
    this.__name = name;
    this.__file = file;
  }

  /** Name of cubemap */
  public get name() { return this.__name; }
  /** Filename of cubemap */
  public get file() { return this.__file; }
}

/**
 * Textures and cubemaps
 */
class sc_map_textures {
  private __terrain_shader: string;
  private __background_texture_path: string;
  private __sky_cubemap_texture_path: string;
  private __environment_cubemaps: sc_map_environment_cubemap[];


  private constructor(terrain_shader: string,
                      background_texture_path: string,
                      sky_cubemap_texture_path: string,
                      environment_cubemaps: sc_map_environment_cubemap[]) {
    this.__terrain_shader = terrain_shader;
    this.__background_texture_path = background_texture_path;
    this.__sky_cubemap_texture_path = sky_cubemap_texture_path;
    this.__environment_cubemaps = environment_cubemaps;
  }

  /** Shader to use on terrain */
  public get terrain_shader()                { return this.__terrain_shader; }
  public set terrain_shader(value)           { this.__terrain_shader = value; }
  /** Texture to use as background image */
  public get background_texture_path()       { return this.__background_texture_path; }
  public set background_texture_path(value)  { this.__background_texture_path = value; }
  /** Texture to use as sky cubemap */
  public get sky_cubemap_texture_path()      { return this.__sky_cubemap_texture_path; }
  public set sky_cubemap_texture_path(value) { this.__sky_cubemap_texture_path = value; }
  /** List of environment cubemaps */
  public get environment_cubemaps()          { return this.__environment_cubemaps; }
  public set environment_cubemaps(value)     { this.__environment_cubemaps = value; }

  /**
   * Loads the texture config from the provided in0put
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_textures {
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

    return new sc_map_textures(terrain_shader,
                               background_texture_path,
                               sky_cubemap_texture_path,
                               environment_cubemaps);
  }

  /**
   * Saves the texture configuration
   */
  public save(): ByteBuffer {
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

  /**
   * Creates texture configuration
   * @param map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_textures {
    const terrain_shader = "TTerrain";
    const background_texture_path = "/textures/environment/defaultbackground.dds";
    const sky_cubemap_texture_path = "/textures/environment/defaultskycube.dds";
    const environment_cubemaps = [
      new sc_map_environment_cubemap("<default>", "/textures/environment/defaultenvcube.dds")
    ];

    return new sc_map_textures(terrain_shader,
                               background_texture_path,
                               sky_cubemap_texture_path,
                               environment_cubemaps);
  }
}

/**
 * Lighting defintion
 */
class sc_map_lighting {
  private __lighting_multiplier: number;
  private __lighting_sun_direction: sc_vec3;
  private __lighting_sun_ambience: sc_vec3;
  private __lighting_sun_colour: sc_vec3;
  private __shadow_fill_colour: sc_vec3;
  private __specular_colour: sc_vec4;
  private __bloom: number;
  private __fog_colour: sc_vec3;
  private __fog_start: number;
  private __fog_end: number;

  private constructor(lighting_multiplier: number,
                      lighting_sun_direction: sc_vec3,
                      lighting_sun_ambience: sc_vec3,
                      lighting_sun_colour: sc_vec3,
                      shadow_fill_colour: sc_vec3,
                      specular_colour: sc_vec4,
                      bloom: number,
                      fog_colour: sc_vec3,
                      fog_start: number,
                      fog_end: number) {
    this.__lighting_multiplier = lighting_multiplier;
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

  /** Lighting scale */
  get lighting_multiplier() { return this.__lighting_multiplier; }
  /** Direction vector of lighting */
  get lighting_sun_direction() { return this.__lighting_sun_direction; }
  /** Ambient lighting colour */
  get lighting_sun_ambience() { return this.__lighting_sun_ambience; }
  /** Sun colour */
  get lighting_sun_colour(){ return this.__lighting_sun_colour; }
  /** Shadow colour */
  get shadow_fill_colour() { return this.__shadow_fill_colour; }
  /** Specular highlight colour */
  get specular_colour() { return this.__specular_colour; }
  /** Degree of bloom */
  get bloom() { return this.__bloom; }
  /** Fog colour */
  get fog_colour() { return this.__fog_colour; }
  /** Fog start distance */
  get fog_start() { return this.__fog_start; }
  /** Fog saturation distance */
  get fog_end() { return this.__fog_end; }

  /**
   * Loads the lighting from the provided input
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_lighting {
    const lighting_multipler: number = input.readFloat32();
    const lighting_sun_direction: sc_vec3 = [input.readFloat32(),
                                             input.readFloat32(),
                                             input.readFloat32()];
    const lighting_sun_ambience: sc_vec3 = [input.readFloat32(),
                                            input.readFloat32(),
                                            input.readFloat32()];
    const lighting_sun_colour: sc_vec3 = [input.readFloat32(),
                                          input.readFloat32(),
                                          input.readFloat32()];
    const shadow_fill_colour: sc_vec3 = [input.readFloat32(),
                                         input.readFloat32(),
                                         input.readFloat32()];
    const specular_colour: sc_vec4 = [input.readFloat32(),
                                      input.readFloat32(),
                                      input.readFloat32(),
                                      input.readFloat32()];
    const bloom: number = input.readFloat32();
    const fog_colour: sc_vec3 = [input.readFloat32(),
                                 input.readFloat32(),
                                 input.readFloat32()];
    const fog_start: number = input.readFloat32();
    const fog_end: number = input.readFloat32();

    // Can't think of any good sanity checks to run
    return new sc_map_lighting(lighting_multipler,
                               lighting_sun_direction,
                               lighting_sun_ambience,
                               lighting_sun_colour,
                               shadow_fill_colour,
                               specular_colour,
                               bloom,
                               fog_colour,
                               fog_start,
                               fog_end);
  }

  /**
   * Saves the lighting
   */
  public save(): ByteBuffer {
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

  /**
   * Creates the lighting
   * @param map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_lighting {
    return new sc_map_lighting(1.5,
                               [0.7071, 0.7071, 0],
                               [0.2, 0.2, 0.2],
                               [1, 1, 1],
                               [0.7, 0.7, 0.75],
                               [0, 0, 0, 0],
                               0.08,
                               [0.8, 1, 0.8],
                               1000,
                               1000);
  }
}

/**
 * @class sc_map_water_texture
 * Water texture
 */
class sc_map_water_texture {
  private __normal_movement: sc_vec2;
  private __texture_file: string;

  private constructor(normal_movement: sc_vec2, texture_file: string){
    this.__normal_movement = normal_movement;
    this.__texture_file = texture_file;
  }

  /** How the water texture should reflect? */
  public get normal_movement(): sc_vec2 { return this.__normal_movement; }
  /** The water texture */
  public get texture_file(): string { return this.__texture_file; }

  /**
   * Loads the water texture from the provided input
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_water_texture {
    const normal_movement: sc_vec2 = [input.readFloat32(), input.readFloat32()];
    const texture_file: string = input.readCString();

    // Sanity checks
    check.between(1, 512, texture_file.length, "Suspicious water texture filename length");

    return new sc_map_water_texture(normal_movement, texture_file);
  }

  /**
   * Saves the water texture
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeFloat32(this.__normal_movement[0]);
    output.writeFloat32(this.__normal_movement[1]);
    output.writeCString(this.__texture_file);

    return output;
  }

  /**
   * Creates a water texture
   * @param normal_movement
   * @param texture_file
   */
  public static create(normal_movement: sc_vec2, texture_file: string) {
    return new sc_map_water_texture(normal_movement, texture_file);
  }
}

/**
 * @class sc_mp_wave_generator
 * Wave generator
 */
class sc_map_wave_generator {
  private __texture_file: string;
  private __ramp_file: string;
  private __position: sc_vec3;
  private __rotation: number;
  private __velocity: sc_vec3;
  private __lifetime_first: number;
  private __lifetime_second: number;
  private __period_first: number;
  private __period_second: number;
  private __scale_first: number;
  private __scale_second: number;
  private __frame_count: number;
  private __frame_rate_first: number;
  private __frame_rate_second: number;
  private __strip_count: number;

  private constructor(texture_file: string,
                      ramp_file: string,
                      position: sc_vec3,
                      rotation: number,
                      velocity: sc_vec3,
                      lifetime_first: number,
                      lifetime_second: number,
                      period_first: number,
                      period_second: number,
                      scale_first: number,
                      scale_second: number,
                      frame_count: number,
                      frame_rate_first: number,
                      frame_rate_second: number,
                      strip_count: number) {
    this.__texture_file = texture_file;
    this.__ramp_file = ramp_file;
    this.__position = position;
    this.__rotation = rotation;
    this.__velocity = velocity;
    this.__lifetime_first = lifetime_first;
    this.__lifetime_second = lifetime_second;
    this.__period_first = period_first;
    this.__period_second = period_second;
    this.__scale_first = scale_first;
    this.__scale_second = scale_second;
    this.__frame_count = frame_count;
    this.__frame_rate_first = frame_rate_first;
    this.__frame_rate_second = frame_rate_second;
    this.__strip_count = strip_count;
  }

  /** Texture of wave */
  public get texture_file(): string { return this.__texture_file; }
  /** Ramp texture of wave */
  public get ramp_file(): string { return this.__ramp_file; }
  /** Location of generator */
  public get position(): sc_vec3 { return this.__position; }
  /** Orientation of generator */
  public  get rotation(): number { return this.__rotation; }
  /** Velocity of wave */
  public  get velocity(): sc_vec3 { return this.__velocity; }
  /** Lifetime of wave1? */
  public get lifetime_first(): number { return this.__lifetime_first; }
  /** Lifetime of wave2? */
  public get lifetime_second(): number { return this.__lifetime_second; }
  /** Period pf wave1? */
  public get period_first(): number { return this.__period_first; }
  /** Period of wave2? */
  public get period_second(): number { return this.__period_second; }
  /** Scale of wave1 */
  public get scale_first(): number { return this.__scale_first; }
  /** Scale of wave2 */
  public get scale_second(): number { return this.__scale_second; }
  /** Number of frames */
  public get frame_count(): number { return this.__frame_count; }
  /** FPS of wave 1 */
  public get frame_rate_first(): number { return this.__frame_rate_first; }
  /** FPS of wave 2 */
  public get frame_rate_second(): number { return this.__frame_rate_second; }
  /** Number of strips? */
  public get strip_count(): number { return this.__strip_count; }

  /**
   * Loads the wave generator
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_wave_generator {
    const texture_file: string = input.readCString();
    const ramp_file: string = input.readCString();

    const position: sc_vec3 = [input.readFloat32(),
                               input.readFloat32(),
                               input.readFloat32()];
    const rotation: number = input.readFloat32();
    const velocity: sc_vec3 = [input.readFloat32(),
                              input.readFloat32(),
                              input.readFloat32()];
    const lifetime_first: number = input.readFloat32();
    const lifetime_second: number = input.readFloat32();
    const period_first: number = input.readFloat32();
    const period_second: number = input.readFloat32();
    const scale_first: number = input.readFloat32();
    const scale_second: number = input.readFloat32();
    const frame_count: number = input.readFloat32(); // TODO: Check these are not int32_t
    const frame_rate_first: number = input.readFloat32();
    const frame_rate_second: number = input.readFloat32();
    const strip_count: number = input.readFloat32();

    // Sanity checks
    check.between(1, 512, texture_file.length, "Suspicious wave texture filename length");
    check.between(1, 512, ramp_file.length, "Suspicious ramp filename length");

    return new sc_map_wave_generator(texture_file,
                                     ramp_file,
                                     position,
                                     rotation,
                                     velocity,
                                     lifetime_first,
                                     lifetime_second,
                                     period_first,
                                     period_second,
                                     scale_first,
                                     scale_second,
                                     frame_count,
                                     frame_rate_first,
                                     frame_rate_second,
                                     strip_count);
  }

  /**
   * Saves the wave generator
   */
  public save(): ByteBuffer {
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
    output.writeFloat32(this.__lifetime_second);
    output.writeFloat32(this.__period_first);
    output.writeFloat32(this.__period_second);
    output.writeFloat32(this.__scale_first);
    output.writeFloat32(this.__scale_second);
    output.writeFloat32(this.__frame_count); // TODO: This cannot really be a float can it?
    output.writeFloat32(this.__frame_rate_first);
    output.writeFloat32(this.__frame_rate_second);
    output.writeFloat32(this.__strip_count);

    return output;
  }
}

/**
 * @class sc_map_water
 * Water
 */
class sc_map_water {
  private __has_water: boolean;
  private __elevation: number;
  private __elevation_deep: number;
  private __elevation_abyss: number;
  private __surface_colour: sc_vec3;
  private __colour_lerp: sc_vec2;
  private __refraction_scale: number;
  private __fresnel_bias: number;
  private __fresnel_power: number;
  private __unit_reflection: number;
  private __sky_reflection: number;
  private __water_sun_shininess: number;
  private __water_sun_strength: number;
  private __water_sun_direction: sc_vec3;
  private __water_sun_colour: sc_vec3
  private __water_sun_reflection: number;
  private __water_sun_glow: number;
  private __water_cubemap_file: string;
  private __water_ramp_file: string;
  private __normal_repeat: sc_vec4;
  private __water_textures: sc_map_water_texture[];
  private __wave_generators: sc_map_wave_generator[];

  constructor(has_water: boolean,
              elevation: number,
              elevation_deep: number,
              elevation_abyss: number,
              surface_colour: sc_vec3,
              colour_lerp: sc_vec2,
              refraction_scale: number,
              fresnel_bias: number,
              fresnel_power: number,
              unit_reflection: number,
              sky_reflection: number,
              water_sun_shininess: number,
              water_sun_strength: number,
              water_sun_direction: sc_vec3,
              water_sun_colour: sc_vec3,
              water_sun_reflection: number,
              water_sun_glow: number,
              water_cubemap_file: string,
              water_ramp_file: string,
              normal_repeat: sc_vec4,
              water_textures: sc_map_water_texture[],
              wave_generators: sc_map_wave_generator[]) {
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

  /** If the map has water **/
  public get has_water(): boolean { return this.__has_water; }
  public set has_water(value: boolean) { this.__has_water = value; }
  /** Depth of shallow water */
  public get elevation(): number { return this.__elevation; }
  public set elevation(value: number) { this.__elevation = value; }
  /** Depth of deep water, which is rendered darker */
  public get elevation_deep(): number { return this.__elevation_deep; }
  public set elevation_deep(value: number) { this.__elevation_deep = value; }
  /** Depth of the abyssal plains where Cthulu slumbers */
  public get elevation_abyss(): number { return this.__elevation_abyss; }
  public set elevation_abyss(value: number) { this.__elevation_abyss = value; }
  /** Surface colour of water */
  public get surface_colour(): sc_vec3 { return this.__surface_colour; }
  /** How colour varies */
  public get colour_lerp(): sc_vec2 { return this.__colour_lerp; }
  /** Scale of refraction effect */
  public get refraction_scale(): number { return this.__refraction_scale; }
  /** Bias of fresnel effect */
  public get fresnel_bias(): number { return this.__fresnel_bias; }
  /** Power of fresnel effect */
  public get fresnel_power(): number { return this.__fresnel_power; }
  /** Degree of reflection of units */
  public get unit_reflection(): number { return this.__unit_reflection; }
  /** Degree of reflection of sky */
  public get sky_reflection(): number { return this.__sky_reflection; }
  /** How shiny the water is */
  public get water_sun_shininess(): number { return this.__water_sun_shininess; }
  /** Intensity of sunlight */
  public get water_sun_strength(): number { return this.__water_sun_strength; }
  /** Direction of sunlight */
  public get water_sun_direction(): sc_vec3 { return this.__water_sun_direction; }
  /** Sun colour for reflection/glow on water */
  public get water_sun_colour(): sc_vec3{ return this.__water_sun_colour; }
  /** Sun reflection on water */
  public get water_sun_reflection(): number { return this.__water_sun_reflection; }
  /** Sun glow on the water */
  public get water_sun_glow(): number { return this.__water_sun_glow; }
  /** Water cubemap */
  public get water_cubemap_file(): string { return this.__water_cubemap_file; }
  /** Water ramp file */
  public get water_ramp_file(): string { return this.__water_ramp_file; }
  /** Normal repeat vector */
  public get normal_repeat(): sc_vec4 { return this.__normal_repeat; }
  /** Water textures */
  public get water_textures(): sc_map_water_texture[] { return this.__water_textures; }
  /** Waves */
  public get wave_generators(): sc_map_wave_generator[] { return this.__wave_generators; }

  /**
   * Loads the water
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_water {
    let has_water: boolean = input.readByte() !== 0;
    let elevation: number = input.readFloat32();
    let elevation_deep: number = input.readFloat32();
    let elevation_abyss: number = input.readFloat32();
    let surface_colour: sc_vec3 = [input.readFloat32(),
                                   input.readFloat32(),
                                   input.readFloat32()];
    let colour_lerp: sc_vec2 = [input.readFloat32(),
                                input.readFloat32()];
    let refraction_scale: number = input.readFloat32();
    let fresnel_bias: number = input.readFloat32();
    let fresnel_power: number = input.readFloat32();
    let unit_reflection: number = input.readFloat32();
    let sky_reflection: number = input.readFloat32();
    let water_sun_shininess: number = input.readFloat32();
    let water_sun_strength: number = input.readFloat32();
    let water_sun_direction: sc_vec3 = [input.readFloat32(),
                                        input.readFloat32(),
                                        input.readFloat32()];
    let water_sun_colour: sc_vec3 = [input.readFloat32(),
                                     input.readFloat32(),
                                     input.readFloat32()];
    let water_sun_reflection: number = input.readFloat32();
    let water_sun_glow: number = input.readFloat32();
    let water_cubemap_file: string = input.readCString();
    let water_ramp_file: string = input.readCString();
    let normal_repeat: sc_vec4 = [input.readFloat32(),
                                  input.readFloat32(),
                                  input.readFloat32(),
                                  input.readFloat32()];
    let water_textures: sc_map_water_texture[] = [];
    for (let i = 0; i < 4; i++) {
      let water_texture = sc_map_water_texture.load(input);
      water_textures.push(water_texture);
    }

    let wave_generator_count: number = input.readInt32();
    let wave_generators: sc_map_wave_generator[] = [];
    for (let i = 0; i < wave_generator_count; i++) {
      let wave_generator = sc_map_wave_generator.load(input);
      wave_generators.push(wave_generator);
    }


    // Sanity checks
    check.between(0, elevation, elevation_deep, "Deep elevation higher than elevation");
    check.between(0, elevation_deep, elevation_abyss, "Abyss elevation higher than deep elevation");

    // Record fields
    return new sc_map_water(has_water,
                            elevation,
                            elevation_deep,
                            elevation_abyss,
                            surface_colour,
                            colour_lerp,
                            refraction_scale,
                            fresnel_bias,
                            fresnel_power,
                            unit_reflection,
                            sky_reflection,
                            water_sun_shininess,
                            water_sun_strength,
                            water_sun_direction,
                            water_sun_colour,
                            water_sun_reflection,
                            water_sun_glow,
                            water_cubemap_file,
                            water_ramp_file,
                            normal_repeat,
                            water_textures,
                            wave_generators);
  }

  /**
   * Saves the water
   */
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

  /**
   * Creates the water
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_water {
    const has_water: boolean = true;
    const terrain_height: number = map_args.default_height;

    // TODO: Figure out a nice way to do the below bit
    const elevation: number = terrain_height * 0.75 / 128;
    const elevation_deep: number = terrain_height * 0.50 / 128;
    const elevation_abyss: number = terrain_height * 0.25 / 128;
    const surface_colour: sc_vec3 = [0.0, 0.7, 1.5];
    const colour_lerp: sc_vec2 = [0.064, 0.119];
    const refraction_scale: number = 0.375;
    const fresnel_bias: number = 0.15;
    const fresnel_power: number = 1.5;
    const unit_reflection: number = 0.5;
    const sky_reflection: number = 1.5;
    const water_sun_shininess: number = 50;
    const water_sun_strength: number = 10;
    const water_sun_direction: sc_vec3 = [0.0999, -0.9626, 0.2519];
    const water_sun_colour: sc_vec3 = [0.8127, 0.4741, 0.3386];
    const water_sun_reflection: number = 5;
    const water_sun_glow: number = 0.1;
    const water_cubemap_file: string = "/textures/engine/waterCubemap.dds";
    const water_ramp_file: string = "/textures/engine/waterramp.dds";
    const normal_repeat: sc_vec4 = [0.0009, 0.0090, 0.0500, 0.5000];

    const water_textures: sc_map_water_texture[] = [];
    for (let i = 0; i < 4; i++) {
      let water_texture = sc_map_water_texture.create([0.5000, -0.9500], "/textures/engine/waves.dds");
      water_textures.push(water_texture);
    }

    const wave_generators: sc_map_wave_generator[] = [];

    return new sc_map_water(has_water,
                            elevation,
                            elevation_deep,
                            elevation_abyss,
                            surface_colour,
                            colour_lerp,
                            refraction_scale,
                            fresnel_bias,
                            fresnel_power,
                            unit_reflection,
                            sky_reflection,
                            water_sun_shininess,
                            water_sun_strength,
                            water_sun_direction,
                            water_sun_colour,
                            water_sun_reflection,
                            water_sun_glow,
                            water_cubemap_file,
                            water_ramp_file,
                            normal_repeat,
                            water_textures,
                            wave_generators);
  }
}

/**
 * @class sc_map_layer
 * Layer entry
 */
export class sc_map_layer {
  private __texture_file: string;
  private __texture_scale: number;

  /**
   * Constructor.
   * @param {string} [texture_file]
   * @param {number} [texture_scale] This could be more accurately named 'texture_tile_count' as I think
   * it represents the number of times this texture will be repeated over the entire map
   */
  private constructor(texture_file: string, texture_scale: number) {
    this.__texture_file = (texture_file || "").toLowerCase();
    this.__texture_scale = texture_scale;
  }

  /** The texture. Will be stored lower case */
  public get texture_file(): string       { return this.__texture_file; }
  public set texture_file(value: string)  { this.__texture_file = (value || "").toLowerCase(); }
  /** The number of times the texture repeats over the map */
  public get texture_scale(): number      { return this.__texture_scale; }
  public set texture_scale(value: number) { this.__texture_scale = value; }

  /**
   * Loads the layer
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_layer {
    let texture_file = input.readCString();
    let texture_scale = input.readFloat32();

    // Sanity checks
    check.between(0, 512, texture_file.length, "Suspicious layer texture filename length");

    // Record fields
    return new sc_map_layer(texture_file, texture_scale);
  }

  /**
   * Saves the layer
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeCString(this.__texture_file);
    output.writeFloat32(this.__texture_scale);

    return output;
  }

  /**
   * Creates the layer
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(texture_file: string, texture_scale: number): sc_map_layer {
    return new sc_map_layer(texture_file, texture_scale);
  }

}

/**
 * @class sc_map_layers
 * The collection of layers defining how the texturemaps are rendered
 */
class sc_map_layers {
  private __albedo_data: sc_map_layer[];
  private __normal_data: sc_map_layer[];

  private constructor(albedo_data: sc_map_layer[],
                      normal_data: sc_map_layer[]) {
    this.__albedo_data = albedo_data;
    this.__normal_data = normal_data;
  }

  /** Albedo (eg RGB) layers. There are 10 of these */
  public get albedo_data(): ReadonlyArray<sc_map_layer> { return this.__albedo_data; }
  /** Normal layers. There are 9 of these */
  public get normal_data(): ReadonlyArray<sc_map_layer> { return this.__normal_data; }

  /**
   * Loads the layer
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_layers {
    // Skip 24 unknown purpose char
    input.readBytes(24);

    let albedo_data = [];
    for (let i = 0; i < 10; i++) {
      const layer = sc_map_layer.load(input);
      albedo_data.push(layer)
    }

    let normal_data = [];
    for (let i = 0; i < 9; i++) {
      let layer = sc_map_layer.load(input);
      normal_data.push(layer)
    }

    // Record fields
    return new sc_map_layers(albedo_data, normal_data);
  }

  /**
   * Saves the layers
   */
  public save(): ByteBuffer {
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

  /**
   * Creates the layers
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_layers {
    // TODO: Fully specify layers. What do blank layers even mean? No albedo/normals applied?
    // entirely unused?
    const albedo_data: sc_map_layer[] = [
      sc_map_layer.create("/env/evergreen/layers/rockmed_albedo.dds", 10),
      sc_map_layer.create("/env/swamp/layers/sw_sphagnum_03_albedo.dds", 4),
      sc_map_layer.create("/env/evergreen2/layers/eg_grass001_albedo.dds", 4),
      sc_map_layer.create("/env/evergreen/layers/rockmed_albedo.dds", 10),
      sc_map_layer.create("/env/evergreen2/layers/eg_rock_albedo.dds", 15),
      sc_map_layer.create("", 4),
      sc_map_layer.create("", 4),
      sc_map_layer.create("", 4),
      sc_map_layer.create("", 4),
      sc_map_layer.create("/env/evergreen/layers/macrotexture000_albedo.dds", 128)
    ];

    const normal_data: sc_map_layer[] = [
      sc_map_layer.create("/env/evergreen/layers/SandLight_normals.dds", 4),
      sc_map_layer.create("/env/evergreen/layers/grass001_normals.dds", 4),
      sc_map_layer.create("/env/evergreen/layers/Dirt001_normals.dds", 4),
      sc_map_layer.create("/env/evergreen/layers/RockMed_normals.dds", 4),
      sc_map_layer.create("/env/evergreen/layers/snow001_normals.dds", 4),
      sc_map_layer.create("", 4),
      sc_map_layer.create("", 4),
      sc_map_layer.create("", 4),
      sc_map_layer.create("", 4)
    ];

    return new sc_map_layers(albedo_data, normal_data);
  }
}

/**
 * @class sc_map_decal
 * An individual decal record
 */
class sc_map_decal {
  private __id: number;
  private __decal_type: number;
  private __texture_files: string[];
  private __scale: sc_vec3;
  private __position: sc_vec3;
  private __rotation: sc_vec3;
  private __cutoff_lod: number;
  private __near_cutoff_lod: number;
  private __owner_army: number;

  private constructor(id: number,
                      decal_type: number,
                      texture_files: string[],
                      scale: sc_vec3,
                      position: sc_vec3,
                      rotation: sc_vec3,
                      cutoff_lod: number,
                      near_cutoff_lod: number,
                      owner_army: number) {
    this.__id = id;
    this.__decal_type = decal_type;
    this.__texture_files = texture_files;
    this.__scale = scale;
    this.__position = position;
    this.__rotation = rotation;
    this.__cutoff_lod = cutoff_lod;
    this.__near_cutoff_lod = near_cutoff_lod;
    this.__owner_army = owner_army;
  }

  /** ID of this decal */
  public get id(): number { return this.__id; }
  /** Type of this decal */
  public get decal_type(): number { return this.__decal_type; }
  /** Texture files */
  public get texture_files(): ReadonlyArray<string> { return this.__texture_files; }
  /** Scaling to apply to the texture */
  public get scale(): sc_vec3 { return this.__scale; }
  /** Position of the decal */
  public get position(): sc_vec3 { return this.__position; }
  /** Orientation of rotation */
  public get rotation(): sc_vec3 { return this.__rotation; }
  /** Maximum distance to render at */
  public get cutoff_lod(): number { return this.__cutoff_lod; }
  /** Minimum distance to render at? */
  public get near_cutoff_lod(): number { return this.__near_cutoff_lod; }
  /** Army this decal belows to */
  public get owner_army(): number { return this.__owner_army; }

  /**
   * Loads the decal
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_decal {
    let id: number = input.readInt32();
    let decal_type: number = input.readInt32();
    let texture_count: number = input.readInt32();
    let texture_files: string[] = [];

    // Sanity checks. I have no idea what the limit actually is
    check.between(0, 16, texture_count, "Suspicious number of decal textures");

    for (let i = 0; i < texture_count; i++) {
      let texture_file: string = input.readIString() as string;
      check.between(0, 512, texture_file.length, "Suspicious decal texture name length");
      texture_files.push(texture_file);
    }
    let scale: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let position: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let rotation: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    let cutoff_lod: number = input.readFloat32();
    let near_cutoff_lod: number = input.readFloat32();
    let owner_army: number = input.readInt32();

    // Sanity checks
    check.between(-1, 16, owner_army, "Suspicious owner army");

    // Record fields
    return new sc_map_decal(id,
                            decal_type,
                            texture_files,
                            scale,
                            position,
                            rotation,
                            cutoff_lod,
                            near_cutoff_lod,
                            owner_army)
  }

  /**
   * Saves the decal
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__id);
    output.writeInt32(this.__decal_type);
    output.writeInt32(this.__texture_files.length);
    // TODO: This is actually wrong - needs to be writeIString without a trailing NULL...
    for (let i = 0; i < this.__texture_files.length; i++) {
      output.writeCString(this.__texture_files[i]);
    }
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

  // Create not implemented as I don't think I need it yet
}

/**
 * @class sc_map_decal_group
 * Defines a related collection of decals
 */
class sc_map_decal_group {
  private __id: number;
  private __name: string;
  private __data: number[];

  private constructor(id: number,
                      name: string,
                      data: number[]) {
    this.__id = id;
    this.__name = name;
    this.__data = data;
  }

  /** The Id of the decal group */
  public get id(): number { return this.__id; }
  /** The name of the decal group */
  public get name(): string { return this.__name; }
  /** TBD: Not understood. Maybe decal index buffer? */
  public get data(): number[] { return this.__data; }

  /**
   * Loads the decal group
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_decal_group {
    let id = input.readInt32();
    let name = input.readCString();
    let data_length = input.readInt32();
    let data = [];
    for (let i = 0; i < data_length; i++) {
      let item = input.readInt32();
      data.push(item);
    }

    return new sc_map_decal_group(id, name, data);
  }

  /**
   * Saves the decal group
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__id);
    output.writeCString(this.__name);
    output.writeInt32(this.__data.length);

    for (let i = 0; i < this.__data.length; i++) {
      output.writeInt32(this.__data[i]);
    }

    return output;
  }

  // create not implemented as not needed
}

/**
 * @class sc_map_decals
 * The decals and decal groups for the map
 */
class sc_map_decals {
  private __decals: sc_map_decal[];
  private __decal_groups: sc_map_decal_group[];

  private constructor(decals: sc_map_decal[],
                      decal_groups: sc_map_decal_group[]) {
    this.__decals = decals;
    this.__decal_groups = decal_groups;
  }

  /** Decals */
  public get decals(): sc_map_decal[] { return this.__decals; }
  /** Decal groups */
  public get decal_groups(): sc_map_decal_group[] { return this.__decal_groups; }

  /**
   * Loads the decals structure
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_decals {
    // Skip 8 bytes of unknown
    input.readBytes(8);

    let decal_count = input.readInt32();
    let decals = [];
    for (let i = 0; i < decal_count; i++) {
      let decal = sc_map_decal.load(input);
      decals.push(decal);
    }

    let decal_group_count = input.readInt32();
    let decal_groups = [];
    for (let i = 0; i < decal_group_count; i++) {
      let decal_group = sc_map_decal_group.load(input);
      decal_groups.push(decal_group);
    }

    // TODO: Could do some sanity checks here - if I understand decal groups as some sort of
    // index buffer we could check against the ids in decals

    // Record fields
    return new sc_map_decals(decals, decal_groups);
  }

  /**
   * Saves the decal structure
   */
  public save(): ByteBuffer {
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

  /**
   * Creates the decals structure
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_decals {
    return new sc_map_decals([], []);
  }
}

/**
 * @class sc_map_normalmap
 * The normal map records. Technically the file format supports multiple instances of normal maps,
 * but this library doesn't
 */
class sc_map_normalmap {
  private __width: number;
  private __height: number;
  private __data: ByteBuffer;

  private constructor(width: number,
                      height: number,
                      data: ByteBuffer) {
    this.__width = width;
    this.__height = height;
    this.__data = data;
  }

  /** Width of the normal map */
  public get width() { return this.__width; }
  /** Height of the normal map */
  public get height() { return this.__height; }
  /** Data of normal map */
  public get data() { return this.__data; }

  /**
   * Loads the normalmap
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_normalmap {
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
    return new sc_map_normalmap(width, height, normal_map.data);
  }

  /**
   * Saves the normalmap
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__width);
    output.writeInt32(this.__height);
    output.writeInt32(1); // Normal map count
    output.writeInt32(this.__width * this.__height  * 4 / 4 + 128);

    // Note: DXT5 is capable of lossless compression if there are only a few distinct values,
    // but it does so in RGB565, which causes the bottom 2-3 bits of each channel to be dropped
    // This also means that the 2-3 bottom bits are likely to be zero after loading
    sc_dds.save(output, this.__data, this.__width, this.__height, new sc_dds_pixelformat_dxt5());

    return output;
  }

  /**
   * Creates the normalmap
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_normalmap {
    const width = nm_sz(map_args.size);
    const height = nm_sz(map_args.size);
    const data = new ByteBuffer(width * height * 4, ByteBuffer.LITTLE_ENDIAN);

    // Fill normalmap with 'pointing up' vector.
    // TODO: Check this is up!
    for (let i = 0; i < width * height; i++) {
      data.writeUint8(0);
      data.writeUint8(255);
      data.writeUint8(0);
      data.writeUint8(0);
    }

    return new sc_map_normalmap(width, height, data);
  }
}

/**
 * @class sc_map_texturemap
 * Formed of two individual texturemaps for a total of 8 layers
 * The final texture colour is a somewhat fruity blend of these.
 *
 * Firstly the base texture is applied at 100% intensity.
 * Then, each layer from 0 to 8 is blended in. The weighting given to the next
 * channel for a given channel value x is (x - 127) * 2
 * This means that values < 127 have no effect on the texture /colour/
 *
 * The texture normal map is blended in a similar fashion, but without the odd
 * minimum threshold.
 */
export class sc_map_texturemap {
  private __chan0_3: ByteBuffer;
  private __chan4_7: ByteBuffer;
  private __width: number;
  private __height: number;

  private constructor(chan0_3: ByteBuffer,
                      chan4_7: ByteBuffer,
                      width: number,
                      height: number) {
    this.__chan0_3 = chan0_3;
    this.__chan4_7 = chan4_7;
    this.__width = width;
    this.__height = height;
  }

  /**
   * Channel 0-3 of the texturemap. Channel 0 is the lowest channel applied over the base
   * Encoded in DDS, but raw RGBA888 here
   */
  public get chan0_3(): ByteBuffer { return this.__chan0_3; }
  /**
   * Channel 4-7 of the texturemap
   * Serialised to DDS, but raw RGBA888 here
   */
  public get chan4_7(): ByteBuffer { return this.__chan4_7; }
  /** Width of the texture map. Half heightmap resolution */
  public get width(): number { return this.__width; }
  /** Height of the texture map. Half heightmap resolution */
  public get height(): number { return this.__height; }

  /**
   * Loads the texturemap
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_texturemap {
    const chan_data: ByteBuffer[] = [];
    let width: number = 0;
    let height: number = 0;

    for (let chan = 0; chan < 2; chan++) {
      let chan_length = input.readInt32();
      // Sanity check texture map length
      check.one_of([dds_raw_sz(tm_sz(0)), dds_raw_sz(tm_sz(1)), dds_raw_sz(tm_sz(2)), dds_raw_sz(tm_sz(3)), dds_raw_sz(tm_sz(4))], chan_length, "Suspicious texture map length");

      let starting_remaining = input.remaining();
      let chan_dds = sc_dds.load(input);
      let bytes_read = starting_remaining - input.remaining();
      // Sanity check correct number of bytes read
      check.equal(bytes_read, chan_length, `Wrong number of bytes read extracting texture map ${chan} (req ${chan_length} found ${bytes_read}`);

      chan_data.push(chan_dds.data);

      // This assumes that both texture maps have equal dimensions
      width = chan_dds.width;
      height = chan_dds.height;
    }

    // Record fields
    return new sc_map_texturemap(chan_data[0], chan_data[1], width, height);
  }

  /**
   * Saves the texturemap
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(dds_raw_sz2(this.__width, this.__height));
    sc_dds.save(output, this.__chan0_3, this.__width, this.__height, new sc_dds_pixelformat_argb());

    output.writeInt32(dds_raw_sz2(this.__width, this.__height));
    sc_dds.save(output, this.__chan4_7, this.__width, this.__height, new sc_dds_pixelformat_argb());

    return output;
  }

  /**
   * Creates the texturemap
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_texturemap {
    const width = tm_sz(map_args.size);
    const height = tm_sz(map_args.size);
    const chan0_3 = new ByteBuffer(width * height * 4, ByteBuffer.LITTLE_ENDIAN);
    const chan4_7 = new ByteBuffer(width * height * 4, ByteBuffer.LITTLE_ENDIAN);
    chan0_3.fill(0).reset();
    chan4_7.fill(0).reset();

    return new sc_map_texturemap(chan0_3, chan4_7, width, height);
  }
}

/**
 * @class sc_map_watermap
 * The size of the watermap is coupled to heightmap size, so
 * the heightmap is provided during load
 * Note that this is probably more like a 'terrain metadata' structure
 */
class sc_map_watermap {
  private __heightmap_width: number;
  private __heightmap_height: number;
  private __watermap_data: ByteBuffer;
  private __foam_mask_data: ByteBuffer;
  private __flatness_data: ByteBuffer;
  private __depth_bias_data: ByteBuffer;
  private __terrain_type_data: ByteBuffer;

  /**
   * Constructor
   */
  private constructor(heightmap_width: number,
                      heightmap_height: number,
                      watermap_data: ByteBuffer,
                      foam_mask_data: ByteBuffer,
                      flatness_data: ByteBuffer,
                      depth_bias_data: ByteBuffer,
                      terrain_type_data: ByteBuffer) {
    this.__heightmap_width = heightmap_width;
    this.__heightmap_height = heightmap_height;
    this.__watermap_data = watermap_data;
    this.__foam_mask_data = foam_mask_data;
    this.__flatness_data = flatness_data;
    this.__depth_bias_data = depth_bias_data;
    this.__terrain_type_data = terrain_type_data;
  }

  /** Watermap data. Serialised as a DXT5, but this is the raw RGBA data */
  public get watermap_data(): ByteBuffer { return this.__watermap_data; }
  /** Width of the watermap */
  public get watermap_width(): number { return this.__heightmap_width / 2; }
  /** Height of the watermap */
  public get watermap_height(): number { return this.__heightmap_height / 2; }
  /** Foam mask data. Both stored and represented here as 1 byte per pixel RAW */
  public get foam_mask_data(): ByteBuffer { return this.__foam_mask_data; }
  /** Width of the foam mask */
  public get foam_mask_width(): number { return this.__heightmap_width / 2; }
  /** Height of the foam mask */
  public get foam_mask_height(): number { return this.__heightmap_height / 2; }
  /** Flatness data. Both stored and represented here as 1 byte per pixel RAW */
  public get flatness_data(): ByteBuffer { return this.__flatness_data; }
  /** Width of the flatness data */
  public get flatness_width(): number { return this.__heightmap_width / 2; }
  /** Height of the flatness data */
  public get flatness_height(): number { return this.__heightmap_height / 2; }
  /** Depth bias data. Both stored and represented here as 1 byte per pixel RAW */
  public get depth_bias_data(): ByteBuffer { return this.__depth_bias_data; }
  /** Width of the depth bias data */
  public get depth_bias_width(): number { return this.__heightmap_width / 2; }
  /** Height of the depth bias */
  public get depth_bias_height(): number { return this.__heightmap_height / 2; }
  /**
   * Terrain type data. Both stored and represented here as 1 byte per pixel RAW.
   * Double the resolution of the other fields
   */
  public get terrain_type_data(): ByteBuffer { return this.__terrain_type_data; }
  /** Width of the terrain type data */
  public get terrain_type_width(): number { return this.__heightmap_width; }
  /** Height of the terrain type data */
  public get terrain_type_height(): number { return this.__heightmap_height; }

  /**
   * Loads the texturemap
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer, heightmap: sc_map_heightmap): sc_map_watermap {
    input.readBytes(4); // Skip 4 bytes of unknown
    let watermap_length = input.readInt32();

    // Sanity check water map length
    // TBD: Check bounds are correct
    check.equal(dds_dxt5_sz2(heightmap.width / 2, heightmap.height / 2), watermap_length, "Suspicious water map length")

    let starting_remaining = input.remaining();
    let watermap_dds = sc_dds.load(input);
    let bytes_read = starting_remaining - input.remaining();
    // Sanity check correct number of bytes read
    check.equal(bytes_read, watermap_length, `Wrong number of bytes read extracting watermap (req ${watermap_length} found ${bytes_read}`);

    // The remaining buffers are coupled in size to the heightmap
    let half_length = heightmap.width * heightmap.height / 4;
    let full_length = heightmap.width * heightmap.height;

    // Note we compact the buffers to ensure 'capacity' is sane. It's a bit more memory usage
    // however if we ever <i>really</i> need to optimise stuff
    let foam_mask_data = input.readBytes(half_length).compact();
    let flatness_data = input.readBytes(half_length).compact();
    let depth_bias_data = input.readBytes(half_length).compact();
    let terrain_type_data = input.readBytes(full_length).compact();

    // Record fields
    return new sc_map_watermap(heightmap.width,
                               heightmap.height,
                               watermap_dds.data,
                               foam_mask_data,
                               flatness_data,
                               depth_bias_data,
                               terrain_type_data);
  }

  /**
   * Saves the watermap
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    // Write 4 unknown bytes
    for (let i = 0; i < 4; i++) {
      output.writeByte(0);
    }

    output.writeInt32(dds_dxt5_sz2(this.__heightmap_width / 2, this.__heightmap_height / 2));
    sc_dds.save(output, this.__watermap_data, this.__heightmap_width / 2, this.__heightmap_height / 2, new sc_dds_pixelformat_dxt5());

    output.append(this.__foam_mask_data);
    output.append(this.__flatness_data);
    output.append(this.__depth_bias_data);
    output.append(this.__terrain_type_data);

    return output;
  }

  /**
   * Creates the watermap
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_watermap {
    const heightmap_width = hm_sz(map_args.size);
    const heightmap_height = hm_sz(map_args.size);

    const watermap_data = new ByteBuffer(wmwm_sz(map_args.size) * wmwm_sz(map_args.size) * 4, ByteBuffer.LITTLE_ENDIAN); // 32bpp
    const foam_mask_data = new ByteBuffer(wmfm_sz(map_args.size) * wmfm_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp
    const flatness_data = new ByteBuffer(wmfl_sz(map_args.size) * wmfl_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp
    const depth_bias_data = new ByteBuffer(wmdb_sz(map_args.size) * wmdb_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp
    const terrain_type_data = new ByteBuffer(wmtt_sz(map_args.size) * wmtt_sz(map_args.size), ByteBuffer.LITTLE_ENDIAN); // 8bpp

    // On NodeJs I seem to be hitting the Buffer constructor instead of ArrayBuffer, leading to non-zero initialised
    // memory. Explicitly zero to avoid this.
    watermap_data.fill(0).reset();
    foam_mask_data.fill(0).reset();
    flatness_data.fill(0).reset();
    depth_bias_data.fill(0).reset();
    terrain_type_data.fill(0).reset();

    return new sc_map_watermap(heightmap_width,
                               heightmap_height,
                               watermap_data,
                               foam_mask_data,
                               flatness_data,
                               depth_bias_data,
                               terrain_type_data);
  }
}

/**
 * @class sc_map_prop
 * Prop entry
 */
class sc_map_prop {
  private __blueprint_path: string;
  private __position: sc_vec3;
  private __rotation_x: sc_vec3;
  private __rotation_y: sc_vec3;
  private __rotation_z: sc_vec3;
  private __scale: sc_vec3;

  private constructor(blueprint_path: string,
                      position: sc_vec3,
                      rotation_x: sc_vec3,
                      rotation_y: sc_vec3,
                      rotation_z: sc_vec3,
                      scale: sc_vec3) {
    this.__blueprint_path = blueprint_path;
    this.__position = position;
    this.__rotation_x = rotation_x;
    this.__rotation_y = rotation_y;
    this.__rotation_z = rotation_z;
    this.__scale = scale;
  }

  /** Path to prop blueprint */
  public get blueprint_path(): string { return this.__blueprint_path; }
  /** Position */
  public get position() { return this.__position; }
  /** Rotation X. TBD: What format are these rotations? */
  public get rotation_x(): sc_vec3 { return this.__rotation_x; }
  /** Rotation Y */
  public get rotation_y(): sc_vec3 { return this.__rotation_y; }
  /** Rotation Z */
  public get rotation_z(): sc_vec3 { return this.__rotation_z; }
  /** Scale */
  public get scale(): sc_vec3 { return this.__scale; }

  /**
   * Loads the prop
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_prop {
    const blueprint_path: string = input.readCString();
    const position: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    const rotation_x: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    const rotation_y: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    const rotation_z: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];
    const scale: sc_vec3 = [input.readFloat32(), input.readFloat32(), input.readFloat32()];

    // Record fields
    return new sc_map_prop(blueprint_path,
                           position,
                           rotation_x,
                           rotation_y,
                           rotation_z,
                           scale);
  }

  /**
   * Saves the prop
   */
  public save(): ByteBuffer {
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

  // Create not implemented as not used
}

/**
 * @class sc_map_props
 * Collection of props
 */
class sc_map_props {
  private __props: sc_map_prop[];

  private constructor(props: sc_map_prop[]) {
    this.__props = props;
  }

  /** Props */
  public get props(): sc_map_prop[] { return this.__props; }

  /**
   * Loads the props
   * @param {ByteBuffer} input File to load
   */
  public static load(input: ByteBuffer): sc_map_props {
    let prop_count = input.readInt32();
    // Sanity check prop_count
    check.between(0, 102400, prop_count, "Suspicious number of props found");

    let props = [];
    for (let i = 0; i < prop_count; i++) {
      let prop = sc_map_prop.load(input);
      props.push(prop);
    }

    // Record fields
    return new sc_map_props(props);
  }

  /**
   * Saves the props
   * @param {ByteBuffer} input File to load
   */
  public save(): ByteBuffer {
    const output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);

    output.writeInt32(this.__props.length);
    for (let i = 0; i < this.__props.length; i++) {
      output.append(this.__props[i].save().flip().compact());
    }

    return output;
  }

  /**
   * Creates the props
   * @param {sc_map_args} map_args The defining characteristics of the map
   */
  public static create(map_args: sc_map_args): sc_map_props {
    return new sc_map_props([]);
  }
}

/**
 * @class sc_map
 * Top level map class
 * @example
 * // Loading
 * let map = sc_map.load(map_bytebuffer);
 * @example
 * // Creation
 * let map = sc_map.create({
 *   name: "Gentle fields",
 *   author: "MrBombastic",
 *   description: "Rolling hills and shallow waters...",
 *   size: 1,
 *   default_height: 10240
 * });
 */
export class sc_map {
  private __header: sc_map_header;
  private __preview_image: sc_map_preview_image;
  private __heightmap: sc_map_heightmap;
  private __textures: sc_map_textures;
  private __lighting: sc_map_lighting;
  private __water: sc_map_water;
  private __layers: sc_map_layers;
  private __decals: sc_map_decals;
  private __normalmap: sc_map_normalmap;
  private __texturemap: sc_map_texturemap;
  private __watermap: sc_map_watermap;
  private __props: sc_map_props;


  private constructor(header: sc_map_header,
                      preview_image: sc_map_preview_image,
                      heightmap: sc_map_heightmap,
                      textures: sc_map_textures,
                      lighting: sc_map_lighting,
                      water: sc_map_water,
                      layers: sc_map_layers,
                      decals: sc_map_decals,
                      normalmap: sc_map_normalmap,
                      texturemap: sc_map_texturemap,
                      watermap: sc_map_watermap,
                      props: sc_map_props) {
    this.__header = header;
    this.__preview_image = preview_image;
    this.__heightmap = heightmap;
    this.__textures = textures;
    this.__lighting = lighting;
    this.__water = water;
    this.__layers = layers;
    this.__decals = decals;
    this.__normalmap = normalmap;
    this.__texturemap = texturemap;
    this.__watermap = watermap;
    this.__props = props;
  }

  /** The map header */
  public get header() { return this.__header; }
  /** Preview image shown by game */
  public get preview_image() { return this.__preview_image; }
  /** Terrain heightmap */
  public get heightmap() { return this.__heightmap; }
  /** Non-terrain textures (eg sky texture) */
  public get textures() { return this.__textures; }
  /** Lighting data */
  public get lighting() { return this.__lighting; }
  /** Water data */
  public get water() { return this.__water; }
  /** Defines what textures are used to each layer */
  public get layers() { return this.__layers; }
  /** Decals to apply */
  public get decals() { return this.__decals; }
  /** Normalmap data */
  public get normalmap() { return this.__normalmap; }
  /** 8 channel texture map data */
  public get texturemap() { return this.__texturemap; }
  /** Terrain type data */
  public get watermap() { return this.__watermap; }
  /** Props to place around the map */
  public get props() { return this.__props; }

  /**
   * Populates the sc_map ohject from a ByteBuffer
   * @param {ByteBuffer} input
   */
  public static load(input: ByteBuffer): sc_map {
    try {
      const header = sc_map_header.load(input);
      const preview_image = sc_map_preview_image.load(input);
      const heightmap = sc_map_heightmap.load(input);
      const textures = sc_map_textures.load(input);
      const lighting = sc_map_lighting.load(input);
      const water = sc_map_water.load(input);
      const layers = sc_map_layers.load(input);
      const decals = sc_map_decals.load(input);
      const normalmap = sc_map_normalmap.load(input);
      const texturemap = sc_map_texturemap.load(input);
      const watermap = sc_map_watermap.load(input, heightmap);
      const props = sc_map_props.load(input);

      return new sc_map(header,
                        preview_image,
                        heightmap,
                        textures,
                        lighting,
                        water,
                        layers,
                        decals,
                        normalmap,
                        texturemap,
                        watermap,
                        props);
    } catch(error) {
      // Log diagnostics and move on
      console.log(`${error}. This occurred at or around input offset ${input.offset}`);
      throw error;
    }
  }

  /**
   * Saves the map
   * @return {ByteBuffer}
   */
  public save(): ByteBuffer {
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
    let output = new ByteBuffer(1, ByteBuffer.LITTLE_ENDIAN);
    for (const buffer of buffers) {
      // Flip to make buffer ready for reading, compact to get exactly right sized buffer
      buffer.flip().compact();
      output.append(buffer);
    }

    // TBD: This will be a Buffer under node, which may not be quite what I want
    return output.flip().compact();
  }

  /**
   * Creates a new map.
   * @param {sc_map_args} map_args
   * At a minimum map_args must contain the size field.
   * {
   *   name: "Name of map",               // not used in this class, serialised by Lua related classes
   *   author: "Name of author",          // not used in this class, serialised by Lua related classes
   *   description: "Description of map", // not used in this class, serialised by Lua related classes
   *   size: integer,                     // 0 -> 5x5, 4 -> 80x80
   *   default_height: Uint16             // Initial value of empty heightmap. Defaults to 16 * 1024
   * }
   */
  public static create(map_args: sc_map_args): sc_map {
    const header = sc_map_header.create(map_args);
    const preview_image = sc_map_preview_image.create(map_args);
    const heightmap = sc_map_heightmap.create(map_args);
    const textures = sc_map_textures.create(map_args);
    const lighting = sc_map_lighting.create(map_args);
    const water = sc_map_water.create(map_args);
    const layers = sc_map_layers.create(map_args);
    const decals = sc_map_decals.create(map_args);
    const normalmap = sc_map_normalmap.create(map_args);
    const texturemap = sc_map_texturemap.create(map_args);
    const watermap = sc_map_watermap.create(map_args);
    const props = sc_map_props.create(map_args);

    return new sc_map(header,
                      preview_image,
                      heightmap,
                      textures,
                      lighting,
                      water,
                      layers,
                      decals,
                      normalmap,
                      texturemap,
                      watermap,
                      props);
  }
}
