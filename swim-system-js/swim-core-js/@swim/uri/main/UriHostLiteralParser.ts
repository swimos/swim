// Copyright 2015-2020 SWIM.AI inc.
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

import {Input, Output, Parser, Diagnostic, Utf8} from "@swim/codec";
import {Uri} from "./Uri";
import {UriHost} from "./UriHost";
import {UriParser} from "./UriParser";

/** @hidden */
export class UriHostLiteralParser extends Parser<UriHost> {
  private readonly uri: UriParser;
  private readonly output: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, output?: Output<string>, step?: number) {
    super();
    this.uri = uri;
    this.output = output;
    this.step = step;
  }

  feed(input: Input): Parser<UriHost> {
    return UriHostLiteralParser.parse(input, this.uri, this.output, this.step);
  }

  static parse(input: Input, uri: UriParser, output?: Output<string>, step: number = 1): Parser<UriHost> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && input.head() === 91/*'['*/) {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(91/*'['*/, input));
      }
    }
    if (step === 2) {
      output = output || Utf8.decodedString();
      while (input.isCont() && (c = input.head(), Uri.isHostChar(c) || c === 58/*':'*/)) {
        input = input.step();
        output = output.write(Uri.toLowerCase(c));
      }
      if (input.isCont() && c === 93/*']'*/) {
        input = input.step();
        return Parser.done(uri.hostIPv6(output.bind()));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(93/*']'*/, input));
      }
    }
    return new UriHostLiteralParser(uri, output, step);
  }
}
UriParser.HostLiteralParser = UriHostLiteralParser;
