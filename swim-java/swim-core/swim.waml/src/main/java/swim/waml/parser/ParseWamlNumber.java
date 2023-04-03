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
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.util.Assume;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlNumberForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlNumber<T> extends Parse<T> {

  final WamlParser parser;
  final WamlNumberForm<? extends T> form;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final @Nullable StringBuilder builder;
  final int sign;
  final long value;
  final int digits;
  final int step;

  public ParseWamlNumber(WamlParser parser, WamlNumberForm<? extends T> form,
                         @Nullable Parse<WamlForm<T>> parseAttr,
                         @Nullable StringBuilder builder, int sign,
                         long value, int digits, int step) {
    this.parser = parser;
    this.form = form;
    this.parseAttr = parseAttr;
    this.builder = builder;
    this.sign = sign;
    this.value = value;
    this.digits = digits;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlNumber.parse(input, this.parser, this.form, this.parseAttr,
                                 this.builder, this.sign, this.value,
                                 this.digits, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  public static <T> Parse<T> parse(Input input, WamlParser parser,
                                   WamlNumberForm<? extends T> form,
                                   @Nullable Parse<WamlForm<T>> parseAttr,
                                   @Nullable StringBuilder builder, int sign,
                                   long value, int digits, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        step = 4;
      }
    }
    do {
      if (step == 2) {
        if (parseAttr == null) {
          parseAttr = Assume.conforms(parser.parseAttr(input, form));
        } else {
          parseAttr = parseAttr.consume(input);
        }
        if (parseAttr.isDone()) {
          form = Assume.conforms(parseAttr.getNonNullUnchecked());
          parseAttr = null;
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '@') {
          step = 2;
          continue;
        } else if (input.isReady()) {
          step = 4;
        }
      }
      break;
    } while (true);
    if (step == 4) {
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 5) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          step = 8;
        } else { // c >= '1' && c <= '9'
          value = (long) (sign * (c - '0'));
          input.step();
          step = 6;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 6) {
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
          step = 7;
        } else {
          step = 8;
        }
      } else if (input.isDone()) {
        try {
          return Parse.done(form.integerValue(value));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 7) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == '.' || c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        if (c == '.') {
          step = 10;
        } else { // c == 'E' || c == 'e'
          step = 12;
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(form.bigIntegerValue(Assume.nonNull(builder).toString()));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 8) {
      if (input.isCont() && (((c = input.head()) == 'x' && sign > 0 && value == 0L)
                            || c == '.' || c == 'E' || c == 'e')) {
        if (c == 'x') {
          input.step();
          step = 9;
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
            step = 10;
          } else { // c == 'E' || c == 'e'
            step = 12;
          }
        }
      } else if (input.isReady()) {
        try {
          return Parse.done(form.integerValue(value));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 9) {
      while (input.isCont() && Base16.isDigit(c = input.head())) {
        value = (value << 4) | (long) Base16.decodeDigit(c);
        digits += 1;
        input.step();
      }
      if (input.isReady()) {
        if (digits > 0) {
          try {
            return Parse.done(form.hexadecimalValue(value, digits));
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
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
      if (input.isCont() && (c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 12;
      } else if (input.isReady()) {
        try {
          return Parse.done(form.decimalValue(Assume.nonNull(builder).toString()));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 12) {
      if (input.isCont()) {
        if ((c = input.head()) == '+' || c == '-') {
          Assume.nonNull(builder).appendCodePoint(c);
          input.step();
        }
        step = 13;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 13) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 14;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 14) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(form.decimalValue(Assume.nonNull(builder).toString()));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlNumber<T>(parser, form, parseAttr, builder,
                                  sign, value, digits, step);
  }

}
