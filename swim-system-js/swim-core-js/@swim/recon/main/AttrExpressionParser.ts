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

import {Builder} from "@swim/util";
import {Input, Parser} from "@swim/codec";
import {Recon} from "./Recon";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class AttrExpressionParser<I, V> extends Parser<V> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _builder: Builder<I, V> | undefined;
  private readonly _fieldParser: Parser<I> | undefined;
  private readonly _valueParser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>,
              fieldParser?: Parser<I>, valueParser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._builder = builder;
    this._fieldParser = fieldParser;
    this._valueParser = valueParser;
    this._step = step;
  }

  feed(input: Input): Parser<V> {
    return AttrExpressionParser.parse(input, this._recon, this._builder,
                                      this._fieldParser, this._valueParser, this._step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     fieldParser?: Parser<I>, valueParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont()) {
          if (c === 64/*'@'*/) {
            step = 2;
          } else if (c === 123/*'{'*/ || c === 91/*'['*/) {
            builder = builder || recon.recordBuilder();
            step = 5;
          } else if (c === 40/*'('*/) {
            step = 4;
          } else if (c === 33/*'!'*/ || c === 34/*'"'*/ || c === 36/*'$'*/ || c === 37/*'%'*/
                  || c === 39/*'\''*/ || c === 43/*'+'*/ || c === 45/*'-'*/
                  || c >= 48/*'0'*/ && c <= 57/*'9'*/ || c === 126/*'~'*/
                  || Recon.isIdentStartChar(c)) {
            step = 3;
          } else if (!builder) {
            return Parser.done(recon.extant());
          } else {
            return Parser.done(builder.bind());
          }
        } else if (input.isDone()) {
          if (!builder) {
            return Parser.done(recon.extant());
          } else {
            return Parser.done(builder.bind());
          }
        }
      }
      if (step === 2) {
        if (!fieldParser) {
          fieldParser = recon.parseAttr(input);
        }
        while (fieldParser.isCont() && !input.isEmpty()) {
          fieldParser = fieldParser.feed(input);
        }
        if (fieldParser.isDone()) {
          builder = builder || recon.recordBuilder();
          builder.push(fieldParser.bind());
          fieldParser = void 0;
          step = 1;
          continue;
        } else if (fieldParser.isError()) {
          return fieldParser.asError();
        }
      }
      if (step === 3) {
        if (!valueParser) {
          valueParser = recon.parseAdditiveOperator(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          builder = builder || recon.valueBuilder();
          builder.push(recon.item(valueParser.bind()));
          valueParser = void 0;
          step = 6;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 4) {
        if (!valueParser) {
          valueParser = recon.parseAdditiveOperator(input, builder);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          if (!builder) {
            builder = recon.valueBuilder();
            builder.push(recon.item(valueParser.bind()));
          }
          valueParser = void 0;
          step = 6;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 5) {
        if (!valueParser) {
          valueParser = recon.parseAdditiveOperator(input, builder);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          valueParser = void 0;
          step = 6;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step === 6) {
        while (input.isCont() && (c = input.head(), Recon.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont()) {
          if (c === 64/*'@'*/) {
            step = 1;
            continue;
          } else {
            return Parser.done(builder!.bind());
          }
        } else if (input.isDone()) {
          return Parser.done(builder!.bind());
        }
      }
      break;
    } while (true);
    return new AttrExpressionParser<I, V>(recon, builder, fieldParser, valueParser, step);
  }
}
