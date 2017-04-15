/**
 * Base class for all tools. Subclasses shoud implemente
 * 1. apply_impl()
 * 2. start_impl()
 *
 * When the tool is applied by draging the mouse over a region with LMB held the following events
 * will occur:
 *
 * 1. start_impl() will be called
 * 2. One or more calls will be made to apply_impl. These will not correspond 1:1 with
 *    the mouse move events, as intermediate positions will be calculated
 */

export class sc_edit_tool_base {
  constructor(outer_radius, inner_radius, strength) {
    this.__active = false;
    this.__position = [0, 0]; // TODO: pick a good vector maths library

    this.set_outer_radius(outer_radius);
    this.set_inner_radius(inner_radius);
    this.set_strength(strength);
  }


  /**
   * Setter for outer radius
   */
  set_outer_radius(outer_radius) {
    this.__outer_radius = outer_radius;
  }


  /**
   * Setter for inner radius
   */
  set_inner_radius(inner_radius) {
    this.__inner_radius = inner_radius;
  }


  /**
   * Setter for stength
   */
  set_strength(strength) {
    this.__strength = strength;
  }


  /**
   * Start function. Called when the mouse is first depressed
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  start(data, args) {
    // First application, so apply once at current position
    this.__start_impl(data.edit_heightmap, args.grid_position);
    this.__apply_impl(data.edit_heightmap, args.grid_position);

    // Store last position and mark active
    this.__active = true;
    this.__position = args.grid_position;
  }


  /**
   * Apply function. This should be called at every position where the mouse moves.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  apply(data, args) {
    if (this.__active) {
      // Previously active. Calculate intermediate steps and apply at each
      const interpolated_points = this.__calculate_intermediate_points(this.__position, args.grid_position);

      for (let point of interpolated_points) {
        this.__apply_impl(data.edit_heightmap, point);
      }

      // Store last position
      this.__position = args.grid_position;
    }
  }


  /**
   * Finish application of a tool
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  end(data, args) {
    if (this.__active) {
      this.__end_impl();
    }
    this.__active = false;
  }


  /**
   * Returns the ideal spacing of tool applications.
   */
  get ideal_spacing() {
    return Math.max(2, this.__inner_radius * 0.25);
  }


  /**
   * Calculates the intermediate points between two fixed points
   * No point is generated at p0 as it will have been used on a previous apply()
   */
  __calculate_intermediate_points(p0, p1) {
    const distance = Math.sqrt(Math.pow(p1[0] - p0[0], 2), Math.pow(p1[1] - p0[1], 2));
    const steps = Math.floor(distance / this.ideal_spacing);
    const step = [(p1[0] - p0[0]) / steps, (p1[1] - p0[1]) / steps];

    // The last position is manually set to p1 to ensure it is output
    let intermediate_points = [];
    for (let i = 1; i < steps; i++) {
      intermediate_points.push([Math.floor(p0[0] + i * step[0]), Math.floor(p0[1] + i * step[1])]);
    }
    intermediate_points.push(p1);

    return intermediate_points;
  }


  __start_impl(edit_heightmap, position) {

  }

  __apply_impl(edit_heightmap, position) {

  }

  __end_impl() {

  }
}
