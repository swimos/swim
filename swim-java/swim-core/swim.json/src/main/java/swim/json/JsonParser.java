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

import java.util.Objects;
import java.util.function.Function;
import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.expr.CondExpr;
import swim.term.Term;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

/**
 * A parser of values from JSON.
 *
 * @param <T> the type of values to parse from JSON
 */
@Public
@Since("5.0")
public interface JsonParser<@Covariant T> extends TermParser<T> {

  @Nullable String typeName();

  /**
   * Returns a {@code JsonIdentifierParser} for parsing values of type {@code T}
   * from JSON identifier literals.
   *
   * @return a {@code JsonIdentifierParser} that parses values of type {@code T}
   *         from JSON identifier literals
   * @throws JsonException if parsing values of type {@code T}
   *         from JSON identifier literals is not supported
   */
  default JsonIdentifierParser<T> identifierParser() throws JsonException {
    throw new JsonException("identifier not supported");
  }

  /**
   * Returns a {@code JsonNumberParser} for parsing values of type {@code T}
   * from JSON number literals.
   *
   * @return a {@code JsonNumberParser} that parses values of type {@code T}
   *         from JSON number literals
   * @throws JsonException if parsing values of type {@code T}
   *         from JSON number literals is not supported
   */
  default JsonNumberParser<T> numberParser() throws JsonException {
    throw new JsonException("number not supported");
  }

  /**
   * Returns a {@code JsonStringParser} for parsing values of type {@code T}
   * from JSON string literals.
   *
   * @return a {@code JsonStringParser} that parses values of type {@code T}
   *         from JSON string literals
   * @throws JsonException if parsing values of type {@code T}
   *         from JSON string literals is not supported
   */
  default JsonStringParser<?, T> stringParser() throws JsonException {
    throw new JsonException("string not supported");
  }

  /**
   * Returns a {@code JsonArrayParser} for parsing values of type {@code T}
   * from JSON array literals.
   *
   * @return a {@code JsonArrayParser} that parses values of type {@code T}
   *         from JSON array literals
   * @throws JsonException if parsing values of type {@code T}
   *         from JSON array literals is not supported
   */
  default JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    throw new JsonException("array not supported");
  }

  /**
   * Returns a {@code JsonObjectParser} for parsing values of type {@code T}
   * from JSON object literals.
   *
   * @return a {@code JsonObjectParser} that parses values of type {@code T}
   *         from JSON object literals
   * @throws JsonException if parsing values of type {@code T}
   *         from JSON object literals is not supported
   */
  default JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    throw new JsonException("object not supported");
  }

  /**
   * Returns a default representation of type {@code T}.
   *
   * @return a default value of type {@code T}
   * @throws JsonException if no default value exists for type {@code T}
   */
  @Nullable T initializer() throws JsonException;

  @Override
  default Parse<T> parse(Input input, TermParserOptions options) {
    return this.parse(input, JsonParserOptions.standard().withOptions(options));
  }

  Parse<T> parse(Input input, JsonParserOptions options);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, JsonParserOptions.standard());
  }

  default Parse<T> parse(JsonParserOptions options) {
    return this.parse(StringInput.empty(), options);
  }

  @Override
  default Parse<T> parse() {
    return this.parse(StringInput.empty(), JsonParserOptions.standard());
  }

  default Parse<T> parse(String string, JsonParserOptions options) {
    Objects.requireNonNull(string, "string");
    Objects.requireNonNull(options, "options");
    final StringInput input = new StringInput(string);
    while (input.isCont() && Term.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<T> parseJson = this.parse(input, options);
    if (parseJson.isDone()) {
      while (input.isCont() && Term.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseJson.complete(input);
  }

  @Override
  default Parse<T> parse(String string) {
    return this.parse(string, JsonParserOptions.standard());
  }

  @Override
  default Parse<Object> parseExpr(Input input, TermParserOptions options) {
    options = JsonParserOptions.standard().withOptions(options);
    if (((JsonParserOptions) options).exprsEnabled()) {
      return CondExpr.parse(input, this, options);
    }
    return Assume.covariant(this.parseValue(input, options));
  }

  @Override
  default Parse<T> parseValue(Input input, TermParserOptions options) {
    return ParseJsonValue.parse(input, this, JsonParserOptions.standard().withOptions(options));
  }

  default <U> JsonParser<U> map(Function<? super T, ? extends U> mapper) {
    return new JsonParserMapper<T, U>(this, mapper);
  }

  static <T> JsonParser<T> dummy() {
    return Assume.conforms(JsonDummyParser.INSTANCE);
  }

  static <T> JsonParser<T> unsupported(Class<?> classType) {
    return new JsonUnsupportedParser<T>(classType);
  }

}

final class JsonParserMapper<S, T> implements JsonParser<T>, WriteSource {

  final JsonParser<S> parser;
  final Function<? super S, ? extends T> mapper;

  JsonParserMapper(JsonParser<S> parser, Function<? super S, ? extends T> mapper) {
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
  public JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this.parser.arrayParser().map(this.mapper);
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this.parser.objectParser().map(this.mapper);
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
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> JsonParser<U> map(Function<? super T, ? extends U> mapper) {
    return new JsonParserMapper<S, U>(this.parser, this.mapper.andThen(mapper));
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

final class JsonDummyParser<T> implements JsonParser<T>, WriteSource {

  private JsonDummyParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public JsonIdentifierParser<T> identifierParser() {
    return JsonIdentifierParser.dummy();
  }

  @Override
  public JsonNumberParser<T> numberParser() {
    return JsonNumberParser.dummy();
  }

  @Override
  public JsonStringParser<?, T> stringParser() {
    return JsonStringParser.dummy();
  }

  @Override
  public JsonArrayParser<?, ?, T> arrayParser() {
    return JsonArrayParser.dummy();
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() {
    return JsonObjectParser.dummy();
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parseValue(input, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final JsonDummyParser<Object> INSTANCE = new JsonDummyParser<Object>();

}

final class JsonUnsupportedParser<T> implements JsonParser<T>, WriteSource {

  final Class<?> classType;

  JsonUnsupportedParser(Class<?> classType) {
    this.classType = classType;
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return Parse.diagnostic(input, new JsonException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return Parse.diagnostic(input, new JsonException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonParser", "unsupported")
            .appendArgument(this.classType)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class ParseJsonValue<T> extends Parse<T> {

  final JsonParser<T> parser;
  final JsonParserOptions options;

  ParseJsonValue(JsonParser<T> parser, JsonParserOptions options) {
    this.parser = parser;
    this.options = options;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonValue.parse(input, this.parser, this.options);
  }

  static <T> Parse<T> parse(Input input, JsonParser<T> parser, JsonParserOptions options) {
    if (input.isCont()) {
      final int c = input.head();
      if (Term.isIdentifierStartChar(c)) {
        try {
          return parser.identifierParser().parseIdentifier(input, options);
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '-' || (c >= '0' && c <= '9')) {
        try {
          return parser.numberParser().parseNumber(input, options);
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '"') {
        try {
          return parser.stringParser().parseString(input, options);
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '[') {
        try {
          return parser.arrayParser().parseArray(input, options);
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '{') {
        try {
          return parser.objectParser().parseObject(input, options);
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else {
        return Parse.error(Diagnostic.expected("value", input));
      }
    } else if (input.isDone()) {
      return Parse.error(Diagnostic.expected("value", input));
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonValue<T>(parser, options);
  }

}
