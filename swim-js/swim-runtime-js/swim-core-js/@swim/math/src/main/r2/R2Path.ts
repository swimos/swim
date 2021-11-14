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

import {Equals, Equivalent, Mutable, Arrays} from "@swim/util";
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
import {AnyR2Shape, R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2Curve} from "./R2Curve";
import {R2Spline} from "./R2Spline";
import type {R2PathContext} from "./R2PathContext";
import {R2PathBuilder} from "../"; // forward import
import {R2PathParser} from "../"; // forward import
import {R2Box} from "../"; // forward import

/** @public */
export type AnyR2Path = R2Path | string;

/** @public */
export class R2Path extends R2Shape implements Equals, Equivalent, Debug {
  constructor(splines: ReadonlyArray<R2Spline>) {
    super();
    this.splines = splines;
    this.boundingBox = null;
    this.pathString = void 0;
  }

  readonly splines: ReadonlyArray<R2Spline>;

  isDefined(): boolean {
    return this.splines.length !== 0;
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

  interpolate(u: number): R2Point {
    const splines = this.splines;
    const n = splines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return splines[k]!.interpolate(v);
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

  split(u: number): [R2Path, R2Path] {
    const splines = this.splines;
    const n = splines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      const [s0, s1] = splines[k]!.split(v);
      const splines0 = new Array<R2Spline>(k + 1);
      const splines1 = new Array<R2Spline>(n - k);
      for (let i = 0; i < k; i += 1) {
        splines0[i] = splines[i]!;
      }
      splines0[k] = s0;
      splines1[0] = s1;
      for (let i = k + 1; i < n; i += 1) {
        splines1[i - k] = splines[i]!;
      }
      return [new R2Path(splines0), new R2Path(splines1)];
    } else {
      return [R2Path.empty(), R2Path.empty()];
    }
  }

  subdivide(u: number): R2Path {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      const newSplines = new Array<R2Spline>(n);
      for (let i = 0; i < k; i += 1) {
        newSplines[i] = oldSplines[i]!;
      }
      newSplines[k] = oldSplines[k]!.subdivide(v);
      for (let i = k + 1; i < n; i += 1) {
        newSplines[i] = oldSplines[i]!;
      }
      return new R2Path(newSplines);
    } else {
      return R2Path.empty();
    }
  }

  override transform(f: R2Function): R2Path {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n > 0) {
      const newSplines = new Array<R2Spline>(n);
      for (let i = 0; i < n; i += 1) {
        newSplines[i] = oldSplines[i]!.transform(f);
      }
      return new R2Path(newSplines);
    } else {
      return R2Path.empty();
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
      const splines = this.splines;
      for (let i = 0, n = splines.length; i < n; i += 1) {
        const spline = splines[i]!;
        xMin = Math.min(xMin, spline.xMin);
        yMin = Math.min(yMin, spline.yMin);
        xMax = Math.max(spline.xMax, xMax);
        yMax = Math.max(spline.yMax, yMax);
      }
      boundingBox = new R2Box(xMin, yMin, xMax, yMax);
      (this as Mutable<this>).boundingBox = boundingBox;
    }
    return boundingBox;
  }

  draw(context: R2PathContext): void {
    const splines = this.splines;
    for (let i = 0, n = splines.length; i < n; i += 1) {
      splines[i]!.draw(context);
    }
  }

  transformDraw(context: R2PathContext, f: R2Function): void {
    const splines = this.splines;
    for (let i = 0, n = splines.length; i < n; i += 1) {
      splines[i]!.transformDraw(context, f);
    }
  }

  writePath<T>(output: Output<T>): Output<T> {
    const splines = this.splines;
    const n = splines.length;
    if (output.settings === OutputSettings.standard()) {
      for (let i = 0; i < n; i += 1) {
        output = output.write(splines[i]!.toPathString()); // write memoized subpath strings
      }
    } else {
      for (let i = 0; i < n; i += 1) {
        output = splines[i]!.writePath(output);
      }
    }
    return output;
  }

  /** @internal */
  readonly pathString: string | undefined;

  toPathString(outputSettings?: AnyOutputSettings): string {
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

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Path) {
      return Arrays.equivalent(this.splines, that.splines, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Path) {
      return Arrays.equal(this.splines, that.splines);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    const splines = this.splines;
    const n = splines.length;
    output = output.write("R2Path").write(46/*'.'*/);
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
    return output;
  }

  toAttributeString(): string {
    return this.toPathString();
  }

  override toString(): string {
    return Format.debug(this);
  }

  static empty(): R2Path {
    return new R2Path([]);
  }

  static of(...splines: R2Spline[]): R2Path {
    return new R2Path(splines);
  }

  static open(...curves: R2Curve[]): R2Path {
    return new R2Path([new R2Spline(curves, false)]);
  }

  static closed(...curves: R2Curve[]): R2Path {
    return new R2Path([new R2Spline(curves, true)]);
  }

  static override fromAny(value: AnyR2Path | AnyR2Shape): R2Path {
    if (value === void 0 || value === null || value instanceof R2Path) {
      return value;
    } else if (typeof value === "string") {
      return R2Path.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static builder(): R2PathBuilder {
    return new R2PathBuilder();
  }

  static parse(string: string): R2Path {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = R2PathParser.parse(input);
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
