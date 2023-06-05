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
public interface MetaCodec {

  MediaType mediaType();

  <T> Codec<T> getCodec(Type type) throws CodecException;

  default <T> Decode<T> decode(Type type, InputBuffer input) {
    final Codec<T> codec;
    try {
      codec = this.getCodec(type);
    } catch (CodecException cause) {
      return Decode.error(cause);
    }
    return codec.decode(input);
  }

  default <T> Decode<T> decode(Type type) {
    final Codec<T> codec;
    try {
      codec = this.getCodec(type);
    } catch (CodecException cause) {
      return Decode.error(cause);
    }
    return codec.decode();
  }

  default <T> Encode<?> encode(Type type, OutputBuffer<?> output, @Nullable T value) {
    final Codec<T> codec;
    try {
      codec = this.getCodec(type);
    } catch (CodecException cause) {
      return Encode.error(cause);
    }
    return codec.encode(output, value);
  }

  default <T> Encode<?> encode(Type type, @Nullable T value) {
    final Codec<T> codec;
    try {
      codec = this.getCodec(type);
    } catch (CodecException cause) {
      return Encode.error(cause);
    }
    return codec.encode(value);
  }

  default <T> long sizeOf(Type type, @Nullable T value) throws CodecException {
    final Codec<T> codec = this.getCodec(type);
    return codec.sizeOf(value);
  }

  static MetaCodecRegistry registry() {
    return MetaCodecRegistry.REGISTRY;
  }

  static MetaCodec get(MediaType mediaType) throws CodecException {
    return MetaCodec.registry().getMetaCodec(mediaType);
  }

  static MetaCodec get(String mediaType) throws CodecException {
    return MetaCodec.registry().getMetaCodec(mediaType);
  }

}
