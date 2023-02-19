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
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.codec.ParseException;
import swim.util.Assume;
import swim.waml.WamlForm;
import swim.waml.WamlParser;
import swim.waml.WamlStringForm;

@Internal
public final class ParseWamlString<B, T> extends Parse<T> {

  final WamlParser parser;
  final WamlStringForm<B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final int quotes;
  final int escape;
  final int step;

  public ParseWamlString(WamlParser parser, WamlStringForm<B, ? extends T> form,
                         @Nullable B builder, @Nullable Parse<WamlForm<T>> parseAttr,
                         int quotes, int escape, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseAttr = parseAttr;
    this.quotes = quotes;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlString.parse(input, this.parser, this.form,
                                 this.builder, this.parseAttr,
                                 this.quotes, this.escape, this.step);
  }

  public static <B, T> Parse<T> parse(Input input, WamlParser parser,
                                      WamlStringForm<B, ? extends T> form,
                                      @Nullable B builder,
                                      @Nullable Parse<WamlForm<T>> parseAttr,
                                      int quotes, int escape, int step) {
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
          form = Assume.conforms(parseAttr.getNonNull());
          parseAttr = null;
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
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
      while (input.isCont()) {
        c = input.head();
        if (parser.isWhitespace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == '"') {
        input.step();
        quotes = 1;
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("string", input));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        if (input.head() == '"') {
          input.step();
          quotes = 2;
          step = 6;
        } else {
          builder = form.stringBuilder();
          step = 7;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.message("unclosed string", input));
      }
    }
    if (step == 6) {
      if (input.isCont() && input.head() == '"') {
        input.step();
        builder = form.stringBuilder();
        quotes = 3;
        step = 7;
      } else if (input.isReady()) {
        if (builder == null) {
          builder = form.stringBuilder();
        }
        try {
          return Parse.done(form.buildString(builder));
        } catch (ParseException cause) {
          return Parse.error(Diagnostic.message(cause.getMessage(), input), cause);
        }
      }
    }
    string: do {
      if (step == 7) {
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
            if (quotes == 1) {
              try {
                return Parse.done(form.buildString(builder));
              } catch (ParseException cause) {
                return Parse.error(Diagnostic.message(cause.getMessage(), input), cause);
              }
            } else {
              step = 8;
            }
          } else if (c == '\\') {
            input.step();
            step = 10;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.message("unclosed string", input));
        }
      }
      if (step == 8) {
        builder = Assume.nonNull(builder);
        if (input.isCont()) {
          if (input.head() == '"') {
            input.step();
            step = 9;
          } else {
            builder = form.appendCodePoint(builder, '"');
            step = 7;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.message("unclosed string", input));
        }
      }
      if (step == 9) {
        builder = Assume.nonNull(builder);
        if (input.isCont()) {
          if (input.head() == '"') {
            input.step();
            try {
              return Parse.done(form.buildTextBlock(builder));
            } catch (ParseException cause) {
              return Parse.error(Diagnostic.message(cause.getMessage(), input), cause);
            }
          } else {
            builder = form.appendCodePoint(builder, '"');
            builder = form.appendCodePoint(builder, '"');
            step = 7;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.message("unclosed string", input));
        }
      }
      if (step == 10) {
        builder = Assume.nonNull(builder);
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' || c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            input.step();
            builder = form.appendCodePoint(builder, c);
            step = 7;
            continue;
          } else if (c == 'b') {
            input.step();
            builder = form.appendCodePoint(builder, '\b');
            step = 7;
            continue;
          } else if (c == 'f') {
            input.step();
            builder = form.appendCodePoint(builder, '\f');
            step = 7;
            continue;
          } else if (c == 'n') {
            input.step();
            builder = form.appendCodePoint(builder, '\n');
            step = 7;
            continue;
          } else if (c == 'r') {
            input.step();
            builder = form.appendCodePoint(builder, '\r');
            step = 7;
            continue;
          } else if (c == 't') {
            input.step();
            builder = form.appendCodePoint(builder, '\t');
            step = 7;
            continue;
          } else if (c == 'u') {
            input.step();
            step = 11;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 11 && step < 15) {
        builder = Assume.nonNull(builder);
        do {
          if (input.isCont()) {
            c = input.head();
            if (Base16.isDigit(c)) {
              input.step();
              escape = 16 * escape + Base16.decodeDigit(c);
              if (step <= 10) {
                step += 1;
                continue;
              } else {
                builder = form.appendCodePoint(builder, escape);
                escape = 0;
                step = 7;
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
    return new ParseWamlString<B, T>(parser, form, builder, parseAttr,
                                     quotes, escape, step);
  }

}
