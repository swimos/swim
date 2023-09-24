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
public interface WamlArrayParser<E, B, @Covariant T> extends WamlParser<T> {

  @Override
  default WamlArrayParser<?, ?, T> arrayParser() throws WamlException {
    return this;
  }

  WamlParser<E> elementParser();

  B arrayBuilder(@Nullable Object attrs) throws WamlException;

  B appendElement(B builder, @Nullable E element) throws WamlException;

  @Nullable T buildArray(@Nullable Object attrs, B builder) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseArray(input, options, null);
  }

  default Parse<T> parseArray(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return ParseWamlArray.parse(input, this, options, parseAttrs, null, null, 1);
  }

  @Override
  default <U> WamlArrayParser<E, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlArrayParserMapper<E, B, T, U>(this, mapper);
  }

  static <E, B, T> WamlArrayParser<E, B, T> dummy() {
    return Assume.conforms(WamlDummyArrayParser.INSTANCE);
  }

}

final class WamlArrayParserMapper<E, B, S, T> implements WamlArrayParser<E, B, T>, WriteSource {

  final WamlArrayParser<E, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlArrayParserMapper(WamlArrayParser<E, B, S> parser, Function<? super S, ? extends T> mapper) {
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
  public WamlStringParser<?, T> stringParser() throws WamlException {
    return this.parser.stringParser().map(this.mapper);
  }

  @Override
  public WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    return this.parser.markupParser().map(this.mapper);
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
  public WamlParser<E> elementParser() {
    return this.parser.elementParser();
  }

  @Override
  public B arrayBuilder(@Nullable Object attrs) throws WamlException {
    return this.parser.arrayBuilder(attrs);
  }

  @Override
  public B appendElement(B builder, @Nullable E element) throws WamlException {
    return this.parser.appendElement(builder, element);
  }

  @Override
  public @Nullable T buildArray(@Nullable Object attrs, B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildArray(attrs, builder));
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
  public Parse<T> parseArray(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseArray(input, options, parseAttrs).map(this.mapper);
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
  public <U> WamlArrayParser<E, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlArrayParserMapper<E, B, S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyArrayParser<E, B, T> implements WamlArrayParser<E, B, T>, WriteSource {

  private WamlDummyArrayParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public WamlParser<E> elementParser() {
    return WamlParser.dummy();
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B arrayBuilder(@Nullable Object attrs) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendElement(@Nullable B builder, @Nullable E element) {
    return null;
  }

  @Override
  public @Nullable T buildArray(@Nullable Object attrs, @Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlArrayParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyArrayParser<Object, Object, Object> INSTANCE =
      new WamlDummyArrayParser<Object, Object, Object>();

}

final class ParseWamlArray<E, B, T> extends Parse<T> {

  final WamlArrayParser<E, B, T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable B builder;
  final @Nullable Parse<E> parseElement;
  final int step;

  ParseWamlArray(WamlArrayParser<E, B, T> parser, WamlParserOptions options,
                 @Nullable Parse<?> parseAttrs, @Nullable B builder,
                 @Nullable Parse<E> parseElement, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.parseElement = parseElement;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlArray.parse(input, this.parser, this.options, this.parseAttrs,
                                this.builder, this.parseElement, this.step);
  }

  static <E, B, T> Parse<T> parse(Input input, WamlArrayParser<E, B, T> parser,
                                  WamlParserOptions options, @Nullable Parse<?> parseAttrs,
                                  @Nullable B builder, @Nullable Parse<E> parseElement, int step) {
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
      if (input.isCont() && input.head() == '[') {
        try {
          builder = parser.arrayBuilder(Assume.nonNull(parseAttrs).getUnchecked());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('[', input));
      }
    }
    do {
      if (step == 5) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ']') {
            final T array;
            try {
              array = parser.buildArray(Assume.nonNull(parseAttrs).getUnchecked(),
                                        Assume.nonNull(builder));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(array);
          } else if (c == '#') {
            input.step();
            step = 8;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 6) {
        if (parseElement == null) {
          parseElement = parser.elementParser().parse(input, options);
        } else {
          parseElement = parseElement.consume(input);
        }
        if (parseElement.isDone()) {
          try {
            builder = parser.appendElement(Assume.nonNull(builder), parseElement.getUnchecked());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseElement = null;
          step = 7;
        } else if (parseElement.isError()) {
          return parseElement.asError();
        }
      }
      if (step == 7) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',' || Term.isNewline(c)) {
            input.step();
            step = 5;
            continue;
          } else if (c == '#') {
            input.step();
            step = 8;
          } else if (c == ']') {
            final T array;
            try {
              array = parser.buildArray(Assume.nonNull(parseAttrs).getUnchecked(),
                                        Assume.nonNull(builder));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(array);
          } else {
            return Parse.error(Diagnostic.expected("']', ',' or newline", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 8) {
        while (input.isCont() && !Term.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 5;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlArray<E, B, T>(parser, options, parseAttrs, builder, parseElement, step);
  }

}
