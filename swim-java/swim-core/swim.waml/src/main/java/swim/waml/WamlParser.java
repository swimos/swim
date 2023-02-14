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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.util.Notation;
import swim.waml.parser.ParseWamlArray;
import swim.waml.parser.ParseWamlAttr;
import swim.waml.parser.ParseWamlBlock;
import swim.waml.parser.ParseWamlExpr;
import swim.waml.parser.ParseWamlGroup;
import swim.waml.parser.ParseWamlIdentifier;
import swim.waml.parser.ParseWamlInline;
import swim.waml.parser.ParseWamlLiteral;
import swim.waml.parser.ParseWamlMarkup;
import swim.waml.parser.ParseWamlNumber;
import swim.waml.parser.ParseWamlObject;
import swim.waml.parser.ParseWamlString;
import swim.waml.parser.ParseWamlTuple;
import swim.waml.parser.ParseWamlUnit;
import swim.waml.parser.ParseWamlValue;

/**
 * Factory for constructing WAML parsers.
 */
@Public
@Since("5.0")
public class WamlParser extends ExprParser {

  protected final WamlParserOptions options;

  protected WamlParser(WamlParserOptions options) {
    this.options = options;
  }

  public WamlParserOptions options() {
    return this.options;
  }

  @Override
  public Parse<Term> parseLiteralExpr(Input input, TermForm<?> form) {
    if (form instanceof WamlForm<?>) {
      return ParseWamlLiteral.parse(input, this, (WamlForm<?>) form, null, 1);
    } else {
      return super.parseLiteralExpr(input, form);
    }
  }

  @Override
  public Parse<Term> parseGroupExpr(Input input, TermForm<?> form) {
    if (form instanceof WamlForm<?>) {
      return ParseWamlGroup.parse(input, this, (WamlForm<?>) form, null);
    } else {
      return super.parseGroupExpr(input, form);
    }
  }

  public <T> Parse<T> parseExpr(Input input, WamlForm<? extends T> form) {
    if (this.options().exprsEnabled()) {
      return ParseWamlExpr.parse(input, this, form, null);
    } else {
      return this.parseValue(input, form);
    }
  }

  public <T> Parse<T> parseUndefined(Input input, WamlUndefinedForm<? extends T> form) {
    return Parse.error(Diagnostic.message("undefined is not parsable", input));
  }

  public <T> Parse<T> parseUnit(Input input, WamlUnitForm<? extends T> form) {
    return ParseWamlUnit.parse(input, this, form, null, 1);
  }

  public <T> Parse<T> parseNumber(Input input, WamlNumberForm<? extends T> form) {
    return ParseWamlNumber.parse(input, this, form, null, null, 1, 0L, 0, 1);
  }

  public <T> Parse<T> parseIdentifier(Input input, WamlIdentifierForm<? extends T> form) {
    return ParseWamlIdentifier.parse(input, this, form, null, null, 1);
  }

  public <T> Parse<T> parseString(Input input, WamlStringForm<?, ? extends T> form) {
    return ParseWamlString.parse(input, this, form, null, null, 0, 0, 1);
  }

  public <B, T> Parse<T> parseArray(Input input, WamlArrayForm<?, B, ? extends T> form,
                                    @Nullable B builder) {
    return ParseWamlArray.parse(input, this, form, builder, null, null, 1);
  }

  public <T> Parse<T> parseArray(Input input, WamlArrayForm<?, ?, ? extends T> form) {
    return ParseWamlArray.parse(input, this, form, null, null, null, 1);
  }

  public <T> Parse<T> parseInline(Input input, WamlForm<T> form) {
    return ParseWamlInline.parse(input, this, form, null, null, 1);
  }

  public <T> Parse<T> parseMarkup(Input input, WamlMarkupForm<?, ?, ? extends T> form) {
    return ParseWamlMarkup.parse(input, this, form, null, null, null, null, 0, 1);
  }

  public <T> Parse<T> parseMarkupRest(Input input, WamlMarkupForm<?, ?, ? extends T> form) {
    return ParseWamlMarkup.parse(input, this, form, null, null, null, null, 0, 5);
  }

  public <B, T> Parse<T> parseObject(Input input, WamlObjectForm<?, ?, B, ? extends T> form,
                                     @Nullable B builder) {
    return ParseWamlObject.parse(input, this, form, builder, null, null, null, null, 1);
  }

  public <T> Parse<T> parseObject(Input input, WamlObjectForm<?, ?, ?, ? extends T> form) {
    return ParseWamlObject.parse(input, this, form, null, null, null, null, null, 1);
  }

  public <T> Parse<T> parseTuple(Input input, WamlForm<? extends T> form) {
    return ParseWamlTuple.parse(input, this, form, null, null, 1);
  }

  public <T> Parse<T> parseValue(Input input, WamlForm<? extends T> form) {
    return ParseWamlValue.parse(input, this, form, null, 1);
  }

  public <T> Parse<T> parseBlock(Input input, WamlForm<? extends T> form) {
    if (form instanceof WamlTupleForm<?, ?, ?, ?>) {
      return ParseWamlBlock.parse(input, this, (WamlTupleForm<?, ?, ?, ? extends T>) form,
                                  null, null, null, 1);
    } else {
      return this.parseExpr(input, form);
    }
  }

  public <T> Parse<WamlForm<T>> parseAttr(Input input, WamlForm<T> form) {
    return ParseWamlAttr.parse(input, this, form, null, null, null, 0, 1);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Waml", "parser")
            .appendArgument(this.options)
            .endInvoke();
  }

  static final WamlParser STANDARD = new WamlParser(WamlParserOptions.standard());

  static final WamlParser EXPRESSIONS = new WamlParser(WamlParserOptions.expressions());

}
