// Copyright 2015-2021 Swim.inc
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

import type {R2Curve} from "./R2Curve";
import {R2Segment} from "./R2Segment";
import {R2QuadraticCurve} from "./R2QuadraticCurve";
import {R2CubicCurve} from "./R2CubicCurve";
import {R2EllipticCurve} from "./R2EllipticCurve";
import type {R2SplineContext} from "./R2SplineContext";
import {R2Spline} from "./R2Spline";

/** @public */
export class R2SplineBuilder implements R2SplineContext {
  /** @internal */
  curves: R2Curve[];
  /** @internal */
  closed: boolean;
  /** @internal */
  aliased: boolean;
  /** @internal */
  x0: number;
  /** @internal */
  y0: number;
  /** @internal */
  x: number;
  /** @internal */
  y: number;

  constructor() {
    this.curves = [];
    this.closed = false;
    this.aliased = false;
    this.x0 = 0;
    this.y0 = 0;
    this.x = 0;
    this.y = 0;
  }

  private dealias(): void {
    if (this.aliased) {
      this.curves = this.curves.slice(0);
      this.aliased = false;
    }
  }

  moveTo(x: number, y: number): void {
    if (this.aliased) {
      this.curves = [];
      this.aliased = false;
    } else {
      this.curves.length = 0;
    }
    this.closed = false;
    this.x0 = x;
    this.y0 = y;
    this.x = x;
    this.y = y;
  }

  closePath(): void {
    this.dealias();
    this.curves.push(new R2Segment(this.x, this.y, this.x0, this.y0));
    this.closed = true;
    this.x = this.x0;
    this.y = this.y0;
  }

  lineTo(x: number, y: number): void {
    this.dealias();
    this.curves.push(new R2Segment(this.x, this.y, x, y));
    this.x = x;
    this.y = y;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void {
    this.dealias();
    this.curves.push(new R2QuadraticCurve(this.x, this.y, x1, y1, x, y));
    this.x = x;
    this.y = y;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
    this.dealias();
    this.curves.push(new R2CubicCurve(this.x, this.y, x1, y1, x2, y2, x, y));
    this.x = x;
    this.y = y;
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    this.dealias();
    const x0 = this.x;
    const y0 = this.y;
    const dx01 = x1 - x0;
    const dy01 = y1 - y0;
    const dx12 = x2 - x1;
    const dy12 = y2 - y1;
    const a0 = Math.atan2(dy01, dx01) - Math.PI / 2;
    const a1 = Math.atan2(dy12, dx12) - Math.PI / 2;
    const da = a1 - a0;
    const r0x = Math.cos(a0);
    const r0y = Math.sin(a0);
    const r1x = Math.cos(a1);
    const r1y = Math.sin(a1);
    const r0x0 = x0 - r0x;
    const r0y0 = y0 - r0y;
    const r0x1 = x1 - r0x;
    const r0y1 = y1 - r0y;
    const r1x1 = x1 - r1x;
    const r1y1 = y1 - r1y;
    const r1x2 = x2 - r1x;
    const r1y2 = y2 - r1y;
    const u = R2SplineBuilder.intersection(r0x0, r0y0, r0x1 - r0x0, r0y1 - r0y0,
                                           r1x1, r1y1, r1x2 - r1x1, r1y2 - r1y1);
    const cx = r0x0 + u * (r0x1 - r0x0);
    const cy = r0y0 + u * (r0y1 - r0y0);
    this.curves.push(new R2EllipticCurve(cx, cy, r, r, 0, a0, da));
    this.x = x2;
    this.y = y2;
  }

  private static intersection(px: number, py: number, rx: number, ry: number,
                              qx: number, qy: number, sx: number, sy: number): number {
    const pqx = qx - px;
    const pqy = qy - py;
    const pqr = pqx * ry - pqy * rx;
    const rs = rx * sy - ry * sx;
    if (pqr === 0 && rs === 0) { // collinear
      const rr = rx * rx + ry * ry;
      const sr = sx * rx + sy * ry;
      const t0 = (pqx * rx + pqy * ry) / rr;
      const t1 = t0 + sr / rr;
      if (sr >= 0 ? 0 < t1 && t0 < 1 : 0 < t0 && t1 < 1) {
        return t0;
      } else {
        return NaN;
      }
    } else if (rs === 0) { // parallel
      return NaN;
    } else {
      const pqs = pqx * sy - pqy * sx;
      const t = pqs / rs; // (q − p) × s / (r × s)
      const u = pqr / rs; // (q − p) × r / (r × s)
      if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
        return t;
      } else {
        return NaN;
      }
    }
  }

  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw: boolean = false): void {
    this.dealias();
    let da = a1 - a0;
    if (ccw === true && da > 0) {
      da -= 2 * Math.PI;
    } else if (ccw === false && da < 0) {
      da += 2 * Math.PI;
    }
    const curve = new R2EllipticCurve(cx, cy, r, r, 0, a0, da);
    this.curves.push(curve);
    const {x, y} = curve.interpolate(1);
    this.x = x;
    this.y = y;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, phi: number, a0: number, a1: number, ccw?: boolean): void {
    this.dealias();
    let da = a1 - a0;
    if (ccw === true && da > 0) {
      da -= 2 * Math.PI;
    } else if (ccw === false && da < 0) {
      da += 2 * Math.PI;
    }
    const curve = new R2EllipticCurve(cx, cy, rx, ry, phi, a0, da);
    this.curves.push(curve);
    const {x, y} = curve.interpolate(1);
    this.x = x;
    this.y = y;
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.dealias();
    this.curves.push(new R2Segment(x, y, x + w, y),
                     new R2Segment(x + w, y, x + w, y + h),
                     new R2Segment(x + w, y + h, x, y + h),
                     new R2Segment(x, y + h, x, y));
    this.x = x;
    this.y = y;
  }

  bind(): R2Spline {
    this.aliased = true;
    return new R2Spline(this.curves, this.closed);
  }
}
