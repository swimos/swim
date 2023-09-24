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

package swim.expr;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class AndExpr extends InfixExpr implements WriteSource {

  public AndExpr(Term lhs, Term rhs) {
    super(lhs, rhs);
  }

  @Override
  public String operator() {
    return "&&";
  }

  @Override
  public int precedence() {
    return 4;
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    Term result = this.lhs.evaluate(evaluator);
    if (result.isTruthy()) {
      result = this.rhs.evaluate(evaluator);
    }
    return result;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AndExpr that) {
      return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(AndExpr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.lhs.hashCode()), this.rhs.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("AndExpr", "of")
            .appendArgument(this.lhs)
            .appendArgument(this.rhs)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static AndExpr of(Term lhs, Term rhs) {
    return new AndExpr(lhs, rhs);
  }

  public static Parse<Object> parse(Input input, TermParser<?> parser,
                                    TermParserOptions options) {
    return ParseAndExpr.parse(input, parser, options, null, null, 1);
  }

}

final class ParseAndExpr extends Parse<Object> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable Parse<Object> parseLhs;
  final @Nullable Parse<Object> parseRhs;
  final int step;

  ParseAndExpr(TermParser<?> parser, TermParserOptions options,
               @Nullable Parse<Object> parseLhs,
               @Nullable Parse<Object> parseRhs, int step) {
    this.parser = parser;
    this.options = options;
    this.parseLhs = parseLhs;
    this.parseRhs = parseRhs;
    this.step = step;
  }

  @Override
  public Parse<Object> consume(Input input) {
    return ParseAndExpr.parse(input, this.parser, this.options, this.parseLhs,
                              this.parseRhs, this.step);
  }

  static Parse<Object> parse(Input input, TermParser<?> parser, TermParserOptions options,
                             @Nullable Parse<Object> parseLhs,
                             @Nullable Parse<Object> parseRhs, int step) {
    int c = 0;
    if (step == 1) {
      if (parseLhs == null) {
        parseLhs = BitwiseOrExpr.parse(input, parser, options);
      } else {
        parseLhs = parseLhs.consume(input);
      }
      if (parseLhs.isDone()) {
        step = 2;
      } else if (parseLhs.isError()) {
        return parseLhs.asError();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '&') {
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Assume.nonNull(parseLhs);
        }
      }
      if (step == 3) {
        if (input.isCont() && input.head() == '&') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected('&', input));
        }
      }
      if (step == 4) {
        if (parseRhs == null) {
          parseRhs = BitwiseOrExpr.parse(input, parser, options);
        } else {
          parseRhs = parseRhs.consume(input);
        }
        if (parseRhs.isDone()) {
          final Term lhs;
          try {
            lhs = options.termRegistry().intoTerm(Assume.nonNull(parseLhs).getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          final Term rhs;
          try {
            rhs = options.termRegistry().intoTerm(parseRhs.getUnchecked()).flatten();
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseLhs = Parse.done(new AndExpr(lhs, rhs));
          parseRhs = null;
          step = 2;
          continue;
        } else if (parseRhs.isError()) {
          return parseRhs.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseAndExpr(parser, options, parseLhs, parseRhs, step);
  }

}
