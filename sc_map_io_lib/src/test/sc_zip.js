import { sc_zip } from '../lib/sc_zip';
const fs = require('fs');
const assert = require('chai').assert;


// TBD: Use Chai as promised?
describe('sc_zip', function() {
  describe('loading', function() {
    it('should fail if scripts or map is missing', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_without_scmap.zip");
      sc_zip.load(map_data).then((map) => {
        assert.equal(true, false, "Should not succeed");
        done();
      }).catch((err) => {
        assert.isNotNull(err, "Should fail with a reason");
        done();
      });
    });

    it('should load scenario and determine other filenames', function(done) {
      let map_data = fs.readFileSync(__dirname + "/data/Shuriken_Valley_with_weird_names.zip");
      sc_zip.load(map_data).then((map) => {
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
    it('should save the files with names that match the scenario', function() {

    });
  });
});