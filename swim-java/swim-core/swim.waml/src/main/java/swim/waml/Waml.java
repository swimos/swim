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
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.repr.Repr;
import swim.util.Assume;

/**
 * Factory for constructing WAML parsers and writers.
 */
@Public
@Since("5.0")
public final class Waml {

  private Waml() {
    // static
  }

  private static final WamlCodec CODEC = new WamlCodec();

  public static WamlCodec codec() {
    return CODEC;
  }

  public static <T> WamlForm<T> forType(Type javaType) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm;
    } else {
      throw new IllegalArgumentException("No waml form for type: " + javaType);
    }
  }

  public static <T> WamlForm<T> forValue(@Nullable T value) {
    final WamlForm<T> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm;
    } else {
      throw new IllegalArgumentException("No waml form for value: " + value);
    }
  }

  public static WamlParser parser(@Nullable WamlParserOptions options) {
    if (options == null || WamlParserOptions.standard().equals(options)) {
      return WamlParser.STANDARD;
    } else if (WamlParserOptions.expressions().equals(options)) {
      return WamlParser.EXPRESSIONS;
    } else {
      return new WamlParser(options);
    }
  }

  public static WamlParser parser() {
    return WamlParser.STANDARD;
  }

  public static <T> Parse<T> parse(Type javaType, Input input, @Nullable WamlParserOptions options) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parse(input, Waml.parser(options));
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parse(Type javaType, Input input) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parse(input, Waml.parser());
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parse(Type javaType, @Nullable WamlParserOptions options) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parse(Waml.parser(options));
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parse(Type javaType) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parse(Waml.parser());
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  public static <T> @Nullable T parse(Type javaType, String json, @Nullable WamlParserOptions options) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parse(json, Waml.parser(options));
    } else {
      throw new IllegalArgumentException("No waml form for type: " + javaType);
    }
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  public static <T> @Nullable T parse(Type javaType, String json) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parse(json, Waml.parser());
    } else {
      throw new IllegalArgumentException("No waml form for type: " + javaType);
    }
  }

  public static Parse<Repr> parse(Input input, @Nullable WamlParserOptions options) {
    return WamlReprs.reprForm().parse(input, Waml.parser(options));
  }

  public static Parse<Repr> parse(Input input) {
    return WamlReprs.reprForm().parse(input, Waml.parser());
  }

  public static Parse<Repr> parse(@Nullable WamlParserOptions options) {
    return WamlReprs.reprForm().parse(Waml.parser(options));
  }

  public static Parse<Repr> parse() {
    return WamlReprs.reprForm().parse(Waml.parser());
  }

  public static Repr parse(String json, @Nullable WamlParserOptions options) {
    return Assume.nonNull(WamlReprs.reprForm().parse(json, Waml.parser(options)));
  }

  public static Repr parse(String json) {
    return Assume.nonNull(WamlReprs.reprForm().parse(json, Waml.parser()));
  }

  public static <T> Parse<T> parseBlock(Type javaType, Input input, @Nullable WamlParserOptions options) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parseBlock(input, Waml.parser(options));
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType, Input input) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parseBlock(input, Waml.parser());
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType, @Nullable WamlParserOptions options) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parseBlock(Waml.parser(options));
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parseBlock(Waml.parser());
    } else {
      return Parse.error(new IllegalArgumentException("No waml form for type: " + javaType));
    }
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  public static <T> @Nullable T parseBlock(Type javaType, String json, @Nullable WamlParserOptions options) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parseBlock(json, Waml.parser(options));
    } else {
      throw new IllegalArgumentException("No waml form for type: " + javaType);
    }
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  public static <T> @Nullable T parseBlock(Type javaType, String json) {
    final WamlForm<T> wamlForm = Waml.codec().forType(javaType);
    if (wamlForm != null) {
      return wamlForm.parseBlock(json, Waml.parser());
    } else {
      throw new IllegalArgumentException("No waml form for type: " + javaType);
    }
  }

  public static Parse<Repr> parseBlock(Input input, @Nullable WamlParserOptions options) {
    return WamlReprs.reprForm().parseBlock(input, Waml.parser(options));
  }

  public static Parse<Repr> parseBlock(Input input) {
    return WamlReprs.reprForm().parseBlock(input, Waml.parser());
  }

  public static Parse<Repr> parseBlock(@Nullable WamlParserOptions options) {
    return WamlReprs.reprForm().parseBlock(Waml.parser(options));
  }

  public static Parse<Repr> parseBlock() {
    return WamlReprs.reprForm().parseBlock(Waml.parser());
  }

  public static Repr parseBlock(String json, @Nullable WamlParserOptions options) {
    return Assume.nonNull(WamlReprs.reprForm().parseBlock(json, Waml.parser(options)));
  }

  public static Repr parseBlock(String json) {
    return Assume.nonNull(WamlReprs.reprForm().parseBlock(json, Waml.parser()));
  }

  static WamlWriter writer(@Nullable WamlWriterOptions options) {
    if (options == null || WamlWriterOptions.readable().equals(options)) {
      return WamlWriter.READABLE;
    } else if (WamlWriterOptions.compact().equals(options)) {
      return WamlWriter.COMPACT;
    } else {
      return new WamlWriter(options);
    }
  }

  public static WamlWriter writer() {
    return WamlWriter.READABLE;
  }

  public static Write<?> write(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.write(output, value, Waml.writer(options));
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static Write<?> write(Output<?> output, @Nullable Object value) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.write(output, value, Waml.writer());
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static Write<?> write(@Nullable Object value, @Nullable WamlWriterOptions options) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.write(value, Waml.writer(options));
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static Write<?> write(@Nullable Object value) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.write(value, Waml.writer());
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static String toString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.toString(value, Waml.writer(options));
    } else {
      throw new IllegalArgumentException("No waml form for value: " + value);
    }
  }

  public static String toString(@Nullable Object value) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.toString(value, Waml.writer());
    } else {
      throw new IllegalArgumentException("No waml form for value: " + value);
    }
  }

  public static Write<?> writeBlock(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.writeBlock(output, value, Waml.writer(options));
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static Write<?> writeBlock(Output<?> output, @Nullable Object value) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.writeBlock(output, value, Waml.writer());
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static Write<?> writeBlock(@Nullable Object value, @Nullable WamlWriterOptions options) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.writeBlock(value, Waml.writer(options));
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static Write<?> writeBlock(@Nullable Object value) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.writeBlock(value, Waml.writer());
    } else {
      return Write.error(new IllegalArgumentException("No waml form for value: " + value));
    }
  }

  public static String toBlockString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.toBlockString(value, Waml.writer(options));
    } else {
      throw new IllegalArgumentException("No waml form for value: " + value);
    }
  }

  public static String toBlockString(@Nullable Object value) {
    final WamlForm<Object> wamlForm = Waml.codec().forValue(value);
    if (wamlForm != null) {
      return wamlForm.toBlockString(value, Waml.writer());
    } else {
      throw new IllegalArgumentException("No waml form for value: " + value);
    }
  }

}
