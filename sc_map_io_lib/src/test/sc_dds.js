import { sc_dds } from '../lib/sc_dds';
const assert = require('chai').assert;
const fs = require('fs');
const ByteBuffer = require('bytebuffer');



describe('sc_dxt5', function() {
  describe('loading', function() {
    let dxt5_data = fs.readFileSync(__dirname + "/data/512x512_dxt5.dds");

    it('should load header', function () {
      let dxt5_data_bb = ByteBuffer.wrap(dxt5_data, ByteBuffer.LITTLE_ENDIAN);
      let dds = new sc_dds();
      dds.load(dxt5_data_bb);

      assert.equal(dds.width, 512);
      assert.equal(dds.height, 512);
      assert.equal(dds.data.capacity(), 512 * 512 * 4);
      // Top left pixel is a pinky colour
      assert.equal(dds.data.readUint8(0), 255);
      assert.equal(dds.data.readUint8(1), 227);
      assert.equal(dds.data.readUint8(2), 137);
      assert.equal(dds.data.readUint8(3), 125);
    });
  });
});