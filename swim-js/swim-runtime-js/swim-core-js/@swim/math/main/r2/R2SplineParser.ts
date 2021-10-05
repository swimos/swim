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

import {Input, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import type {R2Curve} from "./R2Curve";
import {R2Segment} from "./R2Segment";
import {R2SegmentParser} from "./R2SegmentParser";
import {R2QuadraticCurve} from "./R2QuadraticCurve";
import {R2QuadraticCurveParser} from "./R2QuadraticCurveParser";
import {R2CubicCurve} from "./R2CubicCurve";
import {R2CubicCurveParser} from "./R2CubicCurveParser";
import {R2EllipticCurveParser} from "./R2EllipticCurveParser";
import {R2Spline} from "./R2Spline";

/** @internal */
export class R2SplineParser extends Parser<R2Spline> {
  private readonly x0Parser: Parser<number> | undefined;
  private readonly y0Parser: Parser<number> | undefined;
  private readonly xParser: Parser<number> | undefined;
  private readonly yParser: Parser<number> | undefined;
  private readonly curveParser: Parser<R2Curve> | undefined;
  private readonly curves: R2Curve[] | undefined;
  private readonly command: number | undefined;
  private readonly step: number | undefined;

  constructor(x0Parser?: Parser<number>, y0Parser?: Parser<number>,
              xParser?: Parser<number>, yParser?: Parser<number>,
              curveParser?: Parser<R2Curve>, curves?: R2Curve[],
              command?: number, step?: number) {
    super();
    this.x0Parser = x0Parser;
    this.y0Parser = y0Parser;
    this.xParser = xParser;
    this.yParser = yParser;
    this.curveParser = curveParser;
    this.curves = curves;
    this.command = command;
    this.step = step;
  }

  override feed(input: Input): Parser<R2Spline> {
    return R2SplineParser.parse(input, this.x0Parser, this.y0Parser,
                                this.xParser, this.yParser,
                                this.curveParser, this.curves,
                                this.command, this.step);
  }

  static parse(input: Input, x0Parser?: Parser<number>, y0Parser?: Parser<number>,
               xParser?: Parser<number>, yParser?: Parser<number>,
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
    return new R2SplineParser(x0Parser, y0Parser, xParser, yParser,
                              curveParser, curves, command, step);
  }
}
