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

import {Input, Output, Parser, Diagnostic, Base16, Utf8} from "@swim/codec";
import {Uri} from "../Uri";
import type {UriQuery} from "../UriQuery";
import type {UriQueryBuilder} from "../UriQueryBuilder";
import type {UriParser} from "./UriParser";

/** @internal */
export class UriQueryParser extends Parser<UriQuery> {
  private readonly uri: UriParser;
  private readonly builder: UriQueryBuilder | undefined;
  private readonly keyOutput: Output<string> | undefined;
  private readonly valueOutput: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, builder?: UriQueryBuilder, keyOutput?: Output<string>,
              valueOutput?: Output<string>, c1?: number, step?: number) {
    super();
    this.uri = uri;
    this.builder = builder;
    this.keyOutput = keyOutput;
    this.valueOutput = valueOutput;
    this.c1 = c1;
    this.step = step;
  }

  override feed(input: Input): Parser<UriQuery> {
    return UriQueryParser.parse(input, this.uri, this.builder, this.keyOutput,
                                this.valueOutput, this.c1, this.step);
  }

  static parse(input: Input, uri: UriParser, builder?: UriQueryBuilder, keyOutput?: Output<string>,
               valueOutput?: Output<string>, c1: number = 0, step: number = 1): Parser<UriQuery> {
    let c = 0;
    do {
      if (step === 1) {
        keyOutput = keyOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isParamChar(c))) {
          input = input.step();
          keyOutput.write(c);
        }
        if (input.isCont() && c === 61/*'='*/) {
          input = input.step();
          step = 4;
        } else if (input.isCont() && c === 38/*'&'*/) {
          input = input.step();
          builder = builder || uri.queryBuilder();
          builder.addParam(keyOutput.bind());
          keyOutput = void 0;
          continue;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          builder = builder || uri.queryBuilder();
          builder.addParam(keyOutput.bind());
          return Parser.done(builder.bind());
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
          keyOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 4) {
        valueOutput = valueOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isParamChar(c) || c === 61/*'='*/)) {
          input = input.step();
          valueOutput.write(c);
        }
        if (input.isCont() && c === 38/*'&'*/) {
          input = input.step();
          builder = builder || uri.queryBuilder();
          builder.addParam(keyOutput!.bind(), valueOutput.bind());
          keyOutput = void 0;
          valueOutput = void 0;
          step = 1;
          continue;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          builder = builder || uri.queryBuilder();
          builder.addParam(keyOutput!.bind(), valueOutput.bind());
          return Parser.done(builder.bind());
        }
      }
      if (step === 5) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 6;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 6) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          valueOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 4;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriQueryParser(uri, builder, keyOutput, valueOutput, c1, step);
  }
}
