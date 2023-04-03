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
import swim.codec.BinaryOutput;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;

@Public
@Since("5.0")
public interface Expr extends Term {

  @Override
  Term evaluate(Evaluator evaluator);

  @Override
  default Expr commit() {
    return this;
  }

  static ExprParser parser() {
    return ExprParser.PARSER;
  }

  static Parse<? extends Term> parse(Input input) {
    return Expr.parser().parseExpr(input, Term.registry());
  }

  static Parse<? extends Term> parse() {
    return Expr.parser().parseExpr(StringInput.empty(), Term.registry());
  }

  static Parse<? extends Term> parse(String string) {
    final StringInput input = new StringInput(string);
    final ExprParser parser = Expr.parser();
    while (input.isCont() && parser.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<Term> parseExcpr = parser.parseExpr(input, Term.registry());
    if (parseExcpr.isDone()) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseExcpr.complete(input);
  }

  static ExprWriter writer(@Nullable ExprWriterOptions options) {
    if (options == null || ExprWriterOptions.readable().equals(options)) {
      return ExprWriter.READABLE;
    } else if (ExprWriterOptions.compact().equals(options)) {
      return ExprWriter.COMPACT;
    } else {
      return new ExprWriter(options);
    }
  }

  static ExprWriter writer() {
    return ExprWriter.READABLE;
  }

  static Write<?> write(Output<?> output, Term term, @Nullable ExprWriterOptions options) {
    return Expr.writer(options).writeTerm(output, Term.registry(), term);
  }

  static Write<?> write(Output<?> output, Term term) {
    return Expr.writer().writeTerm(output, Term.registry(), term);
  }

  static Write<?> write(Term term, @Nullable ExprWriterOptions options) {
    return Expr.writer(options).writeTerm(BinaryOutput.full(), Term.registry(), term);
  }

  static Write<?> write(Term term) {
    return Expr.writer().writeTerm(BinaryOutput.full(), Term.registry(), term);
  }

  static String toString(Term term, @Nullable ExprWriterOptions options) {
    final StringOutput output = new StringOutput();
    Expr.writer(options).writeTerm(output, Term.registry(), term).assertDone();
    return output.get();
  }

  static String toString(Term term) {
    final StringOutput output = new StringOutput();
    Expr.writer().writeTerm(output, Term.registry(), term).assertDone();
    return output.get();
  }

}
