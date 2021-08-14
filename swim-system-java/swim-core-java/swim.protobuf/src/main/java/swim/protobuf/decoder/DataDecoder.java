// Copyright 2015-2021 Swim inc.
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
import swim.protobuf.schema.ProtobufDataType;

final class DataDecoder<T> extends Decoder<T> {

  final ProtobufDataType<T> type;
  final Decoder<T> decoder;
  final long length;
  final int shift;
  final int step;

  DataDecoder(ProtobufDataType<T> type, Decoder<T> decoder, long length, int shift, int step) {
    this.type = type;
    this.decoder = decoder;
    this.length = length;
    this.shift = shift;
    this.step = step;
  }

  DataDecoder(ProtobufDataType<T> type) {
    this(type, null, 0L, 0, 1);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return DataDecoder.decode(input, this.type, this.decoder, this.length, this.shift, this.step);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufDataType<T> type,
                               Decoder<T> decoder, long length, int shift, int step) {
    if (step == 1) {
      while (input.isCont()) {
        final int b = input.head();
        if (shift < 64) {
          input = input.step();
          length |= (long) (b & 0x7f) << shift;
        } else {
          return Decoder.error(new DecoderException("varint overflow"));
        }
        if ((b & 0x80) == 0) {
          shift = 0;
          step = 2;
          break;
        } else {
          shift += 7;
        }
      }
    }
    if (step == 2) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      final boolean inputPart = input.isPart();
      if (length < inputRemaining) {
        input.limit(inputStart + (int) length);
      }
      if (length <= inputRemaining) {
        input = input.isPart(false);
      }
      if (decoder == null) {
        decoder = type.decodeData(input);
      } else {
        decoder = decoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      length -= input.index() - inputStart;
      if (decoder.isDone()) {
        if (length == 0L) {
          return decoder;
        } else {
          return Decoder.error(new DecoderException("unconsumed input"));
        }
      } else if (decoder.isError()) {
        return decoder.asError();
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new DataDecoder<T>(type, decoder, length, shift, step);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufDataType<T> type) {
    return DataDecoder.decode(input, type, null, 0L, 0, 1);
  }

}
