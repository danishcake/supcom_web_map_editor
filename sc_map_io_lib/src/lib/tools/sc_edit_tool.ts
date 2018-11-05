import { sc_vec2 } from "../sc_vec";
import { sc_edit_tool_data, sc_edit_tool_args } from "./sc_edit_tool_args";
import { sc_edit_view_base } from "../views/sc_edit_view";

/**
 * Base class for all local tools. Subclasses should implement
 * 1. apply_impl()
 * 2. start_impl()
 *
 * When the tool is applied by dragging the mouse over a region with LMB held the following events
 * will occur:
 *
 * 1. start_impl() will be called
 * 2. One or more calls will be made to apply_impl. These will not correspond 1:1 with
 *    the mouse move events, as intermediate positions will be calculated
 */

export class sc_edit_tool_base {
  private __active: boolean;
  private __position: sc_vec2;
  protected __outer_radius: number;
  protected __inner_radius: number;
  protected __strength: number;

  constructor(outer_radius: number, inner_radius: number, strength: number) {
    this.__active = false;
    this.__position = [0, 0];
    this.__outer_radius = outer_radius;
    this.__inner_radius = inner_radius;
    this.__strength = strength;
  }


  /**
   * Setter for outer radius
   */
  public set_outer_radius(outer_radius: number): void {
    this.__outer_radius = outer_radius;
  }


  /**
   * Setter for inner radius
   */
  public set_inner_radius(inner_radius: number): void {
    this.__inner_radius = inner_radius;
  }


  /**
   * Setter for stength
   */
  public set_strength(strength: number): void {
    this.__strength = Math.min(255, Math.max(0, strength));
  }

  /**
   * Getter for outer radius
   * TODO: Use set for setter too
   */
  public get outer_radius(): number {
    return this.__outer_radius;
  }


  /**
   * Getter for inner radius
   * TODO: Use set for setter too
   */
  public get inner_radius(): number {
    return this.__inner_radius;
  }


  /**
   * Getter for strength
   * TODO: Use set for setter too
   */
  public get strength(): number {
    return this.__strength;
  }


  /**
   * Start function. Called when the mouse is first depressed
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public start(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    // First application, so apply once at current position
    this.__start_impl(data.target, args.grid_position);
    this.__apply_impl(data.target, args.grid_position);

    // Store last position and mark active
    this.__active = true;
    this.__position = args.grid_position;
  }


  /**
   * Apply function. This should be called at every position where the mouse moves.
   * @param {sc_edit_tool_data} data Data to edit
   * @param {sc_edit_tool_args} args How and where to apply tool
   */
  public apply(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    if (this.__active) {
      // Previously active. Calculate intermediate steps and apply at each
      const interpolated_points = this.__calculate_intermediate_points(this.__position, args.grid_position);

      for (let point of interpolated_points) {
        this.__apply_impl(data.target, point);
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
  public end(data: sc_edit_tool_data, args: sc_edit_tool_args): void {
    // Adjust scale to account for different targets
    args.set_target(data.target, data.edit_heightmap, data.edit_texturemap);

    if (this.__active) {
      this.__end_impl();
    }
    this.__active = false;
  }


  /**
   * Returns the ideal spacing of tool applications.
   */
  get ideal_spacing(): number {
    return Math.max(2, this.__inner_radius * 0.25);
  }


  /**
   * Calculates the intermediate points between two fixed points
   * No point is generated at p0 as it will have been used on a previous apply()
   */
  private __calculate_intermediate_points(p0: sc_vec2, p1: sc_vec2): sc_vec2[] {
    const distance = Math.sqrt(Math.pow(p1[0] - p0[0], 2) + Math.pow(p1[1] - p0[1], 2));
    const steps = Math.floor(distance / this.ideal_spacing);
    const step = [(p1[0] - p0[0]) / steps, (p1[1] - p0[1]) / steps];

    // The last position is manually set to p1 to ensure it is output
    let intermediate_points: sc_vec2[] = [];
    for (let i = 1; i < steps; i++) {
      intermediate_points.push([Math.floor(p0[0] + i * step[0]), Math.floor(p0[1] + i * step[1])]);
    }
    intermediate_points.push(p1);

    return intermediate_points;
  }


  protected __start_impl(target: sc_edit_view_base, position: sc_vec2): void {

  }

  protected __apply_impl(target: sc_edit_view_base, position: sc_vec2): void {

  }

  protected __end_impl() {

  }
}
