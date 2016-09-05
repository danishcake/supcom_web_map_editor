
/**
 * Represents a camera that can pan/zoom within the bounds of map
 * in a similar fashion to that within SupCom
 */
class webgl_camera {
  constructor(gl, width, height) {
    this.__gl = gl;
    this.__width = width;
    this.__height = height;
    this.__long_edge = Math.max(this.__width, this.__height);
    this.__short_edge = Math.min(this.__width, this.__height);
    this.__fov = 90;
    this.__focus = V3.$(this.__width / 2, this.__height / 2, 0);
    this.__zoom = 0;
    this.__up_vector = V3.$(0, -1, 0);

    // Calculate initial model_view/perspective matrices
    this.tick();
  }


  /**
   * Updates matrices based on current focus, zoom etc
   */
  tick() {
  // At maximum zoom (1) we will define ourselves as showing 16 units down the shortest axis
    // At minimum zoom (0) we will define ourselves as showing the entire map * 1.2 down the shortest axis
    // In between we're initially going to just linearly interpolate the z position
    // I'm sure I can make this MUCH nicer with an easing curve

    // Assuming frustrum short edge length is sqrt(2) * z_height * 0.5
    // z_height = 32 / sqrt(2) = 22.6ish
    // TODO: Make this above terrain height
    let nearest_z_position = V3.$(this.__focus[0], this.__focus[1], 22.6);
    let furthest_z_position = V3.$(this.__focus[0], this.__focus[1], this.__long_edge * 1.1 / 2.0);
    let delta = V3.sub(furthest_z_position, nearest_z_position);

    let camera_position = V3.sub(furthest_z_position, V3.scale(delta, this.__zoom));

    this.__model_view = M4x4.makeLookAt(camera_position, this.__focus, this.__up_vector);
    // TODO: Aspect ratio of 1 should be varied with resolution - query gl object?
    let aspect_ratio = this.__gl.drawingBufferWidth / this.__gl.drawingBufferHeight;

    this.__perspective = M4x4.makePerspective(this.__fov, aspect_ratio, -1, 1);
  }


  /**
   * Returns the current model-view matrix
   */
  get modelview() {
    return this.__model_view;
  }


  /**
   * Returns the current projection matrix
   */
  get projection() {
    return this.__perspective;
  }


  /**
   * Zooms in a single notch
   */
  zoom_in() {
    if (this.__zoom < 1) {
      this.__zoom += 1 / 128;
    }
  }


  /**
   * Zooms out by a single notch
   */
  zoom_out() {
    if (this.__zoom > 0) {
      this.__zoom -= 1 / 128;
    }
  }

  set_focus(focus) {
    this.__focus[0] = focus[0];
    this.__focus[1] = focus[1];
    this.__focus[2] = 0;
  }

  /**
   * Identifies the position in the plane (z=0) that a screen-space coordinate maps to
   * This will be used for changing the focus
   */
  project_to_world(screen_position) {
    // TODO: Implement
    return null;
  }
}
