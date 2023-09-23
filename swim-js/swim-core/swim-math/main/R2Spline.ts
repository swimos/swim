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

import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Arrays} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {OutputSettingsLike} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {R2ShapeLike} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2Curve";
import {R2Curve} from "./R2Curve";
import {R2Segment} from "./R2Segment";
import {R2SegmentParser} from "./R2Segment";
import {R2QuadraticCurve} from "./R2QuadraticCurve";
import {R2QuadraticCurveParser} from "./R2QuadraticCurve";
import {R2CubicCurve} from "./R2CubicCurve";
import {R2CubicCurveParser} from "./R2CubicCurve";
import {R2EllipticCurve} from "./R2EllipticCurve";
import {R2EllipticCurveParser} from "./R2EllipticCurve";
import {R2Box} from "./"; // forward import

/** @public */
export interface R2SplineContext extends R2CurveContext {
  rect(x: number, y: number, w: number, h: number): void;

  closePath(): void;
}

/** @public */
export class R2Spline extends R2Curve implements Debug {
  constructor(curves: readonly R2Curve[], closed: boolean) {
    super();
    this.curves = curves;
    this.closed = closed;
    this.boundingBox = null;
    this.pathString = void 0;
  }

  readonly curves: readonly R2Curve[];

  /** @internal */
  readonly closed: boolean;

  override isDefined(): boolean {
    return this.curves.length !== 0;
  }

  isClosed(): boolean {
    return this.closed;
  }

  override get xMin(): number {
    return this.bounds.xMin;
  }

  override get yMin(): number {
    return this.bounds.yMin;
  }

  override get xMax(): number {
    return this.bounds.xMax;
  }

  override get yMax(): number {
    return this.bounds.yMax;
  }

  override interpolateX(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
    const v = n * (u - k * l);
    return curves[k]!.interpolateX(v);
  }

  override interpolateY(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
    const v = n * (u - k * l);
    return curves[k]!.interpolateY(v);
  }

  override interpolate(u: number): R2Point {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return R2Point.undefined();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
    const v = n * (u - k * l);
    return curves[k]!.interpolate(v);
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: R2ShapeLike): boolean {
    return false; // TODO
  }

  override split(u: number): [R2Spline, R2Spline] {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return [R2Spline.empty(), R2Spline.empty()];
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
    const v = n * (u - k * l);
    const [c0, c1] = curves[k]!.split(v);
    const curves0 = new Array<R2Curve>(k + 1);
    const curves1 = new Array<R2Curve>(n - k);
    for (let i = 0; i < k; i += 1) {
      curves0[i] = curves[i]!;
    }
    curves0[k] = c0;
    curves1[0] = c1;
    for (let i = k + 1; i < n; i += 1) {
      curves1[i - k] = curves[i]!;
    }
    return [new R2Spline(curves0, false), new R2Spline(curves1, false)];
  }

