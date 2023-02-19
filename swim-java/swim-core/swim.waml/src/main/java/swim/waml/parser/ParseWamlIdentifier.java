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
import swim.waml.WamlForm;
import swim.waml.WamlIdentifierForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlIdentifier<T> extends Parse<T> {

  final WamlParser parser;
  final WamlIdentifierForm<? extends T> form;
  final @Nullable StringBuilder builder;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final int step;

  public ParseWamlIdentifier(WamlParser parser, WamlIdentifierForm<? extends T> form,
                             @Nullable StringBuilder builder,
                             @Nullable Parse<WamlForm<T>> parseAttr, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseAttr = parseAttr;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlIdentifier.parse(input, this.parser, this.form, this.builder,
                                     this.parseAttr, this.step);
  }

  public static <T> Parse<T> parse(Input input, WamlParser parser,
                                   WamlIdentifierForm<? extends T> form,
                                   @Nullable StringBuilder builder,
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
          form = Assume.conforms(parseAttr.getNonNull());
          parseAttr = null;
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
          input.step();
          builder = new StringBuilder();
          builder.appendCodePoint(c);
          step = 5;
        } else {
          return Parse.error(Diagnostic.expected("identifier", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("identifier", input));
      }
    }
    if (step == 5) {
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
    return new ParseWamlIdentifier<T>(parser, form, builder, parseAttr, step);
  }

}
