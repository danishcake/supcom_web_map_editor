
/**
 * Represents a camera that can pan/zoom within the bounds of map
 * in a similar fashion to that within SupCom
 */
class webgl_camera {
  constructor(gl, scene_size) {
    this.__gl = gl;
    this.__scene_size = scene_size;
    this.__long_edge = Math.max(this.__scene_size[0], this.__scene_size[1]);
    this.__short_edge = Math.min(this.__scene_size[0], this.__scene_size[1]);
    this.__fov = 90;
    this.__focus = vec3.fromValues(this.__scene_size[0] / 2, this.__scene_size[1] / 2, 0);
    this.__camera_position = vec3.fromValues(this.__scene_size[0] / 2, this.__scene_size[1] / 2, 1);
    this.__look_at = vec3.fromValues(this.__scene_size[0] / 2, this.__scene_size[1] / 2, 0);
    this.__up_vector = vec3.fromValues(0, 1, 0);
    this.__zoom = 0;
    this.__steps = 128;
    this.__model_view = mat4.create();
    this.__perspective = mat4.create();

    const nearest_length = 22.6;
    const farthest_length = this.__long_edge * 1.1 / 2.0;
    this.__camera_position[2] = nearest_length + (farthest_length - nearest_length) * this.__zoom;

    // Calculate initial model_view/perspective matrices
    this.tick();
  }


  /**
   * Updates matrices based on current focus, zoom etc
   */
  tick() {
    mat4.lookAt(this.__model_view, this.__camera_position, this.__look_at, this.__up_vector);
    let aspect_ratio = this.__gl.drawingBufferWidth / this.__gl.drawingBufferHeight;
    mat4.perspective(this.__perspective, this.__fov, aspect_ratio, 0.0001, 8192);
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
    zoom_steps(1);
  }


  /**
   * Zooms out by a single notch
   */
  zoom_out() {
    zoom_steps(-1);
  }


  /**
   * Zooms in or out by the specified number of steps
   */
  zoom_steps(steps) {
    this.__zoom = Math.max(0, Math.min(1, this.__zoom + steps / this.__steps));

    const nearest_length = 22.6;
    const farthest_length = this.__long_edge * 1.1 / 2.0;
    const old_position = vec3.clone(this.__camera_position);
    const old_z = this.__camera_position[2];
    const new_z = nearest_length + (farthest_length - nearest_length) * this.__zoom;

    let zoom_scale_change = new_z / old_z;
    // At maximum zoom (1) we will define ourselves as showing 16 units down the shortest axis
    // At minimum zoom (0) we will define ourselves as showing the entire map * 1.2 down the shortest axis
    // In between we're initially going to just linearly interpolate the z position
    // I'm sure I can make this MUCH nicer with an easing curve
    //
    // Assuming frustrum short edge length is sqrt(2) * z_height * 0.5
    // z_height = 32 / sqrt(2) = 22.6ish
    //
    // __focus, which is the position under the cursor, should not be
    // changed by zooming in. This means that camera position needs to be updated so that
    // the mouse coordinates map to the same location
    // http://stackoverflow.com/questions/13155382/jscrollpane-zoom-relative-to-mouse-position?noredirect=1&lq=1
    //
    // Basically if I zoom in by 10% I set the new position to 0.1 * focus + 1.1 * old_position
    // and if I zoom out 10% I set the new position to -0.1 * focus + 0.9 * old_position

    vec3.scale(this.__camera_position, this.__focus, zoom_scale_change);
    vec3.scale(old_position, old_position, 1 - zoom_scale_change);
    vec3.add(this.__camera_position, this.__camera_position, old_position);


    this.__camera_position[2] = new_z;
    this.__look_at[0] = this.__camera_position[0];
    this.__look_at[1] = this.__camera_position[1];
  }


  /**
   * Sets the centre of the zoom process
   */
  set_focus(focus) {
    this.__focus[0] = focus[0];
    this.__focus[1] = focus[1];
    this.__focus[2] = 0;
  }


  /**
   * Generic OpenGL style projection.
   * This could be used to map a world coordinate to nssc coordinate,
   * but in practice is only used for screen -> world via project_to_world
   */
  __project(m, p) {
    let position_world  = vec4.create();
    vec4.transformMat4(position_world, p, m);

    if (position_world[3] === 0) {
      return vec4.fromValues(0, 0, 0, 0);
    }

    position_world[3] = 1.0 / position_world[3];
    position_world[0] *= position_world[3];
    position_world[1] *= position_world[3];
    position_world[2] *= position_world[3];

    return position_world;
  }


  /**
   * Identifies the position in the plane (z=0) that a screen-space coordinate maps to
   * This will be used for changing the focus
   */
  project_to_world(position_screen) {
    // Invert view-projection matrix
    let inverted_mvp = mat4.create();
    mat4.mul(inverted_mvp, this.__perspective, this.__model_view);
    mat4.invert(inverted_mvp, inverted_mvp);

    // Express screen position in normalised screen space coordinates
    const half_width = this.__gl.canvas.clientWidth / 2;
    const half_height = this.__gl.canvas.clientHeight / 2;
    const position_nssc_near = vec4.fromValues( (position_screen[0] - half_width) / half_width,
                                               -(position_screen[1] - half_height) / half_height,
                                                0.0001, 1);
    const position_nssc_far  = vec4.fromValues( (position_screen[0] - half_width) / half_width,
                                               -(position_screen[1] - half_height) / half_height,
                                                8192, 1);

    // Calculate a ray towards the clicked position
    let position_world_near = this.__project(inverted_mvp, position_nssc_near);
    let position_world_far  = this.__project(inverted_mvp, position_nssc_far);

    // Turn the tapped position into a ray
    let ray = vec3.create();
    vec3.sub(ray, position_world_far, position_world_near);

    // Now cast a ray from the camera position to z=0
    if (ray[2] !== 0) {
      vec3.scale(ray, ray, -this.__camera_position[2] / ray[2]);

      let plane_intersection = vec3.create();
      vec3.add(plane_intersection, this.__camera_position, ray);

      //console.log(`[${position_screen[0]}, ${position_screen[1]}] -> [${plane_intersection[0]}, ${plane_intersection[1]}, ${plane_intersection[2]}]`);
      return plane_intersection;
    } else {
      return vec3.fromValues(0, 0, 0, 0);
    }
  }
}
