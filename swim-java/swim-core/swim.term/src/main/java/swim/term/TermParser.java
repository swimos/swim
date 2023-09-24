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

package swim.term;

import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.codec.Parser;
import swim.expr.ChildrenExpr;
import swim.expr.CondExpr;
import swim.expr.ContextExpr;
import swim.expr.DescendantsExpr;
import swim.expr.GlobalExpr;
import swim.expr.SelectorExpr;
import swim.util.Assume;

/**
 * A parser of values optionally embedded in expressions.
 *
 * @param <T> the type of values to parse
 */
@Public
@Since("5.0")
public interface TermParser<@Covariant T> extends Parser<T> {

  Parse<T> parse(Input input, TermParserOptions options);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, TermParserOptions.standard());
  }

  default Parse<Object> parseGroup(Input input, TermParserOptions options) {
    return this.parseExpr(input, options);
  }

  default Parse<Object> parseExpr(Input input, TermParserOptions options) {
    return CondExpr.parse(input, this, options);
  }

  default Parse<Object> parsePrimary(Input input, TermParserOptions options) {
    return ParsePrimaryExpr.parse(input, this, options, null, 1);
  }

  default Parse<Object> parseLiteral(Input input, TermParserOptions options) {
    return ParseLiteralExpr.parse(input, this, options, 1);
  }

  Parse<T> parseValue(Input input, TermParserOptions options);

  default Parse<Term> parseTerm(Input input, TermParserOptions options) {
    return ParseTerm.parse(input, this, options, null);
  }

}

final class ParsePrimaryExpr extends Parse<Object> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable Parse<Object> parseExpr;
  final int step;

  ParsePrimaryExpr(TermParser<?> parser, TermParserOptions options,
                   @Nullable Parse<Object> parseExpr, int step) {
    this.parser = parser;
    this.options = options;
    this.parseExpr = parseExpr;
    this.step = step;
  }

  @Override
  public Parse<Object> consume(Input input) {
    return ParsePrimaryExpr.parse(input, this.parser, this.options, this.parseExpr, this.step);
  }

  static Parse<Object> parse(Input input, TermParser<?> parser, TermParserOptions options,
                             @Nullable Parse<Object> parseExpr, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont() && Term.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == '(') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        step = 2;
      }
    }
    if (step == 2) {
      if (parseExpr == null) {
        parseExpr = parser.parseLiteral(input, options);
      } else {
        parseExpr = parseExpr.consume(input);
      }
      if (parseExpr.isDone()) {
        step = 6;
      } else if (parseExpr.isError()) {
        return parseExpr.asError();
      }
    }
    if (step == 3) {
      while (input.isCont() && Term.isWhitespace(input.head())) {
        input.step();
      }
      if (input.isReady()) {
        step = 4;
      }
    }
    if (step == 4) {
      if (parseExpr == null) {
        parseExpr = parser.parseGroup(input, options);
      } else {
        parseExpr = parseExpr.consume(input);
      }
      if (parseExpr.isDone()) {
        step = 5;
      } else if (parseExpr.isError()) {
        return parseExpr.asError();
      }
    }
    if (step == 5) {
      while (input.isCont() && Term.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == ')') {
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(')', input));
      }
    }
    if (step == 6) {
      while (input.isCont() && Term.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && (c == ':' || c == '.' || c == '[' || c == '(')) {
        final Term term;
        try {
          term = options.termRegistry().intoTerm(Assume.nonNull(parseExpr).getUnchecked()).flatten();
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        return Assume.covariant(SelectorExpr.parse(input, parser, options, term));
      } else if (input.isReady()) {
        return Assume.nonNull(parseExpr);
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParsePrimaryExpr(parser, options, parseExpr, step);
  }

}

final class ParseLiteralExpr extends Parse<Object> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final int step;

  ParseLiteralExpr(TermParser<?> parser, TermParserOptions options, int step) {
    this.parser = parser;
    this.options = options;
    this.step = step;
  }

  @Override
  public Parse<Object> consume(Input input) {
    return ParseLiteralExpr.parse(input, this.parser, this.options, this.step);
  }

  static Parse<Object> parse(Input input, TermParser<?> parser,
                             TermParserOptions options, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont() && Term.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == '%') {
          return Assume.covariant(ContextExpr.parse(input, parser, options));
        } else if (c == '$') {
          return Assume.covariant(GlobalExpr.parse(input, parser, options));
        } else if (c == '*') {
          input.step();
          step = 2;
        } else {
          return Assume.covariant(parser.parseValue(input, options));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("literal", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == '*') {
        input.step();
        return Parse.done(new DescendantsExpr(ContextExpr.of()));
      } else if (input.isReady()) {
        return Parse.done(new ChildrenExpr(ContextExpr.of()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseLiteralExpr(parser, options, step);
  }

}

final class ParseTerm extends Parse<Term> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable Parse<Object> parseExpr;

  ParseTerm(TermParser<?> parser, TermParserOptions options,
            @Nullable Parse<Object> parseExpr) {
    this.parser = parser;
    this.options = options;
    this.parseExpr = parseExpr;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseTerm.parse(input, this.parser, this.options, this.parseExpr);
  }

  static Parse<Term> parse(Input input, TermParser<?> parser, TermParserOptions options,
                           @Nullable Parse<Object> parseExpr) {
    if (parseExpr == null) {
      parseExpr = parser.parseExpr(input, options);
    } else {
      parseExpr = parseExpr.consume(input);
    }
    if (parseExpr.isDone()) {
      final Term term;
      try {
        term = options.termRegistry().intoTerm(parseExpr.getUnchecked()).flatten();
      } catch (TermException cause) {
        return Parse.diagnostic(input, cause);
      }
      return Parse.done(term);
    } else if (parseExpr.isError()) {
      return parseExpr.asError();
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseTerm(parser, options, parseExpr);
  }

}
