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
import swim.json.JsonUndefinedForm;

@Internal
public final class ParseJsonUndefined<T> extends Parse<T> {

  final JsonUndefinedForm<? extends T> form;
  final int index;

  public ParseJsonUndefined(JsonUndefinedForm<? extends T> form, int index) {
    this.form = form;
    this.index = index;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonUndefined.parse(input, this.form, this.index);
  }

  public static <T> Parse<T> parse(Input input, JsonUndefinedForm<? extends T> form, int index) {
    final String literal = "undefined";
    while (input.isCont() && index < literal.length()) {
      final int c = input.head();
      final int expected = literal.codePointAt(index);
      if (c == expected) {
        input.step();
        index = literal.offsetByCodePoints(index, 1);
      } else {
        return Parse.error(Diagnostic.expected(expected, input));
      }
    }
    if (index >= literal.length()) {
      return Parse.done(form.undefinedValue());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonUndefined<T>(form, index);
  }

}
