
/**
 * Represents a camera that can pan/zoom within the bounds of map
 * in a similar fashion to that within SupCom.
 * When zooming the world position under the cursor is kept constant.
 * When zooming out the centre is kept constant.
 * The position of the camera is constrained to a bounding fulcrum
 *
 * At maximum zoom (1) we will define ourselves as showing 16 units down the shortest axis
 * At minimum zoom (0) we will define ourselves as showing the entire map * 1.2 down the shortest axis
 * In between we're initially going to just linearly interpolate the z position
 * Assuming frustrum short edge length is sqrt(2) * z_height * 0.5
 * z_height = 32 / sqrt(2) = 22.6ish
 *
 * Calculations are performed as if the terrain height is zero.
 * @property {sc_vec2} __scene_size The size of the scene
 * @property {number} __long_edge The largest value in __scene_size
 * @property {number} __fov The field of view in degrees
 * @property {sc_vec2} __screen_space_focus The screen coordinates that should remain mapped to the same world space position by zooming
 * @property {sc_vec3} __world_space_focus The world position that should remain mapped to the same screen space position by zooming
 * @property {sc_vec3} __camera_position The terrain relative position of the camera
 * @property {number} __zoom The zoom level, between 0 and 1. At 1 the camera is zoomed out as far as it goes
 * @property {number} __steps The number of zoom steps
 *
 */
class webgl_camera {
  constructor(gl, scene_size) {
    this.__gl = gl;
    this.__scene_size = scene_size;
    this.__long_edge = Math.max(this.__scene_size[0], this.__scene_size[1]);
    this.__fov = 90;
    this.__world_space_focus = vec3.fromValues(this.__scene_size[0] / 2, this.__scene_size[1] / 2, 0);

    this.__up_vector = vec3.fromValues(0, 1, 0);
    this.__zoom = 0;
    this.__steps = 128;

    this.__view = mat4.create();
    this.__perspective = mat4.create();

    // Define camera position. Look-at position is directly below this at z=0
    this.__camera_position = vec3.fromValues(this.__scene_size[0] / 2, this.__scene_size[1] / 2, 22.6);

    // Calculate initial view/perspective matrices
    this.tick(0);
  }


  /**
   * Updates matrices based on current focus, zoom etc
   * @param {number] height_datum The suggested height datum. The lookat and camera origin
   *  will be translated vertically by this value to ensure that all terrain remains visble.
   */
  tick(height_datum) {
    const camera_position = vec3.create();
    vec3.add(camera_position, this.__camera_position, vec3.fromValues(0, 0, height_datum));
    const look_at = vec3.fromValues(camera_position[0], camera_position[1], height_datum);


    mat4.lookAt(this.__view, camera_position, look_at, this.__up_vector);
    let aspect_ratio = this.__gl.drawingBufferWidth / this.__gl.drawingBufferHeight;
    mat4.perspective(this.__perspective, this.__fov, aspect_ratio, 1.0, 256*256*256);
  }


  /**
   * Returns the current view matrix
   */
  get view() {
    return this.__view;
  }


  /**
   * Returns the current projection matrix
   */
  get projection() {
    return this.__perspective;
  }

