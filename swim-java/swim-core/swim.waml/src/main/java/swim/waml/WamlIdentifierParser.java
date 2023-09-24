// Copyright 2015-2023 Nstream, inc.
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
public interface WamlIdentifierParser<@Covariant T> extends WamlParser<T> {

  @Override
  default WamlIdentifierParser<T> identifierParser() throws WamlException {
    return this;
  }

  @Nullable T fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseIdentifier(input, options, null);
  }

  default Parse<T> parseIdentifier(Input input, WamlParserOptions options,
                                   @Nullable Parse<?> parseAttrs) {
    return ParseWamlIdentifier.parse(input, this, options, parseAttrs, null, 1);
  }

  @Override
  default <U> WamlIdentifierParser<U> map(Function<? super T, ? extends U> mapper) {
    return new WamlIdentifierParserMapper<T, U>(this, mapper);
  }

  static <T> WamlIdentifierParser<T> dummy() {
    return Assume.conforms(WamlDummyIdentifierParser.INSTANCE);
  }

}

final class WamlIdentifierParserMapper<S, T> implements WamlIdentifierParser<T>, WriteSource {

  final WamlIdentifierParser<S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlIdentifierParserMapper(WamlIdentifierParser<S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.parser.typeName();
  }

  @Override
  public WamlNumberParser<T> numberParser() throws WamlException {
    return this.parser.numberParser().map(this.mapper);
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
  public @Nullable T fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) throws WamlException {
    try {
      return this.mapper.apply(this.parser.fromIdentifier(attrs, value, options));
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
  public Parse<T> parseIdentifier(Input input, WamlParserOptions options,
                                  @Nullable Parse<?> parseAttrs) {
    return this.parser.parseIdentifier(input, options, parseAttrs).map(this.mapper);
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
  public <U> WamlIdentifierParser<U> map(Function<? super T, ? extends U> mapper) {
    return new WamlIdentifierParserMapper<S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyIdentifierParser<T> implements WamlIdentifierParser<T>, WriteSource {

  private WamlDummyIdentifierParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable T fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlIdentifierParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyIdentifierParser<Object> INSTANCE =
      new WamlDummyIdentifierParser<Object>();

}

final class ParseWamlIdentifier<T> extends Parse<T> {

  final WamlIdentifierParser<T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable StringBuilder builder;
  final int step;

  ParseWamlIdentifier(WamlIdentifierParser<T> parser, WamlParserOptions options,
                      @Nullable Parse<?> parseAttrs, @Nullable StringBuilder builder, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlIdentifier.parse(input, this.parser, this.options,
                                     this.parseAttrs, this.builder, this.step);
  }

  static <T> Parse<T> parse(Input input, WamlIdentifierParser<T> parser,
                            WamlParserOptions options, @Nullable Parse<?> parseAttrs,
                            @Nullable StringBuilder builder, int step) {
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
      if (input.isCont() && Term.isIdentifierStartChar(c = input.head())) {
        builder = new StringBuilder();
        builder.appendCodePoint(c);
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("identifier", input));
      }
    }
    if (step == 5) {
      while (input.isCont() && Term.isIdentifierChar(c = input.head())) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(parser.fromIdentifier(Assume.nonNull(parseAttrs).getUnchecked(),
                                                  Assume.nonNull(builder).toString(), options));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlIdentifier<T>(parser, options, parseAttrs, builder, step);
  }

}
