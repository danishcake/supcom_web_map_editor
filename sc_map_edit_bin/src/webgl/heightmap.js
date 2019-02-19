const webgl_texture = require('./texture').webgl_texture;

/**
 * @class webgl_heightmap
 * Heightmap mesh class.
 * Renders in either heightmap or texturemap mode, depending on the effect passed in
 * TODO: Release resources before replacing
 *
 * @property {sc_edit_heightmap} __heightmap
 * @property {sc_edit_texturemap} __texturemap
 * @property {sc_vec2} __map_size
 * @property {WebGLRenderingContext} __gl
 * @property {WebGLBuffer} __index_buffer WebGL buffer containing index data
 * @property {WebGLBuffer} __vertex_buffer WebGL buffer containing raw vertex data
 * @property {number} __element_count Number of triangles
 * @property {webgl_texture} __height_texture WebGL texture with float heightmap
 * @property {webgl_texture[]} __texturemap_textures Pair of WebGL textures containing the 8 texture channels
 * @property {} __game_resources Game resources service
 */
export class webgl_heightmap {
  /**
   * Creates a webgl_heightmap
   * @param {WebGLRenderingContext} gl The WebGL rendering context to use
   * @param {sc_edit_heightmap} heightmap
   * @param {sc_map_layers} layers
   * @param {sc_edit_texturemap} texturemap
   * @property {} __game_resources Game resources service
   */
  constructor(gl, heightmap, layers, texturemap, game_resources) {
    this.__gl = gl;
    this.__heightmap = heightmap;
    this.__texturemap = texturemap;
    this.__map_size = [heightmap.width, heightmap.height];
    this.__game_resources = game_resources;
    this.__layers = layers;
    this.__generate_mesh();
  }


  /**
   * Builds a dynamic mesh and stores it in __mesh
   *
   * Simple example: If generating a 3x3 mesh the following nodes are required
   * 1    2    3
   *
   * 4    5    6
   *
   * 7    8    9
   *
   * These will be created and an index buffer used to provide lookup
   * [1, 2, 4], [2, 5, 4], [2, 3, 5], [3, 6, 5],...
   *
   * Furthermore a floating point height buffer will be updated on the fly.
   * As heights change the dynamic texture will be changed using gl.texImage2d/gl.texSubImage2d
   */
  __generate_mesh() {
    let gl = this.__gl;

    // Generate static vertices
    let verts = [];
    for (let y = 0; y < this.__heightmap.height; y++) {
      for (let x = 0; x < this.__heightmap.width; x++) {
        verts.push(x);
        verts.push(y);
        verts.push(0);
      }
    }

    // Generate static index buffer
    let idx = (x, y) => { return y * this.__heightmap.width + x; };
    let indices = [];
    for (let y = 0; y < this.__heightmap.height - 1; y++) {
      for (let x = 0; x < this.__heightmap.width - 1; x++) {
        indices.push(idx(x + 0, y + 0));
        indices.push(idx(x + 1, y + 0));
        indices.push(idx(x + 0, y + 1));
        indices.push(idx(x + 1, y + 0));
        indices.push(idx(x + 1, y + 1));
        indices.push(idx(x + 0, y + 1));
      }
    }

    // Build static index buffer
    this.__index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    // Build dynamic array buffer
    this.__vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Each six indicies define two triangles
    this.__element_count = indices.length / 3;

    // Build texture buffer (single channel 32bpp)
    this.__height_texture = new webgl_texture(gl, [
      {key: gl.TEXTURE_MIN_FILTER, value: gl.NEAREST},
      {key: gl.TEXTURE_MAG_FILTER, value: gl.NEAREST},
      {key: gl.TEXTURE_WRAP_S, value: gl.CLAMP_TO_EDGE},
      {key: gl.TEXTURE_WRAP_T, value: gl.CLAMP_TO_EDGE}
    ]);

    this.__height_texture.bind_to_unit(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D,
                  0,
                  gl.ALPHA,
                  this.__heightmap.width,
                  this.__heightmap.height,
                  0,
                  gl.ALPHA,
                  gl.FLOAT,
                  this.__heightmap.working_heightmap,
                  0);

    this.__height_texture.unbind();

    // Build the two texture lookup textures
    this.__texturemap_textures = [];
    for (let i = 0; i < 2; i++) {
      let texturemap_texture = new webgl_texture(gl, [
        {key: gl.TEXTURE_MIN_FILTER, value: gl.LINEAR},
        {key: gl.TEXTURE_MAG_FILTER, value: gl.LINEAR},
        {key: gl.TEXTURE_WRAP_S, value: gl.CLAMP_TO_EDGE},
        {key: gl.TEXTURE_WRAP_T, value: gl.CLAMP_TO_EDGE}
      ]);

      texturemap_texture.bind_to_unit(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    this.__texturemap.width,
                    this.__texturemap.height,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    [this.__texturemap.chan0_3.view, this.__texturemap.chan4_7.view][i],
                    0);

      texturemap_texture.unbind();
      this.__texturemap_textures.push(texturemap_texture);
    }
  }


