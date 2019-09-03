import { sc_edit_heightmap } from '../sc_edit_heightmap';
import * as ByteBuffer from 'bytebuffer';
import { sc_vec3 } from '../sc_vec';



/**
 * Converts the heightmap to STL format for 3D printing
 *
 * This is a mesh format - a simple list of triangles that form the mesh outline of the map.
 *
 * Edges are vertically extended down to the lowest point on the map. This is extended by
 * 1/12th the print width.
 *
 * @param heightmap The map heightmap to convert to STL
 * @param base_thickness Additional flat base height to add in cm. This assumes that the longest of
 *                       x/y is 10cm.
 * @param scale_exageration Normal heightmaps when printed appear very flat. Setting this value
 *                          greater than 1 causes the heightmap to be scaled vertically. The
 *                          additional_height parameter is unaffected.
 */
export const sc_stl_export = (heightmap: sc_edit_heightmap,
                              base_thickness: number,
                              scale_exageration: number): ByteBuffer => {
  // Total triangle count = Top + sides + bottom
  //                      = x * y * 2 + x * 4 + y * 4 + 2
  // STL format is:
  // uint8 header[80]; // Mostly unused
  // uint32 triangle_count;
  // struct {
  //   float normal[3]; // If zero, right hand rule used to deduce normals
  //   float v0[3];
  //   float v1[3];
  //   float v2[3];
  //   uint16 attribute_count; // Typically zero, if non-zero implementation defined
  // } triangles[triangle_count];
  // Each triangle is 50 bytes

  const [w, h] = [heightmap.width - 1, heightmap.height - 1];

  // Additional height assumes that longest edge is 10cm
  const longest_edge = Math.max(w, h);
  const zb = heightmap.minimum_height - base_thickness * longest_edge * heightmap.scale / 10;

  const triangle_count = w * h * 2 + w * 4 + h * 4 + 2;
  const bb = new ByteBuffer(80 + 4 + triangle_count * 50, true);

  // Header
  for (let i = 0; i < 80; i++) {
    bb.writeByte(0);
  }
  bb.writeUint32(triangle_count);

  // Adds a single triangle
  // Verts should be orders counter-clockwise. The triangle below points
  // outwards from the screen
  //
  //      0
  //
  //
  //  1        2
  const append_triangle = (v0: sc_vec3, v1: sc_vec3, v2: sc_vec3) => {
    bb.writeFloat(0);
    bb.writeFloat(0);
    bb.writeFloat(0);

    bb.writeFloat(v0[0]);
    bb.writeFloat(v0[1]);
    bb.writeFloat(v0[2]);

    bb.writeFloat(v1[0]);
    bb.writeFloat(v1[1]);
    bb.writeFloat(v1[2]);

    bb.writeFloat(v2[0]);
    bb.writeFloat(v2[1]);
    bb.writeFloat(v2[2]);

    bb.writeUint16(0);
  };

  // Build bottom
  // Two big triangles:
  // 0---1     0
  //   \ |     | \
  //     2     2---1
  append_triangle([0, 0, zb], [w, 0, zb], [w, h, zb]);
  append_triangle([0, 0, zb], [w, h, zb], [0, h, zb]);

  // Build top
  // 0---2     0
  //   \ |     | \
  //     1     1---2
  // The heights of the four verts are:
  // h0  hx
  //
  // hy  hxy

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const z0  = heightmap.get_pixel([x + 0, y + 0])[0] * heightmap.scale * scale_exageration;
      const zx  = heightmap.get_pixel([x + 1, y + 0])[0] * heightmap.scale * scale_exageration;
      const zy  = heightmap.get_pixel([x + 0, y + 1])[0] * heightmap.scale * scale_exageration;
      const zxy = heightmap.get_pixel([x + 1, y + 1])[0] * heightmap.scale * scale_exageration;

      append_triangle([x, y, z0], [x + 1, y + 1, zxy], [x + 1, y + 0, zx]);
      append_triangle([x, y, z0], [x + 0, y + 1, zy],  [x + 1, y + 1, zxy]);
    }
  }

  // Build top edge (viewed from center outwards)
  // Z          Z
  // | 0        | 0    1
  // |          |
  // | 2    1   |      2
  //  ------>x   ------>x
  for (let x = 0; x < w; x++) {
    const z0  = heightmap.get_pixel([x + 0, 0])[0] * heightmap.scale * scale_exageration;
    const zx  = heightmap.get_pixel([x + 1, 0])[0] * heightmap.scale * scale_exageration;

    append_triangle([x, 0, z0], [x + 1, 0, zb], [x + 0, 0, zb]);
    append_triangle([x, 0, z0], [x + 1, 0, zx], [x + 1, 0, zb]);
  }

  // Build bottom edge (viewed from center outwards)
  //         Z          Z
  //       0 |   2    0 |
  //         |          |
  //  2    1 |   1      |
  // x<------   x<------
  for (let x = 0; x < w; x++) {
    const z0  = heightmap.get_pixel([x + 0, h])[0] * heightmap.scale * scale_exageration;
    const zx  = heightmap.get_pixel([x + 1, h])[0] * heightmap.scale * scale_exageration;

    append_triangle([x + 0, h, z0], [x + 0, h, zb], [x + 1, h, zb]);
    append_triangle([x + 0, h, z0], [x + 1, h, zb], [x + 1, h, zx]);
  }

  // Build left edge (viewed from center outwards)
  // Z          Z
  // | 0        | 0    2
  // |          |
  // | 1    2   |      1
  //  ------>y   ------>y
  for (let y = 0; y < h; y++) {
    const z0  = heightmap.get_pixel([0, y + 0])[0] * heightmap.scale * scale_exageration;
    const zy  = heightmap.get_pixel([0, y + 1])[0] * heightmap.scale * scale_exageration;

    append_triangle([0, y + 0, z0], [0, y + 0, zb], [0, y + 1, zb]);
    append_triangle([0, y + 0, z0], [0, y + 1, zb], [0, y + 1, zy]);
  }

  // Build right edge (viewed from center outwards)
  //         Z          Z
  //       0 |   1    0 |
  //         |          |
  //  1    2 |   2      |
  // y<------   y<------
  for (let y = 0; y < h; y++) {
    const z0  = heightmap.get_pixel([w, y + 0])[0] * heightmap.scale * scale_exageration;
    const zy  = heightmap.get_pixel([w, y + 1])[0] * heightmap.scale * scale_exageration;

    append_triangle([w, y, z0], [w, y + 1, zb], [w, y + 0, zb]);
    append_triangle([w, y, z0], [w, y + 1, zy], [w, y + 1, zb]);
  }

  bb.flip();
  return bb;
};
