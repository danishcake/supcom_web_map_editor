import * as JSZip from 'jszip';
import * as ByteBuffer from 'bytebuffer';
import * as _ from 'underscore';
import { sc_script_scenario } from "./script/sc_script_scenario";
import { sc_script_save } from "./script/sc_script_save";
import { sc_map } from "./sc_map";
import { sc_script_script } from './script/sc_script_script';
import { sc_edit_heightmap } from './sc_edit_heightmap';


/**
 * The files that define a map bundled together
 */
interface sc_zip_map_data_load {
  scmap: sc_map,
  scripts: {
    scenario: sc_script_scenario,
    save: sc_script_save,
  }
}

/**
 * The files that define a map bundled together
 */
interface sc_zip_map_data_save {
  scmap: sc_map,
  scripts: {
    scenario: sc_script_scenario,
    save: sc_script_save,
    script: sc_script_script
  },
  edit_heightmap: sc_edit_heightmap
}

/**
 * A type with a load method (eg map or script)
 */
interface two_phase_constructable {
  load(data: ByteBuffer): void;
}

/**
 * A type with an argument free constructor, and a load method taking a ByteBuffer
 */
interface constructor_of<T> {
  new(): T;
}

export const sc_zip = {
  /**
   * Extracts the map from buffer
   * @param {Buffer|ArrayBuffer|Uint8Array|Blob} Buffer containing a zipfile
   * @return {Promise} A promise containing the result
   * @throw {Error} On any error
   */
  load: function (buffer: Buffer | ArrayBuffer | Uint8Array | Blob): Promise<sc_zip_map_data_load> {

    /**
     * Identifies a file within the zipfile which ends with a known strings
     * @return {ZipObject}
     */
    const identify_filename = function (zip: JSZip, filename_suffix: string): Promise<JSZip.JSZipObject> {
      const candidate_files = zip.filter(function (relative_path: string, file: JSZip.JSZipObject) {
        return relative_path.endsWith(filename_suffix);
      });

      if (candidate_files.length === 0) {
        throw new Error(`${filename_suffix} not found`);
      }

      if (candidate_files.length > 1) {
        throw new Error(`Found ${candidate_files.length} files matching ${filename_suffix}`);
      }

      return Promise.resolve(candidate_files[0]);
    }

    /**
     * A sort of templated method that can be used to load anything that has two stage
     * construction (eg new/load - scripts, maps etc)
     */
    const two_stage_load = function <T extends two_phase_constructable>(type_arraybuffer: ArrayBuffer,
      type: constructor_of<T>): Promise<T> {
      const type_instance = new type();
      type_instance.load(ByteBuffer.wrap(type_arraybuffer, ByteBuffer.LITTLE_ENDIAN))
      return Promise.resolve<T>(type_instance as unknown as T);
    };


    /* Monster promise chain to
     * 1. Locate the scenario file
     * 2. Decompress and parse the scenario file
     * 3. Find the dependent files (eg save and scmap)
     * 4. Decompress and parse those files
     * 5. Yeild a suitable object to be consumed by other code
     */
    return JSZip.loadAsync(buffer)
      .then((zip: JSZip) => {
        return identify_filename(zip, "_scenario.lua")
          .then((scenario_zip_object) => { return scenario_zip_object.async('arraybuffer'); })
          .then((scenario_arraybuffer) => { return two_stage_load(scenario_arraybuffer, sc_script_scenario); })
          .then((scenario_script) => {
            // Identifying the save scripts requires taking the last component of the
            // path in the scenario (typically mapname_save.lua) and looking for it in the zip file
            const scmap_filename = scenario_script.map_filename.split('/').slice(-1)[0];
            const save_filename = scenario_script.save_filename.split('/').slice(-1)[0];
            return Promise.all([identify_filename(zip, scmap_filename),
            identify_filename(zip, save_filename),
              scenario_script])
          })
          .then(([scmap_zip_object, save_zip_object, scenario_script]) => {
            // Decompress the other files
            return Promise.all([
              scmap_zip_object.async('arraybuffer'),
              save_zip_object.async('arraybuffer'),
              scenario_script
            ]);
          })
          .then(([scmap_arraybuffer, save_script_arraybuffer, scenario_script]) => {
            // Load the other files
            return Promise.all([
              Promise.resolve(sc_map.load(ByteBuffer.wrap(scmap_arraybuffer, ByteBuffer.LITTLE_ENDIAN))),
              two_stage_load(save_script_arraybuffer, sc_script_save),
              scenario_script
            ]);
          });
      })
      .then(([scmap, save_script, scenario_script]) => {
        // Pack the results into a single object the rest of the codebase expects
        return {
          scmap: scmap,
          scripts: {
            scenario: scenario_script,
            save: save_script
          }
        };
      });
  },


  save: function (map_data: sc_zip_map_data_save) {
    // All the paths apart from _scenario.lua are explicitly extractable from the scenario file
    const map_path = map_data.scripts.scenario.map_filename.split('/').slice(-2).join('/');
    const script_path = map_data.scripts.scenario.script_filename.split('/').slice(-2).join('/');
    const save_path = map_data.scripts.scenario.save_filename.split('/').slice(-2).join('/');

    // The _scenario.lua path must be built
    const scenario_path = `${map_path.split('.scmap')[0]}_scenario.lua`;
    const map_bb = map_data.scmap.save();
    const script_bb = map_data.scripts.script.save();
    const save_bb = map_data.scripts.save.save(map_data.edit_heightmap);
    const scenario_bb = map_data.scripts.scenario.save();

    let zip = new JSZip();
    zip.file(map_path, map_bb.buffer);
    zip.file(script_path, script_bb.buffer);
    zip.file(save_path, save_bb.buffer);
    zip.file(scenario_path, scenario_bb.buffer);
    return zip.generateAsync({ compression: 'DEFLATE', type: 'arraybuffer' });
  }
};
