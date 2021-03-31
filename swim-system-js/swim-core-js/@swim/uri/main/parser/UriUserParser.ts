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

import {Input, Output, Parser, Diagnostic, Base16, Utf8} from "@swim/codec";
import {Uri} from "../Uri";
import type {UriUser} from "../UriUser";
import type {UriParser} from "./UriParser";

/** @hidden */
export class UriUserParser extends Parser<UriUser> {
  private readonly uri: UriParser;
  private readonly usernameOutput: Output<string> | undefined;
  private readonly passwordOutput: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, usernameOutput?: Output<string>,
              passwordOutput?: Output<string>, c1?: number, step?: number) {
    super();
    this.uri = uri;
    this.usernameOutput = usernameOutput;
    this.passwordOutput = passwordOutput;
    this.c1 = c1;
    this.step = step;
  }

  feed(input: Input): Parser<UriUser> {
    return UriUserParser.parse(input, this.uri, this.usernameOutput,
                               this.passwordOutput, this.c1, this.step);
  }

  static parse(input: Input, uri: UriParser, usernameOutput?: Output<string>,
               passwordOutput?: Output<string>, c1: number = 0, step: number = 1): Parser<UriUser> {
    let c = 0;
    do {
      if (step === 1) {
        usernameOutput = usernameOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isUserChar(c))) {
          input = input.step();
          usernameOutput!.write(c);
        }
        if (input.isCont() && c === 58/*':'*/) {
          input = input.step();
          step = 4;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.user(usernameOutput.bind()));
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
          usernameOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 4) {
        passwordOutput = passwordOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isUserInfoChar(c))) {
          input = input.step();
          passwordOutput.write(c);
        }
        if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.user(usernameOutput!.bind(), passwordOutput.bind()));
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
          passwordOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 4;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriUserParser(uri, usernameOutput, passwordOutput, c1, step);
  }
}
