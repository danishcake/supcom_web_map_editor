/**
 * Basic rectangle class. Defined by two points
 */
export class sc_rect {
  constructor(x, y, w, h) {
    this.__x = x;
    this.__y = y;
    this.__w = w;
    this.__h = h;
  }

  get left() { return this.__x; }
  get top() { return this.__y; }
  get width() { return this.__w; }
  get height() { return this.__h; }
  get right() { return this.__x + this.__w - 1; }
  get bottom() { return this.__y + this.__h - 1; }


  /**
   * Expands to encompass the second rect
   * @return Self for easier chaining
   */
  expand(rhs) {
    let l = Math.min(this.left, rhs.left);
    let t = Math.min(this.top, rhs.top);
    let r = Math.max(this.right, rhs.right);
    let b = Math.max(this.bottom, rhs.bottom);
    this.__w = r - l + 1;
    this.__h = b - t + 1;
    this.__x = l;
    this.__y = t;

    return this;
  }


  /**
   * Expands to encompass the given point
   * @return Self for easier chaining
   */
  expand_point(point) {
    let l = Math.min(this.left, point[0]);
    let t = Math.min(this.top, point[1]);
    let r = Math.max(this.right, point[0]);
    let b = Math.max(this.bottom, point[1]);
    this.__w = r - l + 1;
    this.__h = b - t + 1;
    this.__x = l;
    this.__y = t;
  }


  /**
   * Returns true if the point lies within the rectangle
   */
  contains(x, y) {
    return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
  }
}
