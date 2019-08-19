// Copyright 2015-2019 SWIM.AI inc.
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

import {Equals, Objects} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {PointR2, BoxR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {DrawingContext, PathContext, Graphic} from "@swim/render";

const PI = Math.PI;
const TAU = 2 * PI;
const EPSILON = 1e-12;

export type AnyArc = Arc | ArcInit;

export interface ArcInit {
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  sweepAngle?: AnyAngle;
  padAngle?: AnyAngle;
  padRadius?: AnyLength | null;
  cornerRadius?: AnyLength;
}

export class Arc implements Graphic, Equals, Debug {
  /** @hidden */
  readonly _innerRadius: Length;
  /** @hidden */
  readonly _outerRadius: Length;
  /** @hidden */
  readonly _startAngle: Angle;
  /** @hidden */
  readonly _deltaAngle: Angle;
  /** @hidden */
  readonly _padAngle: Angle;
  /** @hidden */
  readonly _padRadius: Length | null;
  /** @hidden */
  readonly _cornerRadius: Length;

  constructor(innerRadius: Length, outerRadius: Length, startAngle: Angle, sweepAngle: Angle,
              padAngle: Angle, padRadius: Length | null, cornerRadius: Length) {
    this._innerRadius = innerRadius;
    this._outerRadius = outerRadius;
    this._startAngle = startAngle;
    this._deltaAngle = sweepAngle;
    this._padAngle = padAngle;
    this._padRadius = padRadius;
    this._cornerRadius = cornerRadius;
  }

  innerRadius(): Length;
  innerRadius(innerRadius: AnyLength): Arc;
  innerRadius(innerRadius?: AnyLength): Length | Arc {
    if (innerRadius === void 0) {
      return this._innerRadius;
    } else {
      innerRadius = Length.fromAny(innerRadius);
      if (this._innerRadius.equals(innerRadius)) {
        return this;
      } else {
        return this.copy(innerRadius, this._outerRadius, this._startAngle, this._deltaAngle,
                         this._padAngle, this._padRadius, this._cornerRadius);
      }
    }
  }

  outerRadius(): Length;
  outerRadius(outerRadius: AnyLength): Arc;
  outerRadius(outerRadius?: AnyLength): Length | Arc {
    if (outerRadius === void 0) {
      return this._outerRadius;
    } else {
      outerRadius = Length.fromAny(outerRadius);
      if (this._outerRadius.equals(outerRadius)) {
        return this;
      } else {
        return this.copy(this._innerRadius, outerRadius, this._startAngle, this._deltaAngle,
                         this._padAngle, this._padRadius, this._cornerRadius);
      }
    }
  }

  startAngle(): Angle;
  startAngle(startAngle: AnyAngle): Arc;
  startAngle(startAngle?: AnyAngle): Angle | Arc {
    if (startAngle === void 0) {
      return this._startAngle;
    } else {
      startAngle = Angle.fromAny(startAngle);
      if (this._startAngle.equals(startAngle)) {
        return this;
      } else {
        return this.copy(this._innerRadius, this._outerRadius, startAngle, this._deltaAngle,
                         this._padAngle, this._padRadius, this._cornerRadius);
      }
    }
  }

  sweepAngle(): Angle;
  sweepAngle(sweepAngle: AnyAngle): Arc;
  sweepAngle(sweepAngle?: AnyAngle): Angle | Arc {
    if (sweepAngle === void 0) {
      return this._deltaAngle;
    } else {
      sweepAngle = Angle.fromAny(sweepAngle);
      if (this._deltaAngle.equals(sweepAngle)) {
        return this;
      } else {
        return this.copy(this._innerRadius, this._outerRadius, this._startAngle, sweepAngle,
                         this._padAngle, this._padRadius, this._cornerRadius);
      }
    }
  }

  padAngle(): Angle;
  padAngle(padAngle: AnyAngle): Arc;
  padAngle(padAngle?: AnyAngle): Angle | Arc {
    if (padAngle === void 0) {
      return this._padAngle;
    } else {
      padAngle = Angle.fromAny(padAngle);
      if (this._padAngle.equals(padAngle)) {
        return this;
      } else {
        return this.copy(this._innerRadius, this._outerRadius, this._startAngle, this._deltaAngle,
                         padAngle, this._padRadius, this._cornerRadius);
      }
    }
  }

  padRadius(): Length | null;
  padRadius(padRadius: AnyLength | null): Arc;
  padRadius(padRadius?: AnyLength | null): Length | null | Arc {
    if (padRadius === void 0) {
      return this._padRadius;
    } else {
      padRadius = padRadius !== null ? Length.fromAny(padRadius) : null;
      if (Objects.equal(this._padRadius, padRadius)) {
        return this;
      } else {
        return this.copy(this._innerRadius, this._outerRadius, this._startAngle, this._deltaAngle,
                         this._padAngle, padRadius, this._cornerRadius);
      }
    }
  }

  cornerRadius(): Length;
  cornerRadius(cornerRadius: AnyLength): Arc;
  cornerRadius(cornerRadius?: AnyLength): Length | Arc {
    if (cornerRadius === void 0) {
      return this._cornerRadius;
    } else {
      cornerRadius = Length.fromAny(cornerRadius);
      if (this._cornerRadius.equals(cornerRadius)) {
        return this;
      } else {
        return this.copy(this._innerRadius, this._outerRadius, this._startAngle, this._deltaAngle,
                         this._padAngle, this._padRadius, cornerRadius);
      }
    }
  }

  render(): string;
  render(context: DrawingContext, bounds?: BoxR2, anchor?: PointR2): void;
  render(context?: DrawingContext, bounds?: BoxR2, anchor?: PointR2): string | void {
    const ctx = context || new PathContext();

    let cx: number;
    let cy: number;
    if (anchor) {
      cx = anchor.x;
      cy = anchor.y;
    } else {
      cx = 0;
      cy = 0;
    }

    let size: number | undefined;
    if (bounds) {
      size = Math.min(bounds.width, bounds.height);
    }

    let r0 = this._innerRadius.pxValue(size);
    let r1 = this._outerRadius.pxValue(size);
    const a0 = this._startAngle.radValue();
    const da = this._deltaAngle.radValue();
    const a1 = a0 + da;
    const cw = da >= 0;

    if (r1 < r0) {
      // swap inner and outer radii
      const r = r1;
      r1 = r0;
      r0 = r;
    }

    if (!(r1 > EPSILON)) {
      // degenerate point
      ctx.moveTo(cx, cy);
    } else if (da > TAU - EPSILON) {
      // full circle or annulus
      ctx.moveTo(cx + r1 * Math.cos(a0), cy + r1 * Math.sin(a0));
      ctx.arc(cx, cy, r1, a0, a1, !cw);
      if (r0 > EPSILON) {
        ctx.moveTo(cx + r0 * Math.cos(a1), cy + r0 * Math.sin(a1));
        ctx.arc(cx, cy, r0, a1, a0, cw);
      }
    } else {
      // circular or annular sector
      let a01 = a0;
      let a11 = a1;
      let a00 = a0;
      let a10 = a1;
      let da0 = da;
      let da1 = da;
      const ap = (this._padAngle.radValue()) / 2;
      const rp = +(ap > EPSILON) && (this._padRadius !== null ? this._padRadius.pxValue(size) : Math.sqrt(r0 * r0 + r1 * r1));
      const rc = Math.min(Math.abs(r1 - r0) / 2, this._cornerRadius.pxValue(size));
      let rc0 = rc;
      let rc1 = rc;

      if (rp > EPSILON) {
        // apply padding
        let p0 = Math.asin(rp / r0 * Math.sin(ap));
        let p1 = Math.asin(rp / r1 * Math.sin(ap));
        if ((da0 -= p0 * 2) > EPSILON) {
          p0 *= cw ? 1 : -1;
          a00 += p0;
          a10 -= p0;
        } else {
          da0 = 0;
          a00 = a10 = (a0 + a1) / 2;
        }
        if ((da1 -= p1 * 2) > EPSILON) {
          p1 *= cw ? 1 : -1;
          a01 += p1;
          a11 -= p1;
        } else {
          da1 = 0;
          a01 = a11 = (a0 + a1) / 2;
        }
      }

      let x00: number | undefined;
      let y00: number | undefined;
      const x01 = r1 * Math.cos(a01);
      const y01 = r1 * Math.sin(a01);
      const x10 = r0 * Math.cos(a10);
      const y10 = r0 * Math.sin(a10);
      let x11: number | undefined;
      let y11: number | undefined;

      if (rc > EPSILON) {
        // rounded corners
        x11 = r1 * Math.cos(a11);
        y11 = r1 * Math.sin(a11);
        x00 = r0 * Math.cos(a00);
        y00 = r0 * Math.sin(a00);

        if (da < PI) {
          // limit corner radius to sector angle
          const oc = da0 > EPSILON ? Arc.intersect(x01, y01, x00, y00, x11, y11, x10, y10) : [x10, y10];
          const ax = x01 - oc[0];
          const ay = y01 - oc[1];
          const bx = x11 - oc[0];
          const by = y11 - oc[1];
          const kc = 1 / Math.sin(0.5 * Math.acos((ax * bx + ay * by) /
                                                  (Math.sqrt(ax * ax + ay * ay) *
                                                   Math.sqrt(bx * bx + by * by))));
          const lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
          rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
          rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
        }
      }

      if (!(da1 > EPSILON)) {
        // collapsed sector
        ctx.moveTo(cx + x01, cy + y01);
      } else if (rc1 > EPSILON) {
        // rounded outer corners
        const t0 = Arc.cornerTangents(x00!, y00!, x01, y01, r1, rc1, cw);
        const t1 = Arc.cornerTangents(x11!, y11!, x10, y10, r1, rc1, cw);

        ctx.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);

        if (rc1 < rc) {
          // draw merged outer corners
          ctx.arc(cx + t0.cx, cy + t0.cy, rc1, Math.atan2(t0.y01, t0.x01), Math.atan2(t1.y01, t1.x01), !cw);
        } else {
          // draw outer corners and arc
          ctx.arc(cx + t0.cx, cy + t0.cy, rc1, Math.atan2(t0.y01, t0.x01), Math.atan2(t0.y11, t0.x11), !cw);
          ctx.arc(cx, cy, r1, Math.atan2(t0.cy + t0.y11, t0.cx + t0.x11),
                  Math.atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          ctx.arc(cx + t1.cx, cy + t1.cy, rc1, Math.atan2(t1.y11, t1.x11), Math.atan2(t1.y01, t1.x01), !cw);
        }
      } else {
        // draw outer circular arc
        ctx.moveTo(cx + x01, cy + y01);
        ctx.arc(cx, cy, r1, a01, a11, !cw);
      }

      if (!(r0 > EPSILON) || !(da0 > EPSILON)) {
        // collapsed sector
        ctx.lineTo(cx + x10, cy + y10);
      } else if (rc0 > EPSILON) {
        // rounded inner corners
        const t0 = Arc.cornerTangents(x10, y10, x11!, y11!, r0, -rc0, cw);
        const t1 = Arc.cornerTangents(x01, y01, x00!, y00!, r0, -rc0, cw);

        ctx.lineTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);

        if (rc0 < rc) {
          // draw merged inner corners
          ctx.arc(cx + t0.cx, cy + t0.cy, rc0, Math.atan2(t0.y01, t0.x01), Math.atan2(t1.y01, t1.x01), !cw);
        } else {
          // draw inner corners and arc
          ctx.arc(cx + t0.cx, cy + t0.cy, rc0, Math.atan2(t0.y01, t0.x01), Math.atan2(t0.y11, t0.x11), !cw);
          ctx.arc(cx, cy, r0, Math.atan2(t0.cy + t0.y11, t0.cx + t0.x11),
                  Math.atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          ctx.arc(cx + t1.cx, cy + t1.cy, rc0, Math.atan2(t1.y11, t1.x11), Math.atan2(t1.y01, t1.x01), !cw);
        }
      } else {
        // draw inner circular arc
        ctx.arc(cx, cy, r0, a10, a00, cw);
      }
    }

    ctx.closePath();

    if (!context) {
      return ctx.toString();
    }
  }

  protected copy(innerRadius: Length, outerRadius: Length, startAngle: Angle, sweepAngle: Angle,
                 padAngle: Angle, padRadius: Length | null, cornerRadius: Length): Arc {
    return new Arc(innerRadius, outerRadius, startAngle, sweepAngle, padAngle, padRadius, cornerRadius);
  }

  toAny(): ArcInit {
    return {
      innerRadius: this._innerRadius,
      outerRadius: this._outerRadius,
      startAngle: this._startAngle,
      sweepAngle: this._deltaAngle,
      padAngle: this._padAngle,
      padRadius: this._padRadius,
      cornerRadius: this._cornerRadius,
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Arc) {
      return this._innerRadius.equals(that._innerRadius)
          && this._outerRadius.equals(that._outerRadius)
          && this._startAngle.equals(that._startAngle)
          && this._deltaAngle.equals(that._deltaAngle)
          && this._padAngle.equals(that._padAngle)
          && Objects.equal(this._padRadius, that._padRadius)
          && this._cornerRadius.equals(that._cornerRadius);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("Arc").write(46/*'.'*/).write("from").write(40/*'('*/).write(41/*')'*/);
    if (this._innerRadius.isDefined()) {
      output = output.write(46/*'.'*/).write("innerRadius").write(40/*'('*/).debug(this._innerRadius).write(41/*')'*/);
    }
    if (this._outerRadius.isDefined()) {
      output = output.write(46/*'.'*/).write("outerRadius").write(40/*'('*/).debug(this._outerRadius).write(41/*')'*/);
    }
    if (this._startAngle.isDefined()) {
      output = output.write(46/*'.'*/).write("startAngle").write(40/*'('*/).debug(this._startAngle).write(41/*')'*/);
    }
    if (this._deltaAngle.isDefined()) {
      output = output.write(46/*'.'*/).write("sweepAngle").write(40/*'('*/).debug(this._deltaAngle).write(41/*')'*/);
    }
    if (this._padAngle.isDefined()) {
      output = output.write(46/*'.'*/).write("padAngle").write(40/*'('*/).debug(this._padAngle).write(41/*')'*/);
    }
    if (this._padRadius !== null) {
      output = output.write(46/*'.'*/).write("padRadius").write(40/*'('*/).debug(this._padRadius).write(41/*')'*/);
    }
    if (this._cornerRadius.isDefined()) {
      output = output.write(46/*'.'*/).write("cornerRadius").write(40/*'('*/).debug(this._cornerRadius).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  static from(innerRadius: AnyLength = Length.zero(),
              outerRadius: AnyLength = Length.zero(),
              startAngle: AnyAngle = Angle.zero(),
              sweepAngle: AnyAngle = Angle.zero(),
              padAngle: AnyAngle = Angle.zero(),
              padRadius: AnyLength | null = null,
              cornerRadius: AnyLength = Length.zero()): Arc {
    innerRadius = Length.fromAny(innerRadius);
    outerRadius = Length.fromAny(outerRadius);
    startAngle = Angle.fromAny(startAngle);
    sweepAngle = Angle.fromAny(sweepAngle);
    padAngle = Angle.fromAny(padAngle);
    padRadius = padRadius !== null ? Length.fromAny(padRadius) : null;
    cornerRadius = Length.fromAny(cornerRadius);
    return new Arc(innerRadius, outerRadius, startAngle, sweepAngle,
                   padAngle, padRadius, cornerRadius);
  }

  static fromAny(arc: AnyArc): Arc {
    if (arc instanceof Arc) {
      return arc;
    } else if (typeof arc === "object" && arc) {
      return Arc.from(arc.innerRadius, arc.outerRadius, arc.startAngle,
                      arc.sweepAngle, arc.padAngle, arc.padRadius,
                      arc.cornerRadius);
    }
    throw new TypeError("" + arc);
  }

  private static intersect(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number,
                           x3: number, y3: number): [number, number] {
    const x10 = x1 - x0;
    const y10 = y1 - y0;
    const x32 = x3 - x2;
    const y32 = y3 - y2;
    const t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / (y32 * x10 - x32 * y10);
    return [x0 + t * x10, y0 + t * y10];
  }

  private static cornerTangents(x0: number, y0: number, x1: number, y1: number, r1: number, rc: number, cw: boolean)
                             : {cx: number, cy: number, x01: number, y01: number, x11: number, y11: number} {
    // http://mathworld.wolfram.com/Circle-LineIntersection.html
    const x01 = x0 - x1;
    const y01 = y0 - y1;
    const lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01);
    const ox = lo * y01;
    const oy = -lo * x01;
    const x11 = x0 + ox;
    const y11 = y0 + oy;
    const x10 = x1 + ox;
    const y10 = y1 + oy;
    const x00 = (x11 + x10) / 2;
    const y00 = (y11 + y10) / 2;
    const dx = x10 - x11;
    const dy = y10 - y11;
    const d2 = dx * dx + dy * dy;
    const r = r1 - rc;
    const D = x11 * y10 - x10 * y11;
    const d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D));
    let cx0 = (D * dy - dx * d) / d2;
    let cy0 = (-D * dx - dy * d) / d2;
    const cx1 = (D * dy + dx * d) / d2;
    const cy1 = (-D * dx + dy * d) / d2;
    const dx0 = cx0 - x00;
    const dy0 = cy0 - y00;
    const dx1 = cx1 - x00;
    const dy1 = cy1 - y00;
    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) {
      // pick closest intersection
      cx0 = cx1;
      cy0 = cy1;
    }
    return {
      cx: cx0,
      cy: cy0,
      x01: -ox,
      y01: -oy,
      x11: cx0 * (r1 / r - 1),
      y11: cy0 * (r1 / r - 1),
    };
  }
}
