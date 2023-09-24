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
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A transcoder of values from/to non-blocking chunked input/output buffers.
 *
 * @param <T> the type of values to decode/encode
 */
@Public
@Since("5.0")
public interface Codec<T> extends Decoder<T>, Encoder<T> {

  /**
   * Returns the media type of this codec's encoded data format.
   *
   * @return a media type that identifies the data format
   *         decoded/encoded by this codec
   */
  MediaType mediaType();

  static <T> Codec<T> get(MediaType mediaType, Type type) throws CodecException {
    return MetaCodec.registry().getCodec(mediaType, type);
  }

  static <T> Codec<T> get(String mediaType, Type type) throws CodecException {
    return MetaCodec.registry().getCodec(mediaType, type);
  }

}
