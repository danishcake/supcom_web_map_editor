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
  get right() { return this.__x + this.__w; }
  get bottom() { return this.__y + this.__h; }


  /**
   * Expands to encompass the second rect
   * @return Self for easier chaining
   */
  expand(rhs) {
    let l = Math.min(this.left, rhs.left);
    let t = Math.min(this.top, rhs.top);
    let r = Math.max(this.right, rhs.right);
    let b = Math.max(this.bottom, rhs.bottom);
    this.__w = r - l;
    this.__h = b - t;
    this.__x = l;
    this.__y = t;

    return this;
  }

  /**
   * Returns true if the point lies within the rectangle
   */
  contains(x, y) {
    return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
  }
}
