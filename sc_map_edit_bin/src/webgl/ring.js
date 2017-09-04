/**
 * Ring
 * Renders a ring around a given point using single pixel lines
 */
class webgl_ring {
  constructor(gl) {
    this.__gl = gl;
    this.__model_matrix = mat4.create();

    this.__generate_mesh();
  }

  /**
   * Builds a simple ring to render using GL_LINES
   * Ring is 1x1 in size
   */
  __generate_mesh() {
    let gl = this.__gl;

    // Generate static vertices
    let verts = [];
    let add_vert = (x, y, z) => { verts.push(x); verts.push(y); verts.push(z); };

    for (let i = 0; i < 201; i++) {
      const theta = i * Math.PI / 100;
      add_vert(Math.cos(theta), Math.sin(theta), 0);
    }

    // Build static array buffer for vertices
    this.__vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.__element_count = (verts.length / 3) - 1;
  }

  /**
   * Draws the ring
   * @param {webgl_effect} effect The shader to draw with
   * @param {webgl_camera} camera The camera viewing the scene
   * @param {sc_vec3} position The world position to render the ring
   * @param {number} scale The radius of tte ring
   * @param {sc_vec4} line_colour The RGB colour of the ring to render
   */
  draw(effect, camera, position, scale, line_colour) {
    effect.start();

    this.__bind_effect(effect, camera, position, scale, line_colour);
    this.__draw_mesh();

    effect.stop();
  }


  __bind_effect(effect, camera, position, scale, line_colour) {

    let gl = this.__gl;

    // We require the following uniforms:
    // uniform mat4 uMMatrix;
    // uniform mat4 uVMatrix;
    // uniform mat4 uPMatrix;
    // uniform medp vec4 uLineColour;

    // We require the following attributes:
    // attribute vec3 aVertexPosition;

    mat4.fromTranslation(this.__model_matrix, position);
    mat4.scale(this.__model_matrix, this.__model_matrix, vec3.fromValues(scale, scale, 1));


    if (!effect.set_uniform_mat4("uMMatrix", this.__model_matrix) ||
        !effect.set_uniform_mat4("uVMatrix", camera.view) ||
        !effect.set_uniform_mat4("uPMatrix", camera.projection) ||
        !effect.set_uniform_vec4("uLineColour", line_colour) ||
        !effect.bind_attribute("aVertexPosition", this.__vertex_buffer))
    {
      console.log("Failed to bind effect");
      return;
    }

    // Bind the index buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);

    // Setup blending mode
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  __draw_mesh() {
    let gl = this.__gl;

    gl.drawArrays(gl.LINE_STRIP, 0, this.__element_count);

    // Unbind
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}