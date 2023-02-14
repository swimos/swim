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

package swim.json;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryOutput;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.MediaType;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Translator;
import swim.codec.Write;
import swim.expr.TermForm;

@Public
@Since("5.0")
public interface JsonForm<T> extends TermForm<T>, Translator<T> {

  default @Nullable JsonForm<T> taggedForm(String tag) {
    return null;
  }

  default @Nullable JsonUndefinedForm<? extends T> undefinedForm() {
    return null;
  }

  default @Nullable JsonNullForm<? extends T> nullForm() {
    return null;
  }

  @Override
  default @Nullable JsonNumberForm<? extends T> numberForm() {
    return null;
  }

  @Override
  default @Nullable JsonIdentifierForm<? extends T> identifierForm() {
    return null;
  }

  @Override
  default @Nullable JsonStringForm<?, ? extends T> stringForm() {
    return null;
  }

  default @Nullable JsonArrayForm<?, ?, ? extends T> arrayForm() {
    return null;
  }

  default @Nullable JsonObjectForm<?, ?, ?, ? extends T> objectForm() {
    return null;
  }

  @Override
  default MediaType mediaType() {
    return Json.codec().mediaType();
  }

  Parse<T> parse(Input input, JsonParser parser);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, Json.parser());
  }

  default Parse<T> parse(JsonParser parser) {
    return this.parse(StringInput.empty(), parser);
  }

  @Override
  default Parse<T> parse() {
    return this.parse(Json.parser());
  }

  default @Nullable T parse(String json, JsonParser parser) {
    final Input input = new StringInput(json);
    while (input.isCont() && parser.isWhitespace(input.head())) {
      input.step();
    }
    Parse<T> parse = this.parse(input, parser);
    if (parse.isDone()) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
    }
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.get();
  }

  @Override
  default @Nullable T parse(String json) {
    return this.parse(json, Json.parser());
  }

  Write<?> write(Output<?> output, @Nullable T value, JsonWriter writer);

  default Write<?> write(@Nullable T value, JsonWriter writer) {
    return this.write(BinaryOutput.full(), value, writer);
  }

  @Override
  default Write<?> write(@Nullable T value) {
    return this.write(value, Json.writer());
  }

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, Json.writer());
  }

  default String toString(@Nullable T value, JsonWriter writer) {
    final StringOutput output = new StringOutput();
    this.write(output, value, writer).checkDone();
    return output.get();
  }

  @Override
  default String toString(@Nullable T value) {
    return this.toString(value, Json.writer());
  }

  static <T> JsonForm<T> forType(Type javaType) {
    final JsonForm<T> jsonForm = Json.codec().forType(javaType);
    if (jsonForm != null) {
      return jsonForm;
    } else {
      throw new IllegalArgumentException("No json form for type: " + javaType);
    }
  }

  static <T> JsonForm<T> forValue(@Nullable T value) {
    final JsonForm<T> jsonForm = Json.codec().forValue(value);
    if (jsonForm != null) {
      return jsonForm;
    } else {
      throw new IllegalArgumentException("No json form for value: " + value);
    }
  }

}
