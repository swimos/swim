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
import swim.annotations.Nullable;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.json.JsonIdentifierForm;
import swim.json.JsonParser;
import swim.util.Assume;

@Internal
public final class ParseJsonIdentifier<T> extends Parse<T> {

  final JsonParser parser;
  final JsonIdentifierForm<? extends T> form;
  final @Nullable StringBuilder builder;
  final int step;

  public ParseJsonIdentifier(JsonParser parser, JsonIdentifierForm<? extends T> form,
                             @Nullable StringBuilder builder, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonIdentifier.parse(input, this.parser, this.form,
                                     this.builder, this.step);
  }

  public static <T> Parse<T> parse(Input input, JsonParser parser,
                                   JsonIdentifierForm<? extends T> form,
                                   @Nullable StringBuilder builder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierStartChar(c)) {
          input.step();
          builder = new StringBuilder();
          builder.appendCodePoint(c);
          step = 2;
        } else {
          return Parse.error(Diagnostic.expected("identifier", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("identifier", input));
      }
    }
    if (step == 2) {
      builder = Assume.nonNull(builder);
      while (input.isCont()) {
        c = input.head();
        if (parser.isIdentifierChar(c)) {
          input.step();
          builder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        return Parse.done(form.identifierValue(builder.toString(), parser));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonIdentifier<T>(parser, form, builder, step);
  }

}
