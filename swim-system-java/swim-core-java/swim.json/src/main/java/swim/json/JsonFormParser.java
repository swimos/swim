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

import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

final class JsonFormParser<T> extends Parser<T> {
  final JsonParser<Item, Value> json;
  final Form<T> form;
  final Parser<Value> parser;

  JsonFormParser(JsonParser<Item, Value> json, Form<T> form, Parser<Value> parser) {
    this.json = json;
    this.form = form;
    this.parser = parser;
  }

  JsonFormParser(JsonParser<Item, Value> json, Form<T> form) {
    this(json, form, null);
  }

  @Override
  public Parser<T> feed(Input input) {
    return parse(input, this.json, this.form, this.parser);
  }

  static <T> Parser<T> parse(Input input, JsonParser<Item, Value> json,
                             Form<T> form, Parser<Value> parser) {
    if (parser == null) {
      parser = json.parseValue(input);
    } else {
      parser = parser.feed(input);
    }
    if (parser.isDone()) {
      final Value value = parser.bind();
      return done(form.cast(value));
    } else if (parser.isError()) {
      return parser.asError();
    }
    return new JsonFormParser<T>(json, form, parser);
  }

  static <T> Parser<T> parse(Input input, JsonParser<Item, Value> json, Form<T> form) {
    return parse(input, json, form, null);
  }
}
