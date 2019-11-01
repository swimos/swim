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

import swim.avro.schema.AvroArrayType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.util.Builder;

final class ArrayDecoder<I, T> extends Decoder<T> {
  final AvroDecoder avro;
  final AvroArrayType<I, T> type;
  final Builder<I, T> builder;
  final long count;
  final long blockSize;
  final int shift;
  final Decoder<I> itemDecoder;
  final int step;

  ArrayDecoder(AvroDecoder avro, AvroArrayType<I, T> type, Builder<I, T> builder,
               long count, long blockSize, int shift, Decoder<I> itemDecoder, int step) {
    this.avro = avro;
    this.type = type;
    this.builder = builder;
    this.count = count;
    this.blockSize = blockSize;
    this.shift = shift;
    this.itemDecoder = itemDecoder;
    this.step = step;
  }

  ArrayDecoder(AvroDecoder avro, AvroArrayType<I, T> type) {
    this(avro, type, null, 0L, 0L, 0, null, 1);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.avro, this.type, this.builder, this.count,
                  this.blockSize, this.shift, this.itemDecoder, this.step);
  }

  static <I, T> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroArrayType<I, T> type,
                                  Builder<I, T> builder, long count, long blockSize,
                                  int shift, Decoder<I> itemDecoder, int step) {
    do {
      if (step == 1) {
        while (input.isCont()) {
          final int b = input.head();
          if (shift < 64) {
            input = input.step();
            count |= (long) (b & 0x7f) << shift;
          } else {
            return error(new DecoderException("array count overflow"));
          }
          if ((b & 0x80) == 0) {
            count = (count >>> 1) ^ (count << 63 >> 63);
            shift = 0;
            if (count < 0) {
              count = -count;
              step = 2;
              break;
            } else if (count > 0) {
              blockSize = -1L;
              step = 3;
              break;
            } else {
              if (builder == null) {
                builder = type.arrayBuilder();
              }
              return done(builder.bind());
            }
          }
          shift += 7;
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          final int b = input.head();
          if (shift < 64) {
            input = input.step();
            blockSize |= (long) (b & 0x7f) << shift;
          } else {
            return error(new DecoderException("array block size overflow"));
          }
          if ((b & 0x80) == 0) {
            blockSize = (blockSize >>> 1) ^ (blockSize << 63 >> 63);
            shift = 0;
            step = 3;
            break;
          }
          shift += 7;
        }
      }
      if (step == 3) {
        if (itemDecoder == null) {
          itemDecoder = avro.decodeType(type.itemType(), input);
          count -= 1;
        }
        while (itemDecoder.isCont() && !input.isEmpty()) {
          itemDecoder = itemDecoder.feed(input);
        }
        if (itemDecoder.isDone()) {
          if (builder == null) {
            builder = type.arrayBuilder();
          }
          builder.add(itemDecoder.bind());
          itemDecoder = null;
          if (count == 0) {
            blockSize = 0L;
            step = 1;
          }
          continue;
        } else if (itemDecoder.isError()) {
          return itemDecoder.asError();
        }
      }
      break;
    } while (true);
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new ArrayDecoder<I, T>(avro, type, builder, count, blockSize, shift, itemDecoder, step);
  }

  static <I, T> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroArrayType<I, T> type) {
    return decode(input, avro, type, null, 0L, 0L, 0, null, 1);
  }
}
