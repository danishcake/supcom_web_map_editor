import {sc_map} from "./sc_map"
import {sc_script_base, sc_script_scenario} from "./sc_script"

var sc = {
  map: sc_map,
  script: {
    base: sc_script_base,             // Primarily for unit tests
    scenario: sc_script_scenario
  }
};

export { sc }
