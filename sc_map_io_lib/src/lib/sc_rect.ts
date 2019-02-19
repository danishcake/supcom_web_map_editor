/**
 * Basic rectangle class. Defined by two points
 */
export class sc_rect {
  private __x: number;
  private __y: number;
  private __w: number;
  private __h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.__x = x;
    this.__y = y;
    this.__w = w;
    this.__h = h;
  }

  get left(): number { return this.__x; }
  get top(): number { return this.__y; }
  get width(): number { return this.__w; }
  get height(): number { return this.__h; }
  get right(): number { return this.__x + this.__w - 1; }
  get bottom(): number { return this.__y + this.__h - 1; }


  /**
   * Expands to encompass the second rect
   * @return Self for easier chaining
   */
  expand(rhs: sc_rect): sc_rect {
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
  expand_point(point: number[]): void {
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
  contains(x: number, y: number): boolean {
    return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
  }
}
