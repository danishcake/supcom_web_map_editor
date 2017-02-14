import { sc_bitfield } from '../lib/sc_bitfield';
const assert = require('chai').assert;


describe('sc_bitfield', function() {
  describe('unpacking', function() {

    it('should unpack from lsb', function () {
      let bf = new sc_bitfield([0xA5])
      assert.equal(bf.read_bits(4), 0x5);
      assert.equal(bf.read_bits(4), 0xA);
    });

    it('should unpack from first byte first', function () {
      let bf = new sc_bitfield([0xA5, 0x12])
      assert.equal(bf.read_bits(4), 0x5);
      assert.equal(bf.read_bits(4), 0xA);
      assert.equal(bf.read_bits(4), 0x2);
      assert.equal(bf.read_bits(4), 0x1);
    });

    it('should unpack whole bytes', function () {
      let bf = new sc_bitfield([0xA5])
      assert.equal(bf.read_bits(8), 0xA5);
    });

    it('should unpack whole shorts', function () {
      let bf = new sc_bitfield([0xA5, 0x12])
      assert.equal(bf.read_bits(16), 0x12A5);
    });

    it('should unpack from an offset', function () {
      let bf = new sc_bitfield([0xA5, 0x12])
      assert.equal(bf.read_bits(4), 0x5);
      assert.equal(bf.read_bits(12), 0x12A);
    });

    it('should throw if too much unpacked', function () {
      let bf = new sc_bitfield([0xA5, 0x12])
      assert.throws(() => bf.read_bits(20), Error);
    });

    it('should treat number input as int32', function () {
      let bf = new sc_bitfield(0x12345678);
      assert.equal(bf.read_bits(4), 0x8);
      assert.equal(bf.read_bits(4), 0x7);
      assert.equal(bf.read_bits(4), 0x6);
      assert.equal(bf.read_bits(4), 0x5);
      assert.equal(bf.read_bits(4), 0x4);
      assert.equal(bf.read_bits(4), 0x3);
      assert.equal(bf.read_bits(8), 0x12);
      assert.throws(() => bf.read_bits(1), Error);
    });
  });

  describe('packing', function() {
    it('should pack from the lsb', function() {
      let bf = new sc_bitfield([0, 1, 2, 3]);
      bf.write_bits(4, 0x05);
      bf.write_bits(4, 0x09);

      bf.seek_bits(0);
      assert.equal(bf.read_bits(8), 0x95);
    });

    it('should throw if too much data written', function() {
      let bf = new sc_bitfield([0x01, 0x02]);
      bf.write_bits(16, 0xFFFF);
      assert.throws(() => bf.write_bits(1, 0x01), Error);
    });
  });
});