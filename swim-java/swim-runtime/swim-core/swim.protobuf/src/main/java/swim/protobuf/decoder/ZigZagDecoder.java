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

package swim.protobuf.decoder;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.protobuf.schema.ProtobufZigZagType;

final class ZigZagDecoder<T> extends Decoder<T> {

  final ProtobufZigZagType<T> type;
  final long value;
  final int shift;

  ZigZagDecoder(ProtobufZigZagType<T> type, long value, int shift) {
    this.type = type;
    this.value = value;
    this.shift = shift;
  }

  ZigZagDecoder(ProtobufZigZagType<T> type) {
    this(type, 0L, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return ZigZagDecoder.decode(input, this.type, this.value, this.shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufZigZagType<T> type, long value, int shift) {
    while (input.isCont()) {
      final int b = input.head();
      if (shift < 64) {
        input = input.step();
        value |= (long) (b & 0x7f) << shift;
      } else {
        return Decoder.error(new DecoderException("varint overflow"));
      }
      if ((b & 0x80) == 0) {
        value = (value >>> 1) ^ (value << 63 >> 63);
        return Decoder.done(type.cast(value));
      }
      shift += 7;
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new ZigZagDecoder<T>(type, value, shift);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufZigZagType<T> type) {
    return ZigZagDecoder.decode(input, type, 0L, 0);
  }

}
