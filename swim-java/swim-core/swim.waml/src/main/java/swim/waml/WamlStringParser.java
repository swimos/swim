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

package swim.waml;

import java.util.function.Function;
import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.term.Term;
import swim.term.TermParserOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface WamlStringParser<B, @Covariant T> extends WamlParser<T> {

  @Override
  default WamlStringParser<?, T> stringParser() throws WamlException {
    return this;
  }

  B stringBuilder(@Nullable Object attrs) throws WamlException;

  B appendCodePoint(B builder, int c) throws WamlException;

  @Nullable T buildString(@Nullable Object attrs, B builder) throws WamlException;

  default @Nullable T buildTextBlock(@Nullable Object attrs, B builder) throws WamlException {
    return this.buildString(attrs, builder);
  }

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseString(input, options, null);
  }

  default Parse<T> parseString(Input input, WamlParserOptions options,
                               @Nullable Parse<?> parseAttrs) {
    return ParseWamlString.parse(input, this, options, parseAttrs, null, 0, 0, 1);
  }

  @Override
  default <U> WamlStringParser<B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlStringParserMapper<B, T, U>(this, mapper);
  }

  static <B, T> WamlStringParser<B, T> dummy() {
    return Assume.conforms(WamlDummyStringParser.INSTANCE);
  }

}

final class WamlStringParserMapper<B, S, T> implements WamlStringParser<B, T>, WriteSource {

  final WamlStringParser<B, S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlStringParserMapper(WamlStringParser<B, S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.parser.typeName();
  }

  @Override
  public WamlIdentifierParser<T> identifierParser() throws WamlException {
    return this.parser.identifierParser().map(this.mapper);
  }

  @Override
  public WamlNumberParser<T> numberParser() throws WamlException {
    return this.parser.numberParser().map(this.mapper);
  }

  @Override
  public WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    return this.parser.markupParser().map(this.mapper);
  }

  @Override
  public WamlArrayParser<?, ?, T> arrayParser() throws WamlException {
    return this.parser.arrayParser().map(this.mapper);
  }

  @Override
  public WamlObjectParser<?, ?, T> objectParser() throws WamlException {
    return this.parser.objectParser().map(this.mapper);
  }

  @Override
  public WamlTupleParser<?, ?, T> tupleParser() throws WamlException {
    return this.parser.tupleParser().map(this.mapper);
  }

  @Override
  public B stringBuilder(@Nullable Object attrs) throws WamlException {
    return this.parser.stringBuilder(attrs);
  }

  @Override
  public B appendCodePoint(B builder, int c) throws WamlException {
    return this.parser.appendCodePoint(builder, c);
  }

  @Override
  public @Nullable T buildString(@Nullable Object attrs, B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildString(attrs, builder));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T buildTextBlock(@Nullable Object attrs, B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildTextBlock(attrs, builder));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) throws WamlException {
    try {
      return this.mapper.apply(this.parser.initializer(attrs));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parser.parse(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseString(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parser.parseString(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseBlock(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseBlock(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseInline(Input input, WamlParserOptions options) {
    return this.parser.parseInline(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseTuple(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseTuple(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> WamlStringParser<B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlStringParserMapper<B, S, U>(this.parser, this.mapper.andThen(mapper));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.parser)
            .beginInvoke("map")
            .appendArgument(this.mapper)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WamlDummyStringParser<B, T> implements WamlStringParser<B, T>, WriteSource {

  private WamlDummyStringParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B stringBuilder(@Nullable Object attrs) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendCodePoint(@Nullable B builder, int c) {
    return null;
  }

  @Override
  public @Nullable T buildString(@Nullable Object attrs, @Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlStringParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyStringParser<Object, Object> INSTANCE =
      new WamlDummyStringParser<Object, Object>();

}

final class ParseWamlString<B, T> extends Parse<T> {

  final WamlStringParser<B, T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable B builder;
  final int quotes;
  final int escape;
  final int step;

  ParseWamlString(WamlStringParser<B, T> parser, WamlParserOptions options,
                  @Nullable Parse<?> parseAttrs, @Nullable B builder,
                  int quotes, int escape, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.quotes = quotes;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlString.parse(input, this.parser, this.options, this.parseAttrs,
                                 this.builder, this.quotes, this.escape, this.step);
  }

  static <B, T> Parse<T> parse(Input input, WamlStringParser<B, T> parser,
                               WamlParserOptions options, @Nullable Parse<?> parseAttrs,
                               @Nullable B builder, int quotes, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        if (parseAttrs == null) {
          parseAttrs = Parse.done();
        }
        step = 4;
      }
    }
    if (step == 2) {
      if (parseAttrs == null) {
        parseAttrs = parser.attrsParser().parseAttrs(input, options);
      } else {
        parseAttrs = parseAttrs.consume(input);
      }
      if (parseAttrs.isDone()) {
        step = 3;
      } else if (parseAttrs.isError()) {
        return parseAttrs.asError();
      }
    }
    if (step == 3) {
      while (input.isCont() && Term.isSpace(input.head())) {
        input.step();
      }
      if (input.isReady()) {
        step = 4;
      }
    }
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
            builder = parser.stringBuilder(Assume.nonNull(parseAttrs).getUnchecked());
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
          builder = parser.stringBuilder(Assume.nonNull(parseAttrs).getUnchecked());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        quotes = 3;
        input.step();
        step = 7;
      } else if (input.isReady()) {
        try {
          if (builder == null) {
            builder = parser.stringBuilder(Assume.nonNull(parseAttrs).getUnchecked());
          }
          return Parse.done(parser.buildString(Assume.nonNull(parseAttrs).getUnchecked(), builder));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    do {
      if (step == 7) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c != '"' && c != '\\') {
          try {
            builder = parser.appendCodePoint(Assume.nonNull(builder), c);
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
                value = parser.buildString(Assume.nonNull(parseAttrs).getUnchecked(),
                                           Assume.nonNull(builder));
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
              builder = parser.appendCodePoint(Assume.nonNull(builder), '"');
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
              value = parser.buildTextBlock(Assume.nonNull(parseAttrs).getUnchecked(),
                                            Assume.nonNull(Assume.nonNull(builder)));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(value);
          } else {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '"');
              builder = parser.appendCodePoint(builder, '"');
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
              builder = parser.appendCodePoint(Assume.nonNull(builder), c);
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'b') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\b');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'f') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\f');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'n') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\n');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 'r') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\r');
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 7;
            continue;
          } else if (c == 't') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\t');
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
            builder = parser.appendCodePoint(Assume.nonNull(builder), escape);
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
    return new ParseWamlString<B, T>(parser, options, parseAttrs, builder, quotes, escape, step);
  }

}
