// Copyright 2015-2023 Swim.inc
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

import {Input, Output, Parser, Diagnostic} from "@swim/codec";
import {Recon} from "../Recon";
import type {ReconParser} from "./ReconParser";

/** @internal */
export class RawStringParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly output: Output<V> | undefined;
  private readonly count: number | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, output?: Output<V>, count?: number, step?: number) {
    super();
    this.recon = recon;
    this.output = output;
    this.count = count;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return RawStringParser.parse(input, this.recon, this.output, this.count, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, output?: Output<V>,
                     count: number = 0, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Recon.isWhitespace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 96/*'`'*/) {
        input = input.step();
        count = 1;
        step = 2;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("raw string", input));
      }
    }
    if (step === 2) {
      if (input.isCont()) {
        if (input.head() === 96/*'`'*/) {
          input = input.step();
          count = 2;
          step = 3;
        } else {
          output = output || recon.textOutput();
          step = 4;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("raw string", input));
      }
    }
    if (step === 3) {
      if (input.isCont()) {
        if (input.head() === 96/*'`'*/) {
          input = input.step();
          output = output || recon.textOutput();
          count = 3;
          step = 4;
        } else {
          output = output || recon.textOutput();
          return Parser.done(output!.bind());
        }
      } else if (input.isDone()) {
        output = output || recon.textOutput();
        return Parser.done(output!.bind());
      }
    }
    do {
      if (step === 4) {
        while (input.isCont()) {
          c = input.head();
          if ((count !== 1 || c >= 0x20) && c !== 96/*'`'*/ && c !== 92/*'\\'*/) {
            input = input.step();
            output = output!.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c === 92/*'\\'*/) {
            input = input.step();
            step = 5;
          } else if (c === 96/*'`'*/) {
            input = input.step();
            if (count === 1) {
              return Parser.done(output!.bind());
            } else {
              step = 6;
            }
          } else {
            return Parser.error(Diagnostic.expected(96/*'`'*/, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(96/*'`'*/, input));
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          c = input.head();
          input = input.step();
          if (c !== 92/*'\\'*/ && c !== 96/*'`'*/) {
            output = output!.write(92/*'\\'*/);
          }
          output = output!.write(c);
          step = 4;
          continue;
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step === 6) {
        if (input.isCont()) {
          if (input.head() === 96/*'`'*/) {
            input = input.step();
            step = 7;
          } else {
            output = output!.write(96/*'`'*/);
            step = 4;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.message("unclosed raw string", input));
        }
      }
      if (step === 7) {
        if (input.isCont()) {
          if (input.head() === 96/*'`'*/) {
            input = input.step();
            return Parser.done(output!.bind());
          } else {
            output = output!.write(96/*'`'*/);
            output = output!.write(96/*'`'*/);
            step = 4;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.message("unclosed raw string", input));
        }
      }
      break;
    } while (true);
    return new RawStringParser<I, V>(recon, output, count, step);
  }
}
