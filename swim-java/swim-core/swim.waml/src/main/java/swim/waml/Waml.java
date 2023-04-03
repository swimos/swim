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

  public static <T> WamlForm<T> form(Type javaType) throws WamlFormException {
    return Waml.codec().getWamlForm(javaType);
  }

  public static <T> WamlForm<T> form(@Nullable T value) throws WamlFormException {
    return Waml.codec().getWamlForm(value);
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
    try {
      return Waml.codec().<T>getWamlForm(javaType).parse(input, Waml.parser(options));
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, Input input) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parse(input, Waml.parser());
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, @Nullable WamlParserOptions options) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parse(Waml.parser(options));
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parse(Waml.parser());
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, String waml, @Nullable WamlParserOptions options) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parse(waml, Waml.parser(options));
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parse(Type javaType, String waml) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parse(waml, Waml.parser());
    } catch (WamlFormException cause) {
      return Parse.error(cause);
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

  public static Parse<Repr> parse(String waml, @Nullable WamlParserOptions options) {
    return WamlReprs.reprForm().parse(waml, Waml.parser(options));
  }

  public static Parse<Repr> parse(String waml) {
    return WamlReprs.reprForm().parse(waml, Waml.parser());
  }

  public static <T> Parse<T> parseBlock(Type javaType, Input input, @Nullable WamlParserOptions options) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parseBlock(input, Waml.parser(options));
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType, Input input) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parseBlock(input, Waml.parser());
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType, @Nullable WamlParserOptions options) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parseBlock(Waml.parser(options));
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parseBlock(Waml.parser());
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType, String waml, @Nullable WamlParserOptions options) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parseBlock(waml, Waml.parser(options));
    } catch (WamlFormException cause) {
      return Parse.error(cause);
    }
  }

  public static <T> Parse<T> parseBlock(Type javaType, String waml) {
    try {
      return Waml.codec().<T>getWamlForm(javaType).parseBlock(waml, Waml.parser());
    } catch (WamlFormException cause) {
      return Parse.error(cause);
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

  public static Parse<Repr> parseBlock(String waml, @Nullable WamlParserOptions options) {
    return WamlReprs.reprForm().parseBlock(waml, Waml.parser(options));
  }

  public static Parse<Repr> parseBlock(String waml) {
    return WamlReprs.reprForm().parseBlock(waml, Waml.parser());
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
    try {
      return Waml.codec().getWamlForm(value).write(output, value, Waml.writer(options));
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> write(Output<?> output, @Nullable Object value) {
    try {
      return Waml.codec().getWamlForm(value).write(output, value, Waml.writer());
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> write(@Nullable Object value, @Nullable WamlWriterOptions options) {
    try {
      return Waml.codec().getWamlForm(value).write(value, Waml.writer(options));
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> write(@Nullable Object value) {
    try {
      return Waml.codec().getWamlForm(value).write(value, Waml.writer());
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static String toString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    try {
      return Waml.codec().getWamlForm(value).toString(value, Waml.writer(options));
    } catch (WamlFormException cause) {
      throw new IllegalArgumentException(cause);
    }
  }

  public static String toString(@Nullable Object value) {
    try {
      return Waml.codec().getWamlForm(value).toString(value, Waml.writer());
    } catch (WamlFormException cause) {
      throw new IllegalArgumentException(cause);
    }
  }

  public static Write<?> writeBlock(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    try {
      return Waml.codec().getWamlForm(value).writeBlock(output, value, Waml.writer(options));
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> writeBlock(Output<?> output, @Nullable Object value) {
    try {
      return Waml.codec().getWamlForm(value).writeBlock(output, value, Waml.writer());
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> writeBlock(@Nullable Object value, @Nullable WamlWriterOptions options) {
    try {
      return Waml.codec().getWamlForm(value).writeBlock(value, Waml.writer(options));
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static Write<?> writeBlock(@Nullable Object value) {
    try {
      return Waml.codec().getWamlForm(value).writeBlock(value, Waml.writer());
    } catch (WamlFormException cause) {
      return Write.error(cause);
    }
  }

  public static String toBlockString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    try {
      return Waml.codec().getWamlForm(value).toBlockString(value, Waml.writer(options));
    } catch (WamlFormException cause) {
      throw new IllegalArgumentException(cause);
    }
  }

  public static String toBlockString(@Nullable Object value) {
    try {
      return Waml.codec().getWamlForm(value).toBlockString(value, Waml.writer());
    } catch (WamlFormException cause) {
      throw new IllegalArgumentException(cause);
    }
  }

}
