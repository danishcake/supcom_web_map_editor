import { sc_edit_view_base } from "./sc_edit_view"
import { sc_pixel, sc_vec2 } from "../sc_vec";
import { sc_edit_view_passthrough } from "./sc_edit_view_passthrough";

/**
 * Facade around another view that causes OOB pixel reads to return their closest valid neighbour
 */
export class sc_edit_view_oob_clamp extends sc_edit_view_passthrough {
  constructor(wrapped_view: sc_edit_view_base) {
    super(wrapped_view);
  }


  /** Returns the closest valid neighbour pixel */
  protected __oob_pixel_value_impl(position: sc_vec2): sc_pixel {
    // Risk: If this is wrong we will end up recursively calling ourselves!
    const valid_position: sc_vec2 = [Math.min(Math.max(0, position[0]), this.width - 1),
                                     Math.min(Math.max(0, position[1]), this.height - 1)];
    return this.__wrapped_view.get_pixel(valid_position);
  }
}
