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
import swim.waml.WamlFieldForm;
import swim.waml.WamlForm;
import swim.waml.WamlObjectForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlObject<K, V, B, T> extends Parse<T> {

  final WamlParser parser;
  final WamlObjectForm<K, V, B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final @Nullable Parse<K> parseKey;
  final @Nullable WamlFieldForm<K, V, B> fieldForm;
  final @Nullable Parse<V> parseValue;
  final int step;

  public ParseWamlObject(WamlParser parser, WamlObjectForm<K, V, B, ? extends T> form,
                         @Nullable B builder, @Nullable Parse<WamlForm<T>> parseAttr,
                         @Nullable Parse<K> parseKey,
                         @Nullable WamlFieldForm<K, V, B> fieldForm,
                         @Nullable Parse<V> parseValue, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseAttr = parseAttr;
    this.parseKey = parseKey;
    this.fieldForm = fieldForm;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlObject.parse(input, this.parser, this.form, this.builder,
                                 this.parseAttr, this.parseKey,
                                 this.fieldForm, this.parseValue, this.step);
  }

  public static <K, V, B, T> Parse<T> parse(Input input, WamlParser parser,
                                            WamlObjectForm<K, V, B, ? extends T> form,
                                            @Nullable B builder,
                                            @Nullable Parse<WamlForm<T>> parseAttr,
                                            @Nullable Parse<K> parseKey,
                                            @Nullable WamlFieldForm<K, V, B> fieldForm,
                                            @Nullable Parse<V> parseValue, int step) {
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
      if (input.isCont() && input.head() == '{') {
        input.step();
        if (builder == null) {
          builder = form.objectBuilder();
        }
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('{', input));
      }
    }
    do {
      if (step == 5) {
        builder = Assume.nonNull(builder);
        while (input.isCont()) {
          c = input.head();
          if (parser.isWhitespace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '}') {
            input.step();
            return Parse.done(form.buildObject(builder));
          } else if (c == '#') {
            input.step();
            step = 11;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 6) {
        if (parseKey == null) {
          parseKey = parser.parseExpr(input, form.keyForm());
        } else {
          parseKey = parseKey.consume(input);
        }
        if (parseKey.isDone()) {
          step = 7;
        } else if (parseKey.isError()) {
          return parseKey.asError();
        }
      }
      if (step == 7) {
        parseKey = Assume.nonNull(parseKey);
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ':') {
          input.step();
          final K key = parseKey.getNonNull();
          fieldForm = form.getFieldForm(key);
          if (fieldForm == null) {
            return Parse.error(Diagnostic.message("unexpected field: " + key, input));
          }
          step = 8;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(':', input));
        }
      }
      if (step == 8) {
        while (input.isCont() && parser.isSpace(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 9;
        }
      }
      if (step == 9) {
        builder = Assume.nonNull(builder);
        parseKey = Assume.nonNull(parseKey);
        fieldForm = Assume.nonNull(fieldForm);
        if (parseValue == null) {
          parseValue = parser.parseExpr(input, fieldForm.valueForm());
        } else {
          parseValue = parseValue.consume(input);
        }
        if (parseValue.isDone()) {
          final K key = parseKey.getNonNull();
          final V value = parseValue.get();
          builder = fieldForm.updateField(builder, key, value);
          parseKey = null;
          fieldForm = null;
          parseValue = null;
          step = 10;
        } else if (parseValue.isError()) {
          return parseValue.asError();
        }
      }
      if (step == 10) {
        builder = Assume.nonNull(builder);
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ',' || parser.isNewline(c)) {
            input.step();
            step = 5;
            continue;
          } else if (c == '#') {
            input.step();
            step = 11;
          } else if (c == '}') {
            input.step();
            return Parse.done(form.buildObject(builder));
          } else {
            return Parse.error(Diagnostic.expected("'}', ',' or newline", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 11) {
        while (input.isCont() && !parser.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 5;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlObject<K, V, B, T>(parser, form, builder, parseAttr,
                                           parseKey, fieldForm, parseValue, step);
  }

}
