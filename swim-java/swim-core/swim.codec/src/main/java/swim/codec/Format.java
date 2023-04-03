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
  default <T> Transcoder<T> getTranscoder(Type javaType) throws TranscoderException {
    return this.getTranslator(javaType);
  }

  <T> Translator<T> getTranslator(Type javaType) throws TranslatorException;

  default <T> Parse<T> parse(Type javaType, Input input) {
    final Translator<T> translator;
    try {
      translator = this.getTranslator(javaType);
    } catch (TranslatorException cause) {
      return Parse.error(cause);
    }
    return translator.parse(input);
  }

  default <T> Parse<T> parse(Type javaType) {
    final Translator<T> translator;
    try {
      translator = this.getTranslator(javaType);
    } catch (TranslatorException cause) {
      return Parse.error(cause);
    }
    return translator.parse();
  }

  default <T> Parse<T> parse(Type javaType, String string) {
    final Translator<T> translator;
    try {
      translator = this.getTranslator(javaType);
    } catch (TranslatorException cause) {
      return Parse.error(cause);
    }
    return translator.parse(string);
  }

  default <T> Write<?> write(Type javaType, Output<?> output, @Nullable T value) {
    final Translator<T> translator;
    try {
      translator = this.getTranslator(javaType);
    } catch (TranslatorException cause) {
      return Write.error(cause);
    }
    return translator.write(output, value);
  }

  default <T> Write<?> write(Type javaType, @Nullable T value) {
    final Translator<T> translator;
    try {
      translator = this.getTranslator(javaType);
    } catch (TranslatorException cause) {
      return Write.error(cause);
    }
    return translator.write(value);
  }

  default <T> String toString(Type javaType, @Nullable T value) {
    final Translator<T> translator;
    try {
      translator = this.getTranslator(javaType);
    } catch (TranslatorException cause) {
      throw new IllegalArgumentException(cause);
    }
    return translator.toString(value);
  }

  static Format get(MediaType mediaType) throws FormatException {
    return Codec.registry().getFormat(mediaType);
  }

  static Format get(String mediaType) throws FormatException {
    return Codec.registry().getFormat(mediaType);
  }

}
