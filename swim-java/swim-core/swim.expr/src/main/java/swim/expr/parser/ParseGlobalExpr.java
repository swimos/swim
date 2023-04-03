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
import swim.expr.ExprParser;
import swim.expr.GlobalExpr;
import swim.expr.NumberTermForm;
import swim.expr.StringTermForm;
import swim.expr.Term;
import swim.expr.TermException;
import swim.expr.TermForm;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.util.Assume;

@Internal
public final class ParseGlobalExpr extends Parse<Term> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable Object builder;
  final int index;
  final int step;

  public ParseGlobalExpr(ExprParser parser, TermForm<?> form,
                         @Nullable Object builder, int index, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.index = index;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseGlobalExpr.parse(input, this.parser, this.form,
                                 this.builder, this.index, this.step);
  }

  public static Parse<Term> parse(Input input, ExprParser parser, TermForm<?> form,
                                  @Nullable Object builder, int index, int step) {
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
        if (parser.isIdentifierStartChar(c)) {
          try {
            final StringTermForm<Object, Object> stringForm = Assume.conforms(form.stringForm());
            builder = stringForm.stringBuilder();
            builder = stringForm.appendCodePoint(builder, c);
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          step = 3;
        } else if (c == '0') {
          final Term indexTerm;
          try {
            final NumberTermForm<Object> numberForm = Assume.conforms(form.numberForm());
            indexTerm = numberForm.intoTerm(numberForm.integerValue(0));
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          return Parse.done(new ChildExpr(GlobalExpr.of(), indexTerm));
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
      final StringTermForm<Object, Object> stringForm;
      try {
        stringForm = Assume.conforms(form.stringForm());
      } catch (TermException cause) {
        return Parse.diagnostic(input, cause);
      }
      while (input.isCont() && parser.isIdentifierChar(c = input.head())) {
        try {
          builder = stringForm.appendCodePoint(Assume.nonNull(builder), c);
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        input.step();
      }
      if (input.isReady()) {
        final Term keyTerm;
        try {
          keyTerm = stringForm.intoTerm(stringForm.buildString(Assume.nonNull(builder)));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        return Parse.done(new ChildExpr(GlobalExpr.of(), keyTerm));
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
        final Term indexTerm;
        try {
          final NumberTermForm<Object> numberForm = Assume.conforms(form.numberForm());
          indexTerm = numberForm.intoTerm(numberForm.integerValue(index));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
        return Parse.done(new ChildExpr(GlobalExpr.of(), indexTerm));
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
    return new ParseGlobalExpr(parser, form, builder, index, step);
  }

}
