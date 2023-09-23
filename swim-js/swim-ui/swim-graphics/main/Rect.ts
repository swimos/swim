// Copyright 2015-2023 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Equals} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import type {R2Box} from "@swim/math";
import type {Graphics} from "./Graphics";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {DrawingContext} from "./DrawingContext";
import {PathContext} from "./PathContext";
import {PathRenderer} from "./PathRenderer";

/** @public */
export type RectLike = Rect | RectInit;

/** @public */
export interface RectInit {
  x: LengthLike;
  y: LengthLike;
  width: LengthLike;
  height: LengthLike;
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

  withX(x: LengthLike): Rect {
    x = Length.fromLike(x);
    if (this.x.equals(x)) {
      return this;
    }
    return this.copy(x, this.y, this.width, this.height);
  }

  readonly y: Length;

  withY(y: LengthLike): Rect {
    y = Length.fromLike(y);
    if (this.y.equals(y)) {
      return this;
    }
    return this.copy(this.x, y, this.width, this.height);
  }

  readonly width: Length;

  withWidth(width: LengthLike): Rect {
    width = Length.fromLike(width);
    if (this.width.equals(width)) {
      return this;
    }
    return this.copy(this.x, this.y, width, this.height);
  }

  readonly height: Length;

  withHeight(height: LengthLike): Rect {
    height = Length.fromLike(height);
    if (this.height.equals(height)) {
      return this;
    }
    return this.copy(this.x, this.y, this.width, height);
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

  toLike(): RectInit {
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

  static create(x: LengthLike, y: LengthLike, width: LengthLike, height: LengthLike): Rect {
    x = Length.fromLike(x);
    y = Length.fromLike(y);
    width = Length.fromLike(width);
    height = Length.fromLike(height);
    return new Rect(x, y, width, height);
  }

  static fromLike<T extends RectLike | null | undefined>(value: T): Rect | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Rect) {
      return value as Rect | Uninitable<T>;
    } else if (typeof value === "object") {
      return Rect.create(value.x, value.y, value.width, value.height);
    }
    throw new TypeError("" + value);
  }
}
