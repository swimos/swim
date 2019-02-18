// Copyright 2015-2019 SWIM.AI inc.
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
import {ColorChannel} from "./ColorChannel";

/** @hidden */
export class ColorChannelParser extends Parser<ColorChannel> {
  private readonly valueParser: Parser<number> | undefined;
  private readonly step: number | undefined;

  constructor(valueParser?: Parser<number>, step?: number) {
    super();
    this.valueParser = valueParser;
    this.step = step;
  }

  feed(input: Input): Parser<ColorChannel> {
    return ColorChannelParser.parse(input, this.valueParser, this.step);
  }

  static parse(input: Input, valueParser?: Parser<number>, step: number = 1): Parser<ColorChannel> {
    if (step === 1) {
      if (!valueParser) {
        valueParser = Base10.parseNumber(input);
      } else {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 2;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 2) {
      if (input.isCont() && input.head() === 37/*'%'*/) {
        input = input.step();
        return Parser.done(new ColorChannel(valueParser!.bind(), "%"));
      } else if (!input.isEmpty()) {
        return Parser.done(new ColorChannel(valueParser!.bind()));
      }
    }
    return new ColorChannelParser(valueParser, step);
  }
}
ColorChannel.Parser = ColorChannelParser;
