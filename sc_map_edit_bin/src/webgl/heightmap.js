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
   * These will be created and an index buffer used to provide lookup
   * [1, 2, 4], [2, 5, 4], [2, 3, 5], [3, 6, 5],...
   *
   * As geometry changes the dynamic vertex array buffer will be changed
   * using gl.BufferSubData
   */
  __generate_mesh(heightmap) {
    let gl = this.__gl;

    // Generate static vertices
    let verts = [];
    for (let y = 0; y < heightmap.height; y++) {
      for (let x = 0; x < heightmap.width; x++) {
        verts.push(x);
        verts.push(y);
        verts.push(0);
      }
    }

    // Generate static index buffer
    let idx = function(x, y) { return y * heightmap.width + x; };
    let indices = [];
    for (let y = 0; y < heightmap.height - 1; y++) {
      for (let x = 0; x < heightmap.width - 1; x++) {
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Each six indicies define two triangles
    this.__element_count = indices.length / 3;
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

    // Bind vertex buffer to vertex attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, this.__vertex_buffer);
    gl.vertexAttribPointer(effect.attributes.aVertexPosition.index, 3, gl.FLOAT, false, 0, 0);

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
