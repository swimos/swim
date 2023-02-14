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
import swim.waml.Waml;
import swim.waml.WamlAttrForm;
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
      if (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierStartChar(c)) {
          input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 3;
        } else if (c == '"') {
          input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          step = 4;
        } else {
          return Parse.error(Diagnostic.expected("attribute name", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("attribute name", input));
      }
    }
    if (step == 3) {
      nameBuilder = Assume.nonNull(nameBuilder);
      while (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierChar(c)) {
          input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        final String name = nameBuilder.toString();
        attrForm = Assume.conformsNullable(form.getAttrForm(name));
        if (attrForm == null) {
          return Parse.error(Diagnostic.message("unexpected attribute: " + name, input));
        }
        step = 10;
      }
    }
    name: do {
      if (step == 4) {
        nameBuilder = Assume.nonNull(nameBuilder);
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c != '"' && c != '\\') {
            input.step();
            nameBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"') {
            input.step();
            final String name = nameBuilder.toString();
            attrForm = Assume.conformsNullable(form.getAttrForm(name));
            if (attrForm == null) {
              return Parse.error(Diagnostic.message("unexpected attribute: " + name, input));
            }
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
        nameBuilder = Assume.nonNull(nameBuilder);
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' || c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            input.step();
            nameBuilder.appendCodePoint(c);
            step = 4;
            continue;
          } else if (c == 'b') {
            input.step();
            nameBuilder.append('\b');
            step = 4;
            continue;
          } else if (c == 'f') {
            input.step();
            nameBuilder.append('\f');
            step = 4;
            continue;
          } else if (c == 'n') {
            input.step();
            nameBuilder.append('\n');
            step = 4;
            continue;
          } else if (c == 'r') {
            input.step();
            nameBuilder.append('\r');
            step = 4;
            continue;
          } else if (c == 't') {
            input.step();
            nameBuilder.append('\t');
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
      if (step >= 6 && step < 10) {
        nameBuilder = Assume.nonNull(nameBuilder);
        do {
          if (input.isCont()) {
            c = input.head();
            if (Base16.isDigit(c)) {
              input.step();
              escape = 16 * escape + Base16.decodeDigit(c);
              if (step <= 8) {
                step += 1;
                continue;
              } else {
                nameBuilder.appendCodePoint(escape);
                escape = 0;
                step = 4;
                continue name;
              }
            } else {
              return Parse.error(Diagnostic.expected("hex digit", input));
            }
          } else if (input.isDone()) {
            return Parse.error(Diagnostic.expected("hex digit", input));
          }
          break;
        } while (true);
      }
      break;
    } while (true);
    if (step == 10) {
      nameBuilder = Assume.nonNull(nameBuilder);
      attrForm = Assume.nonNull(attrForm);
      if (input.isCont() && input.head() == '(') {
        input.step();
        step = 11;
      } else if (input.isReady()) {
        final String name = nameBuilder.toString();
        return Parse.done(attrForm.refineForm(form, name));
      }
    }
    if (step == 11) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
      if (input.isReady()) {
        step = 12;
      }
    }
    if (step == 12) {
      attrForm = Assume.nonNull(attrForm);
      if (parseArgs == null) {
        parseArgs = parser.parseBlock(input, attrForm.argsForm());
      } else {
        parseArgs = parseArgs.consume(input);
      }
      if (parseArgs.isDone()) {
        step = 13;
      } else if (parseArgs.isError()) {
        return parseArgs.asError();
      }
    }
    if (step == 13) {
      nameBuilder = Assume.nonNull(nameBuilder);
      attrForm = Assume.nonNull(attrForm);
      parseArgs = Assume.nonNull(parseArgs);
      while (input.isCont()) {
        c = input.head();
        if (parser.isWhitespace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == ')') {
        input.step();
        final String name = nameBuilder.toString();
        final Object args = parseArgs.get();
        return Parse.done(attrForm.refineForm(form, name, args));
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
