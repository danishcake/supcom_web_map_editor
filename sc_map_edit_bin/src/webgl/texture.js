/**
 * A parameter to be bound to a texture unit with texParameteri
 * @class webgl_textureparameter
 * @property {number} key
 * @property {number} value
 */

/**
 * Wraps a texture, tracking associated parameters that must be set on the corresponding texture unit
 * @property {WebGLRenderingContext} __gl Rendering context
 * @property {number} __texture_id The OpenGL texture ID
 * @property {webgl_textureparameter[]} __tex_parameters The list of parameters to set on the texture unit during binding
 * @property {number|null} __last_bound_texture_unit The texture unit last used, or null if not used
 */
class webgl_texture {
  /**
   * Generates an empty texture ID
   * @param {WebGLRenderingContext} gl
   * @param {webgl_textureparameter[]} Initial set of parameters
   */
  constructor(gl, params) {
    this.__gl = gl;
    this.__texture_id = gl.createTexture();
    this.__tex_parameters_i = params || [];
    this.__last_bound_texture_unit = null;
  }

  /**
   * Gets the texture ID
   * @return {WebGLTexture|*}
   */
  get texture_id() {
    return this.__texture_id;
  }

  /**
   * Gets the integer parameters uesd by this texture
   * @return {webgl_textureparameter[]}
   */
  get tex_parameters_i() {
    return this.__tex_parameters_i;
  }

    /**
     * Binds this texture to the given texture unit/uniform id
     */
  bind_to_unit(texture_unit) {
    const gl = this.__gl;
    gl.activeTexture(texture_unit);
    gl.bindTexture(gl.TEXTURE_2D, this.__texture_id);
    for (let tex_parameter of this.__tex_parameters_i) {
      gl.texParameteri(gl.TEXTURE_2D, tex_parameter.key, tex_parameter.value);
    }
    this.__last_bound_texture_unit = texture_unit;
  }

  /**
   * Clears the binding
   */
  unbind() {
    const gl = this.__gl;
    if (this.____last_bound_texture_unit !== null) {
      gl.activeTexture(this.__last_bound_texture_unit);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }
}