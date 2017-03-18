import {sc_map} from "./sc_map"
import {sc_script_base, sc_script_scenario, sc_script_save, sc_script_script} from "./sc_script"
import {sc_edit} from "./sc_edit"

var sc = {
  map: sc_map,
  script: {
    base: sc_script_base,             // Primarily for unit tests
    scenario: sc_script_scenario,
    save: sc_script_save,
    script: sc_script_script
  },
  edit: sc_edit
};

export { sc }
