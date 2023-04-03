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

  public static <T> JsonForm<T> form(Type javaType) throws JsonFormException {
    return Json.codec().getJsonForm(javaType);
  }

  public static <T> JsonForm<T> form(@Nullable T value) throws JsonFormException {
    return Json.codec().getJsonForm(value);
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
    try {
      return Json.codec().<T>getJsonForm(javaType).parse(input, Json.parser(options));
    } catch (JsonFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, Input input) {
    try {
      return Json.codec().<T>getJsonForm(javaType).parse(input, Json.parser());
    } catch (JsonFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, @Nullable JsonParserOptions options) {
    try {
      return Json.codec().<T>getJsonForm(javaType).parse(Json.parser(options));
    } catch (JsonFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType) {
    try {
      return Json.codec().<T>getJsonForm(javaType).parse(Json.parser());
    } catch (JsonFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, String json, @Nullable JsonParserOptions options) {
    try {
      return Json.codec().<T>getJsonForm(javaType).parse(json, Json.parser(options));
    } catch (JsonFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, String json) {
    try {
      return Json.codec().<T>getJsonForm(javaType).parse(json, Json.parser());
    } catch (JsonFormException cause) {
      return Parse.error(cause);
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

  public static Parse<Repr> parse(String json, @Nullable JsonParserOptions options) {
    return JsonReprs.reprForm().parse(json, Json.parser(options));
  }

  public static Parse<Repr> parse(String json) {
    return JsonReprs.reprForm().parse(json, Json.parser());
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
    try {
      return Json.codec().getJsonForm(value).write(output, value, Json.writer(options));
    } catch (JsonFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> write(Output<?> output, @Nullable Object value) {
    try {
      return Json.codec().getJsonForm(value).write(output, value, Json.writer());
    } catch (JsonFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> write(@Nullable Object value, @Nullable JsonWriterOptions options) {
    try {
      return Json.codec().getJsonForm(value).write(value, Json.writer(options));
    } catch (JsonFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> write(@Nullable Object value) {
    try {
      return Json.codec().getJsonForm(value).write(value, Json.writer());
    } catch (JsonFormException cause) {
      return Write.error(cause);
    }
  }

  public static String toString(@Nullable Object value, @Nullable JsonWriterOptions options) {
    try {
      return Json.codec().getJsonForm(value).toString(value, Json.writer(options));
    } catch (JsonFormException cause) {
      throw new IllegalArgumentException(cause);
    }
  }

  public static String toString(@Nullable Object value) {
    try {
      return Json.codec().getJsonForm(value).toString(value, Json.writer());
    } catch (JsonFormException cause) {
      throw new IllegalArgumentException(cause);
    }
  }

}