  /**
   * Applies increment update to both the heightmap and texturemap
   */
  update() {
    this.__update_heightmap();
    this.__update_texturemap();
  }


  /**
   * Incremental update to the heightmap.
   * The regions of the heightmap that have changed are uploaded
   * The edit heightmap dirty region is cleared at the end of this process
   */
  __update_heightmap() {
    const gl = this.__gl;
    const dirty_region = this.__heightmap.dirty_region;
    this.__heightmap.update_range_stats();

    if (dirty_region) {
      this.__height_texture.bind_to_unit(gl.TEXTURE0);
      // If I had WebGL 2.0 I could use
      // gl.pixelStorei(gl.UNPACK_ROW_LENGTH, ...
      // gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, ...
      // gl.pixelStorei(gl.UNPACK_SKIP_ROWS, ...
      // gl.texSubImage2D(...

      // As I'm using WebGL 1.0 I'm going to have to copy into a packed array first
      const contiguous_dirty = new Float32Array(dirty_region.width * dirty_region.height);
      for (let y = 0; y < dirty_region.height; y++) {
        const iy = dirty_region.top + y;
        const dirty_line = this.__heightmap.working_heightmap.slice(this.__heightmap.width * iy + dirty_region.left,
                                                                    this.__heightmap.width * iy + dirty_region.right + 1);
        contiguous_dirty.set(dirty_line, y * dirty_region.width);
      }

      gl.texSubImage2D(gl.TEXTURE_2D,
                       0,
                       dirty_region.left,
                       dirty_region.top,
                       dirty_region.width,
                       dirty_region.height,
                       gl.ALPHA,
                       gl.FLOAT,
                       contiguous_dirty);

      this.__height_texture.unbind();
    }

    this.__heightmap.reset_dirty_region();
  }

  /**
   * Obtains a copy of the heightmap texture
   * @returns {*}
   */
  get heightmap_texture() {
    return this.__height_texture;
  }


  /**
   * Incremental update to the texturemap
   * The regions of the heightmap that have changed are uploaded
   * The dirty region is cleared at the end of this process
   * The texturemap requires two passes to update as it is has 8 channels packed into a pair of 4 channel textures
   * TODO: Use direct Uint8Array -> Uint8Array copies rather than this faffing around
   */
  __update_texturemap() {
    const gl = this.__gl;
    const dirty_region = this.__texturemap.dirty_region;

    if (dirty_region) {
      const contiguous_dirty = [new Uint8Array(dirty_region.width * dirty_region.height * 4),
        new Uint8Array(dirty_region.width * dirty_region.height * 4)];

      // Copy 4 channels into contiguous texture
      for (let y = 0; y < dirty_region.height; y++) {
        const iy = dirty_region.top + y;
        for (let x = 0; x < dirty_region.width; x++) {
          const ix = x + dirty_region.left;
          const dirty_pixel = this.__texturemap.get_pixel([ix, iy]);
          const output_index_base = (y * dirty_region.width + x) * 4;
          contiguous_dirty[0][output_index_base + 0] = dirty_pixel[0];
          contiguous_dirty[0][output_index_base + 1] = dirty_pixel[1];
          contiguous_dirty[0][output_index_base + 2] = dirty_pixel[2];
          contiguous_dirty[0][output_index_base + 3] = dirty_pixel[3];
          contiguous_dirty[1][output_index_base + 0] = dirty_pixel[4];
          contiguous_dirty[1][output_index_base + 1] = dirty_pixel[5];
          contiguous_dirty[1][output_index_base + 2] = dirty_pixel[6];
          contiguous_dirty[1][output_index_base + 3] = dirty_pixel[7];
        }
      }

      for (let i = 0; i < 2; i++) {
        this.__texturemap_textures[i].bind_to_unit(gl.TEXTURE0);
        gl.texSubImage2D(gl.TEXTURE_2D,
                         0,
                         dirty_region.left,
                         dirty_region.top,
                         dirty_region.width,
                         dirty_region.height,
                         gl.RGBA,
                         gl.UNSIGNED_BYTE,
                         contiguous_dirty[i]);

        this.__texturemap_textures[i].unbind();
      }
    }

    this.__texturemap.reset_dirty_region();
  }


