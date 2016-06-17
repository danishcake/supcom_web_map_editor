const ByteBuffer = require('bytebuffer');

/**
 * Bitfield class. Given an array of bytes will allow you to
 * read integers. Data is read with little endian packing,
 * which reads from the LSB first.
 * eg: 
 * union {
 *   uint16_t u16;     // 0x4321
 *   uint8_t  u8[2];   // [0x21, 0x43]
 *   struct {
 *     uint16_t a : 4; // 1
 *     uint16_t b : 4; // 2
 *     uint16_t c : 4; // 3
 *     uint16_t d : 4; // 4
 *   } bitfield;
 * };
 *
 * Data is therefore read from the first byte encountered, starting with the LSB
 * of each byte.
 */
export class sc_bitfield {
  /**
   * Wraps an array of bytes, a ByteBuffer, or if a Number is provided it is treated as a uint32
   */
  constructor(data) {
    if (data instanceof Array) {
      this.__data = data;  
    } else if (typeof(data) === 'number') {
      this.__data = [(data & 0x000000FF) >> 0,  (data & 0x0000FF00) >> 8,
                     (data & 0x00FF0000) >> 16, (data & 0xFF000000) >> 24];
    } else if (data instanceof ByteBuffer) {
    // else if (typeof(data) === 'ByteBuffer') {
      this.__data = [];
      while(data.remaining() > 0) {
        this.__data.push(data.readUint8());
      }
    } else {
      throw new Error(`sc_bitfield requires an Array, ArrayBuffer or Number, got ${typeof(data)}`)
    }
    
    this.__offset = 0; // Units: bits
  }
  
  
  /**
   * Reads the specified number of bits and returns an integer result
   */
  read_bits(bits) {
    let result = 0;
    let op_bit = 0;
    
    while (op_bit < bits) {
      
      let byte_index = Math.trunc(this.__offset / 8);
      let bit_index = this.__offset % 8;
      let bit = this.__data[byte_index] & (1 << bit_index);
      
      // Explode if we try to unpack more data than is available
      if(byte_index >= this.__data.length) {
        throw new Error(`Attempted to read too much data from bitfield. Only ${this.__data.length} bytes available`)
      }
      
      result = result | ((bit ? 1 : 0) << op_bit);
      
      op_bit++;
      this.__offset++;
    }
    
    return result;
  }
  
  /**
   * Unpacks the specified number of bits, but returns nothing
   */
  skip_bits(bits) {
    read(bits);
  }
  
  /**
   * Rewinds the unpacker position to the start
   */
  reset() {
    this.__offset = 0;
  }
}
