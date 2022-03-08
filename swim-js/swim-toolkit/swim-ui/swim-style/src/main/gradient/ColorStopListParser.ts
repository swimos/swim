// Copyright 2015-2022 Swim.inc
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

import {Input, Parser, Unicode} from "@swim/codec";
import type {ColorStop} from "./ColorStop";
import {ColorStopParser} from "./ColorStopParser";

/** @internal */
export class ColorStopListParser extends Parser<ColorStop[]> {
  private readonly stops: ReadonlyArray<ColorStop> | undefined;
  private readonly stopParser: Parser<ColorStop> | undefined;
  private readonly step: number | undefined;

  constructor(stops?: ReadonlyArray<ColorStop>, stopParser?: Parser<ColorStop>, step?: number) {
    super();
    this.stops = stops;
    this.stopParser = stopParser;
    this.step = step;
  }

  override feed(input: Input): Parser<ColorStop[]> {
    return ColorStopListParser.parse(input, this.stops !== void 0 ? this.stops.slice(0) : void 0,
                                     this.stopParser, this.step);
  }

  static parse(input: Input, stops?: ColorStop[], stopParser?: Parser<ColorStop>,
               step: number = 1): Parser<ColorStop[]> {
    let c = 0;
    if (step === 1) {
      if (stopParser === void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (!input.isEmpty()) {
          stopParser = ColorStopParser.parse(input);
        }
      } else {
        stopParser = stopParser.feed(input);
      }
      if (stopParser !== void 0) {
        if (stopParser.isDone()) {
          if (stops === void 0) {
            stops = [];
          }
          stops.push(stopParser.bind());
          stopParser = void 0;
          step = 2;
        } else if (stopParser.isError()) {
          return stopParser.asError();
        }
      }
    }
    do {
      if (step === 2) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont() && c === 44/*','*/) {
          input = input.step();
          step = 3;
        } else {
          return Parser.done(stops!);
        }
      }
      if (step === 3) {
        if (stopParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            stopParser = ColorStopParser.parseHint(input);
          }
        } else {
          stopParser = stopParser.feed(input);
        }
        if (stopParser !== void 0) {
          if (stopParser.isDone()) {
            stops!.push(stopParser.bind());
            stopParser = void 0;
            step = 2;
            continue;
          } else if (stopParser.isError()) {
            return stopParser.asError();
          }
        }
      }
      break;
    } while (true);
    return new ColorStopListParser(stops, stopParser, step);
  }
}
