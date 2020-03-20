// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Equals} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {DrawingContext, Renderer, PathContext, PathRenderer, Graphics} from "@swim/render";

export type AnyRect = Rect | RectInit;

export interface RectInit {
  x: AnyLength;
  y: AnyLength;
  width: AnyLength;
  height: AnyLength;
}

export class Rect implements Graphics, Equals, Debug {
  /** @hidden */
  readonly _x: Length;
  /** @hidden */
  readonly _y: Length;
  /** @hidden */
  readonly _width: Length;
  /** @hidden */
  readonly _height: Length;

  constructor(x: Length, y: Length, width: Length, height: Length) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  x(): Length;
  x(x: AnyLength): Rect;
  x(x?: AnyLength): Length | Rect {
    if (x === void 0) {
      return this._x;
    } else {
      x = Length.fromAny(x);
      if (this._x.equals(x)) {
        return this;
      } else {
        return this.copy(x, this._y, this._width, this._height);
      }
    }
  }

  y(): Length;
  y(y: AnyLength): Rect;
  y(y?: AnyLength): Length | Rect {
    if (y === void 0) {
      return this._y;
    } else {
      y = Length.fromAny(y);
      if (this._y.equals(y)) {
        return this;
      } else {
        return this.copy(this._x, y, this._width, this._height);
      }
    }
  }

  width(): Length;
  width(width: AnyLength): Rect;
  width(width?: AnyLength): Length | Rect {
    if (width === void 0) {
      return this._width;
    } else {
      width = Length.fromAny(width);
      if (this._width.equals(width)) {
        return this;
      } else {
        return this.copy(this._x, this._y, width, this._height);
      }
    }
  }

  height(): Length;
  height(height: AnyLength): Rect;
  height(height?: AnyLength): Length | Rect {
    if (height === void 0) {
      return this._height;
    } else {
      height = Length.fromAny(height);
      if (this._height.equals(height)) {
        return this;
      } else {
        return this.copy(this._x, this._y, this._width, height);
      }
    }
  }

  render(): string;
  render(renderer: Renderer, bounds?: BoxR2, anchor?: PointR2): void;
  render(renderer?: Renderer, bounds?: BoxR2, anchor?: PointR2): string | void {
    if (renderer === void 0) {
      const context = new PathContext();
      this.draw(context, bounds, anchor);
      return context.toString();
    } else if (renderer instanceof PathRenderer) {
      this.draw(renderer.context, bounds, anchor);
    }
  }

  draw(context: DrawingContext, bounds?: BoxR2, anchor?: PointR2): void {
    this.renderRect(context, bounds, anchor);
  }

  protected renderRect(context: DrawingContext, bounds: BoxR2 | undefined, anchor: PointR2 | undefined): void {
    let x: number;
    let y: number;
    if (anchor !== void 0) {
      x = anchor.x;
      y = anchor.y;
    } else {
      x = 0;
      y = 0;
    }
    context.rect(x + this._x.pxValue(), y + this._y.pxValue(),
                 this._width.pxValue(), this._height.pxValue());
  }

  protected copy(x: Length, y: Length, width: Length, height: Length): Rect {
    return new Rect(x, y, width, height);
  }

  toAny(): RectInit {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Rect) {
      return this._x.equals(that._x) && this._y.equals(that._y)
          && this._width.equals(that._width) && this._height.equals(that._height);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("Rect").write(46/*'.'*/).write("from").write(40/*'('*/)
        .debug(this._x).write(", ").debug(this._y).write(", ")
        .debug(this._width).write(", ").debug(this._height).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  static from(x: AnyLength, y: AnyLength, width: AnyLength, height: AnyLength): Rect {
    x = Length.fromAny(x);
    y = Length.fromAny(y);
    width = Length.fromAny(width);
    height = Length.fromAny(height);
    return new Rect(x, y, width, height);
  }

  static fromAny(rect: AnyRect): Rect {
    if (rect instanceof Rect) {
      return rect;
    } else if (typeof rect === "object" && rect) {
      return Rect.from(rect.x, rect.y, rect.width, rect.height);
    }
    throw new TypeError("" + rect);
  }
}
