/**
 * Symmetry outline
 * Renders a line around a set of points denoting the current symmetry region
 * @property {sc_edit_heightmap} __heightmap
 * @property {sc_edit_symmetry_base} __symmetry
 */
class webgl_symmetry {
  constructor(gl, heightmap, symmetry) {
    this.__gl = gl;
    this.__model_matrix = mat4.create();
    this.__heightmap = heightmap;
    this.__symmetry = symmetry;
    this.__map_size = [heightmap.width - 1, heightmap.height - 1];

    this.__generate_mesh();
  }

  /**
   * Builds a simple ring to render using GL_LINES
   * Ring is 1x1 in size
   */
  __generate_mesh() {
    let gl = this.__gl;

    // Generate static vertices. These are x/y pairs that will be raised/lowered by the heightmap
    let verts = [];
    let add_vert = (x, y) => {
      // Insert additional points along the line formed by additional point
      if (verts.length !== 0) {
        const last_xy = verts.slice(-2);
        const length = Math.sqrt(Math.pow(last_xy[0] - x, 2) + Math.pow(last_xy[1] - y, 2));
        if (length > 1) {

          const step = [(x - last_xy[0]) / length, (y - last_xy[1]) / length];
          // This will lead to poor sampling along diagonals, but a consistent number of points
          for (let offset = 1; offset < length; offset++) {
            verts.push(last_xy[0] + step[0] * offset);
            verts.push(last_xy[1] + step[1] * offset);
          }
        }
      }

      verts.push(x);
      verts.push(y);
    };

    // TODO: Sample along the lines and generate additional points at the corresponding heightmap
    // heights. Regenerate on change
    const bounding_points = this.__symmetry.get_primary_bounding_points(this.__map_size);
    for (let bounding_point of bounding_points) {
      add_vert(bounding_point[0], bounding_point[1]);
    }
    add_vert(bounding_points[0][0], bounding_points[0][1]);

    // Build static array buffer for vertices
    this.__vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Line strip, so use all elements
    this.__element_count = (verts.length / 2);
  }

  /**
   * Draws the bounding primary region
   * @param {webgl_effect} effect The shader to draw with
   * @param {webgl_camera} camera The camera viewing the scene
   * @param {sc_edit_symmetry_base} symmetry The symmetry currently employed
   * @param {webgl_texture} heightmap_texture The heightmap texture to use. This is
   * calculated by the webgl_heightmap component, but should probably be factored out
   */
  draw(effect, camera, symmetry, heightmap_texture) {
    if (this.__symmetry !== symmetry)
    {
      this.__symmetry = symmetry;
      this.__generate_mesh();
    }

    effect.start();

    this.__bind_effect(effect, camera, [1, 1, 1, 1], heightmap_texture);
    this.__draw_mesh();

    effect.stop();
  }


  __bind_effect(effect, camera, line_colour, heightmap_texture) {

    let gl = this.__gl;

    // We require the following uniforms:
    // uniform mat4 uMMatrix;
    // uniform mat4 uVMatrix;
    // uniform mat4 uPMatrix;
    // uniform medp vec4 uLineColour;
    // uniform vec2 uMapSize;
    // uniform highp sampler2D uHeightmap;
    // uniform highp float uHeightmapScale;

    // We require the following attributes:
    // attribute vec2 aVertexPosition;

    if (!effect.set_uniform_mat4("uMMatrix", this.__model_matrix) ||
        !effect.set_uniform_mat4("uVMatrix", camera.view) ||
        !effect.set_uniform_mat4("uPMatrix", camera.projection) ||
        !effect.set_uniform_vec4("uLineColour", line_colour) ||
        !effect.set_uniform_vec2("uMapSize", this.__map_size) ||
        !effect.set_uniform_sampler2d("uHeightmap", heightmap_texture) ||
        !effect.set_uniform_float("uHeightmapScale", this.__heightmap.scale) ||
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