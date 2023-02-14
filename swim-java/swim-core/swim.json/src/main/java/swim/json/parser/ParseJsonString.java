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
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.codec.ParseException;
import swim.json.JsonStringForm;
import swim.util.Assume;

@Internal
public final class ParseJsonString<B, T> extends Parse<T> {

  final JsonStringForm<B, ? extends T> form;
  final @Nullable B builder;
  final int escape;
  final int step;

  public ParseJsonString(JsonStringForm<B, ? extends T> form,
                         @Nullable B builder, int escape, int step) {
    this.form = form;
    this.builder = builder;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonString.parse(input, this.form, this.builder,
                                 this.escape, this.step);
  }

  public static <B, T> Parse<T> parse(Input input, JsonStringForm<B, ? extends T> form,
                                      @Nullable B builder, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '"') {
        input.step();
        builder = form.stringBuilder();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("string", input));
      }
    }
    string: do {
      if (step == 2) {
        builder = Assume.nonNull(builder);
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c != '"' && c != '\\') {
            input.step();
            builder = form.appendCodePoint(builder, c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"') {
            input.step();
            try {
              return Parse.done(form.buildString(builder));
            } catch (ParseException cause) {
              return Parse.error(Diagnostic.message(cause.getMessage(), input), cause);
            }
          } else if (c == '\\') {
            input.step();
            step = 3;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.message("unclosed string", input));
        }
      }
      if (step == 3) {
        builder = Assume.nonNull(builder);
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '\\') {
            input.step();
            builder = form.appendCodePoint(builder, c);
            step = 2;
            continue;
          } else if (c == 'b') {
            input.step();
            builder = form.appendCodePoint(builder, '\b');
            step = 2;
            continue;
          } else if (c == 'f') {
            input.step();
            builder = form.appendCodePoint(builder, '\f');
            step = 2;
            continue;
          } else if (c == 'n') {
            input.step();
            builder = form.appendCodePoint(builder, '\n');
            step = 2;
            continue;
          } else if (c == 'r') {
            input.step();
            builder = form.appendCodePoint(builder, '\r');
            step = 2;
            continue;
          } else if (c == 't') {
            input.step();
            builder = form.appendCodePoint(builder, '\t');
            step = 2;
            continue;
          } else if (c == 'u') {
            input.step();
            step = 4;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 4 && step < 8) {
        builder = Assume.nonNull(builder);
        do {
          if (input.isCont()) {
            c = input.head();
            if (Base16.isDigit(c)) {
              input.step();
              escape = 16 * escape + Base16.decodeDigit(c);
              if (step <= 6) {
                step += 1;
                continue;
              } else {
                builder = form.appendCodePoint(builder, escape);
                escape = 0;
                step = 2;
                continue string;
              }
            } else {
              return Parse.error(Diagnostic.expected("hex digit", input));
            }
          } else if (input.isDone()) {
            return Parse.error(Diagnostic.expected("hex digit", input));
          }
          break;
        } while (true);
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonString<B, T>(form, builder, escape, step);
  }

}
