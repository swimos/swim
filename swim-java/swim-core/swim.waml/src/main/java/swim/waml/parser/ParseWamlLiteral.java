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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ContextExpr;
import swim.expr.Term;
import swim.expr.TermException;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.util.Assume;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlLiteral extends Parse<Term> {

  final WamlParser parser;
  final WamlForm<?> form;
  final @Nullable Parse<?> parseValue;
  final int step;

  public ParseWamlLiteral(WamlParser parser, WamlForm<?> form,
                          @Nullable Parse<?> parseValue, int step) {
    this.parser = parser;
    this.form = form;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseWamlLiteral.parse(input, this.parser, this.form,
                                  this.parseValue, this.step);
  }

  public static Parse<Term> parse(Input input, WamlParser parser, WamlForm<?> form,
                                  @Nullable Parse<?> parseValue, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont() && parser.isSpace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == '%') {
          return parser.parseContextExpr(input, form);
        } else if (c == '$') {
          return parser.parseGlobalExpr(input, form);
        } else if (c == '*') {
          input.step();
          step = 2;
        } else {
          step = 3;
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
    if (step == 3) {
      if (parseValue == null) {
        parseValue = parser.parseValue(input, form);
      } else {
        parseValue = parseValue.consume(input);
      }
      if (parseValue.isDone()) {
        final Object value = parseValue.getUnchecked();
        final Term term;
        try {
          term = Assume.<WamlForm<Object>>conforms(form).intoTerm(value);
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        if (value == term) {
          return Assume.conforms(parseValue);
        } else {
          return Parse.done(term);
        }
      } else if (parseValue.isError()) {
        return parseValue.asError();
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlLiteral(parser, form, parseValue, step);
  }

}
