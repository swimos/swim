// Copyright 2015-2023 Swim.inc
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

import type {Equals} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {AnyLength, Length, R2Box} from "@swim/math";
import type {Graphics} from "../graphics/Graphics";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {DrawingContext} from "../drawing/DrawingContext";
import {PathContext} from "../path/PathContext";
import {PathRenderer} from "../path/PathRenderer";

/** @public */
export type AnyRect = Rect | RectInit;

/** @public */
export interface RectInit {
  x: AnyLength;
  y: AnyLength;
  width: AnyLength;
  height: AnyLength;
}

/** @public */
export class Rect implements Graphics, Equals, Debug {
  constructor(x: Length, y: Length, width: Length, height: Length) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  readonly x: Length;

  withX(x: AnyLength): Rect {
    x = Length.fromAny(x);
    if (this.x.equals(x)) {
      return this;
    } else {
      return this.copy(x, this.y, this.width, this.height);
    }
  }

  readonly y: Length;

  withY(y: AnyLength): Rect {
    y = Length.fromAny(y);
    if (this.y.equals(y)) {
      return this;
    } else {
      return this.copy(this.x, y, this.width, this.height);
    }
  }

  readonly width: Length;

  withWidth(width: AnyLength): Rect {
    width = Length.fromAny(width);
    if (this.width.equals(width)) {
      return this;
    } else {
      return this.copy(this.x, this.y, width, this.height);
    }
  }

  readonly height: Length;

  withHeight(height: AnyLength): Rect {
    height = Length.fromAny(height);
    if (this.height.equals(height)) {
      return this;
    } else {
      return this.copy(this.x, this.y, this.width, height);
    }
  }

  render(): string;
  render(renderer: GraphicsRenderer, frame?: R2Box): void;
  render(renderer?: GraphicsRenderer, frame?: R2Box): string | void {
    if (renderer === void 0) {
      const context = new PathContext();
      context.setPrecision(3);
      this.draw(context, frame);
      return context.toString();
    } else if (renderer instanceof PathRenderer) {
      this.draw(renderer.context, frame);
    }
  }

  draw(context: DrawingContext, frame: R2Box | null = null): void {
    this.renderRect(context, frame);
  }

  protected renderRect(context: DrawingContext, frame: R2Box | null): void {
    context.rect(this.x.pxValue(), this.y.pxValue(),
                 this.width.pxValue(), this.height.pxValue());
  }

  protected copy(x: Length, y: Length, width: Length, height: Length): Rect {
    return new Rect(x, y, width, height);
  }

  toAny(): RectInit {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Rect) {
      return this.x.equals(that.x) && this.y.equals(that.y)
          && this.width.equals(that.width) && this.height.equals(that.height);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Rect").write(46/*'.'*/).write("create").write(40/*'('*/)
                   .debug(this.x).write(", ").debug(this.y).write(", ")
                   .debug(this.width).write(", ").debug(this.height).write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(x: AnyLength, y: AnyLength, width: AnyLength, height: AnyLength): Rect {
    x = Length.fromAny(x);
    y = Length.fromAny(y);
    width = Length.fromAny(width);
    height = Length.fromAny(height);
    return new Rect(x, y, width, height);
  }

  static fromAny(value: AnyRect): Rect {
    if (value instanceof Rect) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return Rect.create(value.x, value.y, value.width, value.height);
    }
    throw new TypeError("" + value);
  }
}
