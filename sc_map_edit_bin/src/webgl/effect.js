/**
 * Effect class
 * Combines a vertex and fragment shader
 */
class webgl_effect {
  constructor(gl, vertex_shader_src, fragment_shader_src) {
    this.gl = gl;

    // Build a type LUT for debugging
    this.__type_lut = {};
    this.__type_lut[gl.FLOAT_VEC2]   = "FLOAT_VEC2";
    this.__type_lut[gl.FLOAT_VEC3]   = "FLOAT_VEC3";
    this.__type_lut[gl.FLOAT_VEC4]   = "FLOAT_VEC4";
    this.__type_lut[gl.INT_VEC2]     = "INT_VEC2";
    this.__type_lut[gl.INT_VEC3]     = "INT_VEC3";
    this.__type_lut[gl.INT_VEC4]     = "INT_VEC4";
    this.__type_lut[gl.BOOL_VEC2]    = "BOOL_VEC2";
    this.__type_lut[gl.BOOL_VEC3]    = "BOOL_VEC3";
    this.__type_lut[gl.BOOL_VEC4]    = "BOOL_VEC4";
    this.__type_lut[gl.FLOAT_MAT2]   = "FLOAT_MAT2";
    this.__type_lut[gl.FLOAT_MAT3]   = "FLOAT_MAT3";
    this.__type_lut[gl.FLOAT_MAT4]   = "FLOAT_MAT4";
    this.__type_lut[gl.BOOL]         = "BOOL";
    this.__type_lut[gl.INT]          = "INT";
    this.__type_lut[gl.FLOAT]        = "FLOAT";
    this.__type_lut[gl.SAMPLER_2D]   = "SAMPLER_2D";
    this.__type_lut[gl.SAMPLER_CUBE] = "SAMPLER_CUBE";


    this.__compile(vertex_shader_src, fragment_shader_src);
    this.__enumerate_attributes();
    this.__enumerate_uniforms();
  }

  /**
   * Extracts the text from a DOM element, concatenating adjacent siblings
   */
  static text_from_element(element_id) {
     let parent_element = document.getElementById(element_id);
      if (!parent_element) {
        throw new Error(`Unable to find element '${element_id}'`);
     }

     let child_element = parent_element.firstChild;
     let text = "";

     while (child_element)
     {
        if (child_element.nodeType == child_element.TEXT_NODE)
        {
           text += child_element.textContent;
        }
        child_element = child_element.nextSibling;
     }

     return text;
  }

  /**
   * Helper function to construct a webgl_effect with sources extracted from
   * the DOM
   */
  static create_from_dom(gl, vs_id, fs_id) {
    const vs_src = webgl_effect.text_from_element(vs_id);
    const fs_src = webgl_effect.text_from_element(fs_id);
    return new webgl_effect(gl, vs_src, fs_src);
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
        console.log("Attribute name: " + active_attribute.name +
                    " size: " + active_attribute.size +
                    " type: " + this.__get_type_string(active_attribute.type));
        this.__attributes[active_attribute.name] = {
          type: active_attribute.type,
          index: gl.getAttribLocation(this.__program, active_attribute.name)
        };

        switch (active_attribute.type) {
          case gl.FLOAT_VEC2:
            this.__attributes[active_attribute.name].element_type = gl.FLOAT;
            this.__attributes[active_attribute.name].element_count = 2;
            break;
          case gl.FLOAT_VEC3:
            this.__attributes[active_attribute.name].element_type = gl.FLOAT;
            this.__attributes[active_attribute.name].element_count = 3;
            break;
          case gl.FLOAT_VEC4:
            this.__attributes[active_attribute.name].element_type = gl.FLOAT;
            this.__attributes[active_attribute.name].element_count = 4;
            break;
          default:
            throw new Error(`Attribute type ${this.__get_type_string(active_attribute.type)} not supported`);
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
        console.log("Uniform name: " + active_uniform.name +
                    " size: " + active_uniform.size +
                    " type: " + this.__get_type_string(active_uniform.type));
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
   * Returns a string representation of the given OpenGL type
   */
  __get_type_string(type) {
    return this.__type_lut[type] || `UNKNOWN TYPE (${type})`;
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
   * Checks uniform exists and is of correct type
   * @return false on mismatch
   */
  __check_uniform_type(uniform_id, uniform_type) {
    if (this.__uniforms[uniform_id] === undefined) {
      console.log(`No such uniform '${uniform_id}'`);
      return false;
    }

    if (this.__uniforms[uniform_id].type !== uniform_type) {
      console.log(`Uniform '${uniform_id} is wrong type (required ${this.__get_type_string(uniform_type)} found ${this.__get_type_string(this.__uniforms[uniform_id].type)}'`);
      return false;
    }

    return true;
  }


  /*
  * TODO: I could provide more overloads here
  * TODO: Automate unbinding by tracking what is bound
  * TODO: Track texture usage so I can use more than one texture
  */


  /**
  * Sets a uniform to the specified value
  * @param uniform_id {String} Name of uniform as it appears in GLSL
  * @param val {Array} float
  */
  set_uniform_float(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.FLOAT)) {
      return false;
    }

    this.gl.uniform1f(this.__uniforms[uniform_id].index, val);
    return true;
  }


  /**
  * Sets a uniform to the specified value
  * @param uniform_id {String} Name of uniform as it appears in GLSL
  * @param val {Array} float[16]
  */
  set_uniform_mat4(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.FLOAT_MAT4)) {
      return false;
    }

    this.gl.uniformMatrix4fv(this.__uniforms[uniform_id].index, false, new Float32Array(val));
    return true;
  }


  /**
   * Sets a uniform to the specified value
   * @param uniform_id {String} Name of uniform as it appears in GLSL
   * @param val {Array} float[4]
   */
  set_uniform_vec4(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.FLOAT_VEC4)) {
      return false;
    }

    this.gl.uniform4fv(this.__uniforms[uniform_id].index, new Float32Array(val));
    return true;
  }


  /**
   * Sets a uniform to the specified value
   * @param uniform_id {String} Name of uniform as it appears in GLSL
   * @param val {Array} float[3]
   */
  set_uniform_vec3(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.FLOAT_VEC3)) {
      return false;
    }

    this.gl.uniform3fv(this.__uniforms[uniform_id].index, new Float32Array(val));
    return true;
  }


  /**
   * Sets a uniform to the specified value
   * @param uniform_id {String} Name of uniform as it appears in GLSL
   * @param val {Array} float[2]
   */
  set_uniform_vec2(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.FLOAT_VEC2)) {
      return false;
    }

    this.gl.uniform2fv(this.__uniforms[uniform_id].index, new Float32Array(val));
    return true;
  }


  /**
   * Sets a texture sampler to the specified texture.
   * Always uses texture slot 0 and leaves texture bound
   * @param uniform_id {String} Name of uniform as it appears in GLSL
   * @param val {Number} Texture ID
   */
  set_uniform_sampler2d(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.SAMPLER_2D)) {
      return false;
    }

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, val);
    this.gl.uniform1i(this.__uniforms[uniform_id].index, 0);
    return true;
  }


  /**
   * Binds a vertex attribute
   */
  bind_attribute(attribute_id, buffer) {
    let attribute = this.__attributes[attribute_id];

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(attribute.index, attribute.element_count, attribute.element_type, false, 0, 0);
    return true;
  }



  get attributes() { return this.__attributes; }
  get uniforms() { return this.__uniforms; }
}
