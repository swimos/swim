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

package swim.json.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.json.JsonArrayForm;
import swim.json.JsonException;
import swim.json.JsonParser;
import swim.util.Assume;

@Internal
public final class ParseJsonArray<E, B, T> extends Parse<T> {

  final JsonParser parser;
  final JsonArrayForm<E, B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<E> parseElement;
  final int step;

  public ParseJsonArray(JsonParser parser, JsonArrayForm<E, B, ? extends T> form,
                        @Nullable B builder, @Nullable Parse<E> parseElement, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseElement = parseElement;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonArray.parse(input, this.parser, this.form, this.builder,
                                this.parseElement, this.step);
  }

  public static <E, B, T> Parse<T> parse(Input input, JsonParser parser,
                                         JsonArrayForm<E, B, ? extends T> form,
                                         @Nullable B builder,
                                         @Nullable Parse<E> parseElement, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '[') {
        if (builder == null) {
          try {
            builder = form.arrayBuilder();
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('[', input));
      }
    }
    if (step == 2) {
      while (input.isCont() && parser.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == ']') {
          final T array;
          try {
            array = form.buildArray(Assume.nonNull(builder));
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          return Parse.done(array);
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected(']', input));
      }
    }
    do {
      if (step == 3) {
        if (parseElement == null) {
          parseElement = parser.parseExpr(input, form.elementForm());
        } else {
          parseElement = parseElement.consume(input);
        }
        if (parseElement.isDone()) {
          try {
            builder = form.appendElement(Assume.nonNull(builder), parseElement.getUnchecked());
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseElement = null;
          step = 4;
        } else if (parseElement.isError()) {
          return parseElement.asError();
        }
      }
      if (step == 4) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 5;
          } else if (c == ']') {
            final T array;
            try {
              array = form.buildArray(Assume.nonNull(builder));
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(array);
          } else {
            return Parse.error(Diagnostic.expected("',' or ']'", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 5) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonArray<E, B, T>(parser, form, builder, parseElement, step);
  }

}
