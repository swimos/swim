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
import swim.util.ToSource;

@Public
@Since("5.0")
public interface WamlMarkupParser<N, B, @Covariant T> extends WamlParser<T> {

  @Override
  default WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    return this;
  }

  WamlParser<N> nodeParser();

  B markupBuilder(@Nullable Object attrs) throws WamlException;

  B appendNode(B builder, @Nullable N node) throws WamlException;

  B appendText(B builder, String text) throws WamlException;

  @Nullable T buildMarkup(@Nullable Object attrs, B builder) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseMarkup(input, options, null);
  }

  default Parse<T> parseMarkup(Input input, WamlParserOptions options,
                               @Nullable Parse<?> parseAttrs) {
    return ParseWamlMarkup.parse(input, this, options, parseAttrs, null, null, null, 0, 1);
  }

  default Parse<T> parseMarkupRest(Input input, WamlParserOptions options) {
    return ParseWamlMarkup.parse(input, this, options, Parse.done(), null, null, null, 0, 5);
  }

  @Override
  default <U> WamlMarkupParser<N, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlMarkupParserMapper<N, B, T, U>(this, mapper);
  }

  static <N, B, TT> WamlMarkupParser<N, B, TT> dummy() {
    return Assume.conforms(WamlDummyMarkupParser.INSTANCE);
  }

}

final class WamlMarkupParserMapper<N, B, S, T> implements WamlMarkupParser<N, B, T>, ToSource {

