import { sc_edit_tool_data } from "../tools/sc_edit_tool_args";

/**
 * Base class for all global tools. Subclasses should implement
 * 1. apply_impl()
 *
 * The tool is applied to the entire view at once, and will be applied only once
 *
 */
export class sc_edit_global_tool_base {
  constructor() {
  }

  public apply(data: sc_edit_tool_data): void {
    this.__apply_impl(data);
  }

  protected __apply_impl(data: sc_edit_tool_data): void {
  }
}
