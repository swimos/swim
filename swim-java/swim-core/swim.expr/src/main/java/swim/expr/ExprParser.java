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

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.parser.ParseAdditiveExpr;
import swim.expr.parser.ParseAndExpr;
import swim.expr.parser.ParseBitwiseAndExpr;
import swim.expr.parser.ParseBitwiseOrExpr;
import swim.expr.parser.ParseBitwiseXorExpr;
import swim.expr.parser.ParseComparisonExpr;
import swim.expr.parser.ParseCondExpr;
import swim.expr.parser.ParseContextExpr;
import swim.expr.parser.ParseFormatExpr;
import swim.expr.parser.ParseGlobalExpr;
import swim.expr.parser.ParseIdentifierTerm;
import swim.expr.parser.ParseLiteralExpr;
import swim.expr.parser.ParseMultiplicativeExpr;
import swim.expr.parser.ParseNumberTerm;
import swim.expr.parser.ParseOrExpr;
import swim.expr.parser.ParsePrefixExpr;
import swim.expr.parser.ParsePrimaryExpr;
import swim.expr.parser.ParseSelectorExpr;
import swim.expr.parser.ParseStringTerm;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * Factory for constructing expression parsers.
 */
@Public
@Since("5.0")
public class ExprParser extends ExprLexer implements ToSource {

  protected ExprParser() {
    // nop
  }

  public Parse<Term> parseNumberTerm(Input input, NumberTermForm<?> form) {
    return ParseNumberTerm.parse(input, form, null, 1, 0L, 0, 1);
  }

  public Parse<Term> parseIdentifierTerm(Input input, IdentifierTermForm<?> form) {
    return ParseIdentifierTerm.parse(input, this, form, null, 1);
  }

  public Parse<Term> parseStringTerm(Input input, StringTermForm<?, ?> form) {
    return ParseStringTerm.parse(input, form, null, 0, 1);
  }

  public Parse<Term> parseGlobalExpr(Input input, TermForm<?> form) {
    return ParseGlobalExpr.parse(input, this, form, null, 0, 1);
  }

  public Parse<Term> parseContextExpr(Input input, TermForm<?> form) {
    return ParseContextExpr.parse(input, this, form, null, 0, 1);
  }

  public Parse<Term> parseLiteralExpr(Input input, TermForm<?> form) {
    return ParseLiteralExpr.parse(input, this, form, 1);
  }

  public Parse<Term> parseSelectorExpr(Input input, TermForm<?> form, Term term) {
    return ParseSelectorExpr.parse(input, this, form, term, null, null, null, 0, 1);
  }

  public Parse<Term> parsePrimaryExpr(Input input, TermForm<?> form) {
    return ParsePrimaryExpr.parse(input, this, form, null, 1);
  }

  public Parse<Term> parsePrefixExpr(Input input, TermForm<?> form) {
    return ParsePrefixExpr.parse(input, this, form, null, null, 1);
  }

  public Parse<Term> parseMultiplicativeExpr(Input input, TermForm<?> form) {
    return ParseMultiplicativeExpr.parse(input, this, form, null, null, null, 1);
  }

  public Parse<Term> parseAdditiveExpr(Input input, TermForm<?> form) {
    return ParseAdditiveExpr.parse(input, this, form, null, null, null, 1);
  }

  public Parse<Term> parseComparisonExpr(Input input, TermForm<?> form) {
    return ParseComparisonExpr.parse(input, this, form, null, null, null, 1);
  }

  public Parse<Term> parseBitwiseAndExpr(Input input, TermForm<?> form) {
    return ParseBitwiseAndExpr.parse(input, this, form, null, null, 1);
  }

  public Parse<Term> parseBitwiseXorExpr(Input input, TermForm<?> form) {
    return ParseBitwiseXorExpr.parse(input, this, form, null, null, 1);
  }

  public Parse<Term> parseBitwiseOrExpr(Input input, TermForm<?> form) {
    return ParseBitwiseOrExpr.parse(input, this, form, null, null, 1);
  }

  public Parse<Term> parseAndExpr(Input input, TermForm<?> form) {
    return ParseAndExpr.parse(input, this, form, null, null, 1);
  }

  public Parse<Term> parseOrExpr(Input input, TermForm<?> form) {
    return ParseOrExpr.parse(input, this, form, null, null, 1);
  }

  public Parse<Term> parseCondExpr(Input input, TermForm<?> form) {
    return ParseCondExpr.parse(input, this, form, null, null, null, 1);
  }

  public Parse<Term> parseExpr(Input input, TermForm<?> form) {
    return this.parseCondExpr(input, form);
  }

  public Parse<Term> parseGroupExpr(Input input, TermForm<?> form) {
    return this.parseExpr(input, form);
  }

  public Parse<FormatExpr> parseFormatExpr(Input input, TermForm<?> form) {
    return ParseFormatExpr.parse(input, this, form, null, null, null, 0, 1);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Expr", "parser").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final ExprParser PARSER = new ExprParser();

}
