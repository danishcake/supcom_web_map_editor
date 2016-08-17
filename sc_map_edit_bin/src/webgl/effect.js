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
      throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(this.__vs_obj)}`);
    }

    gl.shaderSource(this.__fs_obj, this.__fs_src);
    gl.compileShader(this.__fs_obj);
    if (!gl.getShaderParameter(this.__fs_obj, gl.COMPILE_STATUS))
    {
      throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(this.__fs_obj)}`);
    }

    // Link the shaders into a program
    this.__program = gl.createProgram();
    gl.attachShader(this.__program, this.__vs_obj);
    gl.attachShader(this.__program, this.__fs_obj);
    gl.linkProgram(this.__program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(this.__program, gl.LINK_STATUS))
    {
      new new Error("Unable to initialize the shader program.");
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
}
