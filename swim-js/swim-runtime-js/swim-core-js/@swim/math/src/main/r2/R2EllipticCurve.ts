// Copyright 2015-2021 Swim Inc.
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

import {Numbers} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {AnyR2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2CurveContext";
import {R2Curve} from "./R2Curve";

/** @public */
export class R2EllipticCurve extends R2Curve implements Debug {
  constructor(cx: number, cy: number, rx: number, ry: number,
              phi: number, a0: number, da: number) {
    super();
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
    this.phi = phi;
    this.a0 = a0;
    this.da = da;
  }

  readonly cx: number;

  readonly cy: number;

  readonly rx: number;

  readonly ry: number;

  readonly phi: number;

  readonly a0: number;

  readonly da: number;

  override get xMin(): number {
    return this.cx - Math.max(this.rx, this.ry);
  }

  override get yMin(): number {
    return this.cy - Math.max(this.rx, this.ry);
  }

  override get xMax(): number {
    return this.cx + Math.max(this.rx, this.ry);
  }

  override get yMax(): number {
    return this.cy + Math.max(this.rx, this.ry);
  }

  override interpolateX(u: number): number {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return this.cx + dx;
    } else {
      return this.cx + dx * Math.cos(phi) - dy * Math.sin(phi);
    }
  }

  override interpolateY(u: number): number {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return this.cy + dy;
    } else {
      return this.cy + dx * Math.sin(phi) + dy * Math.cos(phi);
    }
  }

  override interpolate(u: number): R2Point {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return new R2Point(this.cx + dx, this.cy + dy);
    } else {
      return new R2Point(this.cx + dx * Math.cos(phi) - dy * Math.sin(phi),
                         this.cy + dx * Math.sin(phi) + dy * Math.cos(phi));
    }
  }

  override contains(that: AnyR2Shape): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: AnyR2Shape | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: AnyR2Shape): boolean {
    return false; // TODO
  }

  override split(u: number): [R2EllipticCurve, R2EllipticCurve] {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const c0 = new R2EllipticCurve(this.cx, this.cy, this.rx, this.ry,
                                   this.phi, a0, a - a0);
    const c1 = new R2EllipticCurve(this.cx, this.cy, this.rx, this.ry,
                                   this.phi, a, a0 + da - a);
    return [c0, c1];
  }

  override transform(f: R2Function): R2EllipticCurve {
    const cx = f.transformX(this.cx, this.cy);
    const cy = f.transformY(this.cx, this.cy);
    const rx = f.transformX(this.cx + this.rx, this.cy + this.ry) - cx;
    const ry = f.transformY(this.cx + this.rx, this.cy + this.ry) - cy;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;
    const a0x = Math.cos(a0);
    const a0y = Math.sin(a0);
    const a1x = Math.cos(a1);
    const a1y = Math.sin(a1);
    const b0x = f.transformX(this.cx + a0x, this.cy - a0y) - cx;
    const b0y = f.transformY(this.cx + a0x, this.cy - a0y) - cy;
    const b1x = f.transformX(this.cx + a1x, this.cy - a1y) - cx;
    const b1y = f.transformY(this.cx + a1x, this.cy - a1y) - cy;
    const b0 = Math.atan2(b0y, b0x);
    let b1 = Math.atan2(b1y, b1x);
    if (Math.abs(da) > Math.PI) {
      if (b1 > 0) {
        b1 = -2 * Math.PI + b1;
      } else if (b1 < 0) {
        b1 = 2 * Math.PI - b1
      }
    }
    const db = b1 - b0;
    return new R2EllipticCurve(cx, cy, rx, ry, this.phi, b0, db);
  }

  override drawMove(context: R2CurveContext): void {
    const {x0, y0} = this.toEndpoints();
    context.moveTo(x0, y0);
  }

  override drawRest(context: R2CurveContext): void {
    context.ellipse(this.cx, this.cy, this.rx, this.ry, this.phi,
                    this.a0, this.a0 + this.da, this.da < 0);
  }

  override transformDrawMove(context: R2CurveContext, f: R2Function): void {
    const {x0, y0} = this.toEndpoints();
    context.moveTo(f.transformX(x0, y0), f.transformY(x0, y0));
  }

  override transformDrawRest(context: R2CurveContext, f: R2Function): void {
    const cx = f.transformX(this.cx, this.cy);
    const cy = f.transformY(this.cx, this.cy);
    const rx = f.transformX(this.cx + this.rx, this.cy + this.ry) - cx;
    const ry = f.transformY(this.cx + this.rx, this.cy + this.ry) - cy;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;
    const a0x = Math.cos(a0);
    const a0y = Math.sin(a0);
    const a1x = Math.cos(a1);
    const a1y = Math.sin(a1);
    const b0x = f.transformX(this.cx + a0x, this.cy - a0y) - cx;
    const b0y = f.transformY(this.cx + a0x, this.cy - a0y) - cy;
    const b1x = f.transformX(this.cx + a1x, this.cy - a1y) - cx;
    const b1y = f.transformY(this.cx + a1x, this.cy - a1y) - cy;
    const b0 = Math.atan2(b0y, b0x);
    let b1 = Math.atan2(b1y, b1x);
    if (Math.abs(da) > Math.PI) {
      if (b1 > 0) {
        b1 = -2 * Math.PI + b1;
      } else if (b1 < 0) {
        b1 = 2 * Math.PI - b1
      }
    }
    const ccw = b1 < b0;
    context.ellipse(cx, cy, rx, ry, this.phi, b0, b1, ccw);
  }

  override writeMove<T>(output: Output<T>): Output<T> {
    const {x0, y0} = this.toEndpoints();
    output = output.write(77/*'M'*/);
    output = Format.displayNumber(output, x0);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, y0);
    return output;
  }

  override writeRest<T>(output: Output<T>): Output<T> {
    const {rx, ry, phi, large, sweep, x1, y1} = this.toEndpoints();
    output = output.write(65/*'A'*/);
    output = Format.displayNumber(output, rx);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, ry);
    output = output.write(32/*' '*/);
    output = Format.displayNumber(output, phi);
    output = output.write(32/*' '*/);
    output = output.write(large ? 49/*'1'*/ : 48/*'0'*/);
    output = output.write(44/*','*/);
    output = output.write(sweep ? 49/*'1'*/ : 48/*'0'*/);
    output = output.write(32/*' '*/);
    output = Format.displayNumber(output, x1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, y1);
    return output;
  }

  toEndpoints(): {x0: number, y0: number, rx: number, ry: number, phi: number,
                  large: boolean, sweep: boolean, x1: number, y1: number} {
    const cx = this.cx;
    const cy = this.cy;
    const rx = this.rx;
    const ry = this.ry;
    const phi = this.phi;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosA0 = Math.cos(a0);
    const sinA0 = Math.sin(a0);
    const cosA1 = Math.cos(a1);
    const sinA1 = Math.sin(a1);
    const x0 = cosPhi * rx * cosA0 - sinPhi * ry * sinA0 + cx;
    const y0 = sinPhi * rx * cosA0 + cosPhi * ry * sinA0 + cy;
    const x1 = cosPhi * rx * cosA1 - sinPhi * ry * sinA1 + cx;
    const y1 = sinPhi * rx * cosA1 + cosPhi * ry * sinA1 + cy;
    const large = Math.abs(da) > Math.PI;
    const sweep = da > 0;
    return {x0, y0, rx, ry, phi, large, sweep, x1, y1};
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2EllipticCurve) {
      return Numbers.equivalent(this.cx, that.cx, epsilon)
          && Numbers.equivalent(this.cy, that.cy, epsilon)
          && Numbers.equivalent(this.rx, that.rx, epsilon)
          && Numbers.equivalent(this.ry, that.ry, epsilon)
          && Numbers.equivalent(this.phi, that.phi, epsilon)
          && Numbers.equivalent(this.a0, that.a0, epsilon)
          && Numbers.equivalent(this.da, that.da, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2EllipticCurve) {
      return this.cx === that.cx && this.cy === that.cy
          && this.rx === that.rx && this.ry === that.ry
          && this.phi === that.phi && this.a0 === that.a0
          && this.da === that.da;
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Curve").write(46/*'.'*/).write("elliptic").write(40/*'('*/)
                   .debug(this.cx).write(", ").debug(this.cy).write(", ")
                   .debug(this.rx).write(", ").debug(this.ry).write(", ")
                   .debug(this.phi).write(", ").debug(this.a0).write(", ")
                   .debug(this.da).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static fromEndpoints(x0: number, y0: number, rx: number, ry: number, phi: number,
                       large: boolean, sweep: boolean, x1: number, y1: number): R2EllipticCurve {
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const x0p =  cosPhi * ((x0 - x1) / 2) + sinPhi * ((y0 - y1) / 2);
    const y0p = -sinPhi * ((x0 - x1) / 2) + cosPhi * ((y0 - y1) / 2);

    const rx2 = rx * rx;
    const ry2 = ry * ry;
    const x0p2 = x0p * x0p;
    const y0p2 = y0p * y0p;
    let sp = Math.sqrt((rx2 * ry2 - rx2 * y0p2 - ry2 * x0p2) / (rx2 * y0p2 + ry2 * x0p2));
    if (large === sweep) {
      sp = -sp;
    }
    const cxp =  sp * rx * y0p / ry;
    const cyp = -sp * ry * x0p / rx;
    const cx = cosPhi * cxp - sinPhi * cyp + (x0 + x1) / 2;
    const cy = sinPhi * cxp + cosPhi * cyp + (y0 + y1) / 2;

    function angle(ux: number, uy: number, vx: number, vy: number): number {
      const uv = ux * vx + uy * vy;
      const uu = ux * ux + uy * uy;
      const vv = vx * vx + vy * vy;
      let a = Math.acos(uv / (Math.sqrt(uu) * Math.sqrt(vv)));
      if (ux * vy - uy * vx < 0) {
        a = -a;
      }
      return a;
    }
    const a0 = angle(1, 0, (x0p - cxp) / rx, (y0p - cyp) / ry);
    let da = angle((x0p - cxp) / rx, (y0p - cyp) / ry, (-x0p - cxp) / rx, (-y0p - cyp) / ry) % (2 * Math.PI);
    if (sweep && da < 0) {
      da += 2 * Math.PI;
    } else if (!sweep && da > 0) {
      da -= 2 * Math.PI;
    }

    return new R2EllipticCurve(cx, cy, rx, ry, phi, a0, da);
  }
}
