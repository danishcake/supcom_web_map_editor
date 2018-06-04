/**
 * Marker
 * Renders a marker over the map. Each version of this class
 * will render a different marker - mass, energy, unknown etc
 * It can then be called to render many times
 */
class webgl_marker {
  /**
   * Creates a webgl_marker
   * @param {WebGLRenderingContext} gl The WebGL rendering context to use
   * @param {WebGLTexture} texture The webGL texture to display here
   */
  constructor(gl, texture) {
    this.__gl = gl;
    this.__texture = texture;
    this.__model_matrix = mat4.create();

    this.__generate_mesh();
  }

  /**
   * Builds a simple quad to render using GL_TRIANGLES
   * Quad is 1x1 in size
   */
  __generate_mesh() {
    let gl = this.__gl;

    // Generate static vertices
    let verts = [];
    let tx_coords = [];
    let indices = [];
    let add_vert = (x, y, z) => { verts.push(x); verts.push(y); verts.push(z); };
    let add_tx = (u, v) => { tx_coords.push(u); tx_coords.push(v); };
    let add_triangle = (v0, v1, v2) => { indices.push(v0); indices.push(v1); indices.push(v2); };

    // TBD: Displace by (-0.5, -0.5) ?
    add_vert(-1, -1, 0); add_tx(0, 0);
    add_vert( 1, -1, 0); add_tx(1, 0);
    add_vert( 1,  1, 0); add_tx(1, 1);
    add_vert(-1,  1, 0); add_tx(0, 1);
    add_triangle(0, 1, 2);
    add_triangle(0, 2, 3);

    // Build static array buffer for vertices
    this.__vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Build static array buffer for texture coordinates
    this.__uv_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__uv_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tx_coords), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Build static index buffer
    this.__index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Each three indices define a triangle
    this.__element_count = indices.length / 3;
  }

  /**
   * Draws the marker
   * @param {webgl_effect} effect The shader to draw with
   * @param {webgl_camera} camera The camera viewing the scene
   * @param {sc_vec3} position The world position to render the marker
   * @param {bool} selected If the marker is selected
   * @param {sc_edit_heightmap} heightmap The heightmap, from which to extract render height
   */
  draw(effect, camera, position, selected, heightmap) {
    effect.start();

    const grid_position = vec2.create();
    vec2.round(grid_position, [position.x, position.z]);
    const height_at_position = heightmap.get_pixel(grid_position)[0] * heightmap.scale;

    this.__bind_effect(effect, camera, vec3.fromValues(position.x, position.z, height_at_position), selected);
    this.__draw_mesh();

    effect.stop();
  }


  __bind_effect(effect, camera, position, selected) {

    let gl = this.__gl;

    // We require the following uniforms:
    // uniform mat4 uMMatrix;
    // uniform mat4 uVMatrix;
    // uniform mat4 uPMatrix;
    // uniform medp vec3 uTint;
    // uniform highp sampler2D uMarkerTexture;

    // We require the following attributes:
    // attribute vec3 aVertexPosition;
    // attribute vec2 aTextureCoordinate;

    mat4.fromTranslation(this.__model_matrix, position);

    let tint = [0, 0, 0];
    if (selected) {
      tint = [0.2, 0.2, 0.8];
    }

    if (!effect.set_uniform_mat4("uMMatrix", this.__model_matrix) ||
        !effect.set_uniform_mat4("uVMatrix", camera.view) ||
        !effect.set_uniform_mat4("uPMatrix", camera.projection) ||
        !effect.set_uniform_sampler2d("uMarkerTexture", this.__texture) ||
        !effect.set_uniform_vec3("uTint", tint) ||
        !effect.bind_attribute("aVertexPosition", this.__vertex_buffer) ||
        !effect.bind_attribute("aTextureCoordinate", this.__uv_buffer))
    {
      console.log("Failed to bind effect");
      return;
    }

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__index_buffer);

    // Setup blending mode
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  __draw_mesh() {
    let gl = this.__gl;

    gl.drawElements(gl.TRIANGLES, this.__element_count * 3, gl.UNSIGNED_INT, 0)

    // Unbind
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
}