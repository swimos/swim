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

import {Mutable, Arrays} from "@swim/util";
import {
  Debug,
  Format,
  AnyOutputSettings,
  Output,
  Parser,
  Diagnostic,
  Unicode,
} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {AnyR2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import {R2Curve} from "./R2Curve";
import type {R2SplineContext} from "./R2SplineContext";
import {R2SplineBuilder} from "../"; // forward import
import {R2SplineParser} from "../"; // forward import
import {R2Box} from "../"; // forward import

/** @public */
export class R2Spline extends R2Curve implements Debug {
  constructor(curves: ReadonlyArray<R2Curve>, closed: boolean) {
    super();
    this.curves = curves;
    this.closed = closed;
    this.boundingBox = null;
    this.pathString = void 0;
  }

  readonly curves: ReadonlyArray<R2Curve>;

  /** @internal */
  readonly closed: boolean;

  isDefined(): boolean {
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
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
      const v = n * (u - k * l);
      return curves[k]!.interpolateX(v);
    } else {
      return NaN;
    }
  }

  override interpolateY(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
      const v = n * (u - k * l);
      return curves[k]!.interpolateY(v);
    } else {
      return NaN;
    }
  }

  override interpolate(u: number): R2Point {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n - 1);
      const v = n * (u - k * l);
      return curves[k]!.interpolate(v);
    } else {
      return new R2Point(NaN, NaN);
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

  override split(u: number): [R2Spline, R2Spline] {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
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
    } else {
      return [R2Spline.empty(), R2Spline.empty()];
    }
  }

  subdivide(u: number): R2Spline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n > 0) {
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
    } else {
      return R2Spline.empty();
    }
  }

  override transform(f: R2Function): R2Spline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n > 0) {
      const newCurves = new Array<R2Curve>(n);
      for (let i = 0; i < n; i += 1) {
        newCurves[i] = oldCurves[i]!.transform(f);
      }
      return new R2Spline(newCurves, this.closed);
    } else {
      return R2Spline.empty();
    }
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
      for (let i = 0, n = curves.length; i < n; i += 1) {
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

  override toPathString(outputSettings?: AnyOutputSettings): string {
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

  static empty(): R2Spline {
    return new R2Spline([], false);
  }

  static open(...curves: R2Curve[]): R2Spline {
    return new R2Spline(curves, false);
  }

  static closed(...curves: R2Curve[]): R2Spline {
    return new R2Spline(curves, true);
  }

  static builder(): R2SplineBuilder {
    return new R2SplineBuilder();
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
