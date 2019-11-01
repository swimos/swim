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

import swim.avro.schema.AvroFixedType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class FixedDecoder<T> extends Decoder<T> {
  final AvroFixedType<T> type;
  final long size;
  final Decoder<T> decoder;

  FixedDecoder(AvroFixedType<T> type, long size, Decoder<T> decoder) {
    this.type = type;
    this.size = size;
    this.decoder = decoder;
  }

  FixedDecoder(AvroFixedType<T> type) {
    this(type, type.size(), null);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.size, this.decoder);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroFixedType<T> type,
                               long size, Decoder<T> decoder) {

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
      decoder = type.decodeFixed(input);
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
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new FixedDecoder<T>(type, size, decoder);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroFixedType<T> type) {
    return decode(input, type, type.size(), null);
  }
}
