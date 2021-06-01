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

import type {Builder} from "@swim/util";
import {Input, Parser} from "@swim/codec";
import type {ReconParser} from "./ReconParser";

/** @hidden */
export class InlineItemParser<I, V> extends Parser<V> {
  private readonly recon: ReconParser<I, V>;
  private readonly builder: Builder<I, V> | undefined;
  private readonly fieldParser: Parser<I> | undefined;
  private readonly valueParser: Parser<V> | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>, fieldParser?: Parser<I>,
              valueParser?: Parser<V>, step?: number) {
    super();
    this.recon = recon;
    this.builder = builder;
    this.fieldParser = fieldParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  override feed(input: Input): Parser<V> {
    return InlineItemParser.parse(input, this.recon, this.builder, this.fieldParser,
                                  this.valueParser, this.step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     fieldParser?: Parser<I>,  valueParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (c === 64/*'@'*/) {
          fieldParser = recon.parseAttr(input);
          step = 2;
        } else if (c === 123/*'{'*/) {
          if (builder !== void 0) {
            valueParser = recon.parseRecord(input, builder);
            step = 5;
          } else {
            valueParser = recon.parseRecord(input);
            step = 4;
          }
        } else if (c === 91/*'['*/) {
          if (builder !== void 0) {
            valueParser = recon.parseMarkup(input, builder);
            step = 5;
          } else {
            valueParser = recon.parseMarkup(input);
            step = 4;
          }
        } else if (builder === void 0) {
          return Parser.done(recon.extant());
        } else {
          return Parser.done(builder.bind());
        }
      } else if (input.isDone()) {
        if (builder === void 0) {
          return Parser.done(recon.extant());
        } else {
          return Parser.done(builder.bind());
        }
      }
    }
    if (step === 2) {
      while (fieldParser!.isCont() && !input.isEmpty()) {
        fieldParser = fieldParser!.feed(input);
      }
      if (fieldParser!.isDone()) {
        builder = builder || recon.valueBuilder();
        builder.push(fieldParser!.bind());
        fieldParser = void 0;
        step = 3;
      } else if (fieldParser!.isError()) {
        return fieldParser!.asError();
      }
    }
    if (step === 3) {
      if (input.isCont()) {
        c = input.head();
        if (c === 123/*'{'*/) {
          valueParser = recon.parseRecord(input, builder);
          step = 5;
        } else if (c === 91/*'['*/) {
          valueParser = recon.parseMarkup(input, builder);
          step = 5;
        } else {
          return Parser.done(builder!.bind());
        }
      } else if (input.isDone()) {
        return Parser.done(builder!.bind());
      }
    }
    if (step === 4) {
      while (valueParser!.isCont() && !input.isEmpty()) {
        valueParser = valueParser!.feed(input);
      }
      if (valueParser!.isDone()) {
        builder = builder || recon.valueBuilder();
        builder.push(recon.item(valueParser!.bind()));
        return Parser.done(builder.bind());
      } else if (valueParser!.isError()) {
        return valueParser!;
      }
    }
    if (step === 5) {
      while (valueParser!.isCont() && !input.isEmpty()) {
        valueParser = valueParser!.feed(input);
      }
      if (valueParser!.isDone()) {
        return Parser.done(builder!.bind());
      } else if (valueParser!.isError()) {
        return valueParser!;
      }
    }
    return new InlineItemParser<I, V>(recon, builder, fieldParser, valueParser, step);
  }
}
