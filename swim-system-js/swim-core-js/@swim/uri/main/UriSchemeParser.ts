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
import {UriScheme} from "./UriScheme";
import {UriParser} from "./UriParser";

/** @hidden */
export class UriSchemeParser extends Parser<UriScheme> {
  private readonly uri: UriParser;
  private readonly output: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, output?: Output<string>, step?: number) {
    super();
    this.uri = uri;
    this.output = output;
    this.step = step;
  }

  feed(input: Input): Parser<UriScheme> {
    return UriSchemeParser.parse(input, this.uri, this.output, this.step);
  }

  static parse(input: Input, uri: UriParser, output?: Output<string>, step: number = 1): Parser<UriScheme> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && (c = input.head(), Uri.isAlpha(c))) {
        input = input.step();
        output = output || Utf8.decodedString();
        output = output.write(Uri.toLowerCase(c));
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("scheme", input));
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Uri.isSchemeChar(c))) {
        input = input.step();
        output!.write(Uri.toLowerCase(c));
      }
      if (!input.isEmpty()) {
        return Parser.done(uri.scheme(output!.bind()));
      }
    }
    return new UriSchemeParser(uri, output, step);
  }
}
UriParser.SchemeParser = UriSchemeParser;
