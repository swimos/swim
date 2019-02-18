// Copyright 2015-2019 SWIM.AI inc.
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

package swim.json;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class ValueParser<I, V> extends Parser<V> {
  final JsonParser<I, V> json;

  ValueParser(JsonParser<I, V> json) {
    this.json = json;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.json);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json) {
    int c = 0;
    while (input.isCont()) {
      c = input.head();
      if (Json.isWhitespace(c)) {
        input = input.step();
      } else {
        break;
      }
    }
    if (input.isCont()) {
      if (c == '{') {
        return json.parseObject(input);
      } else if (c == '[') {
        return json.parseArray(input);
      } else if (Json.isIdentStartChar(c)) {
        return json.parseIdent(input);
      } else if (c == '"' || c == '\'') {
        return json.parseString(input);
      } else if (c == '-' || c >= '0' && c <= '9') {
        return json.parseNumber(input);
      } else {
        return error(Diagnostic.expected("value", input));
      }
    } else if (input.isDone()) {
      return error(Diagnostic.expected("value", input));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new ValueParser<I, V>(json);
  }
}
