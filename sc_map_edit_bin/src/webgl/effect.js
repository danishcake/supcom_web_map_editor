/**
 * Effect class
 * Combines a vertex and fragment shader
 */
class webgl_effect {
  constructor(gl, vertex_shader_src, fragment_shader_src) {
    this.gl = gl;
    this.__compile(vertex_shader_src, fragment_shader_src);
    this.__enumerate_attributes();
    this.__enumerate_uniforms();
  }


  /**
   * Compiles and links the vertex and fragment shaders
   */
  __compile(vertex_shader_src, fragment_shader_src) {
    let gl = this.gl;

    // Hang onto source for debugging
    this.__vs_src = vertex_shader_src;
    this.__fs_src = fragment_shader_src;

    // Create shader objects
    this.__vs_obj = gl.createShader(gl.VERTEX_SHADER);
    this.__fs_obj = gl.createShader(gl.FRAGMENT_SHADER);

    // Compile the shaders
    gl.shaderSource(this.__vs_obj, this.__vs_src);
    gl.compileShader(this.__vs_obj);
    if (!gl.getShaderParameter(this.__vs_obj, gl.COMPILE_STATUS))
    {
      throw new Error(`An error occurred compiling the vertex shader: ${gl.getShaderInfoLog(this.__vs_obj)}`);
    }

    gl.shaderSource(this.__fs_obj, this.__fs_src);
    gl.compileShader(this.__fs_obj);
    if (!gl.getShaderParameter(this.__fs_obj, gl.COMPILE_STATUS))
    {
      throw new Error(`An error occurred compiling the fragment shader: ${gl.getShaderInfoLog(this.__fs_obj)}`);
    }

    // Link the shaders into a program
    this.__program = gl.createProgram();
    gl.attachShader(this.__program, this.__vs_obj);
    gl.attachShader(this.__program, this.__fs_obj);
    gl.linkProgram(this.__program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(this.__program, gl.LINK_STATUS))
    {
      throw new Error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(this.__program)}`);
    }
  }

  /**
   * Walks the vertex attributes linked into the program so we can bind by name later
   */
  __enumerate_attributes() {
    let gl = this.gl;

    this.__attributes = {};
    let n = 0;
    while (true) {
      let active_attribute = gl.getActiveAttrib(this.__program, n++);
      if (active_attribute) {
        console.log("Attribute name: " + active_attribute.name + " size: " + active_attribute.size + " type: " + active_attribute.type);
        this.__attributes[active_attribute.name] = {
          type: active_attribute.type,
          index: gl.getAttribLocation(this.__program, active_attribute.name)
        };

        switch (active_attribute.type) {
          case gl.FLOAT_VEC3:
            this.__attributes[active_attribute.name].element_type = gl.FLOAT;
            this.__attributes[active_attribute.name].element_count = 3;
            break;
          default:
            throw new Error(`Attribute type ${active_attribute.type} is not Vector3f. Only Vector3f supported`);
            break;
        }
      } else {
        break;
      }
    }
  }


  /**
   * Walks the uniforms linked into a program so we can bind by name later
   */
  __enumerate_uniforms() {
    let gl = this.gl;

    this.__uniforms = {};
    let n = 0;
    while (true) {
      let active_uniform = gl.getActiveUniform(this.__program, n++);
      if (active_uniform) {
        console.log("Uniform name: " + active_uniform.name + " size: " + active_uniform.size + " type: " + active_uniform.type);
        this.__uniforms[active_uniform.name] = {
          type: active_uniform.type,
          index: gl.getUniformLocation(this.__program, active_uniform.name)
        };
      } else {
        break;
      }
    }
  }


  /**
   * Activate the effect for future rendering.
   * You have to setup each uniform and bind each attribute before rendering
   */
  start() {
    let gl = this.gl;
    gl.useProgram(this.__program);

    for(var attribute in this.__attributes)
    {
      gl.enableVertexAttribArray(this.__attributes[attribute].index);
    }
  }

  /**
   * Deactivates the current effect
   */
  stop() {
    let gl = this.gl;
    gl.useProgram(null);
  }


  /**
  * Sets a uniform to the specified value
  * TODO: I could enforce some type safety here, or just use 'set_uniform' and inspect types at enumeration
  * TODO: I could provide more overloads here
  * TODO: Automate unbinding by tracking what is bound
  * TODO: Track texture usage so I can use more than one texture
  */
  set_uniform_mat4(uniform_id, val) { this.gl.uniformMatrix4fv(this.__uniforms[uniform_id].index, false, new Float32Array(val)); }
  set_uniform_vec4(uniform_id, val) { this.gl.uniform4fv(this.__uniforms[uniform_id].index, new Float32Array(val)); }
  set_uniform_vec3(uniform_id, val) { this.gl.uniform3fv(this.__uniforms[uniform_id].index, new Float32Array(val)); }
  set_uniform_vec2(uniform_id, val) { this.gl.uniform2fv(this.__uniforms[uniform_id].index, new Float32Array(val)); }
  set_uniform_sampler2d(uniform_id, val) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, val);
    this.gl.uniform1i(this.__uniforms[uniform_id].index, 0);
  }


  /**
   * Binds a vertex attribute
   */
  bind_attribute(attribute_id, buffer) {
    let attribute = this.__attributes[attribute_id];

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(attribute.index, attribute.element_count, attribute.element_type, false, 0, 0);
  }



  get attributes() { return this.__attributes; }
  get uniforms() { return this.__uniforms; }
}
