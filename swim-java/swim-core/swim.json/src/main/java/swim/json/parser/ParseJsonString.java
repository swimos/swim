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
import swim.json.JsonException;
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
        try {
          builder = form.stringBuilder();
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("string", input));
      }
    }
    do {
      if (step == 2) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c != '"' && c != '\\') {
          try {
            builder = form.appendCodePoint(Assume.nonNull(builder), c);
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
        }
        if (input.isCont()) {
          if (c == '"') {
            final T value;
            try {
              value = form.buildString(Assume.nonNull(builder));
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(value);
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
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '\\') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), c);
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'b') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\b');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'f') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\f');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'n') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\n');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'r') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\r');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 't') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\t');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
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
      if (step == 4) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 5) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 6;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 7;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 7) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          try {
            builder = form.appendCodePoint(Assume.nonNull(builder), escape);
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          escape = 0;
          input.step();
          step = 2;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonString<B, T>(form, builder, escape, step);
  }

}
