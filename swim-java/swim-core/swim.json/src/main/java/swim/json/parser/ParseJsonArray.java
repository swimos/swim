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
        input.step();
        if (builder == null) {
          builder = form.arrayBuilder();
        }
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('[', input));
      }
    }
    if (step == 2) {
      builder = Assume.nonNull(builder);
      while (input.isCont()) {
        c = input.head();
        if (parser.isWhitespace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == ']') {
          input.step();
          return Parse.done(form.buildArray(builder));
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected(']', input));
      }
    }
    do {
      if (step == 3) {
        builder = Assume.nonNull(builder);
        if (parseElement == null) {
          parseElement = parser.parseExpr(input, form.elementForm());
        } else {
          parseElement = parseElement.consume(input);
        }
        if (parseElement.isDone()) {
          builder = form.appendElement(builder, parseElement.get());
          parseElement = null;
          step = 4;
        } else if (parseElement.isError()) {
          return parseElement.asError();
        }
      }
      if (step == 4) {
        builder = Assume.nonNull(builder);
        while (input.isCont()) {
          c = input.head();
          if (parser.isWhitespace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 3;
            continue;
          } else if (c == ']') {
            input.step();
            return Parse.done(form.buildArray(builder));
          } else {
            return Parse.error(Diagnostic.expected("',' or ']'", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
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
