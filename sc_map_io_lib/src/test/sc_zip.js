import { sc } from '../lib/sc';
const fs = require('fs');
const _ = require('underscore');
const JSZip = require('jszip');
const assert = require('chai').assert;


// TBD: Use Chai as promised?
describe('sc_zip', function() {
  describe('loading', function() {
    it('should fail if scripts or map is missing', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_without_scmap.zip");
      sc.zip.load(map_data)
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
      sc.zip.load(map_data)
      .then((map) => {
        assert.equal("/maps/Shuriken_Valley/Shuriken_Valley_a.scmap", map.scripts.scenario.map_filename);
        done();
      }).catch((err) => {
        assert.equal(true, false, "Should fail");
      });
    });

    it('should load the scmap and save files', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_with_weird_names.zip");
      sc.zip.load(map_data)
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
        map: new sc.map(),
        scripts: {
          scenario: new sc.script.scenario(),
          save: new sc.script.save(),
          script: new sc.script.script()
        }
      };
      const map_args = {
        name: "Awesome Volcano",               // Used to determine filenames
        author: "1337 internet tag",
        description: "Description of map",
        size: 0,
        default_height: 0
      };
      map_data.map.create(map_args);
      map_data.scripts.scenario.create(map_args);
      map_data.scripts.save.create(map_args);
      map_data.scripts.script.create(map_args);

      const expected_scenario_filename = 'Awesome_Volcano/Awesome_Volcano_scenario.lua';
      const expected_save_filename     = map_data.scripts.scenario.save_filename.split('/').slice(-2).join('/');
      const expected_map_filename      = map_data.scripts.scenario.map_filename.split('/').slice(-2).join('/');
      const expected_script_filename   = map_data.scripts.scenario.script_filename.split('/').slice(-2).join('/');

      sc.zip.save(map_data).then((zip_arraybuffer) => {
        // Verify the presence of expected files
        JSZip.loadAsync(zip_arraybuffer).then((zip) => {

          fs.writeFileSync(__dirname + "/data/temp.zip", Buffer.from(zip_arraybuffer));

          assert.isTrue(_.any(zip.files, (file) => { return file.name.endsWith(expected_scenario_filename); }));
          assert.isTrue(_.any(zip.files, (file) => { return file.name.endsWith(expected_save_filename); }));
          assert.isTrue(_.any(zip.files, (file) => { return file.name.endsWith(expected_map_filename); }));
          assert.isTrue(_.any(zip.files, (file) => { return file.name.endsWith(expected_script_filename); }));
          done();
        });
      }).catch((err) => {
        assert.equal(true, false, "Should not fail");
        done();
      });;
    });
  });
});