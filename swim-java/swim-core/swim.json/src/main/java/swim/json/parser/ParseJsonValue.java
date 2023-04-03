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
import swim.json.JsonException;
import swim.json.JsonForm;
import swim.json.JsonParser;

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

  public static <T> Parse<T> parse(Input input, JsonParser parser,
                                   JsonForm<? extends T> form) {
    if (input.isCont()) {
      final int c = input.head();
      if (parser.isIdentifierStartChar(c)) {
        try {
          return parser.parseIdentifier(input, form.identifierForm());
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '-' || (c >= '0' && c <= '9')) {
        try {
          return parser.parseNumber(input, form.numberForm());
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '"') {
        try {
          return parser.parseString(input, form.stringForm());
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '[') {
        try {
          return parser.parseArray(input, form.arrayForm());
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else if (c == '{') {
        try {
          return parser.parseObject(input, form.objectForm());
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
      } else {
        return Parse.error(Diagnostic.expected("value", input));
      }
    } else if (input.isDone()) {
      return Parse.error(Diagnostic.expected("value", input));
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonValue<T>(parser, form);
  }

}
