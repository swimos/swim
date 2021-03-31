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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {SplineR2} from "./SplineR2";
import {SplineR2Parser} from "./SplineR2Parser";
import {PathR2} from "./PathR2";

/** @hidden */
export class PathR2Parser extends Parser<PathR2> {
  private readonly splineParser: Parser<SplineR2> | undefined;
  private readonly splines: SplineR2[] | undefined;
  private readonly step: number | undefined;

  constructor(splineParser?: Parser<SplineR2>, splines?: SplineR2[], step?: number) {
    super();
    this.splineParser = splineParser;
    this.splines = splines;
    this.step = step;
  }

  feed(input: Input): Parser<PathR2> {
    return PathR2Parser.parse(input, this.splineParser, this.splines, this.step);
  }

  static parse(input: Input, splineParser?: Parser<SplineR2>,
               splines?: SplineR2[], step: number = 1): Parser<PathR2> {
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
                splineParser = SplineR2Parser.parse(input);
                break;
              case 110/*'n'*/:
                step = 2;
                break;
              default:
                if (splines !== void 0) {
                  return Parser.done(new PathR2(splines));
                } else {
                  return Parser.done(PathR2.empty());
                }
            }
          } else if (!input.isEmpty()) {
            if (splines !== void 0) {
              return Parser.done(new PathR2(splines));
            } else {
              return Parser.done(PathR2.empty());
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
              return Parser.done(PathR2.empty());
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
    return new PathR2Parser(splineParser, splines, step);
  }
}
