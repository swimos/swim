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
import {Murmur3} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Base10} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {R2ShapeLike} from "./R2Shape";
import {R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2Curve";
import {R2BezierCurve} from "./R2Curve";

/** @public */
export type R2SegmentLike = R2Segment | R2SegmentInit;

/** @public */
export const R2SegmentLike = {
  [Symbol.hasInstance](instance: unknown): instance is R2SegmentLike {
    return instance instanceof R2Segment
        || R2SegmentInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface R2SegmentInit {
  /** @internal */
  readonly typeid?: "R2SegmentInit";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** @public */
export const R2SegmentInit = {
  [Symbol.hasInstance](instance: unknown): instance is R2SegmentInit {
    return Objects.hasAllKeys<R2SegmentInit>(instance, "x0", "y0", "x1", "y1");
  },
};

/** @public */
export class R2Segment extends R2BezierCurve implements Interpolate<R2Segment>, HashCode, Debug {
  constructor(x0: number, y0: number, x1: number, y1: number) {
    super();
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  /** @internal */
  declare readonly typeid?: "R2Segment";

  override likeType?(like: R2SegmentInit): void;

  isDefined(): boolean {
    return isFinite(this.x0) && isFinite(this.y0)
        && isFinite(this.x1) && isFinite(this.y1);
  }

  readonly x0: number;

  readonly y0: number;

  readonly x1: number;

  readonly y1: number;

  override get xMin(): number {
    return Math.min(this.x0, this.x1);
  }

  override get yMin(): number {
    return Math.min(this.y0, this.y1);
  }

  override get xMax(): number {
    return Math.max(this.x0, this.x1);
  }

  override get yMax(): number {
    return Math.max(this.y0, this.y1);
  }

  override interpolateX(u: number): number {
    return (1.0 - u) * this.x0 + u * this.x1;
  }

  override interpolateY(u: number): number {
    return (1.0 - u) * this.y0 + u * this.y1;
  }

  override interpolate(u: number): R2Point {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    return new R2Point(x01, y01);
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    if (typeof that === "number") {
      return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that, y!);
    }
    that = R2Shape.fromLike(that);
    if (that instanceof R2Point) {
      return this.containsPoint(that);
    } else if (that instanceof R2Segment) {
      return this.containsSegment(that);
    }
    return false;
  }

  /** @internal */
  containsPoint(that: R2Point): boolean {
    return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x, that.y);
  }

  /** @internal */
  containsSegment(that: R2Segment): boolean {
    return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x0, that.y0)
        && R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x1, that.y1);
  }

  /** @internal */
  static contains(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
    return (ax <= cx && cx <= bx || bx <= cx && cx <= ax)
        && (ay <= cy && cy <= by || by <= cy && cy <= ay)
        && (bx - ax) * (cy - ay) === (cx - ax) * (by - ay);
  }

  override intersects(that: R2ShapeLike): boolean {
    that = R2Shape.fromLike(that);
    if (that instanceof R2Point) {
      return this.intersectsPoint(that);
    } else if (that instanceof R2Segment) {
      return this.intersectsSegment(that);
    }
    return that.intersects(this);
  }

  /** @internal */
  intersectsPoint(that: R2Point): boolean {
    return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x, that.y);
  }

  /** @internal */
  intersectsSegment(that: R2Segment): boolean {
    return R2Segment.intersects(this.x0, this.y0, this.x1 - this.x0, this.y1 - this.y0,
                                that.x0, that.y0, that.x1 - that.x0, that.y1 - that.y0);
  }

  /** @internal */
  static intersects(px: number, py: number, rx: number, ry: number,
                    qx: number, qy: number, sx: number, sy: number): boolean {
    const pqx = qx - px;
    const pqy = qy - py;
    const pqr = pqx * ry - pqy * rx;
    const rs = rx * sy - ry * sx;
    if (pqr === 0 && rs === 0) { // collinear
      const rr = rx * rx + ry * ry;
      const sr = sx * rx + sy * ry;
      const t0 = (pqx * rx + pqy * ry) / rr;
      const t1 = t0 + sr / rr;
      return sr >= 0 ? 0 < t1 && t0 < 1 : 0 < t0 && t1 < 1;
    } else if (rs === 0) { // parallel
      return false;
    }
    const pqs = pqx * sy - pqy * sx;
    const t = pqs / rs; // (q − p) × s / (r × s)
    const u = pqr / rs; // (q − p) × r / (r × s)
    return 0 <= t && t <= 1 && 0 <= u && u <= 1;
  }

  override split(u: number): [R2Segment, R2Segment] {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const c0 = new R2Segment(this.x0, this.y0, x01, y01);
    const c1 = new R2Segment(x01, y01, this.x1, this.y1);
    return [c0, c1];
  }

  override transform(f: R2Function): R2Segment {
    return new R2Segment(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                         f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  toLike(): R2SegmentInit {
    return {
      x0: this.x0,
      y0: this.y0,
      x1: this.x1,
      y1: this.y1,
    };
  }

  override drawMove(context: R2CurveContext): void {
    context.moveTo(this.x0, this.y0);
  }

  override drawRest(context: R2CurveContext): void {
    context.lineTo(this.x1, this.y1);
  }

  override transformDrawMove(context: R2CurveContext, f: R2Function): void {
    context.moveTo(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0));
  }

  override transformDrawRest(context: R2CurveContext, f: R2Function): void {
    context.lineTo(f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  override writeMove<T>(output: Output<T>): Output<T> {
    output = output.write(77/*'M'*/);
    output = Format.displayNumber(output, this.x0);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y0);
    return output;
  }

  override writeRest<T>(output: Output<T>): Output<T> {
    output = output.write(76/*'L'*/);
    output = Format.displayNumber(output, this.x1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y1);
    return output;
  }

  /** @override */
  interpolateTo(that: R2Segment): Interpolator<R2Segment>;
  interpolateTo(that: unknown): Interpolator<R2Segment> | null;
  interpolateTo(that: unknown): Interpolator<R2Segment> | null {
    if (that instanceof R2Segment) {
      return R2SegmentInterpolator(this, that);
    }
    return null;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Segment) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Segment) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(R2Segment), Numbers.hash(this.x0)), Numbers.hash(this.y0)),
        Numbers.hash(this.x1)), Numbers.hash(this.y1)));
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Segment").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.x0).write(", ").debug(this.y0).write(", ")
                   .debug(this.x1).write(", ").debug(this.y1).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static of(x0: number, y0: number, x1: number, y1: number): R2Segment {
    return new R2Segment(x0, y0, x1, y1);
  }

  static override fromLike<T extends R2SegmentLike | null | undefined>(value: T): R2Segment | Uninitable<T>;
  static override fromLike<T extends R2ShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends R2SegmentLike | null | undefined>(value: T): R2Segment | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof R2Segment) {
      return value as R2Segment | Uninitable<T>;
    } else if (R2SegmentInit[Symbol.hasInstance](value)) {
      return R2Segment.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: R2SegmentInit): R2Segment {
    return new R2Segment(init.x0, init.y0, init.x1, init.y1);
  }
}

