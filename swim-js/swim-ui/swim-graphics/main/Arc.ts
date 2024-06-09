// Copyright 2015-2024 Nstream, inc.
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
import {Equals} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import type {AngleLike} from "@swim/math";
import {Angle} from "@swim/math";
import type {R2PointLike} from "@swim/math";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import type {GraphicsRenderer} from "./GraphicsRenderer";
import type {Graphics} from "./Graphics";
import type {DrawingContext} from "./DrawingContext";
import {PathContext} from "./PathContext";
import {PathRenderer} from "./PathRenderer";

/** @public */
export type ArcLike = Arc | ArcInit;

/** @public */
export interface ArcInit {
  center?: R2Point;
  innerRadius?: LengthLike;
  outerRadius?: LengthLike;
  startAngle?: AngleLike;
  sweepAngle?: AngleLike;
  padAngle?: AngleLike;
  padRadius?: LengthLike | null;
  cornerRadius?: LengthLike;
}

/** @public */
export class Arc implements Graphics, Equals, Debug {
  constructor(center: R2Point, innerRadius: Length, outerRadius: Length, startAngle: Angle,
              sweepAngle: Angle, padAngle: Angle, padRadius: Length | null, cornerRadius: Length) {
    this.center = center;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.startAngle = startAngle;
    this.sweepAngle = sweepAngle;
    this.padAngle = padAngle;
    this.padRadius = padRadius;
    this.cornerRadius = cornerRadius;
  }

  readonly center: R2Point;

  withCenter(center: R2PointLike): Arc {
    center = R2Point.fromLike(center);
    if (this.center.equals(center)) {
      return this;
    }
    return this.copy(center, this.innerRadius, this.outerRadius, this.startAngle,
                     this.sweepAngle, this.padAngle, this.padRadius, this.cornerRadius);
  }

  readonly innerRadius: Length;

  withInnerRadius(innerRadius: LengthLike): Arc {
    innerRadius = Length.fromLike(innerRadius);
    if (this.innerRadius.equals(innerRadius)) {
      return this;
    }
    return this.copy(this.center, innerRadius, this.outerRadius, this.startAngle,
                     this.sweepAngle, this.padAngle, this.padRadius, this.cornerRadius);
  }

  readonly outerRadius: Length;

  withOuterRadius(outerRadius: LengthLike): Arc {
    outerRadius = Length.fromLike(outerRadius);
    if (this.outerRadius.equals(outerRadius)) {
      return this;
    }
    return this.copy(this.center, this.innerRadius, outerRadius, this.startAngle,
                     this.sweepAngle, this.padAngle, this.padRadius, this.cornerRadius);
  }

  readonly startAngle: Angle;

  withStartAngle(startAngle: AngleLike): Arc {
    startAngle = Angle.fromLike(startAngle);
    if (this.startAngle.equals(startAngle)) {
      return this;
    }
    return this.copy(this.center, this.innerRadius, this.outerRadius, startAngle,
                     this.sweepAngle, this.padAngle, this.padRadius, this.cornerRadius);
  }

  readonly sweepAngle: Angle;

  withSweepAngle(sweepAngle: AngleLike): Arc {
    sweepAngle = Angle.fromLike(sweepAngle);
    if (this.sweepAngle.equals(sweepAngle)) {
      return this;
    }
    return this.copy(this.center, this.innerRadius, this.outerRadius, this.startAngle,
                     sweepAngle, this.padAngle, this.padRadius, this.cornerRadius);
  }

  readonly padAngle: Angle;

  withPadAngle(padAngle: AngleLike): Arc {
    padAngle = Angle.fromLike(padAngle);
    if (this.padAngle.equals(padAngle)) {
      return this;
    }
    return this.copy(this.center, this.innerRadius, this.outerRadius, this.startAngle,
                     this.sweepAngle, padAngle, this.padRadius, this.cornerRadius);
  }

  readonly padRadius: Length | null;

  withPadRadius(padRadius: LengthLike | null): Arc {
    if (padRadius !== null) {
      padRadius = Length.fromLike(padRadius);
    }
    if (Equals(this.padRadius, padRadius)) {
      return this;
    }
    return this.copy(this.center, this.innerRadius, this.outerRadius, this.startAngle,
                     this.sweepAngle, this.padAngle, padRadius, this.cornerRadius);
  }

  readonly cornerRadius: Length;

