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
import {Input, Output, Parser, Diagnostic} from "@swim/codec";
import {ReconParser} from "./ReconParser";

/** @hidden */
export class MarkupParser<I, V> extends Parser<V> {
  private readonly _recon: ReconParser<I, V>;
  private readonly _builder: Builder<I, V> | undefined;
  private readonly _textOutput: Output<V> | undefined;
  private readonly _valueParser: Parser<V> | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconParser<I, V>, builder?: Builder<I, V>, textOutput?: Output<V>,
              valueParser?: Parser<V>, step?: number) {
    super();
    this._recon = recon;
    this._builder = builder;
    this._textOutput = textOutput;
    this._valueParser = valueParser;
    this._step = step;
  }

  feed(input: Input): Parser<V> {
    return MarkupParser.parse(input, this._recon, this._builder, this._textOutput,
                              this._valueParser, this._step);
  }

  static parse<I, V>(input: Input, recon: ReconParser<I, V>, builder?: Builder<I, V>,
                     textOutput?: Output<V>, valueParser?: Parser<V>, step: number = 1): Parser<V> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        c = input.head();
        if (c === 91/*'['*/) {
          input = input.step();
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected(91/*'['*/, input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected(91/*'['*/, input));
      }
    }
    do {
      if (step === 2) {
        while (input.isCont()) {
          c = input.head();
          if (c !== 64/*'@'*/ && c !== 91/*'['*/ && c !== 92/*'\\'*/ && c !== 93/*']'*/
              && c !== 123/*'{'*/ && c !== 125/*'}'*/) {
            input = input.step();
            textOutput = textOutput || recon.textOutput();
            textOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c === 93/*']'*/) {
            input = input.step();
            builder = builder || recon.recordBuilder();
            if (textOutput !== void 0) {
              builder.push(recon.item(textOutput.bind()));
            }
            return Parser.done(builder.bind());
          } else if (c === 64/*'@'*/) {
            builder = builder || recon.recordBuilder();
            if (textOutput !== void 0) {
              builder.push(recon.item(textOutput.bind()));
              textOutput = void 0;
            }
            valueParser = recon.parseInlineItem(input);
            step = 3;
          } else if (c === 123/*'{'*/) {
            builder = builder || recon.recordBuilder();
            if (textOutput !== void 0) {
              builder.push(recon.item(textOutput.bind()));
              textOutput = void 0;
            }
            valueParser = recon.parseRecord(input, builder);
            step = 4;
          } else if (c === 91/*'['*/) {
            builder = builder || recon.recordBuilder();
            if (textOutput !== void 0) {
              builder.push(recon.item(textOutput.bind()));
              textOutput = void 0;
            }
            valueParser = recon.parseMarkup(input, builder);
            step = 4;
          } else if (c === 92/*'\\'*/) {
            input = input.step();
            step = 5;
          } else {
            return Parser.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 3) {
        while (valueParser!.isCont() && !input.isEmpty()) {
          valueParser = valueParser!.feed(input);
        }
        if (valueParser!.isDone()) {
          builder!.push(recon.item(valueParser!.bind()));
          valueParser = void 0;
          step = 2;
          continue;
        } else if (valueParser!.isError()) {
          return valueParser!;
        }
      }
      if (step === 4) {
        while (valueParser!.isCont() && !input.isEmpty()) {
          valueParser = valueParser!.feed(input);
        }
        if (valueParser!.isDone()) {
          valueParser = void 0;
          step = 2;
          continue;
        } else if (valueParser!.isError()) {
          return valueParser!;
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          c = input.head();
          textOutput = textOutput || recon.textOutput();
          if (c === 34/*'"'*/ || c === 36/*'$'*/ || c === 39/*'\''*/ || c === 47/*'/'*/
              || c === 64/*'@'*/ || c === 91/*'['*/ || c === 92/*'\\'*/ || c === 93/*']'*/
              || c === 123/*'{'*/ || c === 125/*'}'*/) {
            input = input.step();
            textOutput.write(c);
            step = 2;
          } else if (c === 98/*'b'*/) {
            input = input.step();
            textOutput.write(8/*'\b'*/);
            step = 2;
          } else if (c === 102/*'f'*/) {
            input = input.step();
            textOutput.write(12/*'\f'*/);
            step = 2;
          } else if (c === 110/*'n'*/) {
            input = input.step();
            textOutput.write(10/*'\n'*/);
            step = 2;
          } else if (c === 114/*'r'*/) {
            input = input.step();
            textOutput.write(13/*'\r'*/);
            step = 2;
          } else if (c === 116/*'t'*/) {
            input = input.step();
            textOutput.write(9/*'\t'*/);
            step = 2;
          } else {
            return Parser.error(Diagnostic.expected("escape character", input));
          }
          continue;
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    return new MarkupParser<I, V>(recon, builder, textOutput, valueParser, step);
  }
}
