// Copyright 2015-2021 Swim.inc
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

import {Input, Output, Parser, Diagnostic, Base16, Utf8} from "@swim/codec";
import {Uri} from "../Uri";
import type {UriFragment} from "../UriFragment";
import type {UriParser} from "./UriParser";

/** @internal */
export class UriFragmentParser extends Parser<UriFragment> {
  private readonly uri: UriParser;
  private readonly output: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, output?: Output<string>, c1?: number, step?: number) {
    super();
    this.uri = uri;
    this.output = output;
    this.c1 = c1;
    this.step = step;
  }

  override feed(input: Input): Parser<UriFragment> {
    return UriFragmentParser.parse(input, this.uri, this.output, this.c1, this.step);
  }

  static parse(input: Input, uri: UriParser, output?: Output<string>,
               c1: number = 0, step: number = 1): Parser<UriFragment> {
    let c = 0;
    output = output || Utf8.decodedString();
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Uri.isFragmentChar(c))) {
          input = input.step();
          output = output.write(c);
        }
        if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.fragment(output.bind()));
        }
      }
      if (step === 2) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 3) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          output = output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriFragmentParser(uri, output, c1, step);
  }
}
