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

import {Builder} from "@swim/util";
import {Input, Parser} from "@swim/codec";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class LambdaFuncParser<I, V> extends Parser<V> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _builder: Builder<I, V> | undefined;
  private readonly _bindingsParser: Parser<V> | undefined;
  private readonly _templateParser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>, bindingsParser?: Parser<V>,
              templateParser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._builder = builder;
    this._bindingsParser = bindingsParser;
    this._templateParser = templateParser;
    this._step = step;
  }

  feed(input: Input): Parser<V> {
    return LambdaFuncParser.parse(input, this._recon, this._builder, this._bindingsParser,
                                  this._templateParser, this._step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     bindingsParser?: Parser<V>, templateParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      if (!bindingsParser) {
        bindingsParser = recon.parseConditionalOperator(input, builder);
      }
      while (bindingsParser.isCont() && !input.isEmpty()) {
        bindingsParser = bindingsParser.feed(input);
      }
      if (bindingsParser.isDone()) {
        step = 2;
      } else if (bindingsParser.isError()) {
        return bindingsParser.asError();
      }
    }
    if (step === 2) {
      if (input.isCont()) {
        c = input.head();
        if (c === 62/*'>'*/) {
          // leading '=' consumed by ComparisonOperatorParser
          input = input.step();
          step = 3;
        } else {
          return bindingsParser!;
        }
      } else if (input.isDone()) {
        return bindingsParser!;
      }
    }
    if (step === 3) {
      if (!templateParser) {
        templateParser = recon.parseConditionalOperator(input);
      }
      while (templateParser.isCont() && !input.isEmpty()) {
        templateParser = templateParser.feed(input);
      }
      if (templateParser.isDone()) {
        const bindings = bindingsParser!.bind();
        const template = templateParser.bind();
        return Parser.done(recon.lambda(bindings, template));
      } else if (templateParser.isError()) {
        return templateParser.asError();
      }
    }
    return new LambdaFuncParser<I, V>(recon, builder, bindingsParser, templateParser, step);
  }
}
