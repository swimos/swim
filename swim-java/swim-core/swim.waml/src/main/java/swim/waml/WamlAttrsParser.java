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
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.term.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface WamlAttrsParser<V, B, @Covariant T> {

  WamlParser<V> getAttrValueParser(String name) throws WamlException;

  @Nullable T emptyAttrs() throws WamlException;

  B attrsBuilder() throws WamlException;

  B updateAttr(B builder, String name) throws WamlException;

  B updateAttr(B builder, String name, @Nullable V value) throws WamlException;

  @Nullable T buildAttrs(B builder) throws WamlException;

  default Parse<T> parseAttrs(Input input, WamlParserOptions options) {
    return ParseWamlAttrs.parse(input, this, options, null, null, 1);
  }

  default Parse<B> parseAttr(Input input, WamlParserOptions options, B builder) {
    return ParseWamlAttr.parse(input, this, options, builder, null, null, 0, 1);
  }

  default <U> WamlAttrsParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlAttrsParserMapper<V, B, T, U>(this, mapper);
  }

  static <V, B, T> WamlAttrsParser<V, B, T> dummy() {
    return Assume.conforms(WamlDummyAttrsParser.INSTANCE);
  }

}

final class WamlAttrsParserMapper<V, B, S, T> implements WamlAttrsParser<V, B, T>, WriteSource {

