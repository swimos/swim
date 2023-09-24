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
public interface WamlTupleParser<V, B, @Covariant T> extends WamlParser<T> {

  @Override
  default WamlTupleParser<?, ?, T> tupleParser() throws WamlException {
    return this;
  }

  WamlParser<V> valueParser();

  @Nullable T emptyTuple(@Nullable Object attrs) throws WamlException;

  @Nullable T unaryTuple(@Nullable Object attrs, @Nullable V value) throws WamlException;

  B tupleBuilder(@Nullable Object attrs) throws WamlException;

  B appendValue(B builder, @Nullable V value) throws WamlException;

  B appendField(B builder, @Nullable V key, @Nullable V value) throws WamlException;

  @Nullable T buildTuple(@Nullable Object attrs, B builder) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseTuple(input, options, null);
  }

  @Override
  default Parse<T> parseBlock(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parseFields(input, options, parseAttrs);
  }

  @Override
  default Parse<Object> parseGroup(Input input, TermParserOptions options) {
    return Assume.covariant(this.parseFields(input, WamlParserOptions.standard().withOptions(options), null));
  }

  default Parse<T> parseFields(Input input, WamlParserOptions options,
                               @Nullable Parse<?> parseAttrs) {
    if (parseAttrs == null) {
      parseAttrs = Parse.done();
    }
    return ParseWamlFields.parse(input, this, options, parseAttrs, null, null, null, 1);
  }

  @Override
  default <U> WamlTupleParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlTupleParserMapper<V, B, T, U>(this, mapper);
  }

  static <V, B, T> WamlTupleParser<V, B, T> dummy() {
    return Assume.conforms(WamlDummyTupleParser.INSTANCE);
  }

}

final class WamlTupleParserMapper<V, B, S, T> implements WamlTupleParser<V, B, T>, WriteSource {

