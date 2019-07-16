// Copyright 2015-2019 SWIM.AI inc.
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

import {Input, Parser, Diagnostic, Base16} from "@swim/codec";
import {Color} from "./Color";
import {RgbColor} from "./RgbColor";

/** @hidden */
export class HexColorParser extends Parser<RgbColor> {
  private readonly _value: number | undefined;
  private readonly _step: number | undefined;

  constructor(value?: number, step?: number) {
    super();
    this._value = value;
    this._step = step;
  }

  feed(input: Input): Parser<RgbColor> {
    return HexColorParser.parse(input, this._value, this._step);
  }

  static parse(input: Input, value: number = 0, step: number = 1): Parser<RgbColor> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && input.head() === 35/*'#'*/) {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("#", input));
      }
    }
    if (step >= 2) {
      while (step <= 9 && input.isCont()) {
        c = input.head();
        if (Base16.isDigit(c)) {
          input = input.step();
          value = (value << 4) | Base16.decodeDigit(c);
          step += 1;
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        if (step === 5) { // #xxx
          return Parser.done(new RgbColor(value >> 8 & 0x0f | value >> 4 & 0xf0,
                                          value >> 4 & 0x0f | value & 0xf0,
                                          value << 4 & 0xf0 | value & 0x0f));
        } else if (step === 6) { // #xxxx
          return Parser.done(new RgbColor(value >> 12 & 0x0f | value >> 8 & 0xf0,
                                          value >> 8 & 0x0f | value >> 4 & 0xf0,
                                          value >> 4 & 0x0f | value & 0xf0,
                                          (value << 4 & 0xf0 | value & 0x0f) / 255));
        } else if (step === 8) { // #xxxxxx
          return Parser.done(new RgbColor(value >> 16 & 0xff,
                                          value >> 8 & 0xff,
                                          value & 0xff));
        } else if (step === 10) { // #xxxxxxxx
          return Parser.done(new RgbColor(value >> 24 & 0xff,
                                          value >> 16 & 0xff,
                                          value >> 8 & 0xff,
                                          (value & 0xff) / 255));
        } else {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
    }
    return new HexColorParser(value, step);
  }
}
Color.HexParser = HexColorParser;
