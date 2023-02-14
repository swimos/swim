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

package swim.codec;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public interface Format extends Codec {

  @Override
  default <T> @Nullable Transcoder<T> getTranscoder(Type javaType) {
    return this.getTranslator(javaType);
  }

  <T> @Nullable Translator<T> getTranslator(Type javaType);

  static Format getFormat(MediaType mediaType) {
    final Format format = Codec.registry().getFormat(mediaType);
    if (format != null) {
      return format;
    } else {
      throw new IllegalArgumentException("No format for media type: " + mediaType);
    }
  }

  static Format getFormat(String mediaType) {
    final Format format = Codec.registry().getFormat(mediaType);
    if (format != null) {
      return format;
    } else {
      throw new IllegalArgumentException("No format for media type: " + mediaType);
    }
  }

  static <T> Translator<T> getTranslator(MediaType mediaType, Type javaType) {
    final Format format = Format.getFormat(mediaType);
    final Translator<T> translator = format.getTranslator(javaType);
    if (translator != null) {
      return translator;
    } else {
      throw new IllegalArgumentException("No " + mediaType + " translator for type: " + javaType);
    }
  }

  static <T> Translator<T> getTranslator(String mediaType, Type javaType) {
    final Format format = Format.getFormat(mediaType);
    final Translator<T> translator = format.getTranslator(javaType);
    if (translator != null) {
      return translator;
    } else {
      throw new IllegalArgumentException("No " + mediaType + " translator for type: " + javaType);
    }
  }

  static <T> Parse<T> parse(MediaType mediaType, Type javaType, Input input) {
    return Format.<T>getTranslator(mediaType, javaType).parse(input);
  }

  static <T> Parse<T> parse(String mediaType, Type javaType, Input input) {
    return Format.<T>getTranslator(mediaType, javaType).parse(input);
  }

  static <T> Parse<T> parse(MediaType mediaType, Type javaType) {
    return Format.<T>getTranslator(mediaType, javaType).parse();
  }

  static <T> Parse<T> parse(String mediaType, Type javaType) {
    return Format.<T>getTranslator(mediaType, javaType).parse();
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  static <T> @Nullable T parse(MediaType mediaType, Type javaType, String string) {
    return Format.<T>getTranslator(mediaType, javaType).parse(string);
  }

  @SuppressWarnings("TypeParameterUnusedInFormals")
  static <T> @Nullable T parse(String mediaType, Type javaType, String string) {
    return Format.<T>getTranslator(mediaType, javaType).parse(string);
  }

  static <T> Write<?> write(MediaType mediaType, Output<?> output, T value) {
    return Format.<T>getTranslator(mediaType, value.getClass()).write(output, value);
  }

  static <T> Write<?> write(String mediaType, Output<?> output, T value) {
    return Format.<T>getTranslator(mediaType, value.getClass()).write(output, value);
  }

  static <T> Write<?> write(MediaType mediaType, T value) {
    return Format.<T>getTranslator(mediaType, value.getClass()).write(value);
  }

  static <T> Write<?> write(String mediaType, T value) {
    return Format.<T>getTranslator(mediaType, value.getClass()).write(value);
  }

  static <T> String toString(MediaType mediaType, T value) {
    return Format.<T>getTranslator(mediaType, value.getClass()).toString(value);
  }

  static <T> String toString(String mediaType, T value) {
    return Format.<T>getTranslator(mediaType, value.getClass()).toString(value);
  }

}
