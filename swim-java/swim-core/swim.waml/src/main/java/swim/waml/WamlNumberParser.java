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
public interface WamlNumberParser<@Covariant T> extends WamlParser<T> {

  @Override
  default WamlNumberParser<T> numberParser() throws WamlException {
    return this;
  }

  @Nullable T fromInteger(@Nullable Object attrs, long value) throws WamlException;

  @Nullable T fromHexadecimal(@Nullable Object attrs, long value, int digits) throws WamlException;

  @Nullable T fromBigInteger(@Nullable Object attrs, String value) throws WamlException;

  @Nullable T fromDecimal(@Nullable Object attrs, String value) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseNumber(input, options, null);
  }

  default Parse<T> parseNumber(Input input, WamlParserOptions options,
                               @Nullable Parse<?> parseAttrs) {
    return ParseWamlNumber.parse(input, this, options, parseAttrs, null, 1, 0L, 0, 1);
  }

  @Override
  default <U> WamlNumberParser<U> map(Function<? super T, ? extends U> mapper) {
    return new WamlNumberParserMapper<T, U>(this, mapper);
  }

  static <T> WamlNumberParser<T> dummy() {
    return Assume.conforms(WamlDummyNumberParser.INSTANCE);
  }

}

final class WamlNumberParserMapper<S, T> implements WamlNumberParser<T>, WriteSource {

  final WamlNumberParser<S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlNumberParserMapper(WamlNumberParser<S> parser, Function<? super S, ? extends T> mapper) {
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
  public WamlStringParser<?, T> stringParser() throws WamlException {
    return this.parser.stringParser().map(this.mapper);
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
  public @Nullable T fromInteger(@Nullable Object attrs, long value) throws WamlException {
    try {
      return this.mapper.apply(this.parser.fromInteger(attrs, value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T fromHexadecimal(@Nullable Object attrs, long value, int digits) throws WamlException {
    try {
      return this.mapper.apply(this.parser.fromHexadecimal(attrs, value, digits));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T fromBigInteger(@Nullable Object attrs, String value) throws WamlException {
    try {
      return this.mapper.apply(this.parser.fromBigInteger(attrs, value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T fromDecimal(@Nullable Object attrs, String value) throws WamlException {
    try {
      return this.mapper.apply(this.parser.fromDecimal(attrs, value));
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
  public Parse<T> parseNumber(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parser.parseNumber(input, options, parseAttrs).map(this.mapper);
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
  public <U> WamlNumberParser<U> map(Function<? super T, ? extends U> mapper) {
    return new WamlNumberParserMapper<S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyNumberParser<T> implements WamlNumberParser<T>, WriteSource {

  private WamlDummyNumberParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable T fromInteger(@Nullable Object attrs, long value) {
    return null;
  }

  @Override
  public @Nullable T fromHexadecimal(@Nullable Object attrs, long value, int digits) {
    return null;
  }

  @Override
  public @Nullable T fromBigInteger(@Nullable Object attrs, String value) {
    return null;
  }

  @Override
  public @Nullable T fromDecimal(@Nullable Object attrs, String value) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlNumberParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyNumberParser<Object> INSTANCE =
      new WamlDummyNumberParser<Object>();

}

final class ParseWamlNumber<T> extends Parse<T> {

  final WamlNumberParser<T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable StringBuilder builder;
  final int sign;
  final long value;
  final int digits;
  final int step;

  ParseWamlNumber(WamlNumberParser<T> parser, WamlParserOptions options,
                  @Nullable Parse<?> parseAttrs, @Nullable StringBuilder builder,
                  int sign, long value, int digits, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.sign = sign;
    this.value = value;
    this.digits = digits;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlNumber.parse(input, this.parser, this.options, this.parseAttrs, this.builder,
                                 this.sign, this.value, this.digits, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  static <T> Parse<T> parse(Input input, WamlNumberParser<T> parser,
                            WamlParserOptions options, @Nullable Parse<?> parseAttrs,
                            @Nullable StringBuilder builder, int sign, long value,
                            int digits, int step) {
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
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 5) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          step = 8;
        } else { // c >= '1' && c <= '9'
          value = (long) (sign * (c - '0'));
          input.step();
          step = 6;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 6) {
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
          step = 7;
        } else {
          step = 8;
        }
      } else if (input.isDone()) {
        try {
          return Parse.done(parser.fromInteger(Assume.nonNull(parseAttrs).getUnchecked(), value));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 7) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == '.' || c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        if (c == '.') {
          step = 10;
        } else { // c == 'E' || c == 'e'
          step = 12;
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.fromBigInteger(Assume.nonNull(parseAttrs).getUnchecked(),
                                                  Assume.nonNull(builder).toString()));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 8) {
      if (input.isCont() && (((c = input.head()) == 'x' && sign > 0 && value == 0L)
                            || c == '.' || c == 'E' || c == 'e')) {
        if (c == 'x') {
          input.step();
          step = 9;
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
            step = 10;
          } else { // c == 'E' || c == 'e'
            step = 12;
          }
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.fromInteger(Assume.nonNull(parseAttrs).getUnchecked(), value));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 9) {
      while (input.isCont() && Base16.isDigit(c = input.head())) {
        value = (value << 4) | (long) Base16.decodeDigit(c);
        digits += 1;
        input.step();
      }
      if (input.isReady()) {
        if (digits > 0) {
          try {
            return Parse.done(parser.fromHexadecimal(Assume.nonNull(parseAttrs).getUnchecked(),
                                                     value, digits));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
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
      if (input.isCont() && (c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 12;
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.fromDecimal(Assume.nonNull(parseAttrs).getUnchecked(),
                                               Assume.nonNull(builder).toString()));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 12) {
      if (input.isCont()) {
        if ((c = input.head()) == '+' || c == '-') {
          Assume.nonNull(builder).appendCodePoint(c);
          input.step();
        }
        step = 13;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 13) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 14;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 14) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(parser.fromDecimal(Assume.nonNull(parseAttrs).getUnchecked(),
                                               Assume.nonNull(builder).toString()));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlNumber<T>(parser, options, parseAttrs, builder,
                                  sign, value, digits, step);
  }

}