  /**
   * Zooms in or out by the specified number of steps
   */
  zoom_steps(steps) {
    this.__zoom = Math.max(0, Math.min(1, this.__zoom + steps / this.__steps));

    const nearest_length = 22.6;
    const farthest_length = this.__long_edge * 1.1 / 2.0;
    const previous_height_above_terrain = this.__camera_position[2];
    const new_height_above_terrain = nearest_length + (farthest_length - nearest_length) * this.__zoom;

    // We now need to maintain the screenspace-worldspace mapping, given our new camera height
    // we can do this by moving the xy camera offset along the line cast from the worldspace focus
    // to the camera position
    // TODO: Constrain by map bounds
    const z_change = new_height_above_terrain - previous_height_above_terrain;
    if (z_change < 0) {
      // Find ray from focus to camera and scale so that z is z_change, then offset camera by that
      const focus_to_camera_ray = vec3.create();
      vec3.sub(focus_to_camera_ray, this.__camera_position, this.__world_space_focus);
      vec3.scale(focus_to_camera_ray, focus_to_camera_ray, z_change / focus_to_camera_ray[2]);
      vec3.add(this.__camera_position, this.__camera_position, focus_to_camera_ray);
    } else {
      this.__camera_position[2] += z_change;
    }

    // Constrain to a fulcrum cast from the center at max distance
    // Maximum distance from centre is a function of the FOV and distance from apex
    // We allow half a screen off the edge, so the apex is moved up slightly

    const distance_from_apex = farthest_length - this.__camera_position[2] + 22.6;
    const maximum_distance_from_axis = Math.sin((this.__fov * Math.PI / 180) * 0.5) * distance_from_apex;
    let x_axial_distance = this.__camera_position[0] - (this.__scene_size[0] / 2);
    let y_axial_distance = this.__camera_position[1] - (this.__scene_size[1] / 2);

    x_axial_distance = Math.min(maximum_distance_from_axis, Math.abs(x_axial_distance)) * Math.sign(x_axial_distance);
    y_axial_distance = Math.min(maximum_distance_from_axis, Math.abs(y_axial_distance)) * Math.sign(y_axial_distance);


    this.__camera_position[0] = (this.__scene_size[0] / 2) + x_axial_distance;
    this.__camera_position[1] = (this.__scene_size[1] / 2) + y_axial_distance;

  }


  /**
   * Sets the centre of the zoom process
   * @param {sc_vec2} screen_space_focus Screen-space coordinates (non-normalised) of cursor
   */
  set_focus(screen_space_focus) {
    this.__world_space_focus = this.project_to_world(vec3.fromValues(...screen_space_focus, 0));
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
    // The view matrix cannot be inverted naively as it's numerically unstable.
    // Instead, lets calculate the inverse view matrix the SNEAKY DEVIOUS way by noticing
    // that it can be expected as a rotation and translation.
    // The inverse of a rotation is the transpose, and the inverse of a translation is
    // trivial.
    // V = R * T
    // Vinv = Tinv * Rinv
    // Rinv:
    // Top 3x3 + 0,0,0,1, then transpose
    let inverted_view_rotation = mat4.create();
    mat4.fromValues(inverted_view_rotation, this.__view[0],  this.__view[1],  this.__view[2],  0,
                                            this.__view[4],  this.__view[5],  this.__view[6],  0,
                                            this.__view[8],  this.__view[9],  this.__view[10], 0,
                                                         0,               0,               0,  1);
    mat4.transpose(inverted_view_rotation, inverted_view_rotation);

    // Tinv:
    // Identity + x,y,z,w, then negate x,y,z,w
    let inverted_view_translation = mat4.create();
    mat4.fromValues(inverted_view_translation,                1,                0,                0,              0,
                                                              0,                1,                0,              0,
                                                              0,                0,                1,              0,
                                               -this.__view[12], -this.__view[13], -this.__view[14], this.__view[15]);

    let inverted_view = mat4.create();
    mat4.mul(inverted_view, inverted_view_translation, inverted_view_rotation);

    // Calculate inverse perspective
    // Less numerically unstable, so OK to just use inversion
    let inverted_perspective = mat4.create();
    mat4.invert(inverted_perspective, this.__perspective);

    // Combine to get VPinv
    let inverted_vp = mat4.create();
    mat4.mul(inverted_vp, inverted_view, inverted_perspective);

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
    let position_world_near = this.__project(inverted_vp, position_nssc_near);
    let position_world_far  = this.__project(inverted_vp, position_nssc_far);

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
      return vec3.fromValues(0, 0, 0);
    }
  }
}
