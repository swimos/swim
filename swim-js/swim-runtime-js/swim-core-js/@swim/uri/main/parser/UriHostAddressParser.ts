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

import {Input, Output, Parser, Diagnostic, Base10, Base16, Utf8} from "@swim/codec";
import {Uri} from "../Uri";
import type {UriHost} from "../UriHost";
import type {UriParser} from "./UriParser";

/** @hidden */
export class UriHostAddressParser extends Parser<UriHost> {
  private readonly uri: UriParser;
  private readonly output: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly x: number | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, output?: Output<string>, c1?: number, x?: number, step?: number) {
    super();
    this.uri = uri;
    this.output = output;
    this.c1 = c1;
    this.x = x;
    this.step = step;
  }

  override feed(input: Input): Parser<UriHost> {
    return UriHostAddressParser.parse(input, this.uri, this.output, this.c1, this.x, this.step);
  }

  static parse(input: Input, uri: UriParser, output?: Output<string>,
               c1: number = 0, x: number = 0, step: number = 1): Parser<UriHost> {
    let c = 0;
    output = output || Utf8.decodedString();
    while (step <= 4) {
      while (input.isCont() && (c = input.head(), Base10.isDigit(c))) {
        input = input.step();
        output = output.write(c);
        x = 10 * x + Base10.decodeDigit(c);
      }
      if (input.isCont()) {
        if (c === 46/*'.'*/ && step < 4 && x <= 255) {
          input = input.step();
          output = output.write(c);
          x = 0;
          step += 1;
        } else if (!Uri.isHostChar(c) && c !== 37/*'%'*/ && step === 4 && x <= 255) {
          return Parser.done(uri.hostIPv4(output.bind()));
        } else {
          x = 0;
          step = 5;
          break;
        }
      } else if (!input.isEmpty()) {
        if (step === 4 && x <= 255) {
          return Parser.done(uri.hostIPv4(output.bind()));
        } else {
          return Parser.done(uri.hostName(output.bind()));
        }
      } else {
        break;
      }
    }
    do {
      if (step === 5) {
        while (input.isCont() && (c = input.head(), Uri.isHostChar(c))) {
          input = input.step();
          output!.write(Uri.toLowerCase(c));
        }
        if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 6;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.hostName(output!.bind()));
        }
      }
      if (step === 6) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 7;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 7) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          output!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 5;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriHostAddressParser(uri, output, c1, x, step);
  }
}
