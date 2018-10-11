import { sc_dds, sc_dds_pixelformat } from '../lib/sc_dds';
import { assert } from 'chai';
import * as fs from 'fs';
const ByteBuffer = require('bytebuffer');


describe('sc_dxt5', function() {
  describe('loading', function() {
    let dxt5_data = fs.readFileSync(__dirname + "/data/512x512_dxt5.dds");

    it('should load header', function () {
      let dxt5_data_bb = ByteBuffer.wrap(dxt5_data, ByteBuffer.LITTLE_ENDIAN);
      const dds = sc_dds.load(dxt5_data_bb);

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


  describe('saving', function() {
    describe('RawARGB', function() {
      it('should have correct size', function() {
        let black_blob = ByteBuffer.wrap(new ArrayBuffer(128 * 128 * 4));
        let output_buffer = new ByteBuffer();

        // I expect a 128 byte header followed by 128x128x4 bytes
        sc_dds.save(output_buffer, black_blob, 128, 128, sc_dds_pixelformat.RawARGB);

        assert.equal(output_buffer.offset, 128 + 128 * 128 * 4);
      });
    });

    describe('RawRGB', function() {
      it('should have correct size', function() {
        let black_blob = ByteBuffer.wrap(new ArrayBuffer(128 * 128 * 4));
        let output_buffer = new ByteBuffer();

        // I expect a 128 byte header followed by 128x128x3 bytes
        sc_dds.save(output_buffer, black_blob, 128, 128, sc_dds_pixelformat.RawRGB);

        assert.equal(output_buffer.offset, 128 + 128 * 128 * 3);
      });
    });

    describe('DXT5', function() {
      it('should have correct size', function() {
        let black_blob = ByteBuffer.wrap(new ArrayBuffer(128 * 128 * 4));
        let output_buffer = new ByteBuffer();

        // I expect a 128 byte header followed by 128x128 bytes (4:1 compression)
        sc_dds.save(output_buffer, black_blob, 128, 128, sc_dds_pixelformat.DXT5);

        assert.equal(output_buffer.offset, 128 + 128 * 128);
      });
    });

    describe('DXT5', function() {
      it('should choose a sensible palette for solid colored blocks', function() {
        let multihued_blob = ByteBuffer.wrap(new ArrayBuffer(128 * 128 * 4));
        // Each block is 4x4 pixels, or 16x16 bytes. This loop fills entire rows - 16 pixels or 64 subpixels
        // It is repeated for each of the four rows
        for (let y = 0; y < 4; y++) {
          let x0 = 0;
          let x1 = 4;
          let x2 = 8;
          let x3 = 12;

          // WRGB00000...
          // 000000000...
          // ...
          // Set the top left 4x4 to white
          //                         block => pixel
          //                             pixel => subpixel
          //                         row => pixel
          // Subpixel coordinate is bx * 4 * 4 +
          //                         y * 4 * width
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 0);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 1);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 2);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 3);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 4);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 5);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 6);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 7);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 8);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 9);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 10);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 11);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 12);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 13);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 14);
          multihued_blob.writeUint8(0xFF, (x0 + y * 128) * 4 + 15);

          // Set the next 4x4 to red
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 0);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 1);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 2);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 3);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 4);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 5);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 6);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 7);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 8);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 9);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 10);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 11);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 12);
          multihued_blob.writeUint8(0xFF, (x1 + y * 128) * 4 + 13);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 14);
          multihued_blob.writeUint8(0x00, (x1 + y * 128) * 4 + 15);

          // Set the next 4x4 to green
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 0);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 1);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 2);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 3);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 4);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 5);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 6);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 7);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 8);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 9);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 10);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 11);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 12);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 13);
          multihued_blob.writeUint8(0xFF, (x2 + y * 128) * 4 + 14);
          multihued_blob.writeUint8(0x00, (x2 + y * 128) * 4 + 15);

          // Set the next 4x4 to blue
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 0);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 1);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 2);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 3);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 4);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 5);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 6);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 7);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 8);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 9);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 10);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 11);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 12);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 13);
          multihued_blob.writeUint8(0x00, (x3 + y * 128) * 4 + 14);
          multihued_blob.writeUint8(0xFF, (x3 + y * 128) * 4 + 15);
        }


        let output_buffer = new ByteBuffer();
        sc_dds.save(output_buffer, multihued_blob, 128, 128, sc_dds_pixelformat.DXT5);

        // Rewind and load the compressed texture
        output_buffer.reset();

        let roundtrip_dds = sc_dds.load(output_buffer);

        assert.equal(roundtrip_dds.width, 128);
        assert.equal(roundtrip_dds.height, 128);

        // White block
        assert.equal(roundtrip_dds.data.readUint8(0 + 0), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(0 + 1), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(0 + 2), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(0 + 3), 0xFF);

        // Red block
        assert.equal(roundtrip_dds.data.readUint8(16 + 0), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(16 + 1), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(16 + 2), 0x00);
        assert.equal(roundtrip_dds.data.readUint8(16 + 3), 0x00);

        // Green  block
        assert.equal(roundtrip_dds.data.readUint8(32 + 0), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(32 + 1), 0x00);
        assert.equal(roundtrip_dds.data.readUint8(32 + 2), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(32 + 3), 0x00);

        // Blue block
        assert.equal(roundtrip_dds.data.readUint8(48 + 0), 0xFF);
        assert.equal(roundtrip_dds.data.readUint8(48 + 1), 0x00);
        assert.equal(roundtrip_dds.data.readUint8(48 + 2), 0x00);
        assert.equal(roundtrip_dds.data.readUint8(48 + 3), 0xFF);
      });
    });
  });
});
