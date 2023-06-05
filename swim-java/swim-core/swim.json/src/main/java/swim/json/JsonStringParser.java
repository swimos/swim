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

package swim.json;

import java.util.function.Function;
import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.term.TermParserOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToSource;

@Public
@Since("5.0")
public interface JsonStringParser<B, @Covariant T> extends JsonParser<T> {

  @Override
  default JsonStringParser<?, T> stringParser() throws JsonException {
    return this;
  }

  B stringBuilder() throws JsonException;

  B appendCodePoint(B builder, int c) throws JsonException;

  @Nullable T buildString(B builder) throws JsonException;

  @Override
  default Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parseString(input, options);
  }

  default Parse<T> parseString(Input input, JsonParserOptions options) {
    return ParseJsonString.parse(input, this, null, 0, 1);
  }

  @Override
  default <U> JsonStringParser<B, U> map(Function<? super T, ? extends U> mapper) {
    return new JsonStringParserMapper<B, T, U>(this, mapper);
  }

  static <B, T> JsonStringParser<B, T> dummy() {
    return Assume.conforms(JsonDummyStringParser.INSTANCE);
  }

}

final class JsonStringParserMapper<B, S, T> implements JsonStringParser<B, T>, ToSource {

  final JsonStringParser<B, S> parser;
  final Function<? super S, ? extends T> mapper;

  JsonStringParserMapper(JsonStringParser<B, S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.parser.typeName();
  }

  @Override
  public JsonIdentifierParser<T> identifierParser() throws JsonException {
    return this.parser.identifierParser().map(this.mapper);
  }

  @Override
  public JsonNumberParser<T> numberParser() throws JsonException {
    return this.parser.numberParser().map(this.mapper);
  }

  @Override
  public JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this.parser.arrayParser().map(this.mapper);
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this.parser.objectParser().map(this.mapper);
  }

  @Override
  public B stringBuilder() throws JsonException {
    return this.parser.stringBuilder();
  }

  @Override
  public B appendCodePoint(B builder, int c) throws JsonException {
    return this.parser.appendCodePoint(builder, c);
  }

  @Override
  public @Nullable T buildString(B builder) throws JsonException {
    try {
      return this.mapper.apply(this.parser.buildString(builder));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public @Nullable T initializer() throws JsonException {
    try {
      return this.mapper.apply(this.parser.initializer());
    } catch (Throwable cause) {
      if (Result.isFatal(cause) || cause instanceof JsonException) {
        throw cause;
      }
      throw new JsonException(cause);
    }
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parser.parse(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseString(Input input, JsonParserOptions options) {
    return this.parser.parseString(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> JsonStringParser<B, U> map(Function<? super T, ? extends U> mapper) {
    return new JsonStringParserMapper<B, S, U>(this.parser, this.mapper.andThen(mapper));
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
    return this.toSource();
  }

}

final class JsonDummyStringParser<B, T> implements JsonStringParser<B, T>, ToSource {

  private JsonDummyStringParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B stringBuilder() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendCodePoint(@Nullable B builder, int c) {
    return null;
  }

  @Override
  public @Nullable T buildString(@Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonStringParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final JsonDummyStringParser<Object, Object> INSTANCE =
      new JsonDummyStringParser<Object, Object>();

}

final class ParseJsonString<B, T> extends Parse<T> {

  final JsonStringParser<B, T> parser;
  final @Nullable B builder;
  final int escape;
  final int step;

  ParseJsonString(JsonStringParser<B, T> parser, @Nullable B builder, int escape, int step) {
    this.parser = parser;
    this.builder = builder;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonString.parse(input, this.parser, this.builder, this.escape, this.step);
  }

  static <B, T> Parse<T> parse(Input input, JsonStringParser<B, T> parser,
                               @Nullable B builder, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '"') {
        try {
          builder = parser.stringBuilder();
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
            builder = parser.appendCodePoint(Assume.nonNull(builder), c);
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
        }
        if (input.isCont()) {
          if (c == '"') {
            final T value;
            try {
              value = parser.buildString(Assume.nonNull(builder));
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
              builder = parser.appendCodePoint(Assume.nonNull(builder), c);
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'b') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\b');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'f') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\f');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'n') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\n');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 'r') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\r');
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 2;
            continue;
          } else if (c == 't') {
            try {
              builder = parser.appendCodePoint(Assume.nonNull(builder), '\t');
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
            builder = parser.appendCodePoint(Assume.nonNull(builder), escape);
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
    return new ParseJsonString<B, T>(parser, builder, escape, step);
  }

}
