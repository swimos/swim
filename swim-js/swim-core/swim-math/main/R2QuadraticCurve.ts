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

import {Numbers} from "@swim/util";
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
import {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2Curve";
import {R2BezierCurve} from "./R2Curve";

/** @public */
export class R2QuadraticCurve extends R2BezierCurve implements Debug {
  constructor(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
    super();
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  override isDefined(): boolean {
    return isFinite(this.x0) && isFinite(this.y0)
        && isFinite(this.x1) && isFinite(this.y1)
        && isFinite(this.x2) && isFinite(this.y2);
  }

  readonly x0: number;

  readonly y0: number;

  readonly x1: number;

  readonly y1: number;

  readonly x2: number;

  readonly y2: number;

  override get xMin(): number {
    return Math.min(this.x0, this.x1, this.x2);
  }

  override get yMin(): number {
    return Math.min(this.y0, this.y1, this.y2);
  }

  override get xMax(): number {
    return Math.max(this.x0, this.x1, this.x2);
  }

  override get yMax(): number {
    return Math.max(this.y0, this.y1, this.y2);
  }

  override interpolateX(u: number): number {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const x12 = v * this.x1 + u * this.x2;
    return v * x01 + u * x12;
  }

  override interpolateY(u: number): number {
    const v = 1.0 - u;
    const y01 = v * this.y0 + u * this.y1;
    const y12 = v * this.y1 + u * this.y2;
    return v * y01 + u * y12;
  }

  override interpolate(u: number): R2Point {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const x12 = v * this.x1 + u * this.x2;
    const y12 = v * this.y1 + u * this.y2;
    const x02 = v * x01 + u * x12;
    const y02 = v * y01 + u * y12;
    return new R2Point(x02, y02);
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: R2ShapeLike): boolean {
    return false; // TODO
  }

  override split(u: number): [R2QuadraticCurve, R2QuadraticCurve] {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const x12 = v * this.x1 + u * this.x2;
    const y12 = v * this.y1 + u * this.y2;
    const x02 = v * x01 + u * x12;
    const y02 = v * y01 + u * y12;
    const c0 = new R2QuadraticCurve(this.x0, this.y0, x01, y01, x02, y02);
    const c1 = new R2QuadraticCurve(x02, y02, x12, y12, this.x2, this.y2);
    return [c0, c1];
  }

  override transform(f: R2Function): R2QuadraticCurve {
    return new R2QuadraticCurve(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                                f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1),
                                f.transformX(this.x2, this.y2), f.transformY(this.x2, this.y2));
  }

  override drawMove(context: R2CurveContext): void {
    context.moveTo(this.x0, this.y0);
  }

  override drawRest(context: R2CurveContext): void {
    context.quadraticCurveTo(this.x1, this.y1, this.x2, this.y2);
  }

  override transformDrawMove(context: R2CurveContext, f: R2Function): void {
    context.moveTo(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0));
  }

  override transformDrawRest(context: R2CurveContext, f: R2Function): void {
    context.quadraticCurveTo(f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1),
                             f.transformX(this.x2, this.y2), f.transformY(this.x2, this.y2));
  }

  override writeMove<T>(output: Output<T>): Output<T> {
    output = output.write(77/*'M'*/);
    output = Format.displayNumber(output, this.x0);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y0);
    return output;
  }

  override writeRest<T>(output: Output<T>): Output<T> {
    output = output.write(81/*'Q'*/);
    output = Format.displayNumber(output, this.x1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.x2);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y2);
    return output;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2QuadraticCurve) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon)
          && Numbers.equivalent(this.x2, that.x2, epsilon)
          && Numbers.equivalent(this.y2, that.y2, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2QuadraticCurve) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1
          && this.x2 === that.x2 && this.y2 === that.y2;
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Curve").write(46/*'.'*/).write("quadratic").write(40/*'('*/)
                   .debug(this.x0).write(", ").debug(this.y0).write(", ")
                   .debug(this.x1).write(", ").debug(this.y1).write(", ")
                   .debug(this.x2).write(", ").debug(this.y2).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }
}

/** @internal */
export class R2QuadraticCurveParser extends Parser<R2QuadraticCurve> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly x1Parser: Parser<number> | undefined;
  private readonly y1Parser: Parser<number> | undefined;
  private readonly x2Parser: Parser<number> | undefined;
  private readonly y2Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              x1Parser?: Parser<number>, y1Parser?: Parser<number>,
              x2Parser?: Parser<number>, y2Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.x1Parser = x1Parser;
    this.y1Parser = y1Parser;
    this.x2Parser = x2Parser;
    this.y2Parser = y2Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2QuadraticCurve> {
    return R2QuadraticCurveParser.parse(input, this.x0Parser, this.y0Parser,
                                        this.x1Parser, this.y1Parser,
                                        this.x2Parser, this.y2Parser,
                                        this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               x1Parser?: Parser<number>, y1Parser?: Parser<number>,
               x2Parser?: Parser<number>, y2Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2QuadraticCurve> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 81/*'Q'*/:
          case 113/*'q'*/:
            input = input.step();
            command = c;
            step = 2;
            break;
          case 84/*'T'*/:
          case 116/*'t'*/:
            input = input.step();
            command = c;
            step = 6;
            break;
          default:
            return Parser.error(Diagnostic.expected("curveto", input));
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
          step = 3;
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
          step = 5;
        } else if (y1Parser.isError()) {
          return y1Parser.asError();
        }
      }
    }
    if (step === 5) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 6;
      } else if (!input.isEmpty()) {
        step = 6;
      }
    }
    if (step === 6) {
      if (x2Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          x2Parser = Base10.parseDecimal(input);
        }
      } else {
        x2Parser = x2Parser.feed(input);
      }
      if (x2Parser !== void 0) {
        if (x2Parser.isDone()) {
          step = 7;
        } else if (x2Parser.isError()) {
          return x2Parser.asError();
        }
      }
    }
    if (step === 7) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 8;
      } else if (!input.isEmpty()) {
        step = 8;
      }
    }
    if (step === 8) {
      if (y2Parser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          y2Parser = Base10.parseDecimal(input);
        }
      } else {
        y2Parser = y2Parser.feed(input);
      }
      if (y2Parser !== void 0) {
        if (y2Parser.isDone()) {
          const x0 = x0Parser!.bind();
          const y0 = y0Parser!.bind();
          let x1 = x1Parser!.bind();
          let y1 = y1Parser!.bind();
          let x2 = x2Parser!.bind();
          let y2 = y2Parser.bind();
          if (command === 113/*'q'*/ || command === 116/*'t'*/) {
            x1 += x0;
            y1 += y0;
            x2 += x0;
            y2 += y0;
          }
          return Parser.done(new R2QuadraticCurve(x0, y0, x1, y1, x2, y2));
        } else if (y2Parser.isError()) {
          return y2Parser.asError();
        }
      }
    }
    return new R2QuadraticCurveParser(x0Parser, y0Parser, x1Parser, y1Parser,
                                      x2Parser, y2Parser, command, step);
  }

  static parseRest(input: Input, command?: number, x0Parser?: Parser<number>,
                   y0Parser?: Parser<number>, x1Parser?: Parser<number>,
                   y1Parser?: Parser<number>): Parser<R2QuadraticCurve> {
    const step = command === 84/*'T'*/ || command === 116/*'t'*/ ? 6 : 2;
    return R2QuadraticCurveParser.parse(input, x0Parser, y0Parser, x1Parser, y1Parser,
                                        void 0, void 0, command, step);
  }
}
