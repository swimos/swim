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
import swim.waml.Waml;
import swim.waml.WamlArrayForm;
import swim.waml.WamlForm;
import swim.waml.WamlIdentifierForm;
import swim.waml.WamlMarkupForm;
import swim.waml.WamlNumberForm;
import swim.waml.WamlObjectForm;
import swim.waml.WamlParser;
import swim.waml.WamlStringForm;
import swim.waml.WamlTupleForm;
import swim.waml.WamlUnitForm;

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
          form = parseAttr.getNonNull();
          // Preserve parseAttr to signal the presence of attributes.
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
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
        if (c == '(') {
          final WamlTupleForm<?, ?, ?, ? extends T> tupleForm = form.tupleForm();
          if (tupleForm != null) {
            return parser.parseTuple(input, tupleForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected tuple", input));
          }
        } else if (c == '{') {
          final WamlObjectForm<?, ?, ?, ? extends T> objectForm = form.objectForm();
          if (objectForm != null) {
            return parser.parseObject(input, objectForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected object", input));
          }
        } else if (c == '<') {
          final WamlMarkupForm<?, ?, ? extends T> markupForm = form.markupForm();
          if (markupForm != null) {
            return parser.parseMarkup(input, markupForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected markup", input));
          }
        } else if (c == '[') {
          final WamlArrayForm<?, ?, ? extends T> arrayForm = form.arrayForm();
          if (arrayForm != null) {
            return parser.parseArray(input, arrayForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected array", input));
          }
        } else if (c == '"') {
          final WamlStringForm<?, ? extends T> stringForm = form.stringForm();
          if (stringForm != null) {
            return parser.parseString(input, stringForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected string", input));
          }
        } else if (parser.isIdentifierStartChar(c)) {
          final WamlIdentifierForm<? extends T> identifierForm = form.identifierForm();
          if (identifierForm != null) {
            return parser.parseIdentifier(input, identifierForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected identifier", input));
          }
        } else if (c == '-' || (c >= '0' && c <= '9')) {
          final WamlNumberForm<? extends T> numberForm = form.numberForm();
          if (numberForm != null) {
            return parser.parseNumber(input, numberForm);
          } else {
            return Parse.error(Diagnostic.message("unexpected number", input));
          }
        } else {
          if (parseAttr != null) {
            final WamlUnitForm<? extends T> unitForm = form.unitForm();
            if (unitForm != null) {
              return Parse.done(unitForm.unitValue());
            } else {
              return Parse.error(Diagnostic.message("unexpected unit", input));
            }
          } else {
            return Parse.error(Diagnostic.expected("value", input));
          }
        }
      } else if (input.isDone()) {
        if (parseAttr != null) {
          final WamlUnitForm<? extends T> unitForm = form.unitForm();
          if (unitForm != null) {
            return Parse.done(unitForm.unitValue());
          } else {
            return Parse.error(Diagnostic.message("unexpected unit", input));
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
