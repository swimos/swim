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

package swim.waml;

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
public interface WamlForm<T> extends TermForm<T>, Translator<T> {

  default @Nullable WamlAttrForm<?, ? extends T> getAttrForm(String name) {
    return null;
  }

  default @Nullable WamlForm<T> taggedForm(String tag) {
    return null;
  }

  default @Nullable WamlUndefinedForm<? extends T> undefinedForm() {
    return null;
  }

  default @Nullable WamlUnitForm<? extends T> unitForm() {
    return null;
  }

  @Override
  default @Nullable WamlNumberForm<? extends T> numberForm() {
    return null;
  }

  @Override
  default @Nullable WamlIdentifierForm<? extends T> identifierForm() {
    return null;
  }

  @Override
  default @Nullable WamlStringForm<?, ? extends T> stringForm() {
    return null;
  }

  default @Nullable WamlArrayForm<?, ?, ? extends T> arrayForm() {
    return null;
  }

  default @Nullable WamlMarkupForm<?, ?, ? extends T> markupForm() {
    return null;
  }

  default @Nullable WamlObjectForm<?, ?, ?, ? extends T> objectForm() {
    return null;
  }

  default @Nullable WamlTupleForm<?, ?, ?, ? extends T> tupleForm() {
    return null;
  }

  @Override
  default MediaType mediaType() {
    return Waml.codec().mediaType();
  }

  Parse<T> parse(Input input, WamlParser parser);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, Waml.parser());
  }

  default Parse<T> parse(WamlParser parser) {
    return this.parse(StringInput.empty(), parser);
  }

  @Override
  default Parse<T> parse() {
    return this.parse(Waml.parser());
  }

  default @Nullable T parse(String waml, WamlParser parser) {
    final Input input = new StringInput(waml);
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
  default @Nullable T parse(String waml) {
    return this.parse(waml, Waml.parser());
  }

  default Parse<T> parseBlock(Input input, WamlParser parser) {
    return parser.parseBlock(input, this);
  }

  default Parse<T> parseBlock(Input input) {
    return this.parseBlock(input, Waml.parser());
  }

  default Parse<T> parseBlock(WamlParser parser) {
    return this.parseBlock(StringInput.empty(), parser);
  }

  default Parse<T> parseBlock() {
    return this.parseBlock(Waml.parser());
  }

  default @Nullable T parseBlock(String waml, WamlParser parser) {
    final Input input = new StringInput(waml);
    while (input.isCont() && parser.isWhitespace(input.head())) {
      input.step();
    }
    Parse<T> parse = this.parseBlock(input, parser);
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

  default @Nullable T parseBlock(String waml) {
    return this.parseBlock(waml, Waml.parser());
  }

  Write<?> write(Output<?> output, @Nullable T value, WamlWriter writer);

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, Waml.writer());
  }

  default Write<?> write(@Nullable T value, WamlWriter writer) {
    return this.write(BinaryOutput.full(), value, writer);
  }

  @Override
  default Write<?> write(@Nullable T value) {
    return this.write(value, Waml.writer());
  }

  default String toString(@Nullable T value, WamlWriter writer) {
    final StringOutput output = new StringOutput();
    this.write(output, value, writer).checkDone();
    return output.get();
  }

  @Override
  default String toString(@Nullable T value) {
    return this.toString(value, Waml.writer());
  }

  default Write<?> writeBlock(Output<?> output, @Nullable T value, WamlWriter writer) {
    return this.write(output, value, writer);
  }

  default Write<?> writeBlock(Output<?> output, @Nullable T value) {
    return this.writeBlock(output, value, Waml.writer());
  }

  default Write<?> writeBlock(@Nullable T value, WamlWriter writer) {
    return this.writeBlock(BinaryOutput.full(), value, writer);
  }

  default Write<?> writeBlock(@Nullable T value) {
    return this.writeBlock(value, Waml.writer());
  }

  default String toBlockString(@Nullable T value, WamlWriter writer) {
    final StringOutput output = new StringOutput();
    this.writeBlock(output, value, writer).checkDone();
    return output.get();
  }

  default String toBlockString(@Nullable T value) {
    return this.toBlockString(value, Waml.writer());
  }

  default boolean isInline(@Nullable T value) {
    return false;
  }

  default Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriter writer) {
    return this.write(output, value, writer);
  }

  static <T> WamlForm<T> forType(Type javaType) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm;
    } else {
      throw new IllegalArgumentException("No waml form for type: " + javaType);
    }
  }

  static <T> WamlForm<T> forValue(@Nullable T value) {
    final WamlForm<T> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm;
    } else {
      throw new IllegalArgumentException("No waml form for value: " + value);
    }
  }

}
