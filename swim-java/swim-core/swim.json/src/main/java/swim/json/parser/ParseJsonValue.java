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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.json.JsonArrayForm;
import swim.json.JsonForm;
import swim.json.JsonIdentifierForm;
import swim.json.JsonNumberForm;
import swim.json.JsonObjectForm;
import swim.json.JsonParser;
import swim.json.JsonStringForm;

@Internal
public final class ParseJsonValue<T> extends Parse<T> {

  final JsonParser parser;
  final JsonForm<? extends T> form;

  public ParseJsonValue(JsonParser parser, JsonForm<? extends T> form) {
    this.parser = parser;
    this.form = form;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonValue.parse(input, this.parser, this.form);
  }

  public static <T> Parse<T> parse(Input input, JsonParser parser, JsonForm<? extends T> form) {
    int c = 0;
    while (input.isCont()) {
      c = input.head();
      if (parser.isWhitespace(c)) {
        input.step();
      } else {
        break;
      }
    }
    if (input.isCont()) {
      if (c == '{') {
        final JsonObjectForm<?, ?, ?, ? extends T> objectForm = form.objectForm();
        if (objectForm != null) {
          return parser.parseObject(input, objectForm);
        } else {
          return Parse.error(Diagnostic.message("unexpected object", input));
        }
      } else if (c == '[') {
        final JsonArrayForm<?, ?, ? extends T> arrayForm = form.arrayForm();
        if (arrayForm != null) {
          return parser.parseArray(input, arrayForm);
        } else {
          return Parse.error(Diagnostic.message("unexpected array", input));
        }
      } else if (c == '"') {
        final JsonStringForm<?, ? extends T> stringForm = form.stringForm();
        if (stringForm != null) {
          return parser.parseString(input, stringForm);
        } else {
          return Parse.error(Diagnostic.message("unexpected string", input));
        }
      } else if (c == '-' || (c >= '0' && c <= '9')) {
        final JsonNumberForm<? extends T> numberForm = form.numberForm();
        if (numberForm != null) {
          return parser.parseNumber(input, numberForm);
        } else {
          return Parse.error(Diagnostic.message("unexpected number", input));
        }
      } else if (parser.isIdentifierStartChar(c)) {
        final JsonIdentifierForm<? extends T> identifierForm = form.identifierForm();
        if (identifierForm != null) {
          return parser.parseIdentifier(input, identifierForm);
        } else {
          return Parse.error(Diagnostic.message("unexpected identifier", input));
        }
      } else {
        return Parse.error(Diagnostic.expected("value", input));
      }
    } else if (input.isDone()) {
      return Parse.error(Diagnostic.expected("value", input));
    } else if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonValue<T>(parser, form);
  }

}
