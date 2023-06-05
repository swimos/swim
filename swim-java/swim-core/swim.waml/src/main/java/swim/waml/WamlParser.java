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
import swim.util.ToSource;

/**
 * A parser of values from WAML.
 *
 * @param <T> the type of values to parse from WAML
 */
@Public
@Since("5.0")
public interface WamlParser<@Covariant T> extends TermParser<T> {

  @Nullable String typeName();

  default WamlAttrsParser<?, ?, ?> attrsParser() {
    return WamlReprs.attrsParser();
  }

  default WamlParser<T> withAttrs(@Nullable Object attrs) throws WamlException {
    return this;
  }

  /**
   * Returns a {@code WamlIdentifierParser} for parsing values of type {@code T}
   * from WAML identifier literals.
   *
   * @return a {@code WamlIdentifierParser} that parses values of type {@code T}
   *         from WAML identifier literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML identifier literals is not supported
   */
  default WamlIdentifierParser<T> identifierParser() throws WamlException {
    throw new WamlException("identifier not supported");
  }

  /**
   * Returns a {@code WamlNumberParser} for parsing values of type {@code T}
   * from WAML number literals.
   *
   * @return a {@code WamlNumberParser} that parses values of type {@code T}
   *         from WAML number literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML number literals is not supported
   */
  default WamlNumberParser<T> numberParser() throws WamlException {
    throw new WamlException("number not supported");
  }

  /**
   * Returns a {@code WamlStringParser} for parsing values of type {@code T}
   * from WAML string literals.
   *
   * @return a {@code WamlStringParser} that parses values of type {@code T}
   *         from WAML string literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML string literals is not supported
   */
  default WamlStringParser<?, T> stringParser() throws WamlException {
    throw new WamlException("string not supported");
  }

