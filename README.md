# WebMapEdit
A map editor for [Supreme Commander](https://store.steampowered.com/app/9420/Supreme_Commander_Forged_Alliance) that runs inside your browser, using WebGL to provide a smooth, zoomable map. [Try it!](https://danishcake.github.io/supcom_web_map_editor_pages/)

![Screenshot 1](https://raw.githubusercontent.com/danishcake/supcom_web_map_editor/master/doc/screenshot_1.png "Screenshot 1")

![Screenshot 2](https://raw.githubusercontent.com/danishcake/supcom_web_map_editor/master/doc/screenshot_2.png "Screenshot 2")


## Background
Sometime in 2015/2016 I was in the throes of learning Javascript for a project at work, using a somewhat elderly vanilla Javascript/Angular 1 stack. I thought it might be a good idea to productively use my daily commute to work on a personal project, and I had previously started a map editor in C++/Qt. It felt like a good place to start.

A simple UI was sketched out, buttons stubbed, and I went to work.

### Tech stack
* Angular 1 with Bootstrap CSS for UI elements
* A transpiled version of Lua 5.1 for loading/parsing the Lua scripts that are used for key parts of the map format.
* Typescript 3. The majority of the non-UI code has been ported to Typescript, having originally been written in plain Javascript. This is the origin of a fair amount of 'odd' ways things have been coded!
* A pure Typescript/Javascript DDS codec, supporting ARBG, RGB and DXT5.
* ByteBuffer.js for bit twiddling operations.
* Webpack 4


## Project structure
The project is split into two parts, but when I started writing it I hadn't really figured out how to split a project into multiple actual modules, so the two parts share a single `node_modules` and `package.json`. Properly factoring out and further dividing the projects is on the backlog.

### sc_map_io_lib
Provides the following functionality:
* Deserialisation/serialisation of maps
* Deserialisation/serialisation of scripts
* Tools for manipulation of heightmaps, texturemaps and scripts

### sc_map_edit_bin
Provides a single page web app for editing maps. Makes heavy use of sc_map_io_lib.

## Code quality/standards
Code is written in a very C/C++ style, and has been ported to Typescript, resulting in some slightly odd code in places. It doesn't look like typical Javascript (which is in itself no bad thing).

* Lowercase + underscore naming for all variables, classes etc. Uppercase letters are generally not used
* Private member variables and functions are given a __prefix. This practice predates the use of Typescript.

```javascript
class button_widget {
  private __position: vec2;
  private __size: vec2;

  public is_within(position: vec2): bool {
    ...
  }
}
```

* All code added to sc_map_io_lib should be Typescript.
* All code added to sc_map_edit_bin should be Javascript.
* There is not currently a linter in use.

## Limitations
Supreme Commander maps ship in a variety of sub-formats, the most common of which are:
* `Major 2 Minor 56`.
* `Major 2 Minor 53`. This is the older format that shipped with the original Supreme Commander, and only includes 4 layers instead of 8.
* `Major 2 Minor 60`. Observed in X1MP_001. The unknown data ignored at the start of sc_map_layers is length prefixed, and there is an additional unknown section between the watermap section and the props section.


## Technical notes
### .scmap format
The map format comes in several revisions, of which we primarily support 2.56.

Maps come in a variety of sizes. These cause different sized textures in the .scmap.

| Size   | Description | Heightmap | Normalmap | Texturemap | Watermap  | Foam mask | Flatness data | Water depth bias | Terrain type |
| ------ | ----------- | --------- | --------- | ---------- | --------- | --------- | ------------- | ---------------- | ------------ |
| Tiny   | 5km x 5km   | 256x256   | 256x256   | 128x128    | 128x128   | 128x128   | 128x128       | 128x128          | 1024x1024    |
| Small  | 10km x 10km | 512x512   | 512x512   | 256x256    | 256x256   | 256x256   | 256x256       | 256x256          | 1024 x 1024  |
| Medium | 20km x 20km | 1024x1024 | 1024x1024 | 512x512    | 512x512   | 512x512   | 512x512       | 512x512          | 1024x1024    |
| Large  | 40km x 40km | 2048x2048 | 2048x2048 | 1024x1024  | 1024x1024 | 1024x1024 | 1024x1024     | 1024x1024        | 2048x2048    |
| Huge   | 80km x 80km | 4096x4096 | 4096x4096 | 2048x2048  | 2048x2048 | 2048x2048 | 2048x2048     | 2048x2048        | 4096x4096    |

Note that the heightmap texture actually has an additional pixel in each axis due to the fence posting problem (e.g. 257x257-4097x4097).

Throughout the map file there are two types of string:
* NULL terminated, C style strings. These will be referred to as `ntstring`.
* Length prefixed strings. These will be referred to as `lpstring`.

Arrays are either fixed length or length prefixed.

Almost no reverse engineering was required, as the excellent HazardX figured out this stuff over a decade ago. Some of the variables below map to shader variables in the .fx files in the Supreme Commander gamedata. Perhaps one of the early betas of Supreme Commander was distributed with debug symbols?

#### Coordinate system
The game map is laid out in the X-Z plain, with the Y coordinate representing vertical height.

*TODO*: Confirm that Z==0 is the top

#### 2.56
##### Header
The header is formed by the following structure
```C
typedef struct header_tag
{
  char    magic[4];      // Always 'Map^z' in ASCII - treated as int32 0x1a70614d
  int32_t major_version; // Always 2
  int32_t unknown_1;     // Ignored, but seems to always be 2
  int32_t unknown_2;     // Ignored, but seems to always be 0xEDFEEEEFBE. Endianness detection?
  float   width;         // Width of the map. Appears to be heightmap size
  float   height;        // Height of the map. Appears to be heightmap size
  int32_t unknown_3;     // Ignored, but seems to always be 0
  int32_t unknown_4;     // Ignored, but seems to always be 0
} header_t;
```

##### Preview image
Directly after the header is a preview image. This is a DDS RGBA texture. This section also includes the minor map version, which doesn't really have a sensible home.
```C
typedef struct preview_image_tag
{
  int32_t preview_image_length;               // The length of the preview image. This is always 256x256x4 + 128 (eg a 256x256 32bpp with 128 bytes DDS header)
  uint8_t preview_image[256 * 256 * 4 + 128]; // The DDS encoded preview image
  int32_t minor_version;                      // The minor version.
} preview_image_t;
```

We support minor version 56 and 60 only. The differences for these formats are discussed later.

##### Heightmap
After the preview image is the heightmap. This a raw blob of uint16_t.
Note that due to the fencepost problem, a map that reports a heightmap of 256x256 will actually have 257x257 elements.

The vertical scale is believed to the scaling factor used to transform between horizontal units and vertical units. If it is set to one the minimum angle would be 45°, so it is typically more like 1/128.

```C
typedef struct heightmap_tag
{
  int32_t  width;             // The heightmap width
  int32_t  height;            // The heightmap height
  float    scale;             // Vertical scaling for heightmap.
  uint16_t heightmap_data[0]; // Actual size is (width + 1) * (height + 1)
} heightmap_t;
```

*TODO*: Confirm top-bottom scanline order.

##### Textures
The textures section contains basic data required by the game to render the terrain.

```C
typedef struct textures_tag
{
  uint8_t               unknown_1; // Always 0
  ntstring              terrain_shader; // Shader to use to render the terrain. Usually TTerrain.
  ntstring              background_texture_path;   //
  ntstring              sky_cubemap_texture_path;  // Sky cubemap texture
  int32_t               environment_cubemap_count; // Length of following array
  environment_cubemap_t environment_cubemaps[0];
} textures_t;
```

```C
typedef struct environment_cubemap_tag
{
  ntstring name;
  ntstring filename;
} environment_cubemap_t
```

These are not used by the editor at time of writing, and will be written back unchanged if loaded, or use the following fixed values if a new map is created:

| Field                    | Default value                                       |
| ------------------------ | --------------------------------------------------- |
| terrain_shader           | TTerrain                                            |
| background_texture_path  | /textures/environment/defaultbackground.dds         |
| sky_cubemap_texture_path | /textures/environment/defaultskycube.dds            |
| environment_cubemaps     | <default>: /textures/environment/defaultenvcube.dds |

##### Lighting
Next is the lighting section. This contains the data required to light the terrain.

```C
typedef struct lighting_tag
{
  float lighting_multiplier;    // General brightness scalar
  vec3f lighting_sun_direction; // Vector of sun illumination
  vec3f lighting_sun_ambience;  // RGB value of non-directional lighting
  vec3f lighting_sun_colour;    // RGB value of directional lighting
  vec3f shadow_fill_colour;     // RGB value of shadows?
  vec4f specular_colour;        // ARGB value of specular lighting. Alpha believed to be general scalar for effect
  float bloom;                  // Scalar for bloom effect?
  vec3f fog_colour;             // Colour of fog?
  float fog_start;              // Distance where fog starts?
  float fog_end;                // Distance where fog reaches full intensity?
} lighting_t;
```

The editor does not use these values, so interpretations are untested. Loaded maps have their lighting written back unchanged, and new maps use the following defaults:

| Field                    | Default value                                       |
| ------------------------ | --------------------------------------------------- |
| lighting_multiplier      | 1.5                                                 |
| lighting_sun_direction   | [0.707, 0.707, 0]                                   |
| lighting_sun_ambience    | [0.2, 0.2, 0.2]                                     |
| lighting_sun_colour      | [1, 1, 1]                                           |
| shadow_fill_colour       | [0.7, 0.7, 0.75]                                    |
| specular_colour          | [0, 0, 0, 0]                                        |
| bloom                    | 0.08                                                |
| fog_colour               | [0.8, 1, 0.8]                                       |
| fog_start                | 1000                                                |
| fog_end                  | 1000                                                |

##### Water
The water section defines how water and waves are rendered. The water in Supreme Commander is formed by three layers - shallow, deep and abyssal. Waves are rendered by a series of 'wave generators' that are manually placed (or generated) at beaches. The editor does not do this at time of writing.

```C
typedef struct water_tag
{
  uint8_t          water_enabled;           // 0 disables water
  float            elevation;               // Height of shallowest water. Units in world (eg scaled by heightmap scale, rather than uint16_t height bins)
  float            elevation_deep;          // Height of deep water
  float            eleveation_abyss;        // Height of the abyssal plane
  vec3f            surface_colour;          // Color of surface water, applied more strongly as water gets deeper
  vec2f            colour_lerp;             // Controls how much surface_colour is applied. The x-component is the minimum amount and the y component is the maximum amount.
  float            refraction_scale;        // Strength of refraction effect
  float            fresnel_bias;            // Doesn't seem to be used
  float            fresnel_power;           // Doesn't seem to be used
  float            unit_reflection;         // Reflectiveness of water surface
  float            sky_reflection;          // Sky reflection scalar;
  float            water_sun_shininess;     // Strength of reflection of sun
  float            water_sun_strength;      // Doesn't seem to be used
  vec3f            water_sun_direction;     // Direction of sun lighting vector for reflection purposes
  vec3f            water_sun_colour;        // Colour of sun for reflection from water
  float            water_sun_reflection;    // Not sure
  float            water_sun_glow;          // Degree of glow to apply - appears to be ifdef'd out
  ntstring         water_sun_cubemap_file;  // Sky cubemap
  ntstring         water_ramp_file;         // Water ramp - lookup for colour of water by depth.
  vec4f            normal_repeat;           // Scale for the water textures movement. Each component corresponds to one of the textures
  water_texture_t  water_textures[4];       // The four normalmaps for water
  int32_t          wave_generator_count;    // Length of following array
  wave_generator_t wave_generators[0];      // Waves
} water_t;
```

```C
typedef struct water_texture_tag
{
  vec2f    water_normal_movement; // Direction of normal map scrolling
  ntstring water_normal_texture;  // Normal map
} water_texture_t;
```

```C
typedef struct wave_generator_tag
{
  ntstring texture_file;      // Wave texture
  ntstring ramp_file;         // Unknown use
  vec3f    position;          // Wave generator location
  float    rotation;          // Rotation around Y
  vec3f    velocity;          // Unknown use - perhaps wave speed?
  float    lifetime_first;    // Unknown use - perhaps how long after spawning first visible?
  float    lifetime_second;   // Unknown use
  float    period_first;      // Unknown use - perhaps how oftens waves spawn
  float    period_second;     // Unknown use
  float    scale_first;       // Unknown use - perhaps size of wave at lifetime_first?
  float    scale_second;      // Unknown use
  float    frame_count;       // Unknown use. Possible should be an int32_t
  float    frame_rate_first;  // Unknown use
  float    frame_rate_second; // Unknown use
  float    strip_count;       // Unknown use
} wave_generator_t;
```

Wave generators are not supported by the editor. Loaded maps will have their wave generators written back unchanged (which may not be what you want!). Similarly, the water textures and general water sections are not supported beyond changing elevation. Loaded maps will have their water section written back unchanged. Newly created maps will use the following defaults:

| Field                    | Default value                                          |
| ------------------------ | ------------------------------------------------------ |
| water_enabled            | true                                                   |
| elevation                | 0.75 * initial terrain height                          |
| elevation_deep           | 0.50 * initial terrain height                          |
| eleveation_abyss         | 0.25 * initial terrain height                          |
| surface_colour           | [0, 0.7, 1.5]                                          |
| colour_lerp              | [0.064, 0.119]                                         |
| refraction_scale         | 0.375                                                  |
| fresnel_bias             | 0.15                                                   |
| fresnel_power            | 1.5                                                    |
| unit_reflection          | 0.5                                                    |
| sky_reflection           | 1.5                                                    |
| water_sun_shininess      | 50                                                     |
| water_sun_strength       | 10                                                     |
| water_sun_direction      | [0.0999, -0.9626, 0.2519]                              |
| water_sun_colour         | [0.8127, 0.4741, 0.3386]                               |
| water_sun_reflection     | 5                                                      |
| water_sun_glow           | 0.1                                                    |
| water_sun_cubemap_file   | /textures/engine/waterCubemap.dds                      |
| water_ramp_file          | /textures/engine/waterramp.dds                         |
| normal_repeat            | [0.0009, 0.0090, 0.0500, 0.5000]                       |
| water_textures[4]        | [[0.5000, -0.9500], "/textures/engine/waves.dds", ...] |
| wave_generator_count     | 0                                                     |
| wave_generators[0]       | []                                                     |

##### Unknown section 1
The purpose of this section is unknown. It always consists of 24 bytes.

```C
typedef struct unknown_section_1_v56_t
{
  uint8_t unknown[24];
} unknown_section_1_v56_t;
```

The contents of these bytes are ignored, and always serialised as zeroes.

##### Layers
The layers section defines the albedo textures and normal textures to use for each layer. There are 10 albedo layers and 9 normal layers, and these are blended to produce the final output. The weightings for these layers, and how they are blended are described in the texturemap section.

```C
typedef struct layer_tag
{
  ntstring texture_file;    // Texture to use
  float    texture_scale;   // Scaling to apply to uv texture coordinates
} layer_t;
```

```C
typedef struct layers_tag
{
  layers_t albedo_layers[10];
  layers_t normal_layers[9];
} layers_t;
```

##### Decals
It's easiest to just come out and say that I do not really understand decals in Supreme Commander. What is a decal group? What, really, is decal in Supcom? Who knows! Is it wreckage? Trees?

```C
typedef struct decals_tag
{
  int8_t        unknown;                          // Unknown bytes. Serialised as 0
  int32_t       decal_count;                      // Number of decals
  decal_t       decals[decal_count];              // Decals
  int32_t       decal_group_count;                // Number of decal groups
  decal_group_t decal_groups[decal_group_count];  // Decal groups
} decals_t;

typedef struct decal_tag
{
  int32_t  id;                      // Unique ID of decal
  int32_t  decal_type;              // Type of decal
  int32_t  texture_count;           // Number of associated textures
  lpstring textures[texture_count]; // Associated textures
  vec3f    scale;                   // Scale of decal
  vec3f    position;                // Position of decal
  vec3f    rotation                 // Orientation of decal
  float    cutoff_lod;              // Furthest to render decal
  float    near_cutoff_lod;         // Nearest to render decal
  int32_t  owner_army;              // Owning army
} decal_t;

typedef struct decal_group_tag
{
  int32_t id;           // Unique ID of decal group
  ntstring name;        // Name of decal group
  int32_t data_length;  // Number of following integers
  int32_t data[0];      // data_length elements of mystery integers
} decal_group_t;
```

##### Normalmap
The normal maps affect how lighting reflects from the terrain. These are stored as DXT5 compressed DDS textures. Normalmaps have the same dimensions as heightmaps, without fence posting.

```C
typedef struct normalmap_tag
{
  int32_t width;          // Width of normalmap
  int32_t height;         // Height of normalmap
  int32_t count;          // Number of following normalmaps (always 1)
  uint32_t data_length;   // Length of following array
  uint8_t  data[0];       // data_length bytes of normalmap
} normalmap_t;
```

##### Texturemap
The texturemap defines how the layers defined earlier are blended together to build an output colour. There are 8 channels, expressed as a pair of RGBA textures, which are used as weights for the albedo and normal layers. Each channel has an 8 bit range, but only the lower half of the range is used for the albedo - anything above 127 achieves full intensity. The full 0-255 range is used as part of the normalmap/lighting pass.

The final albedo colour is calculated by starting with the layer 0, then interpolating between it and the next layer using the weights from this section.


```C
RGBA albedo = albedo_layers[0];
albedo = lerp(albedo, albedo_layers[1], saturate(texturemap_chan0_3[0] * 2));
albedo = lerp(albedo, albedo_layers[2], saturate(texturemap_chan0_3[1] * 2));
albedo = lerp(albedo, albedo_layers[3], saturate(texturemap_chan0_3[2] * 2));
albedo = lerp(albedo, albedo_layers[4], saturate(texturemap_chan0_3[3] * 2));
albedo = lerp(albedo, albedo_layers[5], saturate(texturemap_chan4_7[0] * 2));
albedo = lerp(albedo, albedo_layers[6], saturate(texturemap_chan4_7[1] * 2));
albedo = lerp(albedo, albedo_layers[7], saturate(texturemap_chan4_7[2] * 2));
albedo = lerp(albedo, albedo_layers[8], saturate(texturemap_chan4_7[3] * 2));
```

The format for each of the texturemaps is a RGBA DDS texture. Texturemaps have the half resolution of the heightmap, and do not have any fenceposting adjustment.

```C
typedef struct texturemap_tag
{
  int32_t chan0_3_length;           // Number of bytes in the following texturemap
  uint8_t chan0_3[chan0_3_length];  // A DDS RGBA texture
  int32_t chan4_7_length;           // Number of bytes in the following texturemap
  uint8_t chan4_7[chan4_7_length];  // A DDS RGBA texture
} texturemap_t;
```

##### Watermap
The watermap is something of a misnomer - it contains a variety of maps that acts as terrain metadata. These are half heightmap resolution, apart from the terrain type, which is at full heightmap resolution. No fence posting is required.

```C
// Here hm_w and hm_h are the non-fence posted heightmap width and height
typedef struct watermap_tag
{
  uint8_t unknown[4];      // Unknown purpose. Written as zeroes
  int32_t watermap_length; // Length of following watermap. Not actually used, as the length of a DDS texture can be determined from the header
  uint8_t watermap[watermap_length];  // DXT5 compressed DDS texture
  uint8_t foam_mask[hm_w * hm_h / 4]; // Simple array of foam mask data, 8bpp
  uint8_t flatness[hm_w * hm_h / 4]; // Simple array of flatness data, 8bpp
  uint8_t depth_bias[hm_w * hm_h / 4]; // Simple array of depth bias data, 8bpp
  uint8_t terrain_type[hm_w * hm_h]; // Simple array of terrain type data, 8bpp
} watermap_t;
```

How these fields are used by the game is unknown.
##### Unknown section 2
This section is only present in minor version 60. It /may/ contain decal glow data, but this is mostly suposition based on the names of the textures contained.

```C
typedef struct unknown_section_2_v56_tag
{
} unknown_section_2_v56_t;
```

##### Props
What is a prop? I'm not really sure! Maybe wreckage?

```C
typedef struct props_tag
{
  int32_t prop_count; // Length of following array
  prop_t  props[0];   // Array of props
} props_t;

typedef struct prop_tag
{
  nt_string blueprint_path; // Blueprint defining the prop
  vec3f     position;       // Location of prop
  vec3f     rotation_x;     // Rotation around X
  vec3f     rotation_y;     // Rotation around Y
  vec3f     rotation_z;     // Rotation around Z
  vec3f     scale;          // Scale
} prop_t;
```

#### 2.60
Notes in the following section do not affect serialisation, as maps are always serialised in 2.56.

##### Unknown section 1
The first unknown section is a fixed length array in version 56, but becomes a length prefixed variable length array in minor_version 60. The contents continue to be unknown, and the length has never been observed to be anything other than 24.

```C
typedef struct unknown_section_1_v60_tag
{
  int32_t length;       // Length of following array. Always seems to be 24
  uint8_t unknown[0];   // Array of unknown purpose
} unknown_section_1_v60_t;
```

##### Unknown section 2
The second unknown section is only present in version 60.

```C
typedef struct unknown_section_2_v60_tag
{
  uint8_t  unknown_1[0x40];
  ntstring unknown_2;
  ntstring unknown_3;
  int32_t  unknown_4;                   // Count of following array
  uint8_t  unknown_5[0x28 * unknown_4];
  uint8_t  unknown_6[0x13];
  ntstring unknown_7;
  uint8_t  unknown_8[0x58];
} unknown_section_2_v60_t;
```

#### < 2.56
Version 2.53 is not currently supported. It is known to differ is several ways, most noticable in that it only has 4 layers rather than 8.

### Views and tools
Heightmap and texture editing is performed using 'tools' and 'views'.

A view is a simple interface that allows you to read/write pixels from the underlying data, while a tool is the method of interacting with views.

#### Views
There are two base 'images' - the heightmap and texturemap. The heightmap is a 16bpp single channel image, while the texturemap is a 8bpp 8 channel image. These are represented by the `sc_edit_heightmap` and `sc_edit_texturemap`, which are themselves views. There is also `sc_edit_patch`, which is a small memory backed bitmap. All other views are designed to wrap other views, changing the behaviour of pixel reading or writing. The following views have been added:

* `sc_edit_view_symmetry`: Writing to this view will write the same value to additional pixels, depending on the selected type of symmetry. For example, if quadrant symmetry is selected and you write to the top-left pixel, all four corner pixels will be written.
* `sc_edit_view_snapshot`: Writing to this view will write to the wrapped view, but this will not affect the values read from the snapshot, which are frozen to those at time of creation.
* `sc_edit_view_oob_clamp`: Reading out of bounds values, for example (-1, -1) will be clamped to valid values in both axes, (0, 0) in this case.
* `sc_edit_view_mask`: Writing to this view will only write to subchannels selected by the mask.
* `sc_edit_view_convolution`: Reading from this view will apply a convolution filter to the read pixels. The convolution is specified in terms of an array of weights, plus a final divisor that is used to normalise the values. It also applies OOB clamping similarly to `sc_edit_view_oob_clamp`.

### Tools
Tools are designed for manipulating the map in various ways - changing the heightmap, texturemap, or markers (e.g. spawn points). Tools have a lifecycle associated with the way they are used - mouse-down, move and finally mouse-up. Tools that inherit from `sc_edit_tool_base` only have to implement the `__impl_*` functions.


| Method to override | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `__start_impl`   | Called once when mouse pressed. Use to take snapshots or do any onetime setup |
| `__apply_impl`   | Called repeatedly while the mouse is moving. If the mouse moves a long distance in one go intermediate steps will be generated every 0.25 * inner radius |
| `__end_impl`     | Called after the mouse is released. Use this to release any resources acquired by `__start_impl` |
| `__keydown_impl` | Called when a key is pressed |
| `__keyup_impl`   | Called when a key is released |

The following tools have been implemented:
* `sc_edit_tool_water_elevation`: Sets the water elevation to the elevation of the terrain at the cursor
* `sc_edit_tool_add_marker`: Used to place markers (e.g. spawn points, mass points, hydro)
* `sc_edit_select_marker`: Used to select, move or delete markers
* `sc_edit_tool_set`: Used to set all subchannels to a particular value. Used to set the intensity of a texturemap albedo layer.
* `sc_edit_tool_raise`: Used to increase the value of all subchannels. Can also be used to lower values.
* `sc_edit_tool_flatten`: Samples the area where first used, then sets the area it is applied to that value.
* `sc_edit_clear_higher`: Sets all subchannels higher than a value given at construction to zero.

In some cases, the target view passed to each tool is altered to control it's effect. For example, sc_edit_tool_set targets an `sc_edit_view_mask` when editing the texturemap so that it only changes a single channel at once.
