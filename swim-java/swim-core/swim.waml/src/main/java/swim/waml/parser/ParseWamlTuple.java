// Copyright 2015-2022 Swim.inc
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

package swim.waml.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.util.Assume;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlTuple<T> extends Parse<T> {

  final WamlParser parser;
  final WamlForm<? extends T> form;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final @Nullable Parse<? extends T> parseBlock;
  final int step;

  public ParseWamlTuple(WamlParser parser, WamlForm<? extends T> form,
                        @Nullable Parse<WamlForm<T>> parseAttr,
                        @Nullable Parse<? extends T> parseBlock, int step) {
    this.parser = parser;
    this.form = form;
    this.parseAttr = parseAttr;
    this.parseBlock = parseBlock;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlTuple.parse(input, this.parser, this.form, this.parseAttr,
                                this.parseBlock, this.step);
  }

  public static <T> Parse<T> parse(Input input, WamlParser parser,
                                   WamlForm<? extends T> form,
                                   @Nullable Parse<WamlForm<T>> parseAttr,
                                   @Nullable Parse<? extends T> parseBlock,
                                   int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        step = 4;
      }
    }
    do {
      if (step == 2) {
        if (parseAttr == null) {
          parseAttr = Assume.conforms(parser.parseAttr(input, form));
        } else {
          parseAttr = parseAttr.consume(input);
        }
        if (parseAttr.isDone()) {
          form = Assume.conforms(parseAttr.getNonNullUnchecked());
          parseAttr = null;
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '@') {
          step = 2;
          continue;
        } else if (input.isReady()) {
          step = 4;
        }
      }
      break;
    } while (true);
    if (step == 4) {
      if (input.isCont() && input.head() == '(') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('(', input));
      }
    }
    if (step == 5) {
      if (parseBlock == null) {
        parseBlock = parser.parseBlock(input, form);
      } else {
        parseBlock = parseBlock.consume(input);
      }
      if (parseBlock.isDone()) {
        step = 6;
      } else if (parseBlock.isError()) {
        return parseBlock.asError();
      }
    }
    if (step == 6) {
      while (input.isCont() && parser.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == ')') {
        input.step();
        return Assume.conformsNonNull(parseBlock);
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(')', input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlTuple<T>(parser, form, parseAttr, parseBlock, step);
  }

}
