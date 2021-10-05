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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {R2Spline} from "./R2Spline";
import {R2SplineParser} from "./R2SplineParser";
import {R2Path} from "./R2Path";

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
              case 109/*'m'*/:
                splineParser = R2SplineParser.parse(input);
                break;
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
