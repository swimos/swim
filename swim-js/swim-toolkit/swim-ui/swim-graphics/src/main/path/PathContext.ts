// Copyright 2015-2022 Swim.inc
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

import type {Mutable} from "@swim/util";
import {Format} from "@swim/codec";
import type {DrawingContext} from "../drawing/DrawingContext";

/** @public */
export class PathContext implements DrawingContext {
  constructor() {
    this.precision = -1;
    this.x0 = NaN;
    this.y0 = NaN;
    this.x1 = NaN;
    this.y1 = NaN;
    this.d = "";
  }

  readonly precision!: number;

  setPrecision(precision: number): void {
    (this as Mutable<this>).precision = precision;
  }

  /** @internal */
  get anglePrecision(): number {
    const precision = this.precision;
    return precision > 0 ? Math.max(5, precision) : precision;
  }

  /** @internal */
  x0: number;
  /** @internal */
  y0: number;
  /** @internal */
  x1: number;
  /** @internal */
  y1: number;
  /** @internal */
  d: string;

  moveTo(x: number, y: number): void {
    this.d += "M" + Format.decimal(x, this.precision)
            + "," + Format.decimal(y, this.precision);
    this.x0 = x;
    this.y0 = y;
    this.x1 = x;
    this.y1 = y;
  }

  lineTo(x: number, y: number): void {
    this.d += "L" + Format.decimal(x, this.precision)
            + "," + Format.decimal(y, this.precision);
    this.x1 = x;
    this.y1 = y;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void {
    this.d += "Q" + Format.decimal(x1, this.precision)
            + "," + Format.decimal(y1, this.precision)
            + "," + Format.decimal(x, this.precision)
            + "," + Format.decimal(y, this.precision);
    this.x1 = x;
    this.y1 = y;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
    this.d += "C" + Format.decimal(x1, this.precision)
            + "," + Format.decimal(y1, this.precision)
            + "," + Format.decimal(x2, this.precision)
            + "," + Format.decimal(y2, this.precision)
            + "," + Format.decimal(x, this.precision)
            + "," + Format.decimal(y, this.precision);
    this.x1 = x;
    this.y1 = y;
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    const x0 = this.x1;
    const y0 = this.y1;
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const x01 = x0 - x1;
    const y01 = y0 - y1;
    const l01_2 = x01 * x01 + y01 * y01;

    if (r < 0) {
      throw new Error("negative radius: " + r);
    } else if (isNaN(this.x1)) {
      // empty path
      this.d += "M" + Format.decimal(x1, this.precision)
              + "," + Format.decimal(y1, this.precision);
      this.x1 = x1;
      this.y1 = y1;
    } else if (!(l01_2 > PathContext.Epsilon)) {
      // coincident endpoints
    } else if (!(Math.abs(y01 * x21 - y21 * x01) > PathContext.Epsilon) || r === 0) {
      // colinear control points
      this.d += "L" + Format.decimal(x1, this.precision)
              + "," + Format.decimal(y1, this.precision);
      this.x1 = x1;
      this.y1 = y1;
    } else {
      const x20 = x2 - x0;
      const y20 = y2 - y0;
      const l21_2 = x21 * x21 + y21 * y21;
      const l20_2 = x20 * x20 + y20 * y20;
      const l21 = Math.sqrt(l21_2);
      const l01 = Math.sqrt(l01_2);
      const l = r * Math.tan((Math.PI - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2);
      const t01 = l / l01;
      const t21 = l / l21;
      if (Math.abs(t01 - 1) > PathContext.Epsilon) {
        // line to start tangent
        this.d += "L" + Format.decimal(x1 + t01 * x01, this.precision)
                + "," + Format.decimal(y1 + t01 * y01, this.precision);
      }
      x1 = x1 + t21 * x21;
      y1 = y1 + t21 * y21;
      const rs = Format.decimal(r, this.precision);
      this.d += "A" + rs
              + "," + rs
              + ",0"
              + ",0"
              + "," + (y01 * x20 > x01 * y20 ? "1" : "0")
              + "," + Format.decimal(x1, this.precision)
              + "," + Format.decimal(y1, this.precision);
      this.x1 = x1;
      this.y1 = y1;
    }
  }

  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw: boolean = false): void {
    const dx = r * Math.cos(a0);
    const dy = r * Math.sin(a0);
    const x0 = cx + dx;
    const y0 = cy + dy;
    const cw = 1 ^ +ccw;
    let da = ccw ? a0 - a1 : a1 - a0;

    if (r < 0) {
      throw new Error("negative radius: " + r);
    } else if (isNaN(this.x1)) {
      // empty path
      this.d += "M" + Format.decimal(x0, this.precision)
              + "," + Format.decimal(y0, this.precision);
    } else if (Math.abs(this.x1 - x0) > PathContext.Epsilon || Math.abs(this.y1 - y0) > PathContext.Epsilon) {
      // line to start point
      this.d += "L" + Format.decimal(x0, this.precision)
              + "," + Format.decimal(y0, this.precision);
    }

    if (r === 0) {
      return;
    } else if (da < 0) {
      // reverse direction
      da = da % (2 * Math.PI) + 2 * Math.PI;
    }

    const rs = Format.decimal(r, this.precision);
    if (da > 2 * Math.PI - PathContext.Epsilon) {
      // complete circle
      this.d += "A" + rs
              + "," + rs
              + ",0"
              + ",1"
              + "," + (cw ? "1" : "0")
              + "," + Format.decimal(x0, this.precision)
              + "," + Format.decimal(y0, this.precision);
      this.x1 = x0;
      this.y1 = y0;
    } else if (da > PathContext.Epsilon) {
      // non-zero arc angle
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      this.d += "A" + rs
              + "," + rs
              + ",0"
              + "," + (da >= Math.PI ? "1" : "0")
              + "," + (cw ? "1" : "0")
              + "," + Format.decimal(x1, this.precision)
              + "," + Format.decimal(y1, this.precision);
      this.x1 = x1;
      this.y1 = y1;
    }
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.d += "M" + Format.decimal(x, this.precision)
            + "," + Format.decimal(y, this.precision)
            + "h" + Format.decimal(w, this.precision)
            + "v" + Format.decimal(h, this.precision)
            + "h" + Format.decimal(-w, this.precision)
            + "Z";
    this.x0 = x;
    this.y0 = y;
    this.x1 = x;
    this.y1 = y;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, phi: number, a0: number, a1: number, ccw: boolean = false): void {
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosA1 = Math.cos(a1);
    const sinA1 = Math.sin(a1);
    const x1 = cosPhi * rx * cosA1 - sinPhi * ry * sinA1 + cx;
    const y1 = sinPhi * rx * cosA1 + cosPhi * ry * sinA1 + cy;
    const da = a1 - a0;
    const large = Math.abs(da) > Math.PI;
    const sweep = !ccw;
    this.d += "A" + Format.decimal(rx, this.precision)
            + "," + Format.decimal(ry, this.precision)
            + "," + Format.decimal(phi, this.anglePrecision)
            + "," + (large ? "1" : "0")
            + "," + (sweep ? "1" : "0")
            + "," + Format.decimal(x1, this.precision)
            + "," + Format.decimal(y1, this.precision);
    this.x1 = x1;
    this.y1 = y1;
  }

  closePath(): void {
    if (!isNaN(this.x1)) {
      this.d += "Z";
      this.x1 = this.x0;
      this.y1 = this.y0;
    }
  }

  toString(): string {
    return this.d;
  }

  /** @internal */
  static Epsilon: number = 1e-6;
}
