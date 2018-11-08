/**
 * Supreme Command Forged Alliance Map scripts
 * A map will typically consist of a .scmap (see sc_map.js) and
 * three acompanying scripts
 *
 * mymap.scmap          //  Binary blob
 * mymap_scenario.lua   //  Top level script defining name, description and linking to other scripts
 * mymap_save.lua       //  Script defining team, spawn positions, mass points, AI markers etc
 * mymap_script.lua     //< Scripts associated with the map. Usually fixed contents that can be ignored
 */
import * as ByteBuffer from "bytebuffer";
import { sc_map_args } from "../sc_map_args";


/**
 * Script 'script'. This is unlike the other scripts as it doesn't perform any loading
 * and is serialised the same every time. It therefore doesn't inherit from sc_script_base
 */
export class sc_script_script {
  constructor() {
  }


  /**
   * Writes a standard startup script
   */
  public save(): ByteBuffer {
    let output =
      "local ScenarioUtils = import('/lua/sim/ScenarioUtilities.lua')\n" +
      "function OnPopulate()\n"                                          +
      " ScenarioUtils.InitializeArmies()\n"                              +
      "end\n"                                                            +
      "\n"                                                               +
      "function OnStart(self)\n"
      "end\n";

      return ByteBuffer.wrap(output, ByteBuffer.LITTLE_ENDIAN);
  }


  /**
   * Does nothing - present for consistency
   */
  public create(map_args: sc_map_args): void {
  }
}
