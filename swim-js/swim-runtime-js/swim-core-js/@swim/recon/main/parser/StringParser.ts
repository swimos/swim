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

import {Input, Output, Parser, Diagnostic, Base16} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @hidden */
export class StringParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly output: Output<V> | undefined;
  private readonly quote: number | undefined;
  private readonly code: number | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, output?: Output<V>, quote?: number,
              code?: number, step?: number) {
    super();
    this.recon = recon;
    this.output = output;
    this.quote = quote;
    this.code = code;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return StringParser.parse(input, this.recon, this.output, this.quote,
                              this.code, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, output?: Output<V>,
                     quote: number = 0, code: number = 0, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isWhitespace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if ((c === 34/*'"'*/ || c === 39/*'\''*/) && (quote === c || quote === 0)) {
          input = input.step();
          output = output || recon.textOutput();
          quote = c;
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("string", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("string", input));
      }
    }
    string: do {
      if (step === 2) {
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c !== quote && c !== 92/*'\\'*/) {
            input = input.step();
            output = output!.write(c);
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
            step = 3;
          } else {
            return Parser.error(Diagnostic.expected(quote, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(quote, input));
        }
      }
      if (step === 3) {
        if (input.isCont()) {
          c = input.head();
          if (c === 34/*'"'*/ || c === 36/*'$'*/ || c === 39/*'\''*/ || c === 47/*'/'*/
              || c === 64/*'@'*/ || c === 91/*'['*/ || c === 92/*'\\'*/ || c === 93/*']'*/
              || c === 123/*'{'*/ || c === 125/*'}'*/) {
            input = input.step();
            output = output!.write(c);
            step = 2;
            continue;
          } else if (c === 98/*'b'*/) {
            input = input.step();
            output = output!.write(8/*'\b'*/);
            step = 2;
            continue;
          } else if (c === 102/*'f'*/) {
            input = input.step();
            output = output!.write(12/*'\f'*/);
            step = 2;
            continue;
          } else if (c === 110/*'n'*/) {
            input = input.step();
            output = output!.write(10/*'\n'*/);
            step = 2;
            continue;
          } else if (c === 114/*'r'*/) {
            input = input.step();
            output = output!.write(13/*'\r'*/);
            step = 2;
            continue;
          } else if (c === 116/*'t'*/) {
            input = input.step();
            output = output!.write(9/*'\t'*/);
            step = 2;
            continue;
          } else if (c === 117/*'u'*/) {
            input = input.step();
            step = 4;
          } else {
            return Parser.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 4) {
        do {
          if (input.isCont()) {
            c = input.head();
            if (Base16.isDigit(c)) {
              input = input.step();
              code = 16 * code + Base16.decodeDigit(c);
              if (step <= 6) {
                step += 1;
                continue;
              } else {
                output = output!.write(code);
                code = 0;
                step = 2;
                continue string;
              }
            } else {
              return Parser.error(Diagnostic.expected("hex digit", input));
            }
          } else if (input.isDone()) {
            return Parser.error(Diagnostic.expected("hex digit", input));
          }
          break;
        } while (true);
      }
      break;
    } while (true);
    return new StringParser<I, V>(recon, output, quote, code, step);
  }
}