  subdivide(u: number): R2Spline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n === 0) {
      return R2Spline.empty();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
    const v = n * (u - k * l);
    const [c0, c1] = oldCurves[k]!.split(v);
    const newCurves = new Array<R2Curve>(n + 1);
    for (let i = 0; i < k; i += 1) {
      newCurves[i] = oldCurves[i]!;
    }
    newCurves[k] = c0;
    newCurves[k + 1] = c1;
    for (let i = k + 1; i < n; i += 1) {
      newCurves[i + 1] = oldCurves[i]!;
    }
    return new R2Spline(newCurves, this.closed);
  }

  override transform(f: R2Function): R2Spline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n === 0) {
      return R2Spline.empty();
    }
    const newCurves = new Array<R2Curve>(n);
    for (let i = 0; i < n; i += 1) {
      newCurves[i] = oldCurves[i]!.transform(f);
    }
    return new R2Spline(newCurves, this.closed);
  }

  /** @internal */
  readonly boundingBox: R2Box | null;

  override get bounds(): R2Box {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let xMin = Infinity;
      let yMin = Infinity;
      let xMax = -Infinity;
      let yMax = -Infinity;
      const curves = this.curves;
      for (let i = 0; i < curves.length; i += 1) {
        const curve = curves[i]!;
        xMin = Math.min(xMin, curve.xMin);
        yMin = Math.min(yMin, curve.yMin);
        xMax = Math.max(curve.xMax, xMax);
        yMax = Math.max(curve.yMax, yMax);
      }
      boundingBox = new R2Box(xMin, yMin, xMax, yMax);
      (this as Mutable<this>).boundingBox = boundingBox;
    }
    return boundingBox;
  }

  override drawMove(context: R2SplineContext): void {
    const curves = this.curves;
    if (curves.length !== 0) {
      curves[0]!.drawMove(context);
    }
  }

  override drawRest(context: R2SplineContext): void {
    const curves = this.curves;
    const closed = this.closed;
    const n = curves.length - (closed && context.closePath !== void 0 ? 1 : 0);
    for (let i = 0; i < n; i += 1) {
      curves[i]!.drawRest(context);
    }
    if (closed && context.closePath !== void 0) {
      context.closePath();
    }
  }

  override transformDrawMove(context: R2SplineContext, f: R2Function): void {
    const curves = this.curves;
    if (curves.length !== 0) {
      curves[0]!.transformDrawMove(context, f);
    }
  }

  override transformDrawRest(context: R2SplineContext, f: R2Function): void {
    const curves = this.curves;
    const closed = this.closed;
    const n = curves.length - (closed && context.closePath !== void 0 ? 1 : 0);
    for (let i = 0; i < n; i += 1) {
      curves[i]!.transformDrawRest(context, f);
    }
    if (closed && context.closePath !== void 0) {
      context.closePath();
    }
  }

  override writeMove<T>(output: Output<T>): Output<T> {
    const curves = this.curves;
    if (curves.length !== 0) {
      output = curves[0]!.writeMove(output);
    }
    return output;
  }

  override writeRest<T>(output: Output<T>): Output<T> {
    const curves = this.curves;
    const closed = this.closed;
    const n = curves.length - (closed ? 1 : 0);
    for (let i = 0; i < n; i += 1) {
      output = curves[i]!.writeRest(output);
    }
    if (closed) {
      output = output.write(90/*'Z'*/);
    }
    return output;
  }

  /** @internal */
  readonly pathString: string | undefined;

  override toPathString(outputSettings?: OutputSettingsLike): string {
    let pathString: string | undefined;
    if (outputSettings !== void 0 || (pathString = this.pathString, pathString === void 0)) {
      const output = Unicode.stringOutput(outputSettings);
      this.writePath(output);
      pathString = output.bind();
      if (outputSettings === void 0) {
        (this as Mutable<this>).pathString = pathString;
      }
    }
    return pathString;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Spline) {
      return Arrays.equivalent(this.curves, that.curves, epsilon)
          && this.closed === that.closed;
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Spline) {
      return Arrays.equal(this.curves, that.curves)
          && this.closed === that.closed;
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const curves = this.curves;
    const n = curves.length;
    output = output.write("R2Spline").write(46/*'.'*/);
    if (n === 0) {
      output = output.write("empty").write(40/*'('*/);
    } else if (n !== 0) {
      output = output.write(this.closed ? "closed" : "open").write(40/*'('*/);
      output = output.debug(curves[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(curves[i]!);
      }
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static builder(): R2SplineBuilder {
    return new R2SplineBuilder();
  }

  @Lazy
  static empty(): R2Spline {
    return new R2Spline(Arrays.empty(), false);
  }

  static open(...curves: R2Curve[]): R2Spline {
    return new R2Spline(curves, false);
  }

  static closed(...curves: R2Curve[]): R2Spline {
    return new R2Spline(curves, true);
  }

  static override parse(string: string): R2Spline {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = R2SplineParser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }
}

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
    if (!this.aliased) {
      return;
    }
    this.curves = this.curves.slice(0);
    this.aliased = false;
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
    }
    const pqs = pqx * sy - pqy * sx;
    const t = pqs / rs; // (q − p) × s / (r × s)
    const u = pqr / rs; // (q − p) × r / (r × s)
    if (t < 0 || t > 1 || u < 0 || u > 1) {
      return NaN;
    }
    return t;
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

  build(): R2Spline {
    this.aliased = true;
    return new R2Spline(this.curves, this.closed);
  }
}

