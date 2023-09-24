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
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface JsonIdentifierParser<@Covariant T> extends JsonParser<T> {

  @Override
  default JsonIdentifierParser<T> identifierParser() throws JsonException {
    return this;
  }

  @Nullable T fromIdentifier(String value, JsonParserOptions options) throws JsonException;

  @Override
  default Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parseIdentifier(input, options);
  }

  default Parse<T> parseIdentifier(Input input, JsonParserOptions options) {
    return ParseJsonIdentifier.parse(input, this, options, null, 1);
  }

  @Override
  default <U> JsonIdentifierParser<U> map(Function<? super T, ? extends U> mapper) {
    return new JsonIdentifierParserMapper<T, U>(this, mapper);
  }

  static <T> JsonIdentifierParser<T> dummy() {
    return Assume.conforms(JsonDummyIdentifierParser.INSTANCE);
  }

}

final class JsonIdentifierParserMapper<S, T> implements JsonIdentifierParser<T>, WriteSource {

  final JsonIdentifierParser<S> parser;
  final Function<? super S, ? extends T> mapper;

  JsonIdentifierParserMapper(JsonIdentifierParser<S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.parser.typeName();
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
  public JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this.parser.arrayParser().map(this.mapper);
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this.parser.objectParser().map(this.mapper);
  }

  @Override
  public @Nullable T fromIdentifier(String value, JsonParserOptions options) throws JsonException {
    try {
      return this.mapper.apply(this.parser.fromIdentifier(value, options));
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
  public Parse<T> parseIdentifier(Input input, JsonParserOptions options) {
    return this.parser.parseIdentifier(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> JsonIdentifierParser<U> map(Function<? super T, ? extends U> mapper) {
    return new JsonIdentifierParserMapper<S, U>(this.parser, this.mapper.andThen(mapper));
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

final class JsonDummyIdentifierParser<T> implements JsonIdentifierParser<T>, WriteSource {

  private JsonDummyIdentifierParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable T fromIdentifier(String value, JsonParserOptions options) {
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonIdentifierParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final JsonDummyIdentifierParser<Object> INSTANCE =
      new JsonDummyIdentifierParser<Object>();

}

final class ParseJsonIdentifier<T> extends Parse<T> {

  final JsonIdentifierParser<T> parser;
  final JsonParserOptions options;
  final @Nullable StringBuilder builder;
  final int step;

  ParseJsonIdentifier(JsonIdentifierParser<T> parser, JsonParserOptions options,
                      @Nullable StringBuilder builder, int step) {
    this.parser = parser;
    this.options = options;
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonIdentifier.parse(input, this.parser, this.options, this.builder, this.step);
  }

  static <T> Parse<T> parse(Input input, JsonIdentifierParser<T> parser, JsonParserOptions options,
                            @Nullable StringBuilder builder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Term.isIdentifierStartChar(c = input.head())) {
        builder = new StringBuilder();
        builder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("identifier", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Term.isIdentifierChar(c = input.head())) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(parser.fromIdentifier(Assume.nonNull(builder).toString(), options));
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonIdentifier<T>(parser, options, builder, step);
  }

}
