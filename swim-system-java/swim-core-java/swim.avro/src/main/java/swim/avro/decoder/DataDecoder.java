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

package swim.avro.decoder;

import swim.avro.schema.AvroDataType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class DataDecoder<T> extends Decoder<T> {
  final AvroDataType<T> type;
  final long size;
  final int shift;
  final Decoder<T> decoder;
  final int step;

  DataDecoder(AvroDataType<T> type, long size, int shift, Decoder<T> decoder, int step) {
    this.type = type;
    this.size = size;
    this.shift = shift;
    this.decoder = decoder;
    this.step = step;
  }

  DataDecoder(AvroDataType<T> type) {
    this(type, 0L, 0, null, 1);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.size, this.shift, this.decoder, this.step);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroDataType<T> type, long size,
                               int shift, Decoder<T> decoder, int step) {
    if (step == 1) {
      while (input.isCont()) {
        final int b = input.head();
        if (shift < 64) {
          input = input.step();
          size |= (long) (b & 0x7f) << shift;
        } else {
          return error(new DecoderException("data size overflow"));
        }
        if ((b & 0x80) == 0) {
          size = (size >>> 1) ^ (size << 63 >> 63);
          shift = 0;
          step = 2;
          break;
        }
        shift += 7;
      }
    }
    if (step == 2) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      final boolean inputPart = input.isPart();
      if (size < inputRemaining) {
        input.limit(inputStart + (int) size);
      }
      if (size <= inputRemaining) {
        input = input.isPart(false);
      }
      if (decoder == null) {
        decoder = type.decodeData(input);
      }
      while (decoder.isCont() && !input.isEmpty()) {
        decoder = decoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      size -= input.index() - inputStart;
      if (decoder.isDone()) {
        if (size == 0L) {
          return decoder;
        } else {
          return error(new DecoderException("unconsumed input"));
        }
      } else if (decoder.isError()) {
        return decoder.asError();
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new DataDecoder<T>(type, size, shift, decoder, step);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroDataType<T> type) {
    return decode(input, type, 0L, 0, null, 1);
  }
}