/** @internal */
export const R2SegmentInterpolator = (function (_super: typeof Interpolator) {
  const R2SegmentInterpolator = function (s0: R2Segment, s1: R2Segment): Interpolator<R2Segment> {
    const interpolator = function (u: number): R2Segment {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const x0 = s0.x0 + u * (s1.x0 - s0.x0);
      const y0 = s0.y0 + u * (s1.y0 - s0.y0);
      const x1 = s0.x1 + u * (s1.x1 - s0.x1);
      const y1 = s0.y1 + u * (s1.y1 - s0.y1);
      return new R2Segment(x0, y0, x1, y1);
    } as Interpolator<R2Segment>;
    Object.setPrototypeOf(interpolator, R2SegmentInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: R2Segment, s1: R2Segment): Interpolator<R2Segment>;

    /** @internal */
    prototype: Interpolator<R2Segment>;
  };

  R2SegmentInterpolator.prototype = Object.create(_super.prototype);
  R2SegmentInterpolator.prototype.constructor = R2SegmentInterpolator;

  return R2SegmentInterpolator;
})(Interpolator);

/** @internal */
export class R2SegmentParser extends Parser<R2Segment> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly x1Parser: Parser<number> | undefined;
  private readonly y1Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              x1Parser?: Parser<number>, y1Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.x1Parser = x1Parser;
    this.y1Parser = y1Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2Segment> {
    return R2SegmentParser.parse(input, this.x0Parser, this.y0Parser,
                                 this.x1Parser, this.y1Parser,
                                 this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               x1Parser?: Parser<number>, y1Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2Segment> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 77/*'M'*/:
          case 109/*'m'*/:
          case 76/*'L'*/:
          case 108/*'l'*/:
            input = input.step();
            command = c;
            step = 2;
            break;
          case 72/*'H'*/:
            input = input.step();
            y1Parser = y0Parser;
            command = c;
            step = 2;
            break;
          case 104/*'h'*/:
            input = input.step();
            y1Parser = Parser.done(0);
            command = c;
            step = 2;
            break;
          case 86/*'V'*/:
            input = input.step();
            x1Parser = x0Parser;
            command = c;
            step = 4;
            break;
          case 118/*'v'*/:
            input = input.step();
            x1Parser = Parser.done(0);
            command = c;
            step = 4;
            break;
          default:
            return Parser.error(Diagnostic.expected("lineto", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (x1Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          x1Parser = Base10.parseDecimal(input);
        }
      } else {
        x1Parser = x1Parser.feed(input);
      }
      if (x1Parser !== void 0) {
        if (x1Parser.isDone()) {
          if (y1Parser === void 0 || !y1Parser.isDone()) {
            step = 3;
          } else { // H or h
            step = 4;
          }
        } else if (x1Parser.isError()) {
          return x1Parser.asError();
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
      if (y1Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          y1Parser = Base10.parseDecimal(input);
        }
      } else {
        y1Parser = y1Parser.feed(input);
      }
      if (y1Parser !== void 0) {
        if (y1Parser.isDone()) {
          const x0 = x0Parser!.bind();
          const y0 = y0Parser!.bind();
          let x1 = x1Parser!.bind();
          let y1 = y1Parser.bind();
          if (command === 109/*'m'*/ || command === 108/*'l'*/ ||
              command === 104/*'h'*/ || command === 118/*'v'*/) {
            x1 += x0;
            y1 += y0;
          }
          return Parser.done(new R2Segment(x0, y0, x1, y1));
        } else if (y1Parser.isError()) {
          return y1Parser.asError();
        }
      }
    }
    return new R2SegmentParser(x0Parser, y0Parser, x1Parser, y1Parser, command, step);
  }

  static parseRest(input: Input, command?: number, x0Parser?: Parser<number>,
                   y0Parser?: Parser<number>): Parser<R2Segment> {
    let x1Parser: Parser<number> | undefined;
    let y1Parser: Parser<number> | undefined;
    let step: number;
    switch (command) {
      case 72/*'H'*/:
        y1Parser = y0Parser;
        step = 2;
        break;
      case 104/*'h'*/:
        y1Parser = Parser.done(0);
        step = 2;
        break;
      case 86/*'V'*/:
        x1Parser = x0Parser;
        step = 4;
        break;
      case 118/*'v'*/:
        x1Parser = Parser.done(0);
        step = 4;
        break;
      default:
        step = 2;
    }
    return this.parse(input, x0Parser, y0Parser, x1Parser, y1Parser, command, step);
  }
}
