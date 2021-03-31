// Copyright 2015-2020 Swim inc.
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

import {Arrays} from "@swim/util";
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
import type {AnyShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import {CurveR2} from "./CurveR2";
import type {SplineR2Context} from "./SplineR2Context";
import {SplineR2Builder} from "../"; // forward import
import {SplineR2Parser} from "../"; // forward import
import {BoxR2} from "../"; // forward import

export class SplineR2 extends CurveR2 implements Debug {
  constructor(curves: ReadonlyArray<CurveR2>, closed: boolean) {
    super();
    Object.defineProperty(this, "curves", {
      value: curves,
      enumerable: true,
    });
    Object.defineProperty(this, "closed", {
      value: closed,
      enumerable: true,
    });
    Object.defineProperty(this, "boundingBox", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pathString", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly curves: ReadonlyArray<CurveR2>;

  /** @hidden */
  declare readonly closed: boolean;

  isDefined(): boolean {
    return this.curves.length !== 0;
  }

  isClosed(): boolean {
    return this.closed;
  }

  get xMin(): number {
    return this.bounds.xMin;
  }

  get yMin(): number {
    return this.bounds.yMin;
  }

  get xMax(): number {
    return this.bounds.xMax;
  }

  get yMax(): number {
    return this.bounds.yMax;
  }

  interpolateX(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return curves[k]!.interpolateX(v);
    } else {
      return NaN;
    }
  }

  interpolateY(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return curves[k]!.interpolateY(v);
    } else {
      return NaN;
    }
  }

  interpolate(u: number): PointR2 {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return curves[k]!.interpolate(v);
    } else {
      return new PointR2(NaN, NaN);
    }
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    return false; // TODO
  }

  intersects(that: AnyShapeR2): boolean {
    return false; // TODO
  }

  split(u: number): [SplineR2, SplineR2] {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      const [c0, c1] = curves[k]!.split(v);
      const curves0 = new Array<CurveR2>(k + 1);
      const curves1 = new Array<CurveR2>(n - k);
      for (let i = 0; i < k; i += 1) {
        curves0[i] = curves[i]!;
      }
      curves0[k] = c0;
      curves1[0] = c1;
      for (let i = k + 1; i < n; i += 1) {
        curves1[i - k] = curves[i]!;
      }
      return [new SplineR2(curves0, false), new SplineR2(curves1, false)];
    } else {
      return [SplineR2.empty(), SplineR2.empty()];
    }
  }

  subdivide(u: number): SplineR2 {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      const [c0, c1] = oldCurves[k]!.split(v);
      const newCurves = new Array<CurveR2>(n + 1);
      for (let i = 0; i < k; i += 1) {
        newCurves[i] = oldCurves[i]!;
      }
      newCurves[k] = c0;
      newCurves[k + 1] = c1;
      for (let i = k + 1; i < n; i += 1) {
        newCurves[i + 1] = oldCurves[i]!;
      }
      return new SplineR2(newCurves, this.closed);
    } else {
      return SplineR2.empty();
    }
  }

  transform(f: R2Function): SplineR2 {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n > 0) {
      const newCurves = new Array<CurveR2>(n);
      for (let i = 0; i < n; i += 1) {
        newCurves[i] = oldCurves[i]!.transform(f);
      }
      return new SplineR2(newCurves, this.closed);
    } else {
      return SplineR2.empty();
    }
  }

  /** @hidden */
  declare readonly boundingBox: BoxR2 | null;

  get bounds(): BoxR2 {
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
      boundingBox = new BoxR2(xMin, yMin, xMax, yMax);
      Object.defineProperty(this, "boundingBox", {
        value: boundingBox,
        enumerable: true,
        configurable: true,
      });
    }
    return boundingBox;
  }

  drawMove(context: SplineR2Context): void {
    const curves = this.curves;
    if (curves.length !== 0) {
      curves[0]!.drawMove(context);
    }
  }

  drawRest(context: SplineR2Context): void {
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

  transformDrawMove(context: SplineR2Context, f: R2Function): void {
    const curves = this.curves;
    if (curves.length !== 0) {
      curves[0]!.transformDrawMove(context, f);
    }
  }

  transformDrawRest(context: SplineR2Context, f: R2Function): void {
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

  writeMove(output: Output): void {
    const curves = this.curves;
    if (curves.length !== 0) {
      curves[0]!.writeMove(output);
    }
  }

  writeRest(output: Output): void {
    const curves = this.curves;
    const closed = this.closed;
    const n = curves.length - (closed ? 1 : 0);
    for (let i = 0; i < n; i += 1) {
      curves[i]!.writeRest(output);
    }
    if (closed) {
      output.write(90/*'Z'*/);
    }
  }

  /** @hidden */
  declare readonly pathString: string | undefined;

  toPathString(outputSettings?: AnyOutputSettings): string {
    let pathString: string | undefined;
    if (outputSettings !== void 0 || (pathString = this.pathString, pathString === void 0)) {
      const output = Unicode.stringOutput(outputSettings);
      this.writePath(output);
      pathString = output.bind();
      if (outputSettings === void 0) {
        Object.defineProperty(this, "pathString", {
          value: pathString,
          enumerable: true,
          configurable: true,
        });
      }
    }
    return pathString;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SplineR2) {
      return Arrays.equivalent(this.curves, that.curves, epsilon)
          && this.closed === that.closed;
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SplineR2) {
      return Arrays.equal(this.curves, that.curves)
          && this.closed === that.closed;
    }
    return false;
  }

  debug(output: Output): void {
    const curves = this.curves;
    const n = curves.length;
    output = output.write("SplineR2").write(46/*'.'*/);
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
  }

  toString(): string {
    return Format.debug(this);
  }

  static empty(): SplineR2 {
    return new SplineR2([], false);
  }

  static open(...curves: CurveR2[]): SplineR2 {
    return new SplineR2(curves, false);
  }

  static closed(...curves: CurveR2[]): SplineR2 {
    return new SplineR2(curves, true);
  }

  static builder(): SplineR2Builder {
    return new SplineR2Builder();
  }

  static parse(string: string): SplineR2 {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = SplineR2Parser.parse(input);
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
