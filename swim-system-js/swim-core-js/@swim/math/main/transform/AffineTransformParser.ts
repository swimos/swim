// Copyright 2015-2021 Swim inc.
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

import {Input, Output, Parser, Diagnostic, Unicode, Base10} from "@swim/codec";
import {Transform} from "./Transform";
import type {AffineTransform} from "./AffineTransform";

/** @hidden */
export class AffineTransformParser extends Parser<AffineTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly entries: number[] | undefined;
  private readonly entryParser: Parser<number> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, entries?: number[],
              entryParser?: Parser<number>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.entries = entries;
    this.entryParser = entryParser;
    this.step = step;
  }

  override feed(input: Input): Parser<AffineTransform> {
    return AffineTransformParser.parse(input, this.identOutput, this.entries, this.entryParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, entries: number[] = [],
               entryParser?: Parser<number>, step: number = 1): Parser<AffineTransform> {
    let c = 0;
    if (step === 1) {
      identOutput = identOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        switch (ident) {
          case "matrix": step = 2; break;
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 40/*'('*/) {
        input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("(", input));
      }
    }
    do {
      if (step === 3) {
        if (entryParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            entryParser = Base10.parseNumber(input);
          }
        } else {
          entryParser = entryParser.feed(input);
        }
        if (entryParser !== void 0) {
          if (entryParser.isDone()) {
            entries.push(entryParser.bind());
            entryParser = void 0;
            step = 4;
          } else if (entryParser.isError()) {
            return entryParser.asError();
          }
        }
      }
      if (step === 4) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (input.isCont()) {
          c = input.head();
          if (c === 41/*')'*/) {
            input.step();
            const ident = identOutput!.bind();
            switch (ident) {
              case "matrix": return Parser.done(Transform.affine(...entries));
              default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
            }
          } else if (entries.length >= 6) {
            return Parser.error(Diagnostic.expected(")", input));
          } else if (c === 44/*','*/) {
            input.step();
            step = 3;
            continue;
          } else {
            return Parser.error(Diagnostic.expected(",", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    return new AffineTransformParser(identOutput, entries, entryParser, step);
  }

  /** @hidden */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<AffineTransform> {
    return AffineTransformParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
