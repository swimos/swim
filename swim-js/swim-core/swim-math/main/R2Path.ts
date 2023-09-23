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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Arrays} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {OutputSettingsLike} from "@swim/codec";
import {OutputSettings} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {R2ShapeLike} from "./R2Shape";
import {R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2Curve} from "./R2Curve";
import type {R2SplineContext} from "./R2Spline";
import {R2Spline} from "./R2Spline";
import {R2SplineBuilder} from "./R2Spline";
import {R2SplineParser} from "./R2Spline";
import {R2Box} from "./"; // forward import

/** @public */
export interface R2PathContext extends R2SplineContext {
}

/** @public */
export type R2PathLike = R2Path | string;

/** @public */
export const R2PathLike = {
  [Symbol.hasInstance](instance: unknown): instance is R2PathLike {
    return instance instanceof R2Path
        || typeof instance === "string";
  },
};

/** @public */
export class R2Path extends R2Shape implements Debug {
  constructor(splines: readonly R2Spline[]) {
    super();
    this.splines = splines;
    this.boundingBox = null;
    this.pathString = void 0;
  }

  override likeType?(like: string): void;

  readonly splines: readonly R2Spline[];

  override isDefined(): boolean {
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
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return splines[k]!.interpolateX(v);
  }

  interpolateY(u: number): number {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return splines[k]!.interpolateY(v);
  }

  interpolate(u: number): R2Point {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return R2Point.undefined();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return splines[k]!.interpolate(v);
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: R2ShapeLike): boolean {
    return false; // TODO
  }

  split(u: number): [R2Path, R2Path] {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return [R2Path.empty(), R2Path.empty()];
    }
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
  }

  subdivide(u: number): R2Path {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n === 0) {
      return R2Path.empty();
    }
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
  }

  override transform(f: R2Function): R2Path {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n === 0) {
      return R2Path.empty();
    }
    const newSplines = new Array<R2Spline>(n);
    for (let i = 0; i < n; i += 1) {
      newSplines[i] = oldSplines[i]!.transform(f);
    }
    return new R2Path(newSplines);
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
      for (let i = 0; i < splines.length; i += 1) {
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
    for (let i = 0; i < splines.length; i += 1) {
      splines[i]!.draw(context);
    }
  }

  transformDraw(context: R2PathContext, f: R2Function): void {
    const splines = this.splines;
    for (let i = 0; i < splines.length; i += 1) {
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

  toPathString(outputSettings?: OutputSettingsLike): string {
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
    } else if (that instanceof R2Path) {
      return Arrays.equivalent(this.splines, that.splines, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Path) {
      return Arrays.equal(this.splines, that.splines);
    }
    return false;
  }

  /** @override */
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

  static builder(): R2PathBuilder {
    return new R2PathBuilder();
  }

  @Lazy
  static empty(): R2Path {
    return new R2Path(Arrays.empty());
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

  static override fromLike<T extends R2PathLike | null | undefined>(value: T): R2Path | Uninitable<T>;
  static override fromLike<T extends R2ShapeLike | null | undefined>(value: T): R2Path | never;
  static override fromLike<T extends R2PathLike | null | undefined>(value: T): R2Path | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof R2Path) {
      return value as R2Path | Uninitable<T>;
    } else if (typeof value === "string") {
      return R2Path.parse(value);
    }
    throw new TypeError("" + value);
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

/** @public */
export class R2PathBuilder implements R2PathContext {
  /** @internal */
  splines: R2Spline[];
  /** @internal */
  builder: R2SplineBuilder | null;

  constructor() {
    this.splines = [];
    this.builder = null;
  }

  moveTo(x: number, y: number): void {
    let builder = this.builder;
    if (builder !== null) {
      const spline = builder.build();
      if (spline.isDefined()) {
        this.splines.push(spline);
      }
    }
    builder = new R2SplineBuilder();
    this.builder = builder;
    builder.moveTo(x, y);
  }

  closePath(): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.closePath();
    } else {
      throw new Error();
    }
  }

  lineTo(x: number, y: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.lineTo(x, y);
    } else {
      throw new Error();
    }
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.quadraticCurveTo(x1, y1, x, y);
    } else {
      throw new Error();
    }
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.bezierCurveTo(x1, y1, x2, y2, x, y);
    } else {
      throw new Error();
    }
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.arcTo(x1, y1, x2, y2, r);
    } else {
      throw new Error();
    }
  }

  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw?: boolean): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.arc(cx, cy, r, a0, a1, ccw);
    } else {
      throw new Error();
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, phi: number, a0: number, a1: number, ccw?: boolean): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.ellipse(cx, cy, rx, ry, phi, a0, a1, ccw);
    } else {
      throw new Error();
    }
  }

  rect(x: number, y: number, w: number, h: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.rect(x, y, w, h);
    } else {
      throw new Error();
    }
  }

  build(): R2Path {
    const splines = this.splines.slice(0);
    const builder = this.builder;
    if (builder !== null) {
      const spline = builder.build();
      if (spline.isDefined()) {
        splines.push(spline);
      }
    }
    return new R2Path(splines);
  }
}

