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
import swim.waml.WamlAttrForm;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlAttr<T> extends Parse<WamlForm<T>> {

  final WamlParser parser;
  final WamlForm<T> form;
  final @Nullable StringBuilder nameBuilder;
  final @Nullable WamlAttrForm<Object, T> attrForm;
  final @Nullable Parse<Object> parseArgs;
  final int escape;
  final int step;

  public ParseWamlAttr(WamlParser parser, WamlForm<T> form,
                       @Nullable StringBuilder nameBuilder,
                       @Nullable WamlAttrForm<Object, T> attrForm,
                       @Nullable Parse<Object> parseArgs, int escape, int step) {
    this.parser = parser;
    this.form = form;
    this.nameBuilder = nameBuilder;
    this.attrForm = attrForm;
    this.parseArgs = parseArgs;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<WamlForm<T>> consume(Input input) {
    return ParseWamlAttr.parse(input, this.parser, this.form,
                               this.nameBuilder, this.attrForm,
                               this.parseArgs, this.escape, this.step);
  }

  public static <T> Parse<WamlForm<T>> parse(Input input, WamlParser parser, WamlForm<T> form,
                                             @Nullable StringBuilder nameBuilder,
                                             @Nullable WamlAttrForm<Object, T> attrForm,
                                             @Nullable Parse<Object> parseArgs,
                                             int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('@', input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (parser.isIdentifierStartChar(c = input.head()) || c == '"')) {
        if (nameBuilder == null) {
          nameBuilder = new StringBuilder();
        }
        if (c == '"') {
          input.step();
          step = 4;
        } else { // parser.isIdentifierStartChar(c)
          nameBuilder.appendCodePoint(c);
          input.step();
          step = 3;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("attribute name", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && parser.isIdentifierChar(c = input.head())) {
        Assume.nonNull(nameBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        final String name = Assume.nonNull(nameBuilder).toString();
        try {
          attrForm = Assume.conforms(form.getAttrForm(name));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        step = 10;
      }
    }
    do {
      if (step == 4) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c != '"' && c != '\\') {
          Assume.nonNull(nameBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '"') {
            final String name = Assume.nonNull(nameBuilder).toString();
            try {
              attrForm = Assume.conforms(form.getAttrForm(name));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            step = 10;
            break;
          } else if (c == '\\') {
            input.step();
            step = 5;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('"', input));
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            Assume.nonNull(nameBuilder).appendCodePoint(c);
            input.step();
            step = 4;
            continue;
          } else if (c == 'b') {
            Assume.nonNull(nameBuilder).append('\b');
            input.step();
            step = 4;
            continue;
          } else if (c == 'f') {
            Assume.nonNull(nameBuilder).append('\f');
            input.step();
            step = 4;
            continue;
          } else if (c == 'n') {
            Assume.nonNull(nameBuilder).append('\n');
            input.step();
            step = 4;
            continue;
          } else if (c == 'r') {
            Assume.nonNull(nameBuilder).append('\r');
            input.step();
            step = 4;
            continue;
          } else if (c == 't') {
            Assume.nonNull(nameBuilder).append('\t');
            input.step();
            step = 4;
            continue;
          } else if (c == 'u') {
            input.step();
            step = 6;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 7;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 7) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 8) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 9;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 9) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          Assume.nonNull(nameBuilder).appendCodePoint(escape);
          escape = 0;
          input.step();
          step = 4;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    if (step == 10) {
      if (input.isCont() && input.head() == '(') {
        input.step();
        step = 11;
      } else if (input.isReady()) {
        final String name = Assume.nonNull(nameBuilder).toString();
        try {
          return Parse.done(Assume.nonNull(attrForm).refineForm(form, name));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (step == 11) {
      if (parseArgs == null) {
        parseArgs = parser.parseBlock(input, Assume.nonNull(attrForm).argsForm());
      } else {
        parseArgs = parseArgs.consume(input);
      }
      if (parseArgs.isDone()) {
        step = 12;
      } else if (parseArgs.isError()) {
        return parseArgs.asError();
      }
    }
    if (step == 12) {
      while (input.isCont() && parser.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont() && c == ')') {
        input.step();
        final String name = Assume.nonNull(nameBuilder).toString();
        final Object args = Assume.nonNull(parseArgs).getUnchecked();
        try {
          return Parse.done(Assume.nonNull(attrForm).refineForm(form, name, args));
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(')', input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlAttr<T>(parser, form, nameBuilder, attrForm,
                                parseArgs, escape, step);
  }

}