  final WamlTupleParser<V, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlTupleParserMapper(WamlTupleParser<V, B, S> parser, Function<? super S, ? extends T> mapper) {
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
  public WamlParser<V> valueParser() {
    return this.parser.valueParser();
  }

  @Override
  public @Nullable T emptyTuple(@Nullable Object attrs) throws WamlException {
    try {
      return this.mapper.apply(this.parser.emptyTuple(attrs));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T unaryTuple(@Nullable Object attrs, @Nullable V value) throws WamlException {
    try {
      return this.mapper.apply(this.parser.unaryTuple(attrs, value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public B tupleBuilder(@Nullable Object attrs) throws WamlException {
    return this.parser.tupleBuilder(attrs);
  }

  @Override
  public B appendValue(B builder, @Nullable V value) throws WamlException {
    return this.parser.appendValue(builder, value);
  }

  @Override
  public B appendField(B builder, @Nullable V key, @Nullable V value) throws WamlException {
    return this.parser.appendField(builder, key, value);
  }

  @Override
  public @Nullable T buildTuple(@Nullable Object attrs, B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildTuple(attrs, builder));
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
  public Parse<T> parseFields(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parser.parseFields(input, options, parseAttrs).map(this.mapper);
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
  public <U> WamlTupleParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlTupleParserMapper<V, B, S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyTupleParser<V, B, T> implements WamlTupleParser<V, B, T>, WriteSource {

  private WamlDummyTupleParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public WamlParser<V> valueParser() {
    return WamlParser.dummy();
  }

  @Override
  public @Nullable T emptyTuple(@Nullable Object attrs) {
    return null;
  }

  @Override
  public @Nullable T unaryTuple(@Nullable Object attrs, @Nullable V value) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B tupleBuilder(@Nullable Object attrs) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendValue(@Nullable B builder, @Nullable V value) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendField(@Nullable B builder, @Nullable V key, @Nullable V value) {
    return null;
  }

  @Override
  public @Nullable T buildTuple(@Nullable Object attrs, @Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlTupleParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyTupleParser<Object, Object, Object> INSTANCE =
      new WamlDummyTupleParser<Object, Object, Object>();

}

final class ParseWamlFields<V, B, T> extends Parse<T> {

  final WamlTupleParser<V, B, T> parser;
  final WamlParserOptions options;
  final Parse<?> parseAttrs;
  final @Nullable B builder;
  final @Nullable Parse<V> parseKey;
  final @Nullable Parse<V> parseValue;
  final int step;

  ParseWamlFields(WamlTupleParser<V, B, T> parser, WamlParserOptions options,
                  Parse<?> parseAttrs, @Nullable B builder, @Nullable Parse<V> parseKey,
                  @Nullable Parse<V> parseValue, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.parseKey = parseKey;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlFields.parse(input, this.parser, this.options, this.parseAttrs,
                                 this.builder, this.parseKey, this.parseValue, this.step);
  }

  static <V, B, T> Parse<T> parse(Input input, WamlTupleParser<V, B, T> parser,
                                  WamlParserOptions options, Parse<?> parseAttrs,
                                  @Nullable B builder, @Nullable Parse<V> parseKey,
                                  @Nullable Parse<V> parseValue, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && (c == '#' // comment
                            || c == '@' // attr
                            || c == '(' // tuple
                            || c == '{' // object
                            || c == '<' // markup
                            || c == '[' // array
                            || c == '"' // string
                            || Term.isIdentifierStartChar(c) // identifier
                            || c == '+' || c == '-' || (c >= '0' && c <= '9') // number
                            || c == '%' // context expr
                            || c == '$' // global expr
                            || c == '*' // children or descendants expr
                            || c == '!' // not expr
                            || c == '~')) { // bitwise not expr
          if (c == '#') {
            input.step();
            step = 7;
          } else { // value
            if (parseValue != null) {
              try {
                if (builder == null) {
                  builder = parser.tupleBuilder(parseAttrs.getUnchecked());
                }
                builder = parser.appendValue(builder, parseValue.getUnchecked());
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              parseValue = null;
            }
            step = 2;
          }
        } else if (input.isReady()) {
          try {
            if (builder != null) {
              if (parseValue != null) {
                builder = parser.appendValue(builder, parseValue.getUnchecked());
              }
              return Parse.done(parser.buildTuple(parseAttrs.getUnchecked(), builder));
            } else if (parseValue != null) {
              return Parse.done(parser.unaryTuple(parseAttrs.getUnchecked(),
                                                  parseValue.getUnchecked()));
            } else {
              return Parse.done(parser.emptyTuple(parseAttrs.getUnchecked()));
            }
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 2) {
        if (parseKey == null) {
          parseKey = parser.valueParser().parse(input, options);
        } else {
          parseKey = parseKey.consume(input);
        }
        if (parseKey.isDone()) {
          step = 3;
        } else if (parseKey.isError()) {
          return parseKey.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ':') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          parseValue = parseKey;
          parseKey = null;
          step = 6;
        }
      }
      if (step == 4) {
        while (input.isCont() && Term.isSpace(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 5;
        }
      }
      if (step == 5) {
        if (parseValue == null) {
          parseValue = parser.valueParser().parse(input, options);
        } else {
          parseValue = parseValue.consume(input);
        }
        if (parseValue.isDone()) {
          try {
            if (builder == null) {
              builder = parser.tupleBuilder(parseAttrs.getUnchecked());
            }
            builder = parser.appendField(builder, Assume.nonNull(parseKey).getUnchecked(),
                                         parseValue.getUnchecked());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseValue = null;
          parseKey = null;
          step = 6;
        } else if (parseValue.isError()) {
          return parseValue.asError();
        }
      }
      if (step == 6) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && (c == '#' || c == ',' || Term.isNewline(c))) {
          input.step();
          if (c == '#') {
            step = 7;
          } else { // c == ',' || Term.isNewline(c)
            step = 1;
            continue;
          }
        } else if (input.isReady()) {
          try {
            if (builder != null) {
              if (parseValue != null) {
                builder = parser.appendValue(builder, parseValue.getUnchecked());
              }
              return Parse.done(parser.buildTuple(parseAttrs.getUnchecked(), builder));
            } else if (parseValue != null) {
              return Parse.done(parser.unaryTuple(parseAttrs.getUnchecked(),
                                                  parseValue.getUnchecked()));
            } else {
              return Parse.done(parser.emptyTuple(parseAttrs.getUnchecked()));
            }
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 7) {
        while (input.isCont() && !Term.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 1;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlFields<V, B, T>(parser, options, parseAttrs, builder,
                                        parseKey, parseValue, step);
  }

}
