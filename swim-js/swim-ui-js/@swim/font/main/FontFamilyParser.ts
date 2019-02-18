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

import {Input, Output, Parser, Diagnostic, Unicode, Base16} from "@swim/codec";
import {FontFamily} from "./FontFamily";

/** @hidden */
export class FontFamilyParser extends Parser<FontFamily> {
  private readonly output: Output<string> | undefined;
  private readonly quote: number | undefined;
  private readonly code: number | undefined;
  private readonly step: number | undefined;

  constructor(output?: Output<string>, quote?: number, code?: number, step?: number) {
    super();
    this.output = output;
    this.quote = quote;
    this.code = code;
    this.step = step;
  }

  feed(input: Input): Parser<FontFamily> {
    return FontFamilyParser.parse(input, this.output, this.quote, this.code, this.step);
  }

  static parse<I, V>(input: Input, output?: Output<string>, quote: number = 0,
                     code: number = 0, step: number = 1): Parser<FontFamily> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (Unicode.isAlpha(c)) {
          output = output || Unicode.stringOutput();
          step = 2;
        } else if (c === 34/*'"'*/ || c === 39/*'\''*/ && (quote === c || quote === 0)) {
          input = input.step();
          output = output || Unicode.stringOutput();
          quote = c;
          step = 3;
        } else {
          return Parser.error(Diagnostic.expected("font family", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("font family", input));
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 45/*'-'*/)) {
        input = input.step();
        output!.write(c);
      }
      if (!input.isEmpty()) {
        return Parser.done(output!.bind());
      }
    }
    string: do {
      if (step === 3) {
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c !== quote && c !== 92/*'\\'*/) {
            input = input.step();
            output!.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c === quote) {
            input = input.step();
            return Parser.done(output!.bind());
          } else if (c === 92/*'\\'*/) {
            input = input.step();
            step = 4;
          } else {
            return Parser.error(Diagnostic.expected(quote, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(quote, input));
        }
      }
      if (step === 4) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            step = 5;
          } else if (c === 10/*'\n'*/) {
            input.step();
            step = 3;
            continue;
          } else {
            input.step();
            output!.write(c);
            step = 3;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 5) {
        do {
          if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
            input = input.step();
            code = 16 * code + Base16.decodeDigit(c);
            if (step <= 11) {
              step += 1;
              continue;
            } else {
              if (code === 0) {
                return Parser.error(Diagnostic.message("zero escape", input));
              }
              output!.write(code);
              code = 0;
              step = 3;
              continue string;
            }
          } else if (!input.isEmpty()) {
            return Parser.error(Diagnostic.unexpected(input));
          }
          break;
        } while (true);
      }
      break;
    } while (true);
    return new FontFamilyParser(output, quote, code, step);
  }
}
