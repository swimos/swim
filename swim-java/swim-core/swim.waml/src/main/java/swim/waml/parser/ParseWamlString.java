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
import swim.util.Assume;
import swim.waml.WamlException;
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
      if (input.isCont() && input.head() == '"') {
        quotes = 1;
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("string", input));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        if (input.head() == '"') {
          quotes = 2;
          input.step();
          step = 6;
        } else {
          try {
            builder = form.stringBuilder();
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          step = 7;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.message("unclosed string", input));
      }
    }
    if (step == 6) {
      if (input.isCont() && input.head() == '"') {
        try {
          builder = form.stringBuilder();
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        quotes = 3;
        input.step();
        step = 7;
      } else if (input.isReady()) {
        try {
          if (builder == null) {
            builder = form.stringBuilder();
          }
          return Parse.done(form.buildString(builder));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    do {
      if (step == 7) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c != '"' && c != '\\') {
          try {
            builder = form.appendCodePoint(Assume.nonNull(builder), c);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
        }
        if (input.isCont()) {
          if (c == '"') {
            if (quotes == 1) {
              final T value;
              try {
                value = form.buildString(Assume.nonNull(builder));
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              input.step();
              return Parse.done(value);
            } else {
              input.step();
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
        if (input.isCont()) {
          if (input.head() == '"') {
            input.step();
            step = 9;
          } else {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '"');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            step = 7;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.message("unclosed string", input));
        }
      }
      if (step == 9) {
        if (input.isCont()) {
          if (input.head() == '"') {
            final T value;
            try {
              value = form.buildTextBlock(Assume.nonNull(builder));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(value);
          } else {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '"');
              builder = form.appendCodePoint(builder, '"');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            step = 7;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.message("unclosed string", input));
        }
      }
      if (step == 10) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), c);
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'b') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\b');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'f') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\f');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'n') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\n');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'r') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\r');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 't') {
            try {
              builder = form.appendCodePoint(Assume.nonNull(builder), '\t');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
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
      if (step == 11) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 12;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 12) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 13;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 13) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 14;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 14) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          try {
            builder = form.appendCodePoint(Assume.nonNull(builder), escape);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          escape = 0;
          input.step();
          step = 7;
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
    return new ParseWamlString<B, T>(parser, form, builder, parseAttr,
                                     quotes, escape, step);
  }

}
