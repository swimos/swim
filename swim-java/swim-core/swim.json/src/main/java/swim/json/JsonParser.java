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

package swim.json;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.json.parser.ParseJsonArray;
import swim.json.parser.ParseJsonExpr;
import swim.json.parser.ParseJsonIdentifier;
import swim.json.parser.ParseJsonLiteral;
import swim.json.parser.ParseJsonNull;
import swim.json.parser.ParseJsonNumber;
import swim.json.parser.ParseJsonObject;
import swim.json.parser.ParseJsonString;
import swim.json.parser.ParseJsonUndefined;
import swim.json.parser.ParseJsonValue;
import swim.util.Notation;

/**
 * Factory for constructing JSON parsers.
 */
@Public
@Since("5.0")
public class JsonParser extends ExprParser {

  protected final JsonParserOptions options;

  protected JsonParser(JsonParserOptions options) {
    this.options = options;
  }

  public JsonParserOptions options() {
    return this.options;
  }

  @Override
  public Parse<Term> parseLiteralExpr(Input input, TermForm<?> form) {
    if (form instanceof JsonForm<?>) {
      return ParseJsonLiteral.parse(input, this, (JsonForm<?>) form, null, 1);
    } else {
      return super.parseLiteralExpr(input, form);
    }
  }

  public <T> Parse<T> parseExpr(Input input, JsonForm<? extends T> form) {
    if (this.options().exprsEnabled()) {
      return ParseJsonExpr.parse(input, this, form, null);
    } else {
      return this.parseValue(input, form);
    }
  }

  public <T> Parse<T> parseUndefined(Input input, JsonUndefinedForm<? extends T> form) {
    return ParseJsonUndefined.parse(input, form, 0);
  }

  public <T> Parse<T> parseNull(Input input, JsonNullForm<? extends T> form) {
    return ParseJsonNull.parse(input, form, 0);
  }

  public <T> Parse<T> parseNumber(Input input, JsonNumberForm<? extends T> form) {
    return ParseJsonNumber.parse(input, form, null, 1, 0L, 0, 1);
  }

  public <T> Parse<T> parseIdentifier(Input input, JsonIdentifierForm<? extends T> form) {
    return ParseJsonIdentifier.parse(input, this, form, null, 1);
  }

  public <T> Parse<T> parseString(Input input, JsonStringForm<?, ? extends T> form) {
    return ParseJsonString.parse(input, form, null, 0, 1);
  }

  public <B, T> Parse<T> parseArray(Input input, JsonArrayForm<?, B, ? extends T> form,
                                    @Nullable B builder) {
    return ParseJsonArray.parse(input, this, form, builder, null, 1);
  }

  public <T> Parse<T> parseArray(Input input, JsonArrayForm<?, ?, ? extends T> form) {
    return ParseJsonArray.parse(input, this, form, null, null, 1);
  }

  public <B, T> Parse<T> parseObject(Input input, JsonObjectForm<?, ?, B, ? extends T> form,
                                     @Nullable B builder) {
    return ParseJsonObject.parse(input, this, form, builder, null, null, null, 1);
  }

  public <T> Parse<T> parseObject(Input input, JsonObjectForm<?, ?, ?, ? extends T> form) {
    return ParseJsonObject.parse(input, this, form, null, null, null, null, 1);
  }

  public <T> Parse<T> parseValue(Input input, JsonForm<? extends T> form) {
    return ParseJsonValue.parse(input, this, form);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Json", "parser")
            .appendArgument(this.options)
            .endInvoke();
  }

  static final JsonParser STANDARD = new JsonParser(JsonParserOptions.standard());

  static final JsonParser EXPRESSIONS = new JsonParser(JsonParserOptions.expressions());

}