  /**
   * Checks the effect uniform/attribute set, binds appropriately and
   * draws the heightmap
   * @param {bool} drawNavigabilityOverlay If set, non-navigable areas are highlighted
   */
  draw(effect, camera, drawNavigabilityOverlay) {
    effect.start();

    this.__bind_effect(effect, camera, drawNavigabilityOverlay);
    this.__draw_mesh();

    effect.stop();
  }


  /**
   * Binds buffers to effect uniform/attributes
   *
   * This heightmap can render is several different modes, each using a different effect. As long as everything in
   * the effect ends up bound we consider that a success.
   */
  __bind_effect(effect, camera, drawNavigabilityOverlay) {
    let gl = this.__gl;

    effect.unbind_all();

    effect.set_uniform_mat4("uVMatrix", camera.view);
    effect.set_uniform_mat4("uPMatrix", camera.projection);
    effect.set_uniform_vec2("uMapSize", this.__map_size);
    effect.set_uniform_sampler2d("uHeightmap", this.__height_texture);
    effect.set_uniform_sampler2d("uTerrainChan03", this.__texturemap_textures[0]);
    effect.set_uniform_sampler2d("uTerrainChan47", this.__texturemap_textures[1]);

    // Bind the many textures
    effect.set_uniform_sampler2d("uTerrainTextureBase", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[0].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture0", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[1].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture1", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[2].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture2", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[3].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture3", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[4].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture4", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[5].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture5", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[6].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture6", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[7].texture_file));
    effect.set_uniform_sampler2d("uTerrainTexture7", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[8].texture_file));
    effect.set_uniform_sampler2d("uTerrainTextureMacro", this.__game_resources.gl_texture_lookup(this.__layers.albedo_data[9].texture_file));

    // And the corresponding texture tiling constants
    effect.set_uniform_float("uTextureScaleBase", this.__layers.albedo_data[0].texture_scale);
    effect.set_uniform_float("uTextureScale0", this.__layers.albedo_data[1].texture_scale);
    effect.set_uniform_float("uTextureScale1", this.__layers.albedo_data[2].texture_scale);
    effect.set_uniform_float("uTextureScale2", this.__layers.albedo_data[3].texture_scale);
    effect.set_uniform_float("uTextureScale3", this.__layers.albedo_data[4].texture_scale);
    effect.set_uniform_float("uTextureScale4", this.__layers.albedo_data[5].texture_scale);
    effect.set_uniform_float("uTextureScale5", this.__layers.albedo_data[6].texture_scale);
    effect.set_uniform_float("uTextureScale6", this.__layers.albedo_data[7].texture_scale);
    effect.set_uniform_float("uTextureScale7", this.__layers.albedo_data[8].texture_scale);
    effect.set_uniform_float("uTextureScaleMacro", this.__layers.albedo_data[9].texture_scale);

    effect.set_uniform_float("uHeightmapScale", this.__heightmap.scale);

    let height_min = this.__heightmap.minimum_height;
    let height_max = this.__heightmap.maximum_height;
    // Avoid over sensitive tone mapping
    if (height_max - height_min < 256) {
      const mid_height = (height_max + height_min) / 2;
      height_min = mid_height - 128;
      height_max = mid_height + 128;
    }

    effect.set_uniform_float("uShadeMin", height_min);
    effect.set_uniform_float("uShadeMax", height_max);

    if (drawNavigabilityOverlay) {
      effect.set_uniform_float("uNavigabilityThreshold", 0.75 / this.__heightmap.scale);
    } else {
      effect.set_uniform_float("uNavigabilityThreshold", 65536);
    }

    effect.bind_attribute("aVertexPosition", this.__vertex_buffer);

    if (!effect.all_bound())
    {
      console.log("Failed to bind effect");
      return;
    }

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__index_buffer);
  }


  /**
   * Draw the mesh. Effect must have been bound already
   */
  __draw_mesh() {
    let gl = this.__gl;

    gl.drawElements(gl.TRIANGLES, this.__element_count * 3, gl.UNSIGNED_INT, 0);

    // TBD: Unbind stuff?
    // I think I only need to unbind the 'global' stuff. I can leave the effect specific stuff bound
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // gl.vertexAttribPointer(effect.attributes.aVertexPosition.index, 3, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
