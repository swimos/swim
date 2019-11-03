// Copyright 2015-2019 SWIM.AI inc.
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

package swim.avro;

import swim.avro.decoder.AvroDecoder;
import swim.avro.schema.AvroType;
import swim.codec.Decoder;
import swim.codec.InputBuffer;

/**
 * Factory for constructing Avro decoders and encoders.
 */
public final class Avro {
  private Avro() {
    // static
  }

  private static AvroDecoder decoder;

  public static AvroDecoder decoder() {
    if (decoder == null) {
      decoder = new AvroDecoder();
    }
    return decoder;
  }

  public static <T> Decoder<T> decodeType(AvroType<T> type, InputBuffer input) {
    return decoder().decodeType(type, input);
  }

  public static <T> Decoder<T> typeDecoder(AvroType<T> type) {
    return decoder().typeDecoder(type);
  }

  public static boolean isNameStartChar(int c) {
    return 'A' <= c && c <= 'Z'
        || 'a' <= c && c <= 'z'
        || c == '_';
  }

  public static boolean isNameChar(int c) {
    return 'A' <= c && c <= 'Z'
        || 'a' <= c && c <= 'z'
        || '0' <= c && c <= '9'
        || c == '_';
  }
}
