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
import swim.expr.ExprParser;
import swim.expr.FormatExpr;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.util.ArrayBuilder;
import swim.util.Assume;

@Internal
public final class ParseFormatExpr extends Parse<FormatExpr> {

  final ExprParser parser;
  final TermForm<?> form;
  final @Nullable StringBuilder stringBuilder;
  final @Nullable ArrayBuilder<Object, Object[]> partsBuilder;
  final @Nullable Parse<Term> parsePart;
  final int escape;
  final int step;

  public ParseFormatExpr(ExprParser parser, TermForm<?> form,
                         @Nullable StringBuilder stringBuilder,
                         @Nullable ArrayBuilder<Object, Object[]> partsBuilder,
                         @Nullable Parse<Term> parsePart, int escape, int step) {
    this.parser = parser;
    this.form = form;
    this.stringBuilder = stringBuilder;
    this.partsBuilder = partsBuilder;
    this.parsePart = parsePart;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<FormatExpr> consume(Input input) {
    return ParseFormatExpr.parse(input, this.parser, this.form,
                                 this.stringBuilder, this.partsBuilder,
                                 this.parsePart, this.escape, this.step);
  }

  public static Parse<FormatExpr> parse(Input input, ExprParser parser, TermForm<?> form,
                                        @Nullable StringBuilder stringBuilder,
                                        @Nullable ArrayBuilder<Object, Object[]> partsBuilder,
                                        @Nullable Parse<Term> parsePart,
                                        int escape, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont() && (c = input.head()) != '\\' && c != '{' && c != '}') {
          if (stringBuilder == null) {
            stringBuilder = new StringBuilder();
          }
          stringBuilder.appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '\\') {
            if (stringBuilder == null) {
              stringBuilder = new StringBuilder();
            }
            input.step();
            step = 2;
          } else if (c == '{') {
            if (stringBuilder != null) {
              if (partsBuilder == null) {
                partsBuilder = new ArrayBuilder<Object, Object[]>(Object.class);
              }
              partsBuilder.add(stringBuilder.toString());
              stringBuilder = null;
            }
            input.step();
            step = 7;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          if (partsBuilder == null) {
            partsBuilder = new ArrayBuilder<Object, Object[]>(Object.class);
          }
          if (stringBuilder != null) {
            partsBuilder.add(stringBuilder.toString());
            stringBuilder = null;
          }
          return Parse.done(new FormatExpr(partsBuilder.build()));
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            Assume.nonNull(stringBuilder).appendCodePoint(c);
            input.step();
            step = 1;
            continue;
          } else if (c == 'b') {
            Assume.nonNull(stringBuilder).append('\b');
            input.step();
            step = 1;
            continue;
          } else if (c == 'f') {
            Assume.nonNull(stringBuilder).append('\f');
            input.step();
            step = 1;
            continue;
          } else if (c == 'n') {
            Assume.nonNull(stringBuilder).append('\n');
            input.step();
            step = 1;
            continue;
          } else if (c == 'r') {
            Assume.nonNull(stringBuilder).append('\r');
            input.step();
            step = 1;
            continue;
          } else if (c == 't') {
            Assume.nonNull(stringBuilder).append('\t');
            input.step();
            step = 1;
            continue;
          } else if (c == 'u') {
            input.step();
            step = 3;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 3) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 4) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 5) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 6;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          Assume.nonNull(stringBuilder).appendCodePoint(escape);
          escape = 0;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 7) {
        if (parsePart == null) {
          parsePart = parser.parseExpr(input, form);
        } else {
          parsePart = parsePart.consume(input);
        }
        if (parsePart.isDone()) {
          step = 8;
        } else if (parsePart.isError()) {
          return parsePart.asError();
        }
      }
      if (step == 8) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '}') {
          if (partsBuilder == null) {
            partsBuilder = new ArrayBuilder<Object, Object[]>(Object.class);
          }
          partsBuilder.add(Assume.nonNull(parsePart).getNonNullUnchecked());
          parsePart = null;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseFormatExpr(parser, form, stringBuilder, partsBuilder,
                               parsePart, escape, step);
  }

}
