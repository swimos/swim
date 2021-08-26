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

import {Input, Parser} from "@swim/codec";
import type {UriHost} from "../UriHost";
import type {UriParser} from "./UriParser";

/** @hidden */
export class UriHostParser extends Parser<UriHost> {
  private readonly uri: UriParser;

  constructor(uri: UriParser) {
    super();
    this.uri = uri;
  }

  override feed(input: Input): Parser<UriHost> {
    return UriHostParser.parse(input, this.uri);
  }

  static parse(input: Input, uri: UriParser): Parser<UriHost> {
    if (input.isCont()) {
      const c = input.head();
      if (c === 91/*'['*/) {
        return uri.parseHostLiteral(input);
      } else {
        return uri.parseHostAddress(input);
      }
    } else if (input.isDone()) {
      return Parser.done(uri.hostName(""));
    }
    return new UriHostParser(uri);
  }
}
