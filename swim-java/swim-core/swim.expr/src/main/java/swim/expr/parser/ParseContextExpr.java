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

package swim.expr.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.ContextExpr;
import swim.expr.ExprParser;
import swim.expr.NumberTermForm;
import swim.expr.StringTermForm;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.util.Assume;

@Internal
public final class ParseContextExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable Object builder;
  final int index;
  final int step;

  public ParseContextExpr(ExprParser parser, TermForm<?> form,
                          @Nullable Object builder, int index, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.index = index;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseContextExpr.parse(input, this.parser, this.form,
                                  this.builder, this.index, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable Object builder, int index, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '%') {
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("%", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierStartChar(c)) {
          input.step();
          final StringTermForm<Object, Object> stringForm = Assume.conformsNullable(form.stringForm());
          if (stringForm != null) {
            builder = stringForm.stringBuilder();
            builder = stringForm.appendCodePoint(builder, c);
            step = 3;
          } else {
            return Parse.error(Diagnostic.message("unexpected identifier", input));
          }
        } else if (c == '0') {
          input.step();
          final NumberTermForm<Object> numberForm = Assume.conformsNullable(form.numberForm());
          if (numberForm != null) {
            final Term indexTerm = numberForm.intoTerm(numberForm.integerValue(0));
            return Parse.done(new ChildExpr(ContextExpr.of(), indexTerm));
          } else {
            return Parse.error(Diagnostic.message("unexpected number", input));
          }
        } else if (c >= '1' && c <= '9') {
          input.step();
          index = c - '0';
          step = 4;
        } else if (c == '*') {
          input.step();
          step = 5;
        } else {
          return Parse.done(ContextExpr.of());
        }
      } else if (input.isDone()) {
        return Parse.done(ContextExpr.of());
      }
    }
    if (step == 3) {
      builder = Assume.nonNull(builder);
      final StringTermForm<Object, Object> stringForm = Assume.conformsNonNull(form.stringForm());
      while (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierChar(c)) {
          input.step();
          builder = stringForm.appendCodePoint(builder, c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        final Term keyTerm = stringForm.intoTerm(stringForm.buildString(builder));
        return Parse.done(new ChildExpr(ContextExpr.of(), keyTerm));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          final int newIndex = 10 * index + (c - '0');
          if (newIndex / index >= 10L) {
            input.step();
            index = newIndex;
          } else {
            return Parse.error(Diagnostic.message("index overflow", input));
          }
        } else {
          break;
        }
      }
      if (input.isReady()) {
        final NumberTermForm<Object> numberForm = Assume.conformsNullable(form.numberForm());
        if (numberForm != null) {
          final Term indexTerm = numberForm.intoTerm(numberForm.integerValue(index));
          return Parse.done(new ChildExpr(ContextExpr.of(), indexTerm));
        } else {
          return Parse.error(Diagnostic.message("unexpected number", input));
        }
      }
    }
    if (step == 5) {
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
    return new ParseContextExpr(parser, form, builder, index, step);
  }

}