  /**
   * Returns a {@code WamlMarkupParser} for parsing values of type {@code T}
   * from WAML markup literals.
   *
   * @return a {@code WamlMarkupParser} that parses values of type {@code T}
   *         from WAML markup literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML markup literals is not supported
   */
  default WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    throw new WamlException("markup not supported");
  }

  /**
   * Returns a {@code WamlArrayParser} for parsing values of type {@code T}
   * from WAML array literals.
   *
   * @return a {@code WamlArrayParser} that parses values of type {@code T}
   *         from WAML array literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML array literals is not supported
   */
  default WamlArrayParser<?, ?, T> arrayParser() throws WamlException {
    throw new WamlException("array not supported");
  }

  /**
   * Returns a {@code WamlObjectParser} for parsing values of type {@code T}
   * from WAML object literals.
   *
   * @return a {@code WamlObjectParser} that parses values of type {@code T}
   *         from WAML object literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML object literals is not supported
   */
  default WamlObjectParser<?, ?, T> objectParser() throws WamlException {
    throw new WamlException("object not supported");
  }

  /**
   * Returns a {@code WamlTupleParser} for parsing values of type {@code T}
   * from WAML tuple literals.
   *
   * @return a {@code WamlTupleParser} that parses values of type {@code T}
   *         from WAML tuple literals
   * @throws WamlException if parsing values of type {@code T}
   *         from WAML tuple literals is not supported
   */
  default WamlTupleParser<?, ?, T> tupleParser() throws WamlException {
    throw new WamlException("tuple not supported");
  }

  /**
   * Returns a default representation of type {@code T}.
   *
   * @return a default value of type {@code T}
   * @throws WamlException if no default value exists for type {@code T}
   */
  @Nullable T initializer(@Nullable Object attrs) throws WamlException;

  @Override
  default Parse<T> parse(Input input, TermParserOptions options) {
    return this.parse(input, WamlParserOptions.standard().withOptions(options));
  }

  Parse<T> parse(Input input, WamlParserOptions options);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, WamlParserOptions.standard());
  }

  default Parse<T> parse(WamlParserOptions options) {
    return this.parse(StringInput.empty(), options);
  }

  @Override
  default Parse<T> parse() {
    return this.parse(StringInput.empty(), WamlParserOptions.standard());
  }

  default Parse<T> parse(String string, WamlParserOptions options) {
    Objects.requireNonNull(string, "string");
    Objects.requireNonNull(options, "options");
    final StringInput input = new StringInput(string);
    while (input.isCont() && Term.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<T> parseWaml = this.parse(input, options);
    if (parseWaml.isDone()) {
      while (input.isCont() && Term.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseWaml.complete(input);
  }

  @Override
  default Parse<T> parse(String string) {
    return this.parse(string, WamlParserOptions.standard());
  }

  default Parse<T> parseBlock(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parse(input, options);
  }

  default Parse<T> parseBlock(Input input, WamlParserOptions options) {
    return this.parseBlock(input, options, null);
  }

  default Parse<T> parseBlock(Input input) {
    return this.parseBlock(input, WamlParserOptions.standard());
  }

  default Parse<T> parseBlock(WamlParserOptions options) {
    return this.parseBlock(StringInput.empty(), options);
  }

  default Parse<T> parseBlock() {
    return this.parseBlock(StringInput.empty(), WamlParserOptions.standard());
  }

  default Parse<T> parseBlock(String string, WamlParserOptions options) {
    Objects.requireNonNull(string, "string");
    Objects.requireNonNull(options, "options");
    final StringInput input = new StringInput(string);
    while (input.isCont() && Term.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<T> parseWaml = this.parseBlock(input, options);
    if (parseWaml.isDone()) {
      while (input.isCont() && Term.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseWaml.complete(input);
  }

  default Parse<T> parseBlock(String string) {
    return this.parseBlock(string, WamlParserOptions.standard());
  }

  default Parse<T> parseInline(Input input, WamlParserOptions options) {
    return ParseWamlInline.parse(input, this, options, null, null, null, 1);
  }

  default Parse<T> parseTuple(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return ParseWamlTuple.parse(input, this, options, parseAttrs, null, 1);
  }

  @Override
  default Parse<Object> parseGroup(Input input, TermParserOptions options) {
    WamlParser<T> parser = this;
    try {
      parser = parser.tupleParser();
    } catch (WamlException cause) {
      // Only nullary and unary tuples will be parsed.
    }
    return Assume.covariant(parser.parseBlock(input, WamlParserOptions.standard().withOptions(options)));
  }

  @Override
  default Parse<Object> parseExpr(Input input, TermParserOptions options) {
    options = WamlParserOptions.standard().withOptions(options);
    if (options instanceof WamlParserOptions && ((WamlParserOptions) options).exprsEnabled()) {
      return CondExpr.parse(input, this, options);
    }
    return Assume.covariant(this.parseValue(input, options));
  }

  @Override
  default Parse<T> parseValue(Input input, TermParserOptions options) {
    return ParseWamlValue.parse(input, this, WamlParserOptions.standard().withOptions(options), null, 1);
  }

  default <U> WamlParser<U> map(Function<? super T, ? extends U> mapper) {
    return new WamlParserMapper<T, U>(this, mapper);
  }

  static <T> WamlParser<T> dummy() {
    return Assume.conforms(WamlDummyParser.INSTANCE);
  }

  static <T> WamlParser<T> unsupported(Class<?> classType) {
    return new WamlUnsupportedParser<T>(classType);
  }

}

final class WamlParserMapper<S, T> implements WamlParser<T>, ToSource {

  final WamlParser<S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlParserMapper(WamlParser<S> parser, Function<? super S, ? extends T> mapper) {
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
  public <U> WamlParser<U> map(Function<? super T, ? extends U> mapper) {
    return new WamlParserMapper<S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyParser<T> implements WamlParser<T>, ToSource {

  private WamlDummyParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public WamlAttrsParser<?, ?, ?> attrsParser() {
    return WamlAttrsParser.dummy();
  }

  @Override
  public WamlIdentifierParser<T> identifierParser() {
    return WamlIdentifierParser.dummy();
  }

  @Override
  public WamlNumberParser<T> numberParser() {
    return WamlNumberParser.dummy();
  }

  @Override
  public WamlStringParser<?, T> stringParser() {
    return WamlStringParser.dummy();
  }

  @Override
  public WamlMarkupParser<?, ?, T> markupParser() {
    return WamlMarkupParser.dummy();
  }

  @Override
  public WamlArrayParser<?, ?, T> arrayParser() {
    return WamlArrayParser.dummy();
  }

  @Override
  public WamlObjectParser<?, ?, T> objectParser() {
    return WamlObjectParser.dummy();
  }

  @Override
  public WamlTupleParser<?, ?, T> tupleParser() {
    return WamlTupleParser.dummy();
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseValue(input, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final WamlDummyParser<Object> INSTANCE = new WamlDummyParser<Object>();

}

final class WamlUnsupportedParser<T> implements WamlParser<T>, ToSource {

  final Class<?> classType;

  WamlUnsupportedParser(Class<?> classType) {
    this.classType = classType;
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return Parse.diagnostic(input, new WamlException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public Parse<T> parseBlock(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return Parse.diagnostic(input, new WamlException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public Parse<T> parseInline(Input input, WamlParserOptions options) {
    return Parse.diagnostic(input, new WamlException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public Parse<T> parseTuple(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return Parse.diagnostic(input, new WamlException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return Parse.diagnostic(input, new WamlException("unable to parse class "
                                                   + this.classType.getName()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlParser", "unsupported")
            .appendArgument(this.classType)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class ParseWamlInline<T> extends Parse<T> {

  final WamlParser<T> parser;
  final WamlParserOptions options;
  final @Nullable Object attrs;
  final @Nullable Parse<?> parseAttr;
  final @Nullable Parse<T> parseValue;
  final int step;

  ParseWamlInline(WamlParser<T> parser, WamlParserOptions options, @Nullable Object attrs,
                  @Nullable Parse<?> parseAttr, @Nullable Parse<T> parseValue, int step) {
    this.parser = parser;
    this.options = options;
    this.attrs = attrs;
    this.parseAttr = parseAttr;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlInline.parse(input, this.parser, this.options, this.attrs,
                                 this.parseAttr, this.parseValue, this.step);
  }

  static <T> Parse<T> parse(Input input, WamlParser<T> parser, WamlParserOptions options,
                            @Nullable Object attrs, @Nullable Parse<?> parseAttr,
                            @Nullable Parse<T> parseValue, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        if (parseAttr == null) {
          parseAttr = Parse.done();
        }
        step = 3;
      }
    }
    if (step == 2) {
      if (parseAttr == null) {
        final WamlAttrsParser<?, ?, ?> attrsParser = parser.attrsParser();
        final Object attrsBuilder;
        try {
          attrsBuilder = attrsParser.attrsBuilder();
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        parseAttr = attrsParser.parseAttr(input, options, Assume.conforms(attrsBuilder));
      } else {
        parseAttr = parseAttr.consume(input);
      }
      if (parseAttr.isDone()) {
        try {
          attrs = parser.attrsParser().buildAttrs(Assume.conforms(parseAttr.getNonNullUnchecked()));
          parser = parser.withAttrs(attrs);
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        parseAttr = null;
        step = 3;
      } else if (parseAttr.isError()) {
        return parseAttr.asError();
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (c == '[') {
          try {
            return parser.arrayParser().parseArray(input, options, Parse.done(attrs));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '<') {
          try {
            return parser.markupParser().parseMarkup(input, options, Parse.done(attrs));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          try {
            return Parse.done(parser.initializer(attrs));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      } else if (input.isDone()) {
        try {
          return Parse.done(parser.initializer(attrs));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlInline<T>(parser, options, attrs, parseAttr, parseValue, step);
  }

}

final class ParseWamlTuple<T> extends Parse<T> {

  final WamlParser<T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable Parse<T> parseBlock;
  final int step;

  ParseWamlTuple(WamlParser<T> parser, WamlParserOptions options,
                 @Nullable Parse<?> parseAttrs,
                 @Nullable Parse<T> parseBlock, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.parseBlock = parseBlock;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlTuple.parse(input, this.parser, this.options, this.parseAttrs,
                                this.parseBlock, this.step);
  }

  static <T> Parse<T> parse(Input input, WamlParser<T> parser, WamlParserOptions options,
                            @Nullable Parse<?> parseAttrs,
                            @Nullable Parse<T> parseBlock, int step) {
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
      if (input.isCont() && input.head() == '(') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('(', input));
      }
    }
    if (step == 5) {
      if (parseBlock == null) {
        parseBlock = parser.parseBlock(input, options, parseAttrs);
      } else {
        parseBlock = parseBlock.consume(input);
      }
      if (parseBlock.isDone()) {
        step = 6;
      } else if (parseBlock.isError()) {
        return parseBlock.asError();
      }
    }
    if (step == 6) {
      while (input.isCont() && Term.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == ')') {
        input.step();
        return Assume.nonNull(parseBlock);
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(')', input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlTuple<T>(parser, options, parseAttrs, parseBlock, step);
  }

}

final class ParseWamlValue<T> extends Parse<T> {

  final WamlParser<T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final int step;

  ParseWamlValue(WamlParser<T> parser, WamlParserOptions options,
                 @Nullable Parse<?> parseAttrs, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlValue.parse(input, this.parser, this.options, this.parseAttrs, this.step);
  }

  static <T> Parse<T> parse(Input input, WamlParser<T> parser, WamlParserOptions options,
                            @Nullable Parse<?> parseAttrs, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
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
        try {
          parser = parser.withAttrs(parseAttrs.getUnchecked());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
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
      if (input.isCont()) {
        c = input.head();
        if (Term.isIdentifierStartChar(c)) {
          try {
            return parser.identifierParser().parseIdentifier(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '-' || (c >= '0' && c <= '9')) {
          try {
            return parser.numberParser().parseNumber(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '"') {
          try {
            return parser.stringParser().parseString(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '[') {
          try {
            return parser.arrayParser().parseArray(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '<') {
          try {
            return parser.markupParser().parseMarkup(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '{') {
          try {
            return parser.objectParser().parseObject(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '(') {
          try {
            return parser.tupleParser().parseTuple(input, options, parseAttrs);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          if (parseAttrs != null) {
            try {
              return Parse.done(parser.initializer(parseAttrs.getUnchecked()));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
          } else {
            return Parse.error(Diagnostic.expected("value", input));
          }
        }
      } else if (input.isDone()) {
        if (parseAttrs != null) {
          try {
            return Parse.done(parser.initializer(parseAttrs.getUnchecked()));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("value", input));
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlValue<T>(parser, options, parseAttrs, step);
  }

}
