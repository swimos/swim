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
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface JsonNumberParser<@Covariant T> extends JsonParser<T> {

  @Override
  default JsonNumberParser<T> numberParser() throws JsonException {
    return this;
  }

  @Nullable T fromInteger(long value) throws JsonException;

  @Nullable T fromHexadecimal(long value, int digits) throws JsonException;

  @Nullable T fromBigInteger(String value) throws JsonException;

  @Nullable T fromDecimal(String value) throws JsonException;

  @Override
  default Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parseNumber(input, options);
  }

  default Parse<T> parseNumber(Input input, JsonParserOptions options) {
    return ParseJsonNumber.parse(input, this, null, 1, 0L, 0, 1);
  }

  @Override
  default <U> JsonNumberParser<U> map(Function<? super T, ? extends U> mapper) {
    return new JsonNumberParserMapper<T, U>(this, mapper);
  }

  static <T> JsonNumberParser<T> dummy() {
    return Assume.conforms(JsonDummyNumberParser.INSTANCE);
  }

}

final class JsonNumberParserMapper<S, T> implements JsonNumberParser<T>, WriteSource {

  final JsonNumberParser<S> parser;
  final Function<? super S, ? extends T> mapper;

  JsonNumberParserMapper(JsonNumberParser<S> parser, Function<? super S, ? extends T> mapper) {
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
  public JsonStringParser<?, T> stringParser() throws JsonException {
    return this.parser.stringParser().map(this.mapper);
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
  public @Nullable T fromInteger(long value) throws JsonException {
    try {
      return this.mapper.apply(this.parser.fromInteger(value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public @Nullable T fromHexadecimal(long value, int digits) throws JsonException {
    try {
      return this.mapper.apply(this.parser.fromHexadecimal(value, digits));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public @Nullable T fromBigInteger(String value) throws JsonException {
    try {
      return this.mapper.apply(this.parser.fromBigInteger(value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public @Nullable T fromDecimal(String value) throws JsonException {
    try {
      return this.mapper.apply(this.parser.fromDecimal(value));
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
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parser.parse(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseNumber(Input input, JsonParserOptions options) {
    return this.parser.parseNumber(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> JsonNumberParser<U> map(Function<? super T, ? extends U> mapper) {
    return new JsonNumberParserMapper<S, U>(this.parser, this.mapper.andThen(mapper));
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

final class JsonDummyNumberParser<T> implements JsonNumberParser<T>, WriteSource {

  private JsonDummyNumberParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable T fromInteger(long value) {
    return null;
  }

  @Override
  public @Nullable T fromHexadecimal(long value, int digits) {
    return null;
  }

  @Override
  public @Nullable T fromBigInteger(String value) {
    return null;
  }

  @Override
  public @Nullable T fromDecimal(String value) {
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonNumberParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final JsonDummyNumberParser<Object> INSTANCE =
      new JsonDummyNumberParser<Object>();

}

final class ParseJsonNumber<T> extends Parse<T> {

  final JsonNumberParser<T> parser;
  final @Nullable StringBuilder builder;
  final int sign;
  final long value;
  final int digits;
  final int step;

  ParseJsonNumber(JsonNumberParser<T> parser, @Nullable StringBuilder builder,
                  int sign, long value, int digits, int step) {
    this.parser = parser;
    this.builder = builder;
    this.sign = sign;
    this.value = value;
    this.digits = digits;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonNumber.parse(input, this.parser, this.builder, this.sign,
                                 this.value, this.digits, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  static <T> Parse<T> parse(Input input, JsonNumberParser<T> parser,
                            @Nullable StringBuilder builder, int sign,
                            long value, int digits, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          step = 5;
        } else { // c >= '1' && c <= '9'
          value = (long) (sign * (c - '0'));
          input.step();
          step = 3;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        final long newValue = 10L * value + (long) (sign * (c - '0'));
        if (newValue / value >= 10L) {
          value = newValue;
          input.step();
        } else {
          builder = new StringBuilder();
          builder.append(value);
          break;
        }
      }
      if (input.isCont()) {
        if (c >= '0' && c <= '9') {
          step = 4;
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        try {
          return Parse.done(parser.fromInteger(value));
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 4) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == '.' || c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        if (c == '.') {
          step = 7;
        } else { // c == 'E' || c == 'e'
          step = 9;
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.fromBigInteger(Assume.nonNull(builder).toString()));
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 5) {
      if (input.isCont() && (((c = input.head()) == 'x' && sign > 0 && value == 0L)
                            || c == '.' || c == 'E' || c == 'e')) {
        if (c == 'x') {
          input.step();
          step = 6;
        } else { // c == '.' || c == 'E' || c == 'e'
          builder = new StringBuilder();
          if (sign < 0 && value == 0L) {
            builder.append('-').append('0');
          } else {
            builder.append(value);
          }
          builder.appendCodePoint(c);
          input.step();
          if (c == '.') {
            step = 7;
          } else { // c == 'E' || c == 'e'
            step = 9;
          }
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.fromInteger(value));
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 6) {
      while (input.isCont() && Base16.isDigit(c = input.head())) {
        value = (value << 4) | (long) Base16.decodeDigit(c);
        digits += 1;
        input.step();
      }
      if (input.isReady()) {
        if (digits > 0) {
          try {
            return Parse.done(parser.fromHexadecimal(value, digits));
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
    }
    if (step == 7) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 8;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 8) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 9;
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.fromDecimal(Assume.nonNull(builder).toString()));
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 9) {
      if (input.isCont()) {
        if ((c = input.head()) == '+' || c == '-') {
          Assume.nonNull(builder).appendCodePoint(c);
          input.step();
        }
        step = 10;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 10) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 11;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 11) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(parser.fromDecimal(Assume.nonNull(builder).toString()));
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonNumber<T>(parser, builder, sign, value, digits, step);
  }

}
