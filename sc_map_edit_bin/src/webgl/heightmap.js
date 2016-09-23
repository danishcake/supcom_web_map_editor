/**
 * Heightmap mesh class.
 * TODO: Release resources before replacing
 */
class webgl_heightmap {
  constructor(gl, heightmap) {
    this.__map_size = [heightmap.width, heightmap.height];
    this.__gl = gl;
    this.__generate_mesh(heightmap);
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
   * These will be created in a temporary variable, then sampled in the order
   * [1, 2, 4], [2, 5, 4], [2, 3, 5], [3, 6, 5],...
   *
   * Currently the plan is to use a displacement map (the heightmap) to achieve nice runtime
   * editable heightmaps without regenerating the mesh continuously
   */
  __generate_mesh(heightmap) {
    let gl = this.__gl;

    // Generate static vertices
    let verts = [];
    for (let y = 0; y < heightmap.height; y++) {
      for (let x = 0; x < heightmap.width; x++) {
        //verts.push(x, y, 0);
        verts.push(x);
        verts.push(y);
        verts.push(0);
      }
    }

    // Generate static index buffer
    let idx = function(x, y) { return (y * heightmap.width + x) * 3; };
    let triangles = [];
    for (let y = 0; y < heightmap.height - 1; y++) {
      for (let x = 0; x < heightmap.width - 1; x++) {
        triangles.push(verts[idx(x,     y) + 0]);
        triangles.push(verts[idx(x,     y) + 1]);
        triangles.push(verts[idx(x,     y) + 2]);
        triangles.push(verts[idx(x + 1, y) + 0]);
        triangles.push(verts[idx(x + 1, y) + 1]);
        triangles.push(verts[idx(x + 1, y) + 2]);
        triangles.push(verts[idx(x,     y + 1) + 0]);
        triangles.push(verts[idx(x,     y + 1) + 1]);
        triangles.push(verts[idx(x,     y + 1) + 2]);
        triangles.push(verts[idx(x + 1, y) + 0]);
        triangles.push(verts[idx(x + 1, y) + 1]);
        triangles.push(verts[idx(x + 1, y) + 2]);
        triangles.push(verts[idx(x + 1, y + 1) + 0]);
        triangles.push(verts[idx(x + 1, y + 1) + 1]);
        triangles.push(verts[idx(x + 1, y + 1) + 2]);
        triangles.push(verts[idx(x,     y + 1) + 0]);
        triangles.push(verts[idx(x,     y + 1) + 1]);
        triangles.push(verts[idx(x,     y + 1) + 2]);
      }
    }

    // Convert to VBO
    this.__vertex_buffer = gl.createBuffer();
    this.__vertex_buffer_size = triangles.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
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

  __bind_effect(effect, camera) {
    let gl = this.__gl;

    // We require the following attributes:
    // vec3 aPosition;

    // We require the following uniforms:
    // uniform mat4 uMVMatrix
    // uniform mat4 uPMatrix
    // sampler2D uHeightmap;     // TODO: Add these in once I get simple case working
    // sampler2D uTexturemap0_3; // TODO: Add these in once I get simple case working
    // sampler2D uTexturemap4_7; // TODO: Add these in once I get simple case working

    effect.set_uniform_mat4("uMVMatrix", camera.modelview);
    effect.set_uniform_mat4("uPMatrix", camera.projection);
    effect.set_uniform_vec2("uMapSize", this.__map_size)

    /* Check effect compatibility */
    if (effect.attributes["aVertexPosition"] === undefined)
    {
      console.log("Model required aPosition in effect");
      return;
    }

    // Bind vertex buffer and draw it
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.vertexAttribPointer(effect.attributes.aVertexPosition.index, 3, gl.FLOAT, false, 0, 0);
  }


  /**
   * Draw the mesh. Effect must have been bound already
   */
  __draw_mesh() {
    let gl = this.__gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.drawArrays(gl.TRIANGLES, 0, this.__vertex_buffer_size);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
