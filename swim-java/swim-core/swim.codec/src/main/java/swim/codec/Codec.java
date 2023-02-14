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

  <T> @Nullable Transcoder<T> getTranscoder(Type javaType);

  static CodecRegistry registry() {
    return CodecRegistry.REGISTRY;
  }

  static Codec getCodec(MediaType mediaType) {
    final Codec codec = Codec.registry().getCodec(mediaType);
    if (codec != null) {
      return codec;
    } else {
      throw new IllegalArgumentException("No codec for media type: " + mediaType);
    }
  }

  static Codec getCodec(String mediaType) {
    final Codec codec = Codec.registry().getCodec(mediaType);
    if (codec != null) {
      return codec;
    } else {
      throw new IllegalArgumentException("No codec for media type: " + mediaType);
    }
  }

  static <T> Transcoder<T> getTranscoder(MediaType mediaType, Type javaType) {
    final Codec codec = Codec.getCodec(mediaType);
    final Transcoder<T> transcoder = codec.getTranscoder(javaType);
    if (transcoder != null) {
      return transcoder;
    } else {
      throw new IllegalArgumentException("No " + mediaType + " transcoder for type: " + javaType);
    }
  }

  static <T> Transcoder<T> getTranscoder(String mediaType, Type javaType) {
    final Codec codec = Codec.getCodec(mediaType);
    final Transcoder<T> transcoder = codec.getTranscoder(javaType);
    if (transcoder != null) {
      return transcoder;
    } else {
      throw new IllegalArgumentException("No " + mediaType + " transcoder for type: " + javaType);
    }
  }

  static <T> Decode<T> decode(MediaType mediaType, Type javaType, InputBuffer input) {
    return Codec.<T>getTranscoder(mediaType, javaType).decode(input);
  }

  static <T> Decode<T> decode(String mediaType, Type javaType, InputBuffer input) {
    return Codec.<T>getTranscoder(mediaType, javaType).decode(input);
  }

  static <T> Decode<T> decode(MediaType mediaType, Type javaType) {
    return Codec.<T>getTranscoder(mediaType, javaType).decode();
  }

  static <T> Decode<T> decode(String mediaType, Type javaType) {
    return Codec.<T>getTranscoder(mediaType, javaType).decode();
  }

  static <T> Encode<?> encode(MediaType mediaType, OutputBuffer<?> output, T value) {
    return Codec.<T>getTranscoder(mediaType, value.getClass()).encode(output, value);
  }

  static <T> Encode<?> encode(String mediaType, OutputBuffer<?> output, T value) {
    return Codec.<T>getTranscoder(mediaType, value.getClass()).encode(output, value);
  }

  static <T> Encode<?> encode(MediaType mediaType, T value) {
    return Codec.<T>getTranscoder(mediaType, value.getClass()).encode(value);
  }

  static <T> Encode<?> encode(String mediaType, T value) {
    return Codec.<T>getTranscoder(mediaType, value.getClass()).encode(value);
  }

}
