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

  apply(data) {
    this.__apply_impl(data);
  }
}
