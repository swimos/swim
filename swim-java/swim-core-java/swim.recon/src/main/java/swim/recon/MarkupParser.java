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

package swim.recon;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.util.Builder;

final class MarkupParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Builder<I, V> builder;
  final Output<V> textOutput;
  final Parser<V> valueParser;
  final int step;

  MarkupParser(ReconParser<I, V> recon, Builder<I, V> builder, Output<V> textOutput,
               Parser<V> valueParser, int step) {
    this.recon = recon;
    this.builder = builder;
    this.textOutput = textOutput;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.textOutput, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder,
                                Output<V> textOutput, Parser<V> valueParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '[') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected('[', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('[', input));
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (c != '@' && c != '[' && c != '\\' && c != ']' && c != '{' && c != '}') {
            input = input.step();
            if (textOutput == null) {
              textOutput = recon.textOutput();
            }
            textOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ']') {
            input = input.step();
            if (builder == null) {
              builder = recon.recordBuilder();
            }
            if (textOutput != null) {
              builder.add(recon.item(textOutput.bind()));
            }
            return done(builder.bind());
          } else if (c == '@') {
            if (builder == null) {
              builder = recon.recordBuilder();
            }
            if (textOutput != null) {
              builder.add(recon.item(textOutput.bind()));
              textOutput = null;
            }
            valueParser = recon.parseInlineItem(input);
            step = 3;
          } else if (c == '{') {
            if (builder == null) {
              builder = recon.recordBuilder();
            }
            if (textOutput != null) {
              builder.add(recon.item(textOutput.bind()));
              textOutput = null;
            }
            valueParser = recon.parseRecord(input, builder);
            step = 4;
          } else if (c == '[') {
            if (builder == null) {
              builder = recon.recordBuilder();
            }
            if (textOutput != null) {
              builder.add(recon.item(textOutput.bind()));
              textOutput = null;
            }
            valueParser = recon.parseMarkup(input, builder);
            step = 4;
          } else if (c == '\\') {
            input = input.step();
            step = 5;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          builder.add(recon.item(valueParser.bind()));
          valueParser = null;
          step = 2;
          continue;
        } else if (valueParser.isError()) {
          return valueParser;
        }
      }
      if (step == 4) {
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          valueParser = null;
          step = 2;
          continue;
        } else if (valueParser.isError()) {
          return valueParser;
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (textOutput == null) {
            textOutput = recon.textOutput();
          }
          if (c == '"' || c == '$' || c == '\'' || c == '/' || c == '@' || c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            input = input.step();
            textOutput.write(c);
            step = 2;
          } else if (c == 'b') {
            input = input.step();
            textOutput.write('\b');
            step = 2;
          } else if (c == 'f') {
            input = input.step();
            textOutput.write('\f');
            step = 2;
          } else if (c == 'n') {
            input = input.step();
            textOutput.write('\n');
            step = 2;
          } else if (c == 'r') {
            input = input.step();
            textOutput.write('\r');
            step = 2;
          } else if (c == 't') {
            input = input.step();
            textOutput.write('\t');
            step = 2;
          } else {
            return error(Diagnostic.expected("escape character", input));
          }
          continue;
        } else if (input.isDone()) {
          return error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new MarkupParser<I, V>(recon, builder, textOutput, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Builder<I, V> builder) {
    return parse(input, recon, builder, null, null, 1);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, null, null, null, 1);
  }
}
