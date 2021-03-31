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

import {Equivalent, Equals, Arrays} from "@swim/util";
import {
  Debug,
  Format,
  AnyOutputSettings,
  OutputSettings,
  Output,
  Parser,
  Diagnostic,
  Unicode,
} from "@swim/codec";
import type {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import type {CurveR2} from "./CurveR2";
import {SplineR2} from "./SplineR2";
import type {PathR2Context} from "./PathR2Context";
import {PathR2Builder} from "../"; // forward import
import {PathR2Parser} from "../"; // forward import
import {BoxR2} from "../"; // forward import

export type AnyPathR2 = PathR2 | string;

export class PathR2 extends ShapeR2 implements Equals, Equivalent, Debug {
  constructor(splines: ReadonlyArray<SplineR2>) {
    super();
    Object.defineProperty(this, "splines", {
      value: splines,
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

  declare readonly splines: ReadonlyArray<SplineR2>;

  isDefined(): boolean {
    return this.splines.length !== 0;
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
    const splines = this.splines;
    const n = splines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return splines[k]!.interpolateX(v);
    } else {
      return NaN;
    }
  }

  interpolateY(u: number): number {
    const splines = this.splines;
    const n = splines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return splines[k]!.interpolateY(v);
    } else {
      return NaN;
    }
  }

  interpolate(u: number): PointR2 {
    const splines = this.splines;
    const n = splines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return splines[k]!.interpolate(v);
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

  split(u: number): [PathR2, PathR2] {
    const splines = this.splines;
    const n = splines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      const [s0, s1] = splines[k]!.split(v);
      const splines0 = new Array<SplineR2>(k + 1);
      const splines1 = new Array<SplineR2>(n - k);
      for (let i = 0; i < k; i += 1) {
        splines0[i] = splines[i]!;
      }
      splines0[k] = s0;
      splines1[0] = s1;
      for (let i = k + 1; i < n; i += 1) {
        splines1[i - k] = splines[i]!;
      }
      return [new PathR2(splines0), new PathR2(splines1)];
    } else {
      return [PathR2.empty(), PathR2.empty()];
    }
  }

  subdivide(u: number): PathR2 {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      const newSplines = new Array<SplineR2>(n);
      for (let i = 0; i < k; i += 1) {
        newSplines[i] = oldSplines[i]!;
      }
      newSplines[k] = oldSplines[k]!.subdivide(v);
      for (let i = k + 1; i < n; i += 1) {
        newSplines[i] = oldSplines[i]!;
      }
      return new PathR2(newSplines);
    } else {
      return PathR2.empty();
    }
  }

  transform(f: R2Function): PathR2 {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n > 0) {
      const newSplines = new Array<SplineR2>(n);
      for (let i = 0; i < n; i += 1) {
        newSplines[i] = oldSplines[i]!.transform(f);
      }
      return new PathR2(newSplines);
    } else {
      return PathR2.empty();
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
      const splines = this.splines;
      for (let i = 0, n = splines.length; i < n; i += 1) {
        const spline = splines[i]!;
        xMin = Math.min(xMin, spline.xMin);
        yMin = Math.min(yMin, spline.yMin);
        xMax = Math.max(spline.xMax, xMax);
        yMax = Math.max(spline.yMax, yMax);
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

  draw(context: PathR2Context): void {
    const splines = this.splines;
    for (let i = 0, n = splines.length; i < n; i += 1) {
      splines[i]!.draw(context);
    }
  }

  transformDraw(context: PathR2Context, f: R2Function): void {
    const splines = this.splines;
    for (let i = 0, n = splines.length; i < n; i += 1) {
      splines[i]!.transformDraw(context, f);
    }
  }

  writePath(output: Output): void {
    const splines = this.splines;
    const n = splines.length;
    if (output.settings === OutputSettings.standard()) {
      for (let i = 0; i < n; i += 1) {
        output.write(splines[i]!.toPathString()); // write memoized subpath strings
      }
    } else {
      for (let i = 0; i < n; i += 1) {
        splines[i]!.writePath(output);
      }
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
    } else if (that instanceof PathR2) {
      return Arrays.equivalent(this.splines, that.splines, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PathR2) {
      return Arrays.equal(this.splines, that.splines);
    }
    return false;
  }

  debug(output: Output): void {
    const splines = this.splines;
    const n = splines.length;
    output = output.write("PathR2").write(46/*'.'*/);
    if (n === 0) {
      output = output.write("empty").write(40/*'('*/);
    } else if (n === 1) {
      const spline = splines[0]!;
      output = output.write(spline.closed ? "closed" : "open").write(40/*'('*/);
      const curves = spline.curves;
      const m = curves.length;
      if (m !== 0) {
        output = output.debug(curves[0]!);
        for (let i = 1; i < m; i += 1) {
          output = output.write(", ").debug(curves[i]!);
        }
      }
    } else {
      output = output.write("of").write(40/*'('*/);
      output = output.debug(splines[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(splines[i]!);
      }
    }
    output = output.write(41/*')'*/);
  }

  toAttributeString(): string {
    return this.toPathString();
  }

  toString(): string {
    return Format.debug(this);
  }

  static empty(): PathR2 {
    return new PathR2([]);
  }

  static of(...splines: SplineR2[]): PathR2 {
    return new PathR2(splines);
  }

  static open(...curves: CurveR2[]): PathR2 {
    return new PathR2([new SplineR2(curves, false)]);
  }

  static closed(...curves: CurveR2[]): PathR2 {
    return new PathR2([new SplineR2(curves, true)]);
  }

  static fromAny(value: AnyPathR2 | AnyShapeR2): PathR2 {
    if (value === void 0 || value === null || value instanceof PathR2) {
      return value;
    } else if (typeof value === "string") {
      return PathR2.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static builder(): PathR2Builder {
    return new PathR2Builder();
  }

  static parse(string: string): PathR2 {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = PathR2Parser.parse(input);
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
