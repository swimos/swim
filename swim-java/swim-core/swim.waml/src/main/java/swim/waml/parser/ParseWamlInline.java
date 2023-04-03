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
import swim.codec.Input;
import swim.codec.Parse;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlInline<T> extends Parse<T> {

  final WamlParser parser;
  final WamlForm<T> form;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final @Nullable Parse<T> parseValue;
  final int step;

  public ParseWamlInline(WamlParser parser, WamlForm<T> form,
                         @Nullable Parse<WamlForm<T>> parseAttr,
                         @Nullable Parse<T> parseValue, int step) {
    this.parser = parser;
    this.form = form;
    this.parseAttr = parseAttr;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlInline.parse(input, this.parser, this.form, this.parseAttr,
                                 this.parseValue, this.step);
  }

  public static <T> Parse<T> parse(Input input, WamlParser parser, WamlForm<T> form,
                                   @Nullable Parse<WamlForm<T>> parseAttr,
                                   @Nullable Parse<T> parseValue, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        step = 3;
      }
    }
    if (step == 2) {
      if (parseAttr == null) {
        parseAttr = parser.parseAttr(input, form);
      } else {
        parseAttr = parseAttr.consume(input);
      }
      if (parseAttr.isDone()) {
        form = parseAttr.getNonNullUnchecked();
        parseAttr = null;
        step = 3;
      } else if (parseAttr.isError()) {
        return parseAttr.asError();
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (c == '[') {
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
        } else {
          try {
            return Parse.done(form.unitForm().unitValue());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      } else if (input.isDone()) {
        try {
          return Parse.done(form.unitForm().unitValue());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlInline<T>(parser, form, parseAttr, parseValue, step);
  }

}
