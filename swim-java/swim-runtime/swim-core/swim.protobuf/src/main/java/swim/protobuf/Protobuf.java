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

package swim.protobuf;

import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.protobuf.decoder.ProtobufDecoder;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufType;

/**
 * Factory for constructing Protocol Buffers decoders and encoders.
 */
public final class Protobuf {

  private Protobuf() {
    // static
  }

  private static ProtobufDecoder decoder;

  public static ProtobufDecoder decoder() {
    if (Protobuf.decoder == null) {
      Protobuf.decoder = new ProtobufDecoder();
    }
    return Protobuf.decoder;
  }

  public static <T> Decoder<T> decodeType(InputBuffer input, ProtobufType<T> type) {
    return Protobuf.decoder().decodeType(input, type);
  }

  public static <T> Decoder<T> typeDecoder(ProtobufType<T> type) {
    return Protobuf.decoder().typeDecoder(type);
  }

  public static <T> Decoder<T> decodePayload(InputBuffer input, ProtobufMessageType<T, ?> type) {
    return Protobuf.decoder().decodePayload(input, type);
  }

  public static <T> Decoder<T> payloadDecoder(ProtobufMessageType<T, ?> type) {
    return Protobuf.decoder().payloadDecoder(type);
  }

}
