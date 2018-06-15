import {sc_edit_global_tool_base} from './sc_edit_global_tool'
import {sc_edit_view_methods} from '../views/sc_edit_view_methods'
import {sc_edit_view_convolution} from '../views/sc_edit_view_convolution'
import {sc_edit_view_snapshot} from '../views/sc_edit_view_snapshot'

/**
 * Smooths the entire target view
 */
export class sc_edit_global_tool_smooth extends sc_edit_global_tool_base {
  /**
   * Constructor
   * @param {number} diameter The radius of the smoothing to apply
   */
  constructor(diameter) {
    super();
    this.diameter = diameter;
  }

  /**
   * Smooths the target view
   * @param {sc_edit_tool_data} data
   * @private
   */
  __apply_impl(data) {
    const snapshot = new sc_edit_view_snapshot(data.target);
    const weights = sc_edit_view_methods.make_pixel(this.diameter * this.diameter, 1);
    const convolution = new sc_edit_view_convolution(snapshot, weights, weights.length);

    sc_edit_view_methods.set(convolution, [0, 0], convolution);
  }
}