  final WamlMarkupParser<N, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlMarkupParserMapper(WamlMarkupParser<N, B, S> parser, Function<? super S, ? extends T> mapper) {
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
  public WamlParser<N> nodeParser() {
    return this.parser.nodeParser();
  }

  @Override
  public B markupBuilder(@Nullable Object attrs) throws WamlException {
    return this.parser.markupBuilder(attrs);
  }

  @Override
  public B appendNode(B builder, @Nullable N node) throws WamlException {
    return this.parser.appendNode(builder, node);
  }

  @Override
  public B appendText(B builder, String text) throws WamlException {
    return this.parser.appendText(builder, text);
  }

  @Override
  public @Nullable T buildMarkup(@Nullable Object attrs, B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildMarkup(attrs, builder));
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
  public Parse<T> parseMarkup(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parser.parseMarkup(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseMarkupRest(Input input, WamlParserOptions options) {
    return this.parser.parseMarkupRest(input, options).map(this.mapper);
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
  public <U> WamlMarkupParser<N, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlMarkupParserMapper<N, B, S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyMarkupParser<N, B, T> implements WamlMarkupParser<N, B, T>, ToSource {

  private WamlDummyMarkupParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public WamlParser<N> nodeParser() {
    return WamlParser.dummy();
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B markupBuilder(@Nullable Object attrs) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendNode(@Nullable B builder, @Nullable N node) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B appendText(@Nullable B builder, String text) {
    return null;
  }

  @Override
  public @Nullable T buildMarkup(@Nullable Object attrs, @Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlMarkupParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final WamlDummyMarkupParser<Object, Object, Object> INSTANCE =
      new WamlDummyMarkupParser<Object, Object, Object>();

}

final class ParseWamlMarkup<N, B, T> extends Parse<T> {

  final WamlMarkupParser<N, B, T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable B builder;
  final @Nullable StringBuilder textBuilder;
  final @Nullable Parse<?> parseNode;
  final int escape;
  final int step;

  ParseWamlMarkup(WamlMarkupParser<N, B, T> parser, WamlParserOptions options,
                  @Nullable Parse<?> parseAttrs, @Nullable B builder,
                  @Nullable StringBuilder textBuilder, @Nullable Parse<?> parseNode,
                  int escape, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.textBuilder = textBuilder;
    this.parseNode = parseNode;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlMarkup.parse(input, this.parser, this.options, this.parseAttrs, this.builder,
                                 this.textBuilder, this.parseNode, this.escape, this.step);
  }

  static <N, B, T> Parse<T> parse(Input input, WamlMarkupParser<N, B, T> parser,
                                     WamlParserOptions options, @Nullable Parse<?> parseAttrs,
                                     @Nullable B builder, @Nullable StringBuilder textBuilder,
                                     @Nullable Parse<?> parseNode, int escape, int step) {
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
      if (input.isCont() && input.head() == '<') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('<', input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '<') {
        if (builder == null) {
          try {
            builder = parser.markupBuilder(Assume.nonNull(parseAttrs).getUnchecked());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('<', input));
      }
    }
    do {
      if (step == 6) {
        while (input.isCont() && (c = input.head()) != '<' && c != '>'
                              && c != '@' && c != '\\' && c != '{') {
          if (textBuilder == null) {
            textBuilder = new StringBuilder();
          }
          textBuilder.appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '<') {
            input.step();
            step = 7;
          } else if (c == '>') {
            input.step();
            step = 8;
          } else if (c == '@') {
            try {
              if (textBuilder != null) {
                builder = parser.appendText(Assume.nonNull(builder), textBuilder.toString());
                textBuilder = null;
              }
              parseNode = parser.nodeParser().parseInline(input, options);
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            step = 9;
          } else if (c == '\\') {
            input.step();
            step = 10;
          } else if (c == '{') {
            if (textBuilder != null) {
              try {
                builder = parser.appendText(Assume.nonNull(builder), textBuilder.toString());
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              textBuilder = null;
            }
            input.step();
            step = 15;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        if (input.isCont()) {
          if (input.head() == '<') {
            if (textBuilder != null) {
              try {
                builder = parser.appendText(Assume.nonNull(builder), textBuilder.toString());
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              textBuilder = null;
            }
            final WamlMarkupParser<?, ?, ?> markupParser;
            try {
              markupParser = parser.nodeParser().markupParser();
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            parseNode = markupParser.parseMarkupRest(input, options);
            step = 9;
          } else {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('<');
            step = 6;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (input.isCont()) {
          if (input.head() == '>') {
            try {
              if (textBuilder != null) {
                builder = parser.appendText(Assume.nonNull(builder), textBuilder.toString());
              }
              input.step();
              return Parse.done(parser.buildMarkup(Assume.nonNull(parseAttrs).getUnchecked(),
                                                   Assume.nonNull(builder)));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
          } else {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('>');
            step = 6;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 9) {
        parseNode = Assume.nonNull(parseNode).consume(input);
        if (parseNode.isDone()) {
          final N node = Assume.conformsNullable(parseNode.getUnchecked());
          try {
            builder = parser.appendNode(Assume.nonNull(builder), node);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseNode = null;
          step = 6;
          continue;
        } else if (parseNode.isError()) {
          return parseNode.asError();
        }
      }
      if (step == 10) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.appendCodePoint(c);
            input.step();
            step = 6;
            continue;
          } else if (c == 'b') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\b');
            input.step();
            step = 6;
            continue;
          } else if (c == 'f') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\f');
            input.step();
            step = 6;
            continue;
          } else if (c == 'n') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\n');
            input.step();
            step = 6;
            continue;
          } else if (c == 'r') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\r');
            input.step();
            step = 6;
            continue;
          } else if (c == 't') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\t');
            input.step();
            step = 6;
            continue;
          } else if (c == 'u') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            step = 11;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 11) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 12;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 12) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 13;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 13) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 9;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 14) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          Assume.nonNull(textBuilder).appendCodePoint(escape);
          escape = 0;
          input.step();
          step = 6;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 15) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == '}') {
            input.step();
            step = 6;
            continue;
          } else if (c == '#') {
            input.step();
            step = 18;
          } else {
            step = 16;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 16) {
        if (parseNode == null) {
          parseNode = parser.nodeParser().parse(input, options);
        } else {
          parseNode = parseNode.consume(input);
        }
        if (parseNode.isDone()) {
          final N node = Assume.conformsNullable(parseNode.getUnchecked());
          try {
            builder = parser.appendNode(Assume.nonNull(builder), node);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseNode = null;
          step = 17;
        } else if (parseNode.isError()) {
          return parseNode.asError();
        }
      }
      if (step == 17) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',' || Term.isNewline(c)) {
            input.step();
            step = 15;
            continue;
          } else if (c == '#') {
            input.step();
            step = 18;
          } else if (c == '}') {
            input.step();
            step = 6;
            continue;
          } else {
            return Parse.error(Diagnostic.expected("'}', ',' or newline", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 18) {
        while (input.isCont() && !Term.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 15;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlMarkup<N, B, T>(parser, options, parseAttrs, builder,
                                        textBuilder, parseNode, escape, step);
  }

}
