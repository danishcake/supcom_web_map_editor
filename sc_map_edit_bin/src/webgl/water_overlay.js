const vec2 = require('gl-matrix').vec2;
const vec3 = require('gl-matrix').vec3;
const vec4 = require('gl-matrix').vec4;
const mat4 = require('gl-matrix').mat4;

/**
 * @class webgl_water_overlay
 * Water overlay mesh class.
 * Renders the water at the levels specified by the map.
 * This is achieved by rendering a plane at a height and colour passed to the
 *
 * @property {sc_vec2} __map_size
 * @property {WebGLRenderingContext} __gl
 * @property {WebGLBuffer} __vertex_buffer WebGL buffer containing raw vertex data
 * @property {number} __element_count Number of triangles
 * @property {sc_vec4} __water_colour Colour of water layer
 */
export class webgl_water_overlay {
  /**
   * Creates a webgl_heightmap
   * @param {WebGLRenderingContext} gl The WebGL rendering context to use
   * @param {sc_edit_heightmap} heightmap
   * @param {sc_vec4} water_colour Colour of water layer
   */
  constructor(gl, heightmap, water_colour) {
    this.__gl = gl;
    this.__heightmap = heightmap;
    this.__map_size = [heightmap.width, heightmap.height];
    this.__water_colour = water_colour;
    this.__model_matrix = mat4.create();
    this.__generate_mesh();
  }


  /**
   * Builds a quad
   */
  __generate_mesh() {
    let gl = this.__gl;

    // Generate static vertices
    let verts = [];

    verts.push(0);                  verts.push(0);                  verts.push(0);
    verts.push(this.__map_size[0]); verts.push(0);                  verts.push(0);
    verts.push(0);                  verts.push(this.__map_size[1]); verts.push(0);

    verts.push(this.__map_size[0]); verts.push(0);                  verts.push(0);
    verts.push(this.__map_size[0]); verts.push(this.__map_size[1]); verts.push(0);
    verts.push(0);                  verts.push(this.__map_size[1]); verts.push(0);

    // Build dynamic array buffer
    this.__vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Each three vertices define a triangle.
    this.__element_count = verts.length / 3;
  }


  /**
   * Checks the effect uniform/attribute set, binds appropriately and
   * draws the heightmap
   * @param {webgl_effect} effect Effect to draw with
   * @param {webgl_camera} camera Camera in use
   * @param {number} water_height Height of water layer
   */
  draw(effect, camera, water_height) {
    effect.start();

    this.__bind_effect(effect, camera, water_height);
    this.__draw_mesh();

    effect.stop();
  }


  /**
   * Binds buffers to effect uniform/attributes
   */
  __bind_effect(effect, camera, water_height) {
    let gl = this.__gl;

    mat4.fromTranslation(this.__model_matrix, [0, 0, water_height]);

    effect.unbind_all();

    effect.set_uniform_mat4("uMMatrix", this.__model_matrix);
    effect.set_uniform_mat4("uVMatrix", camera.view);
    effect.set_uniform_mat4("uPMatrix", camera.projection);
    effect.set_uniform_vec4("uWaterColour", this.__water_colour);
    effect.bind_attribute("aVertexPosition", this.__vertex_buffer);

    if (!effect.all_bound()) {
      console.log("Failed to bind effect");
      return;
    }

    // Bind the element buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
  }


  /**
   * Draw the mesh. Effect must have been bound already
   */
  __draw_mesh() {
    let gl = this.__gl;

    gl.drawArrays(gl.TRIANGLES, 0, this.__element_count);

    // TBD: Unbind stuff?
    // I think I only need to unbind the 'global' stuff. I can leave the effect specific stuff bound
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
