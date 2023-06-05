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
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Text;
import swim.codec.Write;
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermParser;
import swim.term.TermParserOptions;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class GlobalExpr implements Expr, ToSource {

  private GlobalExpr() {
    // singleton
  }

  @Override
  public Term evaluate(Evaluator evaluator) {
    return evaluator.globalTerm();
  }

  @Override
  public Write<?> write(Output<?> output, TermWriter<?> writer, TermWriterOptions options) {
    return Text.write(output, "$");
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("GlobalExpr", "of").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final GlobalExpr INSTANCE = new GlobalExpr();

  public static GlobalExpr of() {
    return INSTANCE;
  }

  public static SelectorExpr member(String key) {
    return new MemberExpr(GlobalExpr.of(), key);
  }

  public static SelectorExpr child(Term key) {
    return new ChildExpr(GlobalExpr.of(), key);
  }

  public static SelectorExpr children() {
    return new ChildrenExpr(GlobalExpr.of());
  }

  public static SelectorExpr descendants() {
    return new DescendantsExpr(GlobalExpr.of());
  }

  public static Parse<Expr> parse(Input input, TermParser<?> parser,
                                  TermParserOptions options) {
    return ParseGlobalExpr.parse(input, parser, options, null, 0, 1);
  }

}

final class ParseGlobalExpr extends Parse<Expr> {

  final TermParser<?> parser;
  final TermParserOptions options;
  final @Nullable StringBuilder builder;
  final int index;
  final int step;

  ParseGlobalExpr(TermParser<?> parser, TermParserOptions options,
                  @Nullable StringBuilder builder, int index, int step) {
    this.parser = parser;
    this.options = options;
    this.builder = builder;
    this.index = index;
    this.step = step;
  }

  @Override
  public Parse<Expr> consume(Input input) {
    return ParseGlobalExpr.parse(input, this.parser, this.options,
                                 this.builder, this.index, this.step);
  }

  static Parse<Expr> parse(Input input, TermParser<?> parser, TermParserOptions options,
                           @Nullable StringBuilder builder, int index, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '$') {
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("$", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (Term.isIdentifierStartChar(c)) {
          builder = new StringBuilder().appendCodePoint(c);
          input.step();
          step = 3;
        } else if (c == '0') {
          input.step();
          return Parse.done(new ChildExpr(GlobalExpr.of(), Term.of(0)));
        } else if (c >= '1' && c <= '9') {
          index = c - '0';
          input.step();
          step = 4;
        } else if (c == '*') {
          input.step();
          step = 5;
        } else {
          return Parse.done(GlobalExpr.of());
        }
      } else if (input.isDone()) {
        return Parse.done(GlobalExpr.of());
      }
    }
    if (step == 3) {
      while (input.isCont() && Term.isIdentifierChar(c = input.head())) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        return Parse.done(new ChildExpr(GlobalExpr.of(), Term.of(Assume.nonNull(builder).toString())));
      }
    }
    if (step == 4) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        final int newIndex = 10 * index + (c - '0');
        if (newIndex / index >= 10L) {
          index = newIndex;
          input.step();
        } else {
          return Parse.error(Diagnostic.message("index overflow", input));
        }
      }
      if (input.isReady()) {
        return Parse.done(new ChildExpr(GlobalExpr.of(), Term.of(index)));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '*') {
        input.step();
        return Parse.done(new DescendantsExpr(GlobalExpr.of()));
      } else if (input.isReady()) {
        return Parse.done(new ChildrenExpr(GlobalExpr.of()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseGlobalExpr(parser, options, builder, index, step);
  }

}
