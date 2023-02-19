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

package swim.waml.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.Term;
import swim.util.Assume;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlExpr<T> extends Parse<T> {

  final WamlParser parser;
  final WamlForm<? extends T> form;
  final @Nullable Parse<Term> parseExpr;

  public ParseWamlExpr(WamlParser parser, WamlForm<? extends T> form,
                       @Nullable Parse<Term> parseExpr) {
    this.parser = parser;
    this.form = form;
    this.parseExpr = parseExpr;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlExpr.parse(input, this.parser, this.form, this.parseExpr);
  }

  public static <T> Parse<T> parse(Input input, WamlParser parser,
                                   WamlForm<? extends T> form,
                                   @Nullable Parse<Term> parseExpr) {
    if (parseExpr == null) {
      parseExpr = parser.parseCondExpr(input, form);
    } else {
      parseExpr = parseExpr.consume(input);
    }
    if (parseExpr.isDone()) {
      final Term term = parseExpr.getNonNull();
      final T value = form.fromTerm(term);
      if (term == value) {
        return Assume.conforms(parseExpr);
      } else {
        return Parse.done(value);
      }
    } else if (parseExpr.isError()) {
      return parseExpr.asError();
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlExpr<T>(parser, form, parseExpr);
  }

}
