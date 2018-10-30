import * as ByteBuffer from "bytebuffer";


/**
 * ByteBuffers have different implementations for different architectures. I want to
 * be able to get the underlying ArrayBuffer, regardless of which is used
 * Under NodeJS:
 * ByteBuffer -> [Buffer] -> [ArrayBuffer]
 * In browsers:
 * ByteBuffer -> [ArrayBuffer]
 */
export function bytebuffer_to_arraybuffer(buffer: ByteBuffer): ArrayBuffer {
  const bb = buffer as any;
  if (bb.buffer.buffer != null) {
    return bb.buffer.buffer as ArrayBuffer;
  } else {
    return bb.buffer as ArrayBuffer;
  }
}
