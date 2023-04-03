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
import swim.json.JsonException;
import swim.json.JsonFieldForm;
import swim.json.JsonObjectForm;
import swim.json.JsonParser;
import swim.util.Assume;

@Internal
public final class ParseJsonObject<K, V, B, T> extends Parse<T> {

  final JsonParser parser;
  final JsonObjectForm<K, V, B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<K> parseKey;
  final @Nullable JsonFieldForm<K, V, B> fieldForm;
  final @Nullable Parse<V> parseValue;
  final int step;

  public ParseJsonObject(JsonParser parser, JsonObjectForm<K, V, B, ? extends T> form,
                         @Nullable B builder, @Nullable Parse<K> parseKey,
                         @Nullable JsonFieldForm<K, V, B> fieldForm,
                         @Nullable Parse<V> parseValue, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseKey = parseKey;
    this.fieldForm = fieldForm;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonObject.parse(input, this.parser, this.form, this.builder,
                                 this.parseKey, this.fieldForm,
                                 this.parseValue, this.step);
  }

  public static <K, V, B, T> Parse<T> parse(Input input, JsonParser parser,
                                            JsonObjectForm<K, V, B, ? extends T> form,
                                            @Nullable B builder,
                                            @Nullable Parse<K> parseKey,
                                            @Nullable JsonFieldForm<K, V, B> fieldForm,
                                            @Nullable Parse<V> parseValue, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '{') {
        if (builder == null) {
          try {
            builder = form.objectBuilder();
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('{', input));
      }
    }
    if (step == 2) {
      while (input.isCont() && parser.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == '}') {
          final T object;
          try {
            object = form.buildObject(Assume.nonNull(builder));
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          return Parse.done(object);
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected('}', input));
      }
    }
    do {
      if (step == 3) {
        if (parseKey == null) {
          try {
            parseKey = parser.parseExpr(input, form.keyForm());
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          parseKey = parseKey.consume(input);
        }
        if (parseKey.isDone()) {
          step = 4;
        } else if (parseKey.isError()) {
          return parseKey.asError();
        }
      }
      if (step == 4) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ':') {
          final K key = Assume.nonNull(parseKey).getNonNullUnchecked();
          try {
            fieldForm = form.getFieldForm(key);
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(':', input));
        }
      }
      if (step == 5) {
        while (input.isCont() && parser.isWhitespace(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 6;
        }
      }
      if (step == 6) {
        if (parseValue == null) {
          try {
            parseValue = parser.parseExpr(input, Assume.nonNull(fieldForm).valueForm());
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          parseValue = parseValue.consume(input);
        }
        if (parseValue.isDone()) {
          final K key = Assume.nonNull(parseKey).getNonNullUnchecked();
          final V value = parseValue.getUnchecked();
          try {
            final JsonObjectForm<K, V, B, ? extends T> refinedForm =
                Assume.nonNull(fieldForm).refineForm(form, key, value);
            if (refinedForm != null) {
              form = refinedForm;
              builder = form.objectBuilder();
            } else {
              builder = Assume.nonNull(fieldForm).updateField(Assume.nonNull(builder), key, value);
            }
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseKey = null;
          fieldForm = null;
          parseValue = null;
          step = 7;
        } else if (parseValue.isError()) {
          return parseValue.asError();
        }
      }
      if (step == 7) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 8;
          } else if (c == '}') {
            final T object;
            try {
              object = form.buildObject(Assume.nonNull(builder));
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(object);
          } else {
            return Parse.error(Diagnostic.expected("',' or '}'", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 8) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonObject<K, V, B, T>(parser, form, builder, parseKey,
                                           fieldForm, parseValue, step);
  }

}
