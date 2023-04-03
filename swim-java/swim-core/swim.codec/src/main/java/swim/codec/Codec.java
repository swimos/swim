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
public interface Codec {

  MediaType mediaType();

  <T> Transcoder<T> getTranscoder(Type javaType) throws TranscoderException;

  default <T> Decode<T> decode(Type javaType, InputBuffer input) {
    final Transcoder<T> transcoder;
    try {
      transcoder = this.getTranscoder(javaType);
    } catch (TranscoderException cause) {
      return Decode.error(cause);
    }
    return transcoder.decode(input);
  }

  default <T> Decode<T> decode(Type javaType) {
    final Transcoder<T> transcoder;
    try {
      transcoder = this.getTranscoder(javaType);
    } catch (TranscoderException cause) {
      return Decode.error(cause);
    }
    return transcoder.decode();
  }

  default <T> Encode<?> encode(Type javaType, OutputBuffer<?> output, @Nullable T value) {
    final Transcoder<T> transcoder;
    try {
      transcoder = this.getTranscoder(javaType);
    } catch (TranscoderException cause) {
      return Encode.error(cause);
    }
    return transcoder.encode(output, value);
  }

  default <T> Encode<?> encode(Type javaType, @Nullable T value) {
    final Transcoder<T> transcoder;
    try {
      transcoder = this.getTranscoder(javaType);
    } catch (TranscoderException cause) {
      return Encode.error(cause);
    }
    return transcoder.encode(value);
  }

  default <T> long sizeOf(Type javaType, @Nullable T value) throws TranscoderException, EncodeException {
    final Transcoder<T> transcoder = this.getTranscoder(javaType);
    return transcoder.sizeOf(value);
  }

  static CodecRegistry registry() {
    return CodecRegistry.REGISTRY;
  }

  static Codec get(MediaType mediaType) throws CodecException {
    return Codec.registry().getCodec(mediaType);
  }

  static Codec get(String mediaType) throws CodecException {
    return Codec.registry().getCodec(mediaType);
  }

}
