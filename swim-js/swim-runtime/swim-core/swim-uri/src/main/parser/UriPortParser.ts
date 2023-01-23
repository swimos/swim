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

import {Input, Parser, Base10} from "@swim/codec";
import type {UriPort} from "../UriPort";
import type {UriParser} from "./UriParser";

/** @internal */
export class UriPortParser extends Parser<UriPort> {
  private readonly uri: UriParser;
  private readonly number: number | undefined;

  constructor(uri: UriParser, number?: number) {
    super();
    this.uri = uri;
    this.number = number;
  }

  override feed(input: Input): Parser<UriPort> {
    return UriPortParser.parse(input, this.uri, this.number);
  }

  static parse(input: Input, uri: UriParser, number: number = 0): Parser<UriPort> {
    let c = 0;
    while (input.isCont() && (c = input.head(), Base10.isDigit(c))) {
      input = input.step();
      number = 10 * number + Base10.decodeDigit(c);
    }
    if (!input.isEmpty()) {
      return Parser.done(uri.port(number));
    }
    return new UriPortParser(uri, number);
  }
}
