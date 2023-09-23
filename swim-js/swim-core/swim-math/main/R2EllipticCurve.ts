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
import {R2Curve} from "./R2Curve";

/** @public */
export class R2EllipticCurve extends R2Curve implements Debug {
  constructor(cx: number, cy: number, rx: number, ry: number,
              phi: number, a0: number, da: number) {
    super();
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
    this.phi = phi;
    this.a0 = a0;
    this.da = da;
  }

  override isDefined(): boolean {
    return isFinite(this.cx) && isFinite(this.cy)
        && isFinite(this.rx) && isFinite(this.ry)
        && isFinite(this.phi)
        && isFinite(this.a0) && isFinite(this.da);
  }

  readonly cx: number;

  readonly cy: number;

  readonly rx: number;

  readonly ry: number;

  readonly phi: number;

  readonly a0: number;

  readonly da: number;

  override get xMin(): number {
    return this.cx - Math.max(this.rx, this.ry);
  }

  override get yMin(): number {
    return this.cy - Math.max(this.rx, this.ry);
  }

  override get xMax(): number {
    return this.cx + Math.max(this.rx, this.ry);
  }

  override get yMax(): number {
    return this.cy + Math.max(this.rx, this.ry);
  }

  override interpolateX(u: number): number {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return this.cx + dx;
    }
    return this.cx + dx * Math.cos(phi) - dy * Math.sin(phi);
  }

  override interpolateY(u: number): number {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return this.cy + dy;
    }
    return this.cy + dx * Math.sin(phi) + dy * Math.cos(phi);
  }

  override interpolate(u: number): R2Point {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return new R2Point(this.cx + dx, this.cy + dy);
    }
    return new R2Point(this.cx + dx * Math.cos(phi) - dy * Math.sin(phi),
                       this.cy + dx * Math.sin(phi) + dy * Math.cos(phi));
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: R2ShapeLike): boolean {
    return false; // TODO
  }

  override split(u: number): [R2EllipticCurve, R2EllipticCurve] {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const c0 = new R2EllipticCurve(this.cx, this.cy, this.rx, this.ry,
                                   this.phi, a0, a - a0);
    const c1 = new R2EllipticCurve(this.cx, this.cy, this.rx, this.ry,
                                   this.phi, a, a0 + da - a);
    return [c0, c1];
  }

  override transform(f: R2Function): R2EllipticCurve {
    const cx = f.transformX(this.cx, this.cy);
    const cy = f.transformY(this.cx, this.cy);
    const rx = f.transformX(this.cx + this.rx, this.cy + this.ry) - cx;
    const ry = f.transformY(this.cx + this.rx, this.cy + this.ry) - cy;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;
    const a0x = Math.cos(a0);
    const a0y = Math.sin(a0);
    const a1x = Math.cos(a1);
    const a1y = Math.sin(a1);
    const b0x = f.transformX(this.cx + a0x, this.cy - a0y) - cx;
    const b0y = f.transformY(this.cx + a0x, this.cy - a0y) - cy;
    const b1x = f.transformX(this.cx + a1x, this.cy - a1y) - cx;
    const b1y = f.transformY(this.cx + a1x, this.cy - a1y) - cy;
    const b0 = Math.atan2(b0y, b0x);
    let b1 = Math.atan2(b1y, b1x);
    if (Math.abs(da) > Math.PI) {
      if (b1 > 0) {
        b1 = -2 * Math.PI + b1;
      } else if (b1 < 0) {
        b1 = 2 * Math.PI - b1;
      }
    }
    const db = b1 - b0;
    return new R2EllipticCurve(cx, cy, rx, ry, this.phi, b0, db);
  }

  override drawMove(context: R2CurveContext): void {
    const {x0, y0} = this.toEndpoints();
    context.moveTo(x0, y0);
  }

  override drawRest(context: R2CurveContext): void {
    context.ellipse(this.cx, this.cy, this.rx, this.ry, this.phi,
                    this.a0, this.a0 + this.da, this.da < 0);
  }

  override transformDrawMove(context: R2CurveContext, f: R2Function): void {
    const {x0, y0} = this.toEndpoints();
    context.moveTo(f.transformX(x0, y0), f.transformY(x0, y0));
  }

  override transformDrawRest(context: R2CurveContext, f: R2Function): void {
    const cx = f.transformX(this.cx, this.cy);
    const cy = f.transformY(this.cx, this.cy);
    const rx = f.transformX(this.cx + this.rx, this.cy + this.ry) - cx;
    const ry = f.transformY(this.cx + this.rx, this.cy + this.ry) - cy;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;
    const a0x = Math.cos(a0);
    const a0y = Math.sin(a0);
    const a1x = Math.cos(a1);
    const a1y = Math.sin(a1);
    const b0x = f.transformX(this.cx + a0x, this.cy - a0y) - cx;
    const b0y = f.transformY(this.cx + a0x, this.cy - a0y) - cy;
    const b1x = f.transformX(this.cx + a1x, this.cy - a1y) - cx;
    const b1y = f.transformY(this.cx + a1x, this.cy - a1y) - cy;
    const b0 = Math.atan2(b0y, b0x);
    let b1 = Math.atan2(b1y, b1x);
    if (Math.abs(da) > Math.PI) {
      if (b1 > 0) {
        b1 = -2 * Math.PI + b1;
      } else if (b1 < 0) {
        b1 = 2 * Math.PI - b1;
      }
    }
    const ccw = b1 < b0;
    context.ellipse(cx, cy, rx, ry, this.phi, b0, b1, ccw);
  }

  override writeMove<T>(output: Output<T>): Output<T> {
    const {x0, y0} = this.toEndpoints();
    output = output.write(77/*'M'*/);
    output = Format.displayNumber(output, x0);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, y0);
    return output;
  }

  override writeRest<T>(output: Output<T>): Output<T> {
    const {rx, ry, phi, large, sweep, x1, y1} = this.toEndpoints();
    output = output.write(65/*'A'*/);
    output = Format.displayNumber(output, rx);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, ry);
    output = output.write(32/*' '*/);
    output = Format.displayNumber(output, phi);
    output = output.write(32/*' '*/);
    output = output.write(large ? 49/*'1'*/ : 48/*'0'*/);
    output = output.write(44/*','*/);
    output = output.write(sweep ? 49/*'1'*/ : 48/*'0'*/);
    output = output.write(32/*' '*/);
    output = Format.displayNumber(output, x1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, y1);
    return output;
  }

  toEndpoints(): {x0: number, y0: number, rx: number, ry: number, phi: number,
                  large: boolean, sweep: boolean, x1: number, y1: number} {
    const cx = this.cx;
    const cy = this.cy;
    const rx = this.rx;
    const ry = this.ry;
    const phi = this.phi;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosA0 = Math.cos(a0);
    const sinA0 = Math.sin(a0);
    const cosA1 = Math.cos(a1);
    const sinA1 = Math.sin(a1);
    const x0 = cosPhi * rx * cosA0 - sinPhi * ry * sinA0 + cx;
    const y0 = sinPhi * rx * cosA0 + cosPhi * ry * sinA0 + cy;
    const x1 = cosPhi * rx * cosA1 - sinPhi * ry * sinA1 + cx;
    const y1 = sinPhi * rx * cosA1 + cosPhi * ry * sinA1 + cy;
    const large = Math.abs(da) > Math.PI;
    const sweep = da > 0;
    return {x0, y0, rx, ry, phi, large, sweep, x1, y1};
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2EllipticCurve) {
      return Numbers.equivalent(this.cx, that.cx, epsilon)
          && Numbers.equivalent(this.cy, that.cy, epsilon)
          && Numbers.equivalent(this.rx, that.rx, epsilon)
          && Numbers.equivalent(this.ry, that.ry, epsilon)
          && Numbers.equivalent(this.phi, that.phi, epsilon)
          && Numbers.equivalent(this.a0, that.a0, epsilon)
          && Numbers.equivalent(this.da, that.da, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2EllipticCurve) {
      return this.cx === that.cx && this.cy === that.cy
          && this.rx === that.rx && this.ry === that.ry
          && this.phi === that.phi && this.a0 === that.a0
          && this.da === that.da;
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Curve").write(46/*'.'*/).write("elliptic").write(40/*'('*/)
                   .debug(this.cx).write(", ").debug(this.cy).write(", ")
                   .debug(this.rx).write(", ").debug(this.ry).write(", ")
                   .debug(this.phi).write(", ").debug(this.a0).write(", ")
                   .debug(this.da).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static fromEndpoints(x0: number, y0: number, rx: number, ry: number, phi: number,
                       large: boolean, sweep: boolean, x1: number, y1: number): R2EllipticCurve {
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const x0p =  cosPhi * ((x0 - x1) / 2) + sinPhi * ((y0 - y1) / 2);
    const y0p = -sinPhi * ((x0 - x1) / 2) + cosPhi * ((y0 - y1) / 2);

    const rx2 = rx * rx;
    const ry2 = ry * ry;
    const x0p2 = x0p * x0p;
    const y0p2 = y0p * y0p;
    let sp = Math.sqrt((rx2 * ry2 - rx2 * y0p2 - ry2 * x0p2) / (rx2 * y0p2 + ry2 * x0p2));
    if (large === sweep) {
      sp = -sp;
    }
    const cxp =  sp * rx * y0p / ry;
    const cyp = -sp * ry * x0p / rx;
    const cx = cosPhi * cxp - sinPhi * cyp + (x0 + x1) / 2;
    const cy = sinPhi * cxp + cosPhi * cyp + (y0 + y1) / 2;

    function angle(ux: number, uy: number, vx: number, vy: number): number {
      const uv = ux * vx + uy * vy;
      const uu = ux * ux + uy * uy;
      const vv = vx * vx + vy * vy;
      let a = Math.acos(uv / (Math.sqrt(uu) * Math.sqrt(vv)));
      if (ux * vy - uy * vx < 0) {
        a = -a;
      }
      return a;
    }
    const a0 = angle(1, 0, (x0p - cxp) / rx, (y0p - cyp) / ry);
    let da = angle((x0p - cxp) / rx, (y0p - cyp) / ry, (-x0p - cxp) / rx, (-y0p - cyp) / ry) % (2 * Math.PI);
    if (sweep && da < 0) {
      da += 2 * Math.PI;
    } else if (!sweep && da > 0) {
      da -= 2 * Math.PI;
    }

    return new R2EllipticCurve(cx, cy, rx, ry, phi, a0, da);
  }
}

/** @internal */
export class R2EllipticCurveParser extends Parser<R2EllipticCurve> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly rxParser: Parser<number> | undefined;
  private readonly ryParser: Parser<number> | undefined;
  private readonly phiParser: Parser<number> | undefined;
  private readonly large: boolean | undefined;
  private readonly sweep: boolean | undefined;
  private readonly x1Parser: Parser<number> | undefined;
  private readonly y1Parser: Parser<number> | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              rxParser?: Parser<number>, ryParser?: Parser<number>,
              phiParser?: Parser<number>, large?: boolean, sweep?: boolean,
              x1Parser?: Parser<number>, y1Parser?: Parser<number>,
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.rxParser = rxParser;
    this.ryParser = ryParser;
    this.phiParser = phiParser;
    this.large = large;
    this.sweep = sweep;
    this.x1Parser = x1Parser;
    this.y1Parser = y1Parser;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2EllipticCurve> {
    return R2EllipticCurveParser.parse(input, this.x0Parser, this.y0Parser,
                                       this.rxParser, this.ryParser,
                                       this.phiParser, this.large, this.sweep,
                                       this.x1Parser, this.y1Parser,
                                       this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               rxParser?: Parser<number>, ryParser?: Parser<number>,
               phiParser?: Parser<number>, large?: boolean, sweep?: boolean,
               x1Parser?: Parser<number>, y1Parser?: Parser<number>,
               command?: number, step: number = 1): Parser<R2EllipticCurve> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        switch (c) {
          case 65/*'A'*/:
          case 97/*'a'*/:
            input = input.step();
            command  = c;
            step = 2;
            break;
          default:
            return Parser.error(Diagnostic.expected("arcto", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (rxParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          rxParser = Base10.parseDecimal(input);
        }
      } else {
        rxParser = rxParser.feed(input);
      }
      if (rxParser !== void 0) {
        if (rxParser.isDone()) {
          step = 3;
        } else if (rxParser.isError()) {
          return rxParser.asError();
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
      if (ryParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          ryParser = Base10.parseDecimal(input);
        }
      } else {
        ryParser = ryParser.feed(input);
      }
      if (ryParser !== void 0) {
        if (ryParser.isDone()) {
          step = 5;
        } else if (ryParser.isError()) {
          return ryParser.asError();
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
      if (phiParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input = input.step();
        }
        if (!input.isEmpty()) {
          phiParser = Base10.parseDecimal(input);
        }
      } else {
        phiParser = phiParser.feed(input);
      }
      if (phiParser !== void 0) {
        if (phiParser.isDone()) {
          step = 7;
        } else if (phiParser.isError()) {
          return phiParser.asError();
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
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 48/*'0'*/) {
          input = input.step();
          large = false;
          step = 9;
        } else if (c === 49/*'1'*/) {
          input = input.step();
          large = true;
          step = 9;
        } else {
          return Parser.error(Diagnostic.expected("flag", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 9) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 10;
      } else if (!input.isEmpty()) {
        step = 10;
      }
    }
    if (step === 10) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 48/*'0'*/) {
          input = input.step();
          sweep = false;
          step = 11;
        } else if (c === 49/*'1'*/) {
          input = input.step();
          sweep = true;
          step = 11;
        } else {
          return Parser.error(Diagnostic.expected("flag", input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 11) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 12;
      } else if (!input.isEmpty()) {
        step = 12;
      }
    }
    if (step === 12) {
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
          step = 13;
        } else if (x1Parser.isError()) {
          return x1Parser.asError();
        }
      }
    }
    if (step === 13) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input = input.step();
        }
        step = 14;
      } else if (!input.isEmpty()) {
        step = 14;
      }
    }
    if (step === 14) {
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
          const rx = rxParser!.bind();
          const ry = ryParser!.bind();
          const phi = phiParser!.bind() * Math.PI / 180;
          let x1 = x1Parser!.bind();
          let y1 = y1Parser.bind();
          if (command === 97/*'a'*/) {
            x1 += x0;
            y1 += y0;
          }
          return Parser.done(R2EllipticCurve.fromEndpoints(x0, y0, rx, ry, phi, large!, sweep!, x1, y1));
        } else if (y1Parser.isError()) {
          return y1Parser.asError();
        }
      }
    }
    return new R2EllipticCurveParser(x0Parser, y0Parser, rxParser, ryParser,
                                     phiParser, large, sweep, x1Parser, y1Parser,
                                     command, step);
  }

  static parseRest(input: Input, command?: number, x0Parser?: Parser<number>,
                   y0Parser?: Parser<number>): Parser<R2EllipticCurve> {
    return R2EllipticCurveParser.parse(input, x0Parser, y0Parser, void 0, void 0, void 0,
                                       void 0, void 0, void 0, void 0, command, 2);
  }
}
