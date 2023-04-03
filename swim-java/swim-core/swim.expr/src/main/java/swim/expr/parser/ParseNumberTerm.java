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
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.expr.NumberTermForm;
import swim.expr.Term;
import swim.expr.TermException;
import swim.util.Assume;

@Internal
public final class ParseNumberTerm<T> extends Parse<Term> {

  final NumberTermForm<T> form;
  final @Nullable StringBuilder builder;
  final int sign;
  final long value;
  final int digits;
  final int step;

  public ParseNumberTerm(NumberTermForm<T> form, @Nullable StringBuilder builder,
                         int sign, long value, int digits, int step) {
    this.form = form;
    this.builder = builder;
    this.sign = sign;
    this.value = value;
    this.digits = digits;
    this.step = step;
  }

  @Override
  public Parse<Term> consume(Input input) {
    return ParseNumberTerm.parse(input, this.form, this.builder, this.sign,
                                 this.value, this.digits, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  public static <T> Parse<Term> parse(Input input, NumberTermForm<T> form,
                                      @Nullable StringBuilder builder, int sign,
                                      long value, int digits, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          step = 5;
        } else { // c >= '1' && c <= '9'
          value = (long) (sign * (c - '0'));
          input.step();
          step = 3;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        final long newValue = 10L * value + (long) (sign * (c - '0'));
        if (newValue / value >= 10L) {
          value = newValue;
          input.step();
        } else {
          builder = new StringBuilder();
          builder.append(value);
          break;
        }
      }
      if (input.isCont()) {
        if (c >= '0' && c <= '9') {
          step = 4;
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        try {
          return Parse.done(form.intoTerm(form.integerValue(value)));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 4) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == '.' || c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        if (c == '.') {
          step = 7;
        } else { // c == 'E' || c == 'e'
          step = 9;
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(form.intoTerm(form.bigIntegerValue(Assume.nonNull(builder).toString())));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 5) {
      if (input.isCont() && (((c = input.head()) == 'x' && sign > 0 && value == 0L)
                            || c == '.' || c == 'E' || c == 'e')) {
        if (c == 'x') {
          input.step();
          step = 6;
        } else { // c == '.' || c == 'E' || c == 'e'
          builder = new StringBuilder();
          if (sign < 0 && value == 0L) {
            builder.append('-').append('0');
          } else {
            builder.append(value);
          }
          builder.appendCodePoint(c);
          input.step();
          if (c == '.') {
            step = 7;
          } else { // c == 'E' || c == 'e'
            step = 9;
          }
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(form.intoTerm(form.integerValue(value)));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 6) {
      while (input.isCont() && Base16.isDigit(c = input.head())) {
        value = (value << 4) | (long) Base16.decodeDigit(c);
        digits += 1;
        input.step();
      }
      if (input.isReady()) {
        if (digits > 0) {
          try {
            return Parse.done(form.intoTerm(form.hexadecimalValue(value, digits)));
          } catch (TermException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
    }
    if (step == 7) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 8;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 8) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 9;
      } else if (input.isReady()) {
        try {
          return Parse.done(form.intoTerm(form.decimalValue(Assume.nonNull(builder).toString())));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 9) {
      if (input.isCont()) {
        if ((c = input.head()) == '+' || c == '-') {
          Assume.nonNull(builder).appendCodePoint(c);
          input.step();
        }
        step = 10;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 10) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 11;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 11) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(form.intoTerm(form.decimalValue(Assume.nonNull(builder).toString())));
        } catch (TermException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseNumberTerm<T>(form, builder, sign, value, digits, step);
  }

}