/** @internal */
export class R2PathParser extends Parser<R2Path> {
  private readonly splineParser: Parser<R2Spline> | undefined;
  private readonly splines: R2Spline[] | undefined;
  private readonly step: number | undefined;

  constructor(splineParser?: Parser<R2Spline>, splines?: R2Spline[], step?: number) {
    super();
    this.splineParser = splineParser;
    this.splines = splines;
    this.step = step;
  }

  override feed(input: Input): Parser<R2Path> {
    return R2PathParser.parse(input, this.splineParser, this.splines, this.step);
  }

  static parse(input: Input, splineParser?: Parser<R2Spline>,
               splines?: R2Spline[], step: number = 1): Parser<R2Path> {
    let c = 0;
    do {
      if (step === 1) {
        if (splineParser === void 0) {
          while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
            input = input.step();
          }
          if (input.isCont()) {
            switch (c) {
              case 77/*'M'*/:
                splineParser = R2SplineParser.parse(input);
                break;
              case 109/*'m'*/: {
                let xParser: Parser<number> | undefined;
                let yParser: Parser<number> | undefined;
                if (splines !== void 0 && splines.length !== 0) {
                  const spline = splines[splines.length - 1]!;
                  xParser = Parser.done(spline.interpolateX(1));
                  yParser = Parser.done(spline.interpolateY(1));
                }
                splineParser = R2SplineParser.parse(input, xParser, yParser);
                break;
              }
              case 110/*'n'*/:
                step = 2;
                break;
              default:
                if (splines !== void 0) {
                  return Parser.done(new R2Path(splines));
                } else {
                  return Parser.done(R2Path.empty());
                }
            }
          } else if (!input.isEmpty()) {
            if (splines !== void 0) {
              return Parser.done(new R2Path(splines));
            } else {
              return Parser.done(R2Path.empty());
            }
          }
        } else {
          splineParser = splineParser.feed(input);
        }
        if (splineParser !== void 0) {
          if (splineParser.isDone()) {
            const spline = splineParser.bind();
            splineParser = void 0;
            if (spline.isDefined()) {
              if (splines === void 0) {
                splines = [];
              }
              splines.push(spline);
            }
            continue;
          } else if (splineParser.isError()) {
            return splineParser.asError();
          }
        }
      }
      break;
    } while (true);
    if (step >= 2 && step <= 5) {
      do {
        if (input.isCont()) {
          if (input.head() === "none".charCodeAt(step - 2)) {
            input = input.step();
            if (step < 5) {
              step += 1;
              continue;
            } else {
              return Parser.done(R2Path.empty());
            }
          } else {
            return Parser.error(Diagnostic.expected("none", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
        break;
      } while (true);
    }
    return new R2PathParser(splineParser, splines, step);
  }
}