  withCornerRadius(cornerRadius: LengthLike): Arc {
    cornerRadius = Length.fromLike(cornerRadius);
    if (this.cornerRadius.equals(cornerRadius)) {
      return this;
    }
    return this.copy(this.center, this.innerRadius, this.outerRadius, this.startAngle,
                     this.sweepAngle, this.padAngle, this.padRadius, cornerRadius);
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

  draw(context: DrawingContext, frame?: R2Box): void {
    this.renderArc(context, frame);
  }

  protected renderArc(context: DrawingContext, frame: R2Box | undefined): void {
    let size: number | undefined;
    if (frame !== void 0) {
      size = Math.min(frame.width, frame.height);
    }

    const center = this.center;
    const cx = center.x;
    const cy = center.y;
    let r0 = this.innerRadius.pxValue(size);
    let r1 = this.outerRadius.pxValue(size);
    const a0 = this.startAngle.radValue();
    const da = this.sweepAngle.radValue();
    const a1 = a0 + da;
    const cw = da >= 0;

    if (r1 < r0) {
      // swap inner and outer radii
      const r = r1;
      r1 = r0;
      r0 = r;
    }

    if (!(r1 > Arc.Epsilon)) {
      // degenerate point
      context.moveTo(cx, cy);
    } else if (da > 2 * Math.PI - Arc.Epsilon) {
      // full circle or annulus
      context.moveTo(cx + r1 * Math.cos(a0), cy + r1 * Math.sin(a0));
      context.arc(cx, cy, r1, a0, a1, !cw);
      if (r0 > Arc.Epsilon) {
        context.moveTo(cx + r0 * Math.cos(a1), cy + r0 * Math.sin(a1));
        context.arc(cx, cy, r0, a1, a0, cw);
      }
    } else {
      // circular or annular sector
      let a01 = a0;
      let a11 = a1;
      let a00 = a0;
      let a10 = a1;
      let da0 = da;
      let da1 = da;
      const ap = (this.padAngle.radValue()) / 2;
      const rp = +(ap > Arc.Epsilon) && (this.padRadius !== null ? this.padRadius.pxValue(size) : Math.sqrt(r0 * r0 + r1 * r1));
      const rc = Math.min(Math.abs(r1 - r0) / 2, this.cornerRadius.pxValue(size));
      let rc0 = rc;
      let rc1 = rc;

      if (rp > Arc.Epsilon) {
        // apply padding
        let p0 = Math.asin(rp / r0 * Math.sin(ap));
        let p1 = Math.asin(rp / r1 * Math.sin(ap));
        if ((da0 -= p0 * 2) > Arc.Epsilon) {
          p0 *= cw ? 1 : -1;
          a00 += p0;
          a10 -= p0;
        } else {
          da0 = 0;
          a00 = a10 = (a0 + a1) / 2;
        }
        if ((da1 -= p1 * 2) > Arc.Epsilon) {
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

      if (rc > Arc.Epsilon) {
        // rounded corners
        x11 = r1 * Math.cos(a11);
        y11 = r1 * Math.sin(a11);
        x00 = r0 * Math.cos(a00);
        y00 = r0 * Math.sin(a00);

        if (da < Math.PI) {
          // limit corner radius to sector angle
          const oc = da0 > Arc.Epsilon ? Arc.intersect(x01, y01, x00, y00, x11, y11, x10, y10) : [x10, y10];
          const ax = x01 - oc[0]!;
          const ay = y01 - oc[1]!;
          const bx = x11 - oc[0]!;
          const by = y11 - oc[1]!;
          const kc = 1 / Math.sin(0.5 * Math.acos((ax * bx + ay * by) /
                                                  (Math.sqrt(ax * ax + ay * ay) *
                                                   Math.sqrt(bx * bx + by * by))));
          const lc = Math.sqrt(oc[0]! * oc[0]! + oc[1]! * oc[1]!);
          rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
          rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
        }
      }

      if (!(da1 > Arc.Epsilon)) {
        // collapsed sector
        context.moveTo(cx + x01, cy + y01);
      } else if (rc1 > Arc.Epsilon) {
        // rounded outer corners
        const t0 = Arc.cornerTangents(x00!, y00!, x01, y01, r1, rc1, cw);
        const t1 = Arc.cornerTangents(x11!, y11!, x10, y10, r1, rc1, cw);

        context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);

        if (rc1 < rc) {
          // draw merged outer corners
          context.arc(cx + t0.cx, cy + t0.cy, rc1, Math.atan2(t0.y01, t0.x01), Math.atan2(t1.y01, t1.x01), !cw);
        } else {
          // draw outer corners and arc
          context.arc(cx + t0.cx, cy + t0.cy, rc1, Math.atan2(t0.y01, t0.x01), Math.atan2(t0.y11, t0.x11), !cw);
          context.arc(cx, cy, r1, Math.atan2(t0.cy + t0.y11, t0.cx + t0.x11),
                      Math.atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          context.arc(cx + t1.cx, cy + t1.cy, rc1, Math.atan2(t1.y11, t1.x11), Math.atan2(t1.y01, t1.x01), !cw);
        }
      } else {
        // draw outer circular arc
        context.moveTo(cx + x01, cy + y01);
        context.arc(cx, cy, r1, a01, a11, !cw);
      }

      if (!(r0 > Arc.Epsilon) || !(da0 > Arc.Epsilon)) {
        // collapsed sector
        context.lineTo(cx + x10, cy + y10);
      } else if (rc0 > Arc.Epsilon) {
        // rounded inner corners
        const t0 = Arc.cornerTangents(x10, y10, x11!, y11!, r0, -rc0, cw);
        const t1 = Arc.cornerTangents(x01, y01, x00!, y00!, r0, -rc0, cw);

        context.lineTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);

        if (rc0 < rc) {
          // draw merged inner corners
          context.arc(cx + t0.cx, cy + t0.cy, rc0, Math.atan2(t0.y01, t0.x01), Math.atan2(t1.y01, t1.x01), !cw);
        } else {
          // draw inner corners and arc
          context.arc(cx + t0.cx, cy + t0.cy, rc0, Math.atan2(t0.y01, t0.x01), Math.atan2(t0.y11, t0.x11), !cw);
          context.arc(cx, cy, r0, Math.atan2(t0.cy + t0.y11, t0.cx + t0.x11),
                      Math.atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          context.arc(cx + t1.cx, cy + t1.cy, rc0, Math.atan2(t1.y11, t1.x11), Math.atan2(t1.y01, t1.x01), !cw);
        }
      } else {
        // draw inner circular arc
        context.arc(cx, cy, r0, a10, a00, cw);
      }
    }

    context.closePath();
  }

  protected copy(center: R2Point, innerRadius: Length, outerRadius: Length, startAngle: Angle,
                 sweepAngle: Angle, padAngle: Angle, padRadius: Length | null, cornerRadius: Length): Arc {
    return new Arc(center, innerRadius, outerRadius, startAngle, sweepAngle, padAngle, padRadius, cornerRadius);
  }

  toLike(): ArcInit {
    return {
      center: this.center,
      innerRadius: this.innerRadius,
      outerRadius: this.outerRadius,
      startAngle: this.startAngle,
      sweepAngle: this.sweepAngle,
      padAngle: this.padAngle,
      padRadius: this.padRadius,
      cornerRadius: this.cornerRadius,
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Arc) {
      return this.center.equals(that.center)
          && this.innerRadius.equals(that.innerRadius)
          && this.outerRadius.equals(that.outerRadius)
          && this.startAngle.equals(that.startAngle)
          && this.sweepAngle.equals(that.sweepAngle)
          && this.padAngle.equals(that.padAngle)
          && Equals(this.padRadius, that.padRadius)
          && this.cornerRadius.equals(that.cornerRadius);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Arc").write(46/*'.'*/).write("create").write(40/*'('*/).write(41/*')'*/);
    if (this.center.isDefined()) {
      output = output.write(46/*'.'*/).write("center").write(40/*'('*/).debug(this.center).write(41/*')'*/);
    }
    if (this.innerRadius.isDefined()) {
      output = output.write(46/*'.'*/).write("innerRadius").write(40/*'('*/).debug(this.innerRadius).write(41/*')'*/);
    }
    if (this.outerRadius.isDefined()) {
      output = output.write(46/*'.'*/).write("outerRadius").write(40/*'('*/).debug(this.outerRadius).write(41/*')'*/);
    }
    if (this.startAngle.isDefined()) {
      output = output.write(46/*'.'*/).write("startAngle").write(40/*'('*/).debug(this.startAngle).write(41/*')'*/);
    }
    if (this.sweepAngle.isDefined()) {
      output = output.write(46/*'.'*/).write("sweepAngle").write(40/*'('*/).debug(this.sweepAngle).write(41/*')'*/);
    }
    if (this.padAngle.isDefined()) {
      output = output.write(46/*'.'*/).write("padAngle").write(40/*'('*/).debug(this.padAngle).write(41/*')'*/);
    }
    if (this.padRadius !== null) {
      output = output.write(46/*'.'*/).write("padRadius").write(40/*'('*/).debug(this.padRadius).write(41/*')'*/);
    }
    if (this.cornerRadius.isDefined()) {
      output = output.write(46/*'.'*/).write("cornerRadius").write(40/*'('*/).debug(this.cornerRadius).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(center: R2PointLike = R2Point.origin(),
                innerRadius: LengthLike = Length.zero(),
                outerRadius: LengthLike = Length.zero(),
                startAngle: AngleLike = Angle.zero(),
                sweepAngle: AngleLike = Angle.zero(),
                padAngle: AngleLike = Angle.zero(),
                padRadius: LengthLike | null = null,
                cornerRadius: LengthLike = Length.zero()): Arc {
    center = R2Point.fromLike(center);
    innerRadius = Length.fromLike(innerRadius);
    outerRadius = Length.fromLike(outerRadius);
    startAngle = Angle.fromLike(startAngle);
    sweepAngle = Angle.fromLike(sweepAngle);
    padAngle = Angle.fromLike(padAngle);
    padRadius = padRadius !== null ? Length.fromLike(padRadius) : null;
    cornerRadius = Length.fromLike(cornerRadius);
    return new Arc(center, innerRadius, outerRadius, startAngle,
                   sweepAngle, padAngle, padRadius, cornerRadius);
  }

  static fromLike<T extends ArcLike | null | undefined>(value: T): Arc | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Arc) {
      return value as Arc | Uninitable<T>;
    } else if (typeof value === "object") {
      return Arc.create(value.center, value.innerRadius, value.outerRadius, value.startAngle,
                        value.sweepAngle, value.padAngle, value.padRadius, value.cornerRadius);
    }
    throw new TypeError("" + value);
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

  /** @internal */
  static Epsilon: number = 1e-12;
}
