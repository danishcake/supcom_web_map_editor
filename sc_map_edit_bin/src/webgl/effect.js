/**
 * @class webl_effect_type_lut
 * Object containing lookup table of WebGL type enumerations to string representations
 */

/**
 * @class webgl_effect_attribute
 * @property {number} type WebGL type constant. @see webgl_effect_type_lut
 * @property {number} index Attribute index
 * @property {boolean} bound Value set true when attribute is bound
 * @property {number} element_type WebGL type constant. In practice always gl.FLOAT
 * @property {number} element_count Number of elements in this attribute. eg Vec4 will be 4
 */

/**
 * @class webgl_effect_uniform
 * @property {number} type WebGL type constant. @see webgl_effect_type_lut
 * @property {number} index Attribute index
 * @property {boolean} bound Value set true when attribute is bound
 * @property {number|null} texture_unit If a sampler is bound to this uniform, the texture unit used
 */

/**
 * @class webgl_effect
 * Effect class
 * Combines a vertex and fragment shader
 * @property {webl_effect_type_lut} __lut
 * @property {string} __vs_src Source code of vertex shader
 * @property {string} __fs_src Source code of fragment shader
 * @property {WebGLShader} __vs_obj Compiled vertex shader
 * @property {WebGLShader} __vs_obj Compiled fragment shader
 * @property {WebGLProgram} __program Linked and usable shader program
 * @property {webgl_effect_attribute[]} __attributes List of attributes stored by name as it appears in the shader source
 * @property {webgl_effect_uniform[]} __uniforms List of uniforms stored by name as it appears in the shader source
 * @property {number} __textures_bound Count of the textures bound. Used to address a new texture unit for each texture
 */
export class webgl_effect {
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
    this.__type_lut[gl.BOOL_VEC3]    = "BOOL_" +
      "";
    this.__type_lut[gl.BOOL_VEC4]    = "BOOL_VEC4";
    this.__type_lut[gl.FLOAT_MAT2]   = "FLOAT_MAT2";
    this.__type_lut[gl.FLOAT_MAT3]   = "FLOAT_MAT3";
    this.__type_lut[gl.FLOAT_MAT4]   = "FLOAT_MAT4";
    this.__type_lut[gl.BOOL]         = "BOOL";
    this.__type_lut[gl.INT]          = "INT";
    this.__type_lut[gl.FLOAT]        = "FLOAT";
    this.__type_lut[gl.SAMPLER_2D]   = "SAMPLER_2D";
    this.__type_lut[gl.SAMPLER_CUBE] = "SAMPLER_CUBE";

    this.__textures_bound = 0;

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
          index: gl.getAttribLocation(this.__program, active_attribute.name),
          bound: false
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
          index: gl.getUniformLocation(this.__program, active_uniform.name),
          bound: false,
          texture_unit: null
        };
      } else {
        break;
      }
    }
  }


  /**
   * Returns a string representation of the given OpenGL type
   * @param {number} type OpenGL type enumeration
   * @return {string} String representation of the provided type
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
   * @param {number} uniform_id Name of the uniform as it appears in the shader source
   * @param {number} uniform_type OpenGL type enumeration
   * @return false on mismatch
   */
  __check_uniform_type(uniform_id, uniform_type) {
    if (this.__uniforms[uniform_id] === undefined) {
      //console.log(`No such uniform '${uniform_id}'`);
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
    this.__uniforms[uniform_id].bound = true;
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
    this.__uniforms[uniform_id].bound = true;
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
    this.__uniforms[uniform_id].bound = true;
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
    this.__uniforms[uniform_id].bound = true;
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
    this.__uniforms[uniform_id].bound = true;
    return true;
  }


  /**
   * Sets a texture sampler to the specified texture.
   * Always uses texture slot 0 and leaves texture bound
   * @param uniform_id {String} Name of uniform as it appears in GLSL
   * @param val {webgl_texture} Texture ID
   */
  set_uniform_sampler2d(uniform_id, val) {
    if (!this.__check_uniform_type(uniform_id, this.gl.SAMPLER_2D)) {
      return false;
    }

    // Determine which texture unit to bind to
    // If not already bound just use the next one
    // If already bound, reuse the previous one
    if (this.__uniforms[uniform_id].texture_unit === null) {
      this.__uniforms[uniform_id].texture_unit = this.__textures_bound;
      this.__textures_bound++;
    }

    val.bind_to_unit(this.gl.TEXTURE0 + this.__uniforms[uniform_id].texture_unit);
    this.gl.uniform1i(this.__uniforms[uniform_id].index, this.__uniforms[uniform_id].texture_unit);
    this.__uniforms[uniform_id].bound = true;
    return true;
  }


  /**
   * Binds a vertex attribute
   */
  bind_attribute(attribute_id, buffer) {
    let attribute = this.__attributes[attribute_id];

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(attribute.index, attribute.element_count, attribute.element_type, false, 0, 0);
    attribute.bound = true;
    return true;
  }


  /**
   * Unbinds every attribute and uniform by calling each unbinder setup at binding time
   * Note: At the moment this just marks stuff as not bound. In the future I could use this
   * mechanism to actually perform unbinding if it proves to be necessary
   */
  unbind_all() {
    for (let attribute_id of Object.keys(this.__attributes)) {
      this.__attributes[attribute_id].bound = false;
    }
    for (let uniform_id of Object.keys(this.__uniforms)) {
      this.__uniforms[uniform_id].bound = false;
      this.__uniforms[uniform_id].texture_unit = null;
    }
    this.__textures_bound = 0;
  }


  /**
   * Returns true if every attribute and uniform has been bound since the last call to unbind_all
   */
  all_bound() {
    let ok = true;
    for (let attribute_id of Object.keys(this.__attributes)) {
      if (!this.__attributes[attribute_id].bound) {
        console.log(`Attribute ${attribute_id} not bound`);
        ok = false;
      }
    }

    for (let uniform_id of Object.keys(this.__uniforms)) {
      if (!this.__uniforms[uniform_id].bound) {
        console.log(`Uniform ${uniform_id} not bound`);
        ok = false;
      }
    }

    return ok;
  }


  get attributes() { return this.__attributes; }
  get uniforms() { return this.__uniforms; }
}
