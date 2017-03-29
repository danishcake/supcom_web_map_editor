const JSZip = require("jszip");
const ByteBuffer = require('bytebuffer');
const _ = require('underscore');
import {sc_script_scenario, sc_script_save} from "./sc_script"
import {sc_map} from "./sc_map"



export const sc_zip = {
  /**
   * Extracts the map from buffer
   * @param {Buffer|ArrayBuffer|Uint8Array|Blob} Buffer containing a zipfile
   * @return {Promise} A promise containing the result
   * @throw {Error} On any error
   */
  load: function(buffer) {

    /**
     * Identifies a file within the zipfile which ends with a known strings
     * @return {ZipObject}
     */
    const identify_filename = function(zip, filename_suffix) {
      const candidate_files = zip.filter(function(relative_path, file) {
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
    const template_load = function(type_arraybuffer, type) {
      const type_instance = new type();
      type_instance.load(ByteBuffer.wrap(type_arraybuffer, ByteBuffer.LITTLE_ENDIAN))
      return Promise.resolve(type_instance);
    };


    /* Monster promise chain to
     * 1. Locate the scenario file
     * 2. Decompress and parse the scenario file
     * 3. Find the dependent files (eg save and scmap)
     * 4. Decompress and parse those files
     * 5. Yeild a suitable object to be consumed by other code
     */
    return JSZip.loadAsync(buffer)
    .then((zip) => {
      return identify_filename(zip, "_scenario.lua")
      .then((scenario_zip_object) => { return scenario_zip_object.async('arraybuffer'); })
      .then((scenario_arraybuffer) => { return template_load(scenario_arraybuffer, sc_script_scenario); })
      .then((scenario_script) => {
        // Identifying the save scripts requires taking the last component of the
        // path in the scenario (typically mapname_save.lua) and looking for it in the zip file
        const scmap_filename = scenario_script.map_filename.split('/').slice(-1);
        const save_filename = scenario_script.save_filename.split('/').slice(-1);
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
          template_load(scmap_arraybuffer, sc_map),
          template_load(save_script_arraybuffer, sc_script_save),
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


  save: function(map_data) {
    // All the paths apart from _scenario.lua are explicitly extractable from the scenario file
    const map_path = map_data.scripts.scenario.map_filename.split('/').slice(-2).join('/');
    const script_path = map_data.scripts.scenario.script_filename.split('/').slice(-2).join('/');
    const save_path = map_data.scripts.scenario.save_filename.split('/').slice(-2).join('/');

    // The _scenario.lua path must be built
    const scenario_path = `${map_path.split('.scmap')[0]}_scenario.lua`;

    const map_bb = map_data.map.save();
    const script_bb = map_data.scripts.script.save();
    const save_bb = map_data.scripts.save.save();
    const scenario_bb = map_data.scripts.scenario.save();

    let zip = new JSZip();
    zip.file(map_path, map_bb.buffer);
    zip.file(script_path, script_bb.buffer);
    zip.file(save_path, save_bb.buffer);
    zip.file(scenario_path, scenario_bb.buffer);
    return zip.generateAsync({compresion: 'DEFLATE', type: 'arraybuffer'});
  }
};