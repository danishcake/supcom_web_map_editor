import {sc_map} from "./sc_map"
import {sc_script_base, sc_script_scenario, sc_script_save, sc_script_script, sc_script_marker} from "./sc_script"
import {sc_edit} from "./sc_edit"
import {sc_zip} from "./sc_zip"

var sc = {
  map: sc_map,
  script: {
    base: sc_script_base,             // Primarily for unit tests
    scenario: sc_script_scenario,
    save: sc_script_save,
    script: sc_script_script,
    marker: sc_script_marker
  },
  edit: sc_edit,
  zip: sc_zip
};

export { sc }
