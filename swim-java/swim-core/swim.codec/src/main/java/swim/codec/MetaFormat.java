// Copyright 2015-2023 Nstream, inc.
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
public interface MetaFormat extends MetaCodec {

  @Override
  default <T> Codec<T> getCodec(Type type) throws CodecException {
    return this.getFormat(type);
  }

  <T> Format<T> getFormat(Type type) throws CodecException;

  default <T> Parse<T> parse(Type type, Input input) {
    final Format<T> format;
    try {
      format = this.getFormat(type);
    } catch (CodecException cause) {
      return Parse.error(cause);
    }
    return format.parse(input);
  }

  default <T> Parse<T> parse(Type type) {
    final Format<T> format;
    try {
      format = this.getFormat(type);
    } catch (CodecException cause) {
      return Parse.error(cause);
    }
    return format.parse();
  }

  default <T> Parse<T> parse(Type type, String string) {
    final Format<T> format;
    try {
      format = this.getFormat(type);
    } catch (CodecException cause) {
      return Parse.error(cause);
    }
    return format.parse(string);
  }

  default <T> Write<?> write(Type type, Output<?> output, @Nullable T value) {
    final Format<T> format;
    try {
      format = this.getFormat(type);
    } catch (CodecException cause) {
      return Write.error(cause);
    }
    return format.write(output, value);
  }

  default <T> Write<?> write(Type type, @Nullable T value) {
    final Format<T> format;
    try {
      format = this.getFormat(type);
    } catch (CodecException cause) {
      return Write.error(cause);
    }
    return format.write(value);
  }

  default <T> String toString(Type type, @Nullable T value) {
    final Format<T> format;
    try {
      format = this.getFormat(type);
    } catch (CodecException cause) {
      throw new IllegalArgumentException(cause);
    }
    return format.toString(value);
  }

  static MetaFormat get(MediaType mediaType) throws CodecException {
    return MetaCodec.registry().getMetaFormat(mediaType);
  }

  static MetaFormat get(String mediaType) throws CodecException {
    return MetaCodec.registry().getMetaFormat(mediaType);
  }

}
