import { sc_zip } from "../lib/sc_zip";
import { sc_map } from "../lib/sc_map";
import { sc_script_scenario } from "../lib/script/sc_script_scenario";
import { sc_script_save } from "../lib/script/sc_script_save";
import { sc_script_script, } from "../lib/script/sc_script_script";
import { sc_edit_patch } from "../lib/views/sc_edit_patch";
import { sc_edit_heightmap } from "../lib/sc_edit_heightmap";

const fs = require('fs');
const _ = require('underscore');
const JSZip = require('jszip');
const assert = require('chai').assert;


// TBD: Use Chai as promised?
describe('sc_zip', function() {
  describe('loading', function() {
    it('should fail if scripts or map is missing', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_without_scmap.zip");
      sc_zip.load(map_data)
      .then((map) => {
        assert.equal(true, false, "Should not succeed");
        done();
      }).catch((err) => {
        assert.isNotNull(err, "Should fail with a reason");
        done();
      });
    });

    it('should load scenario and determine other filenames', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_with_weird_names.zip");
      sc_zip.load(map_data)
      .then((map) => {
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_a.scmap", map.scripts.scenario.map_filename);
        done();
      }).catch((err) => {
        assert.equal(true, false, "Should fail");
      });
    });

    it('should load the scmap and save files', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_with_weird_names.zip");
      sc_zip.load(map_data)
      .then((map) => {
        // .scmap is loaded
        assert.equal(map.scmap.textures.terrain_shader, "TTerrain");
        assert.equal(map.scmap.textures.background_texture_path, "/textures/environment/defaultbackground.dds");
        assert.equal(map.scmap.textures.sky_cubemap_texture_path, "/textures/environment/defaultskycube.dds");

        // _save.lua is loaded
        assert.closeTo(35.5000, map.scripts.save.markers['ARMY_1'].position.x, 0.00001);
        assert.closeTo(75.9766, map.scripts.save.markers['ARMY_1'].position.y, 0.00001);
        assert.closeTo(154.500, map.scripts.save.markers['ARMY_1'].position.z, 0.00001);

        done();
      }).catch((err) => {
        assert.equal(true, false, "Should fail");
      });
    });
  });

  describe('saving', function() {
    it('should save the files with names that match the scenario', function(done) {
      const map_data = {
        scmap: new sc_map(),
        scripts: {
          scenario: new sc_script_scenario(),
          save: new sc_script_save(),
          script: new sc_script_script()
        },
        edit_heightmap: null as any as sc_edit_heightmap // Something of a bodge
      };

      const map_args = {
        name: "Awesome Volcano",               // Used to determine filenames
        author: "1337 internet tag",
        description: "Description of map",
        size: 0,
        default_height: 0
      };
      map_data.scmap.create(map_args);
      map_data.scripts.scenario.create(map_args);
      map_data.scripts.save.create(map_args);
      map_data.scripts.script.create(map_args);
      map_data.edit_heightmap = new sc_edit_heightmap(map_data.scmap.heightmap);

      const expected_scenario_filename = 'Awesome_Volcano/Awesome_Volcano_scenario.lua';
      const expected_save_filename     = map_data.scripts.scenario.save_filename.split('/').slice(-2).join('/');
      const expected_map_filename      = map_data.scripts.scenario.map_filename.split('/').slice(-2).join('/');
      const expected_script_filename   = map_data.scripts.scenario.script_filename.split('/').slice(-2).join('/');

      sc_zip.save(map_data).then((zip_arraybuffer: any) => {
        // Verify the presence of expected files
        JSZip.loadAsync(zip_arraybuffer).then((zip: any) => {

          // Uncomment this line if you need to verify the zip file manually
          //fs.writeFileSync(__dirname + "/data/temp.zip", Buffer.from(zip_arraybuffer));

          assert.isTrue(_.any(zip.files, (file: any) => { return file.name.endsWith(expected_scenario_filename); }));
          assert.isTrue(_.any(zip.files, (file: any) => { return file.name.endsWith(expected_save_filename); }));
          assert.isTrue(_.any(zip.files, (file: any) => { return file.name.endsWith(expected_map_filename); }));
          assert.isTrue(_.any(zip.files, (file: any) => { return file.name.endsWith(expected_script_filename); }));
          done();
        });
      }).catch((err: any) => {
        assert.equal(true, false, "Should not fail");
        done();
      });;
    });
  });
});