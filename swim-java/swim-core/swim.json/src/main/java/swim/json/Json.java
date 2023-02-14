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
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.repr.Repr;
import swim.util.Assume;

/**
 * Factory for constructing JSON parsers and writers.
 */
@Public
@Since("5.0")
public final class Json {

  private Json() {
    // static
  }

  private static final JsonCodec CODEC = new JsonCodec();

  public static JsonCodec codec() {
    return CODEC;
  }

  public static <T> JsonForm<T> forType(Type javaType) {
    final JsonForm<T> jsonForm = Json.codec().forType(javaType);
    if (jsonForm != null) {
      return jsonForm;
    } else {
      throw new IllegalArgumentException("No json form for type: " + javaType);
    }
  }

  public static <T> JsonForm<T> forValue(@Nullable T value) {
    final JsonForm<T> jsonForm = Json.codec().forValue(value);
    if (jsonForm != null) {
      return jsonForm;
    } else {
      throw new IllegalArgumentException("No json form for value: " + value);
    }
  }

  public static JsonParser parser(@Nullable JsonParserOptions options) {
    if (options == null || JsonParserOptions.standard().equals(options)) {
      return JsonParser.STANDARD;
    } else if (JsonParserOptions.expressions().equals(options)) {
      return JsonParser.EXPRESSIONS;
    } else {
      return new JsonParser(options);
    }
  }

  public static JsonParser parser() {
    return JsonParser.STANDARD;
  }

  public static <T> Parse<T> parse(Type javaType, Input input, @Nullable JsonParserOptions options) {
    final JsonForm<T> jsonForn = Json.codec().forType(javaType);
    if (jsonForn != null) {
      return jsonForn.parse(input, Json.parser(options));
    } else {
      return Parse.error(new IllegalArgumentException("No json form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parse(Type javaType, Input input) {
    final JsonForm<T> jsonForn = Json.codec().forType(javaType);
    if (jsonForn != null) {
      return jsonForn.parse(input, Json.parser());
    } else {
      return Parse.error(new IllegalArgumentException("No json form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parse(Type javaType, @Nullable JsonParserOptions options) {
    final JsonForm<T> jsonForn = Json.codec().forType(javaType);
    if (jsonForn != null) {
      return jsonForn.parse(Json.parser(options));
    } else {
      return Parse.error(new IllegalArgumentException("No json form for type: " + javaType));
    }
  }

  public static <T> Parse<T> parse(Type javaType) {
    final JsonForm<T> jsonForn = Json.codec().forType(javaType);
    if (jsonForn != null) {
      return jsonForn.parse(Json.parser());
    } else {
      return Parse.error(new IllegalArgumentException("No json form for type: " + javaType));
    }
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  public static <T> @Nullable T parse(Type javaType, String json, @Nullable JsonParserOptions options) {
    final JsonForm<T> jsonForn = Json.codec().forType(javaType);
    if (jsonForn != null) {
      return jsonForn.parse(json, Json.parser(options));
    } else {
      throw new IllegalArgumentException("No json form for type: " + javaType);
    }
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  public static <T> @Nullable T parse(Type javaType, String json) {
    final JsonForm<T> jsonForn = Json.codec().forType(javaType);
    if (jsonForn != null) {
      return jsonForn.parse(json, Json.parser());
    } else {
      throw new IllegalArgumentException("No json form for type: " + javaType);
    }
  }

  public static Parse<Repr> parse(Input input, @Nullable JsonParserOptions options) {
    return JsonReprs.reprForm().parse(input, Json.parser(options));
  }

  public static Parse<Repr> parse(Input input) {
    return JsonReprs.reprForm().parse(input, Json.parser());
  }

  public static Parse<Repr> parse(@Nullable JsonParserOptions options) {
    return JsonReprs.reprForm().parse(Json.parser(options));
  }

  public static Parse<Repr> parse() {
    return JsonReprs.reprForm().parse(Json.parser());
  }

  public static Repr parse(String json, @Nullable JsonParserOptions options) {
    return Assume.nonNull(JsonReprs.reprForm().parse(json, Json.parser(options)));
  }

  public static Repr parse(String json) {
    return Assume.nonNull(JsonReprs.reprForm().parse(json, Json.parser()));
  }

  static JsonWriter writer(@Nullable JsonWriterOptions options) {
    if (options == null || JsonWriterOptions.compact().equals(options)) {
      return JsonWriter.COMPACT;
    } else if (JsonWriterOptions.readable().equals(options)) {
      return JsonWriter.READABLE;
    } else {
      return new JsonWriter(options);
    }
  }

  public static JsonWriter writer() {
    return JsonWriter.COMPACT;
  }

  public static Write<?> write(Output<?> output, @Nullable Object value, @Nullable JsonWriterOptions options) {
    final JsonForm<Object> jsonForn = Json.codec().forValue(value);
    if (jsonForn != null) {
      return jsonForn.write(output, value, Json.writer(options));
    } else {
      return Write.error(new IllegalArgumentException("No json form for value: " + value));
    }
  }

  public static Write<?> write(Output<?> output, @Nullable Object value) {
    final JsonForm<Object> jsonForn = Json.codec().forValue(value);
    if (jsonForn != null) {
      return jsonForn.write(output, value, Json.writer());
    } else {
      return Write.error(new IllegalArgumentException("No json form for value: " + value));
    }
  }

  public static Write<?> write(@Nullable Object value, @Nullable JsonWriterOptions options) {
    final JsonForm<Object> jsonForn = Json.codec().forValue(value);
    if (jsonForn != null) {
      return jsonForn.write(value, Json.writer(options));
    } else {
      return Write.error(new IllegalArgumentException("No json form for value: " + value));
    }
  }

  public static Write<?> write(@Nullable Object value) {
    final JsonForm<Object> jsonForn = Json.codec().forValue(value);
    if (jsonForn != null) {
      return jsonForn.write(value, Json.writer());
    } else {
      return Write.error(new IllegalArgumentException("No json form for value: " + value));
    }
  }

  public static String toString(@Nullable Object value, @Nullable JsonWriterOptions options) {
    final JsonForm<Object> jsonForn = Json.codec().forValue(value);
    if (jsonForn != null) {
      return jsonForn.toString(value, Json.writer(options));
    } else {
      throw new IllegalArgumentException("No json form for value: " + value);
    }
  }

  public static String toString(@Nullable Object value) {
    final JsonForm<Object> jsonForn = Json.codec().forValue(value);
    if (jsonForn != null) {
      return jsonForn.toString(value, Json.writer());
    } else {
      throw new IllegalArgumentException("No json form for value: " + value);
    }
  }

}
