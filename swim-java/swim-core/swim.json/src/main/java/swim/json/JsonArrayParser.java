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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.term.Term;
import swim.term.TermParserOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToSource;

@Public
@Since("5.0")
public interface JsonArrayParser<E, B, @Covariant T> extends JsonParser<T> {

  @Override
  default JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this;
  }

  JsonParser<E> elementParser();

  B arrayBuilder() throws JsonException;

  B appendElement(B builder, @Nullable E element) throws JsonException;

  @Nullable T buildArray(B builder) throws JsonException;

  @Override
  default Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parseArray(input, options);
  }

  default Parse<T> parseArray(Input input, JsonParserOptions options) {
    return ParseJsonArray.parse(input, this, options, null, null, 1);
  }

  @Override
  default <U> JsonArrayParser<E, B, U> map(Function<? super T, ? extends U> mapper) {
    return new JsonArrayParserMapper<E, B, T, U>(this, mapper);
  }

  static <E, B, T> JsonArrayParser<E, B, T> dummy() {
    return Assume.conforms(JsonDummyArrayParser.INSTANCE);
  }

}

final class JsonArrayParserMapper<E, B, S, T> implements JsonArrayParser<E, B, T>, ToSource {

  final JsonArrayParser<E, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  JsonArrayParserMapper(JsonArrayParser<E, B, S> parser, Function<? super S, ? extends T> mapper) {
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
  public JsonStringParser<?, T> stringParser() throws JsonException {
    return this.parser.stringParser().map(this.mapper);
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this.parser.objectParser().map(this.mapper);
  }

  @Override
  public JsonParser<E> elementParser() {
    return this.parser.elementParser();
  }

  @Override
  public B arrayBuilder() throws JsonException {
    return this.parser.arrayBuilder();
  }

  @Override
  public B appendElement(B builder, @Nullable E element) throws JsonException {
    return this.parser.appendElement(builder, element);
  }

  @Override
  public @Nullable T buildArray(B builder) throws JsonException {
    try {
      return this.mapper.apply(this.parser.buildArray(builder));
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
  public Parse<T> parseArray(Input input, JsonParserOptions options) {
    return this.parser.parseArray(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> JsonArrayParser<E, B, U> map(Function<? super T, ? extends U> mapper) {
    return new JsonArrayParserMapper<E, B, S, U>(this.parser, this.mapper.andThen(mapper));
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

final class JsonDummyArrayParser<E, B, T> implements JsonArrayParser<E, B, T>, ToSource {

  private JsonDummyArrayParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public JsonParser<E> elementParser() {
    return JsonParser.dummy();
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B arrayBuilder() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendElement(@Nullable B builder, @Nullable E element) {
    return null;
  }

  @Override
  public @Nullable T buildArray(@Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonArrayParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final JsonDummyArrayParser<Object, Object, Object> INSTANCE =
      new JsonDummyArrayParser<Object, Object, Object>();

}

final class ParseJsonArray<E, B, T> extends Parse<T> {

  final JsonArrayParser<E, B, T> parser;
  final JsonParserOptions options;
  final @Nullable B builder;
  final @Nullable Parse<E> parseElement;
  final int step;

  ParseJsonArray(JsonArrayParser<E, B, T> parser, JsonParserOptions options,
                 @Nullable B builder, @Nullable Parse<E> parseElement, int step) {
    this.parser = parser;
    this.options = options;
    this.builder = builder;
    this.parseElement = parseElement;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonArray.parse(input, this.parser, this.options, this.builder,
                                this.parseElement, this.step);
  }

  static <E, B, T> Parse<T> parse(Input input, JsonArrayParser<E, B, T> parser,
                                  JsonParserOptions options, @Nullable B builder,
                                  @Nullable Parse<E> parseElement, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '[') {
        try {
          builder = parser.arrayBuilder();
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('[', input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Term.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == ']') {
          final T array;
          try {
            array = parser.buildArray(Assume.nonNull(builder));
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          return Parse.done(array);
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected(']', input));
      }
    }
    do {
      if (step == 3) {
        if (parseElement == null) {
          parseElement = parser.elementParser().parse(input, options);
        } else {
          parseElement = parseElement.consume(input);
        }
        if (parseElement.isDone()) {
          try {
            builder = parser.appendElement(Assume.nonNull(builder), parseElement.getUnchecked());
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseElement = null;
          step = 4;
        } else if (parseElement.isError()) {
          return parseElement.asError();
        }
      }
      if (step == 4) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 5;
          } else if (c == ']') {
            final T array;
            try {
              array = parser.buildArray(Assume.nonNull(builder));
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(array);
          } else {
            return Parse.error(Diagnostic.expected("',' or ']'", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected(']', input));
        }
      }
      if (step == 5) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonArray<E, B, T>(parser, options, builder, parseElement, step);
  }

}
