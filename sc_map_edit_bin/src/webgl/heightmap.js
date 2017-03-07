/**
 * Heightmap mesh class.
 * TODO: Release resources before replacing
 */
class webgl_heightmap {
  constructor(gl, heightmap) {
    this.__heightmap = heightmap;
    this.__map_size = [heightmap.width, heightmap.height];
    this.__gl = gl;
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
    this.__height_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.__height_texture);
    // Configure texture filtering for non-POT texture
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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

    gl.bindTexture(gl.TEXTURE_2D, null);
  }


  /**
   * Incremental update to the heightmap.
   * The regions of the heightmap that have changed are uploaded
   * The edit heightmap dirty region is cleared at the end of this process
   */
  update() {
    const gl = this.__gl;
    const dirty_region = this.__heightmap.dirty_region;
    this.__heightmap.update_range_stats();

    if (dirty_region) {
      gl.bindTexture(gl.TEXTURE_2D, this.__height_texture);


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

      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    this.__heightmap.reset_dirty_region();
  }


  /**
   * Checks the effect uniform/attribute set, binds appropriately and
   * draws the heightmap
   */
  draw(effect, camera) {
    effect.start();

    this.__bind_effect(effect, camera);
    this.__draw_mesh();

    effect.stop();
  }


  /**
   * Binds buffers to effect uniform/attributes
   */
  __bind_effect(effect, camera) {
    let gl = this.__gl;

    // We require the following attributes:
    // vec3 aPosition;

    // We require the following uniforms:
    // uniform mat4 uMVMatrix
    // uniform mat4 uPMatrix
    // uniform vec2 uMapSize
    // sampler2D uHeightmap;
    // sampler2D uTexturemap0_3; // TODO: Add these in once I get simple case working
    // sampler2D uTexturemap4_7; // TODO: Add these in once I get simple case working

    if (!effect.set_uniform_mat4("uMVMatrix", camera.modelview) ||
        !effect.set_uniform_mat4("uPMatrix", camera.projection) ||
        !effect.set_uniform_vec2("uMapSize", this.__map_size)   ||
        !effect.set_uniform_sampler2d("uHeightmap", this.__height_texture) ||
        !effect.set_uniform_float("uHeightmapScale", this.__heightmap.scale * 0.01) ||
        !effect.set_uniform_float("uShadeMin", this.__heightmap.minimum_height) ||
        !effect.set_uniform_float("uShadeMax", this.__heightmap.maximum_height) ||
        !effect.bind_attribute("aVertexPosition", this.__vertex_buffer))
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

    gl.drawElements(gl.TRIANGLES, this.__element_count * 3, gl.UNSIGNED_INT, 0)

    // TBD: Unbind stuff?
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // gl.vertexAttribPointer(effect.attributes.aVertexPosition.index, 3, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}