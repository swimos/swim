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

package swim.json.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.json.JsonNumberForm;
import swim.util.Assume;

@Internal
public final class ParseJsonNumber<T> extends Parse<T> {

  final JsonNumberForm<? extends T> form;
  final @Nullable StringBuilder builder;
  final int sign;
  final long value;
  final int digits;
  final int step;

  public ParseJsonNumber(JsonNumberForm<? extends T> form,
                         @Nullable StringBuilder builder, int sign,
                         long value, int digits, int step) {
    this.form = form;
    this.builder = builder;
    this.sign = sign;
    this.value = value;
    this.digits = digits;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonNumber.parse(input, this.form, this.builder, this.sign,
                                 this.value, this.digits, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  public static <T> Parse<T> parse(Input input, JsonNumberForm<? extends T> form,
                                   @Nullable StringBuilder builder, int sign,
                                   long value, int digits, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '-') {
          input.step();
          sign = -1;
          step = 2;
        } else if (c >= '0' && c <= '9') {
          step = 2;
        } else {
          return Parse.error(Diagnostic.expected("number", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c == '0') {
          input.step();
          step = 5;
        } else if (c >= '1' && c <= '9') {
          input.step();
          value = (long) (sign * (c - '0'));
          step = 3;
        } else {
          return Parse.error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          final long newValue = 10L * value + (long) (sign * (c - '0'));
          if (newValue / value >= 10L) {
            input.step();
            value = newValue;
          } else {
            builder = new StringBuilder();
            builder.append(value);
            step = 4;
            break;
          }
        } else {
          step = 5;
          break;
        }
      }
      if (input.isDone()) {
        return Parse.done(form.integerValue(value));
      }
    }
    if (step == 4) {
      builder = Assume.nonNull(builder);
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input.step();
          builder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '.') {
          input.step();
          builder.appendCodePoint(c);
          step = 7;
        } else if (c == 'E' || c == 'e') {
          input.step();
          builder.appendCodePoint(c);
          step = 9;
        } else {
          return Parse.done(form.bigIntegerValue(builder.toString()));
        }
      } else if (input.isDone()) {
        return Parse.done(form.bigIntegerValue(builder.toString()));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == 'x' && sign > 0 && value == 0L) {
          input.step();
          step = 6;
        } else if (c == '.') {
          input.step();
          builder = new StringBuilder();
          if (sign < 0 && value == 0L) {
            builder.append('-').append('0');
          } else {
            builder.append(value);
          }
          builder.appendCodePoint(c);
          step = 7;
        } else if (c == 'E' || c == 'e') {
          input.step();
          builder = new StringBuilder();
          if (sign < 0 && value == 0L) {
            builder.append('-').append('0');
          } else {
            builder.append(value);
          }
          builder.appendCodePoint(c);
          step = 9;
        } else {
          return Parse.done(form.integerValue(value));
        }
      } else if (input.isDone()) {
        return Parse.done(form.integerValue(value));
      }
    }
    if (step == 6) {
      while (input.isCont()) {
        c = input.head();
        if (Base16.isDigit(c)) {
          input.step();
          value = (value << 4) | (long) Base16.decodeDigit(c);
          digits += 1;
        } else {
          break;
        }
      }
      if (input.isReady()) {
        if (digits > 0) {
          return Parse.done(form.hexadecimalValue(value, digits));
        } else {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
    }
    if (step == 7) {
      builder = Assume.nonNull(builder);
      if (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input.step();
          builder.appendCodePoint(c);
          step = 8;
        } else {
          return Parse.error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 8) {
      builder = Assume.nonNull(builder);
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input.step();
          builder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont() && (c == 'E' || c == 'e')) {
        input.step();
        builder.appendCodePoint(c);
        step = 9;
      } else if (input.isReady()) {
        return Parse.done(form.decimalValue(builder.toString()));
      }
    }
    if (step == 9) {
      builder = Assume.nonNull(builder);
      if (input.isCont()) {
        c = input.head();
        if (c == '+' || c == '-') {
          input.step();
          builder.appendCodePoint(c);
        }
        step = 10;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 10) {
      builder = Assume.nonNull(builder);
      if (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input.step();
          builder.appendCodePoint(c);
          step = 11;
        } else {
          return Parse.error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 11) {
      builder = Assume.nonNull(builder);
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input.step();
          builder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        return Parse.done(form.decimalValue(builder.toString()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonNumber<T>(form, builder, sign, value, digits, step);
  }

}
