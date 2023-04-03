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
import swim.util.Assume;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlValue<T> extends Parse<T> {

  final WamlParser parser;
  final WamlForm<? extends T> form;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final int step;

  public ParseWamlValue(WamlParser parser, WamlForm<? extends T> form,
                        @Nullable Parse<WamlForm<T>> parseAttr, int step) {
    this.parser = parser;
    this.form = form;
    this.parseAttr = parseAttr;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlValue.parse(input, this.parser, this.form,
                                this.parseAttr, this.step);
  }

  public static <T> Parse<T> parse(Input input, WamlParser parser,
                                   WamlForm<? extends T> form,
                                   @Nullable Parse<WamlForm<T>> parseAttr,
                                   int step) {
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
          form = parseAttr.getNonNullUnchecked();
          // Preserve parseAttr to signal the presence of attributes.
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
          parseAttr = null;
          step = 2;
          continue;
        } else if (input.isReady()) {
          step = 4;
        }
      }
      break;
    } while (true);
    if (step == 4) {
      if (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierStartChar(c)) {
          try {
            return parser.parseIdentifier(input, form.identifierForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '-' || (c >= '0' && c <= '9')) {
          try {
            return parser.parseNumber(input, form.numberForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '"') {
          try {
            return parser.parseString(input, form.stringForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '[') {
          try {
            return parser.parseArray(input, form.arrayForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '<') {
          try {
            return parser.parseMarkup(input, form.markupForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '{') {
          try {
            return parser.parseObject(input, form.objectForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else if (c == '(') {
          try {
            return parser.parseTuple(input, form.tupleForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          if (parseAttr != null) {
            try {
              return Parse.done(form.unitForm().unitValue());
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
          } else {
            return Parse.error(Diagnostic.expected("value", input));
          }
        }
      } else if (input.isDone()) {
        if (parseAttr != null) {
          try {
            return Parse.done(form.unitForm().unitValue());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          return Parse.error(Diagnostic.expected("value", input));
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlValue<T>(parser, form, parseAttr, step);
  }

}