/** @internal */
export class R2SplineParser extends Parser<R2Spline> {
  private readonly xParser: Parser<number> | undefined;
  private readonly yParser: Parser<number> | undefined;
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly curveParser: Parser<R2Curve> | undefined;
  private readonly curves: R2Curve[] | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(xParser?: Parser<number>, yParser?: Parser<number>,
              x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              curveParser?: Parser<R2Curve>, curves?: R2Curve[],
              command?: number, step?: number) {
    super();
    this.xParser = xParser;
    this.yParser = yParser;
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.curveParser = curveParser;
    this.curves = curves;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2Spline> {
    return R2SplineParser.parse(input, this.xParser, this.yParser,
                                this.x0Parser, this.y0Parser,
                                this.curveParser, this.curves,
                                this.command, this.step);
  }

  static parse(input: Input, xParser?: Parser<number>, yParser?: Parser<number>,
               x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               curveParser?: Parser<R2Curve>, curves?: R2Curve[],
               command?: number, step: number = 1): Parser<R2Spline> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 77/*'M'*/ || c === 109/*'m'*/) {
          input = input.step();
          command = c;
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("moveto", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (x0Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          x0Parser = Base10.parseDecimal(input);
        }
      } else {
        x0Parser = x0Parser.feed(input);
      }
      if (x0Parser !== void 0) {
        if (x0Parser.isDone()) {
          if (command === 109/*'m'*/ && xParser !== void 0) {
            x0Parser = Parser.done(xParser.bind() + x0Parser.bind());
          }
          xParser = x0Parser;
          step = 3;
        } else if (x0Parser.isError()) {
          return x0Parser.asError();
        }
      }
    }
    if (step === 3) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 4;
      } else if (!input.isEmpty()) {
        step = 4;
      }
    }
    if (step === 4) {
      if (y0Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          y0Parser = Base10.parseDecimal(input);
        }
      } else {
        y0Parser = y0Parser.feed(input);
      }
      if (y0Parser !== void 0) {
        if (y0Parser.isDone()) {
          if (command === 109/*'m'*/ && yParser !== void 0) {
            y0Parser = Parser.done(yParser.bind() + y0Parser.bind());
          }
          yParser = y0Parser;
          step = 5;
        } else if (y0Parser.isError()) {
          return y0Parser.asError();
        }
      }
    }
    do {
      if (step === 5) {
        if (curveParser === void 0) {
          while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
            input = input.step();
          }
          if (input.isCont()) {
            const prevCurve = curves !== void 0 && curves.length !== 0 ? curves[curves.length - 1] : null;
            switch (c) {
              case 76/*'L'*/:
              case 108/*'l'*/:
              case 72/*'H'*/:
              case 104/*'h'*/:
              case 86/*'V'*/:
              case 118/*'v'*/:
                curveParser = R2SegmentParser.parse(input, xParser, yParser);
                command = c;
                break;
              case 81/*'Q'*/:
              case 113/*'q'*/:
                curveParser = R2QuadraticCurveParser.parse(input, xParser, yParser);
                command = c;
                break;
              case 84/*'T'*/:
                if (prevCurve instanceof R2QuadraticCurve) {
                  const dx = prevCurve.x2 - prevCurve.x1;
                  const dy = prevCurve.y2 - prevCurve.y1;
                  const x1 = xParser!.bind() + dx;
                  const y1 = yParser!.bind() + dy;
                  curveParser = R2QuadraticCurveParser.parse(input, xParser, yParser,
                                                             Parser.done(x1), Parser.done(y1));
                } else {
                  curveParser = R2QuadraticCurveParser.parse(input, xParser, yParser,
                                                             xParser, yParser);
                }
                command = c;
                break;
              case 116/*'t'*/:
                if (prevCurve instanceof R2QuadraticCurve) {
                  const dx = prevCurve.x2 - prevCurve.x1;
                  const dy = prevCurve.y2 - prevCurve.y1;
                  curveParser = R2QuadraticCurveParser.parse(input, xParser, yParser,
                                                             Parser.done(dx), Parser.done(dy));
                } else {
                  curveParser = R2QuadraticCurveParser.parse(input, xParser, yParser,
                                                             Parser.done(0), Parser.done(0));
                }
                command = c;
                break;
              case 67/*'C'*/:
              case 99/*'c'*/:
                curveParser = R2CubicCurveParser.parse(input, xParser, yParser);
                command = c;
                break;
              case 83/*'S'*/:
                if (prevCurve instanceof R2CubicCurve) {
                  const dx = prevCurve.x3 - prevCurve.x2;
                  const dy = prevCurve.y3 - prevCurve.y2;
                  const x1 = xParser!.bind() + dx;
                  const y1 = yParser!.bind() + dy;
                  curveParser = R2CubicCurveParser.parse(input, xParser, yParser,
                                                         Parser.done(x1), Parser.done(y1));
                } else {
                  curveParser = R2CubicCurveParser.parse(input, xParser, yParser,
                                                         xParser, yParser);
                }
                command = c;
                break;
              case 115/*'s'*/:
                if (prevCurve instanceof R2CubicCurve) {
                  const dx = prevCurve.x3 - prevCurve.x2;
                  const dy = prevCurve.y3 - prevCurve.y2;
                  curveParser = R2CubicCurveParser.parse(input, xParser, yParser,
                                                         Parser.done(dx), Parser.done(dy));
                } else {
                  curveParser = R2CubicCurveParser.parse(input, xParser, yParser,
                                                         Parser.done(0), Parser.done(0));
                }
                command = c;
                break;
              case 65/*'A'*/:
              case 97/*'a'*/:
                curveParser = R2EllipticCurveParser.parse(input, xParser, yParser);
                command = c;
                break;
              case 90/*'Z'*/:
              case 122/*'z'*/:
                input = input.step();
                if (curves === void 0) {
                  curves = [];
                }
                curves.push(new R2Segment(xParser!.bind(), yParser!.bind(),
                                          x0Parser!.bind(), y0Parser!.bind()));
                return Parser.done(new R2Spline(curves, true));
              case 44/*','*/:
                input = input.step();
              case 43/*'+'*/:
              case 45/*'-'*/:
              case 46/*'.'*/:
              case 48/*'0'*/:
              case 49/*'1'*/:
              case 50/*'2'*/:
              case 51/*'3'*/:
              case 52/*'4'*/:
              case 53/*'5'*/:
              case 54/*'6'*/:
              case 55/*'7'*/:
              case 56/*'8'*/:
              case 57/*'9'*/:
                switch (command) {
                  case 77/*'M'*/:
                  case 109/*'m'*/:
                  case 76/*'L'*/:
                  case 108/*'l'*/:
                  case 72/*'H'*/:
                  case 104/*'h'*/:
                  case 86/*'V'*/:
                  case 118/*'v'*/:
                    curveParser = R2SegmentParser.parseRest(input, command, xParser, yParser);
                    break;
                  case 81/*'Q'*/:
                  case 113/*'q'*/:
                    curveParser = R2QuadraticCurveParser.parseRest(input, command, xParser, yParser);
                    break;
                  case 84/*'T'*/:
                    if (prevCurve instanceof R2QuadraticCurve) {
                      const dx = prevCurve.x2 - prevCurve.x1;
                      const dy = prevCurve.y2 - prevCurve.y1;
                      const x1 = xParser!.bind() + dx;
                      const y1 = yParser!.bind() + dy;
                      curveParser = R2QuadraticCurveParser.parseRest(input, command, xParser, yParser,
                                                                     Parser.done(x1), Parser.done(y1));
                    } else {
                      curveParser = R2QuadraticCurveParser.parseRest(input, command, xParser, yParser,
                                                                     xParser, yParser);
                    }
                    break;
                  case 116/*'t'*/:
                    if (prevCurve instanceof R2QuadraticCurve) {
                      const dx = prevCurve.x2 - prevCurve.x1;
                      const dy = prevCurve.y2 - prevCurve.y1;
                      curveParser = R2QuadraticCurveParser.parseRest(input, command, xParser, yParser,
                                                                     Parser.done(dx), Parser.done(dy));
                    } else {
                      curveParser = R2QuadraticCurveParser.parseRest(input, command, xParser, yParser,
                                                                     Parser.done(0), Parser.done(0));
                    }
                    break;
                  case 67/*'C'*/:
                  case 99/*'c'*/:
                    curveParser = R2CubicCurveParser.parseRest(input, command, xParser, yParser);
                    break;
                  case 83/*'S'*/:
                    if (prevCurve instanceof R2CubicCurve) {
                      const dx = prevCurve.x3 - prevCurve.x2;
                      const dy = prevCurve.y3 - prevCurve.y2;
                      const x1 = xParser!.bind() + dx;
                      const y1 = yParser!.bind() + dy;
                      curveParser = R2CubicCurveParser.parseRest(input, command, xParser, yParser,
                                                                 Parser.done(x1), Parser.done(y1));
                    } else {
                      curveParser = R2CubicCurveParser.parseRest(input, command, xParser, yParser,
                                                                 xParser, yParser);
                    }
                    break;
                  case 115/*'s'*/:
                    if (prevCurve instanceof R2CubicCurve) {
                      const dx = prevCurve.x3 - prevCurve.x2;
                      const dy = prevCurve.y3 - prevCurve.y2;
                      curveParser = R2CubicCurveParser.parseRest(input, command, xParser, yParser,
                                                                 Parser.done(dx), Parser.done(dy));
                    } else {
                      curveParser = R2CubicCurveParser.parseRest(input, command, xParser, yParser,
                                                                 Parser.done(0), Parser.done(0));
                    }
                    break;
                  case 65/*'A'*/:
                  case 97/*'a'*/:
                    curveParser = R2EllipticCurveParser.parseRest(input, command, xParser, yParser);
                    break;
                  default:
                    if (curves !== void 0) {
                      return Parser.done(new R2Spline(curves, false));
                    } else {
                      return Parser.done(R2Spline.empty());
                    }
                }
                break;
              default:
                if (curves !== void 0) {
                  return Parser.done(new R2Spline(curves, false));
                } else {
                  return Parser.done(R2Spline.empty());
                }
            }
          } else if (!input.isEmpty()) {
            if (curves !== void 0) {
              return Parser.done(new R2Spline(curves, false));
            } else {
              return Parser.done(R2Spline.empty());
            }
          }
        } else {
          curveParser = curveParser.feed(input);
        }
        if (curveParser !== void 0) {
          if (curveParser.isDone()) {
            const curve = curveParser.bind();
            curveParser = void 0;
            if (curves === void 0) {
              curves = [];
            }
            curves.push(curve);
            xParser = Parser.done(curve.interpolateX(1));
            yParser = Parser.done(curve.interpolateY(1));
            continue;
          } else if (curveParser.isError()) {
            return curveParser.asError();
          }
        }
      }
      break;
    } while (true);
    return new R2SplineParser(xParser, yParser, x0Parser, y0Parser,
                              curveParser, curves, command, step);
  }
}