  final WamlAttrsParser<V, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlAttrsParserMapper(WamlAttrsParser<V, B, S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public WamlParser<V> getAttrValueParser(String name) throws WamlException {
    return this.parser.getAttrValueParser(name);
  }

  @Override
  public @Nullable T emptyAttrs() throws WamlException {
    try {
      return this.mapper.apply(this.parser.emptyAttrs());
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public B attrsBuilder() throws WamlException {
    return this.parser.attrsBuilder();
  }

  @Override
  public B updateAttr(B builder, String name) throws WamlException {
    return this.parser.updateAttr(builder, name);
  }

  @Override
  public B updateAttr(B builder, String name, @Nullable V value) throws WamlException {
    return this.parser.updateAttr(builder, name, value);
  }

  @Override
  public @Nullable T buildAttrs(B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildAttrs(builder));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public Parse<T> parseAttrs(Input input, WamlParserOptions options) {
    return this.parser.parseAttrs(input, options).map(this.mapper);
  }

  @Override
  public Parse<B> parseAttr(Input input, WamlParserOptions options, B builder) {
    return this.parser.parseAttr(input, options, builder);
  }

  @Override
  public <U> WamlAttrsParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlAttrsParserMapper<V, B, S, U>(this.parser, this.mapper.andThen(mapper));
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

final class WamlDummyAttrsParser<V, B, T> implements WamlAttrsParser<V, B, T>, WriteSource {

  private WamlDummyAttrsParser() {
    // singleton
  }

  @Override
  public WamlParser<V> getAttrValueParser(String name) {
    return WamlParser.dummy();
  }

  @Override
  public @Nullable T emptyAttrs() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B attrsBuilder() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B updateAttr(@Nullable B builder, String name) {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B updateAttr(@Nullable B builder, String name, @Nullable V value) {
    return null;
  }

  @Override
  public @Nullable T buildAttrs(@Nullable B builder) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlAttrsParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyAttrsParser<Object, Object, Object> INSTANCE =
      new WamlDummyAttrsParser<Object, Object, Object>();

}

final class ParseWamlAttrs<B, T> extends Parse<T> {

  final WamlAttrsParser<?, B, T> parser;
  final WamlParserOptions options;
  final @Nullable B builder;
  final @Nullable Parse<B> parseAttr;
  final int step;

  ParseWamlAttrs(WamlAttrsParser<?, B, T> parser, WamlParserOptions options,
                 @Nullable B builder, @Nullable Parse<B> parseAttr, int step) {
    this.parser = parser;
    this.options = options;
    this.builder = builder;
    this.parseAttr = parseAttr;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlAttrs.parse(input, this.parser, this.options, this.builder,
                                this.parseAttr, this.step);
  }

  static <B, T> Parse<T> parse(Input input, WamlAttrsParser<?, B, T> parser,
                               WamlParserOptions options, @Nullable B builder,
                               @Nullable Parse<B> parseAttr, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        try {
          builder = parser.attrsBuilder();
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        step = 2;
      } else if (input.isReady()) {
        try {
          return Parse.done(parser.emptyAttrs());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    do {
      if (step == 2) {
        if (parseAttr == null) {
          parseAttr = parser.parseAttr(input, options, Assume.nonNull(builder));
        } else {
          parseAttr = parseAttr.consume(input);
        }
        if (parseAttr.isDone()) {
          builder = parseAttr.getNonNullUnchecked();
          parseAttr = null;
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '@') {
          step = 2;
          continue;
        } else if (input.isReady()) {
          try {
            return Parse.done(parser.buildAttrs(Assume.nonNull(builder)));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlAttrs<B, T>(parser, options, builder, parseAttr, step);
  }

}

final class ParseWamlAttr<V, B> extends Parse<B> {

  final WamlAttrsParser<V, B, ?> parser;
  final WamlParserOptions options;
  final B builder;
  final @Nullable StringBuilder nameBuilder;
  final @Nullable Parse<V> parseBlock;
  final int escape;
  final int step;

  ParseWamlAttr(WamlAttrsParser<V, B, ?> parser, WamlParserOptions options,
                B builder, @Nullable StringBuilder nameBuilder,
                @Nullable Parse<V> parseBlock, int escape, int step) {
    this.parser = parser;
    this.options = options;
    this.builder = builder;
    this.nameBuilder = nameBuilder;
    this.parseBlock = parseBlock;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<B> consume(Input input) {
    return ParseWamlAttr.parse(input, this.parser, this.options, this.builder,
                               this.nameBuilder, this.parseBlock, this.escape, this.step);
  }

  static <V, B> Parse<B> parse(Input input, WamlAttrsParser<V, B, ?> parser,
                               WamlParserOptions options, B builder,
                               @Nullable StringBuilder nameBuilder,
                               @Nullable Parse<V> parseBlock, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('@', input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (Term.isIdentifierStartChar(c = input.head()) || c == '"')) {
        nameBuilder = new StringBuilder();
        if (Term.isIdentifierStartChar(c)) {
          nameBuilder.appendCodePoint(c);
          input.step();
          step = 3;
        } else { // c == '"'
          input.step();
          step = 4;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("attribute name", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && Term.isIdentifierChar(c = input.head())) {
        Assume.nonNull(nameBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 10;
      }
    }
    do {
      if (step == 4) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c != '"' && c != '\\') {
          Assume.nonNull(nameBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '"') {
            input.step();
            step = 10;
            break;
          } else if (c == '\\') {
            input.step();
            step = 5;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('"', input));
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            Assume.nonNull(nameBuilder).appendCodePoint(c);
            input.step();
            step = 4;
            continue;
          } else if (c == 'b') {
            Assume.nonNull(nameBuilder).append('\b');
            input.step();
            step = 4;
            continue;
          } else if (c == 'f') {
            Assume.nonNull(nameBuilder).append('\f');
            input.step();
            step = 4;
            continue;
          } else if (c == 'n') {
            Assume.nonNull(nameBuilder).append('\n');
            input.step();
            step = 4;
            continue;
          } else if (c == 'r') {
            Assume.nonNull(nameBuilder).append('\r');
            input.step();
            step = 4;
            continue;
          } else if (c == 't') {
            Assume.nonNull(nameBuilder).append('\t');
            input.step();
            step = 4;
            continue;
          } else if (c == 'u') {
            input.step();
            step = 6;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 7;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 7) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 8) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 9;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 9) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          Assume.nonNull(nameBuilder).appendCodePoint(escape);
          escape = 0;
          input.step();
          step = 4;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    if (step == 10) {
      if (input.isCont() && input.head() == '(') {
        input.step();
        step = 11;
      } else if (input.isReady()) {
        try {
          builder = parser.updateAttr(builder, Assume.nonNull(nameBuilder).toString());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        return Parse.done(builder);
      }
    }
    if (step == 11) {
      if (parseBlock == null) {
        final WamlParser<V> valueParser;
        try {
          valueParser = parser.getAttrValueParser(Assume.nonNull(nameBuilder).toString());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        parseBlock = valueParser.parseBlock(input, options);
      } else {
        parseBlock = parseBlock.consume(input);
      }
      if (parseBlock.isDone()) {
        step = 12;
      } else if (parseBlock.isError()) {
        return parseBlock.asError();
      }
    }
    if (step == 12) {
      while (input.isCont() && Term.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == ')') {
        input.step();
        try {
          builder = parser.updateAttr(builder, Assume.nonNull(nameBuilder).toString(),
                                      Assume.nonNull(parseBlock).getUnchecked());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        return Parse.done(builder);
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(')', input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlAttr<V, B>(parser, options, builder, nameBuilder, parseBlock, escape, step);
  }

}









