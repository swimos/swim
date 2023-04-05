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
import swim.waml.WamlArrayForm;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlArray<E, B, T> extends Parse<T> {

  final WamlParser parser;
  final WamlArrayForm<E, B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final @Nullable Parse<E> parseElement;
  final int step;

  public ParseWamlArray(WamlParser parser, WamlArrayForm<E, B, ? extends T> form,
                        @Nullable B builder, @Nullable Parse<WamlForm<T>> parseAttr,
                        @Nullable Parse<E> parseElement, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseAttr = parseAttr;
    this.parseElement = parseElement;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlArray.parse(input, this.parser, this.form, this.builder,
                                this.parseAttr, this.parseElement, this.step);
  }

  public static <E, B, T> Parse<T> parse(Input input, WamlParser parser,
                                         WamlArrayForm<E, B, ? extends T> form,
                                         @Nullable B builder,
                                         @Nullable Parse<WamlForm<T>> parseAttr,
                                         @Nullable Parse<E> parseElement, int step) {
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
      if (input.isCont() && input.head() == '[') {
        if (builder == null) {
          try {
            builder = form.arrayBuilder();
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('[', input));
      }
    }
    do {
      if (step == 5) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ']') {
            final T array;
            try {
              array = form.buildArray(Assume.nonNull(builder));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(array);
          } else if (c == '#') {
            input.step();
            step = 8;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 6) {
        if (parseElement == null) {
          parseElement = parser.parseExpr(input, form.elementForm());
        } else {
          parseElement = parseElement.consume(input);
        }
        if (parseElement.isDone()) {
          try {
            builder = form.appendElement(Assume.nonNull(builder), parseElement.getUnchecked());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseElement = null;
          step = 7;
        } else if (parseElement.isError()) {
          return parseElement.asError();
        }
      }
      if (step == 7) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',' || parser.isNewline(c)) {
            input.step();
            step = 5;
            continue;
          } else if (c == '#') {
            input.step();
            step = 8;
          } else if (c == ']') {
            final T array;
            try {
              array = form.buildArray(Assume.nonNull(builder));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(array);
          } else {
            return Parse.error(Diagnostic.expected("']', ',' or newline", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 8) {
        while (input.isCont() && !parser.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 5;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlArray<E, B, T>(parser, form, builder, parseAttr,
                                       parseElement, step);
  }

}
