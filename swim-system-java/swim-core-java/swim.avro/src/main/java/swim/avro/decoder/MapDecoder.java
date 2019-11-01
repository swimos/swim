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

import swim.avro.schema.AvroMapType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.util.PairBuilder;

final class MapDecoder<K, V, T> extends Decoder<T> {
  final AvroDecoder avro;
  final AvroMapType<K, V, T> type;
  final PairBuilder<K, V, T> builder;
  final long count;
  final long blockSize;
  final long keyLength;
  final int shift;
  final Parser<K> keyParser;
  final Decoder<V> valueDecoder;
  final int step;

  MapDecoder(AvroDecoder avro, AvroMapType<K, V, T> type, PairBuilder<K, V, T> builder,
             long count, long blockSize, long keyLength, int shift, Parser<K> keyParser,
             Decoder<V> valueDecoder, int step) {
    this.avro = avro;
    this.type = type;
    this.builder = builder;
    this.count = count;
    this.blockSize = blockSize;
    this.keyLength = keyLength;
    this.shift = shift;
    this.keyParser = keyParser;
    this.valueDecoder = valueDecoder;
    this.step = step;
  }

  MapDecoder(AvroDecoder avro, AvroMapType<K, V, T> type) {
    this(avro, type, null, 0L, 0L, 0L, 0, null, null, 1);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.avro, this.type, this.builder, this.count, this.blockSize,
                  this.keyLength, this.shift, this.keyParser, this.valueDecoder, this.step);
  }

  static <K, V, T> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroMapType<K, V, T> type,
                                     PairBuilder<K, V, T> builder, long count, long blockSize,
                                     long keyLength, int shift, Parser<K> keyParser,
                                     Decoder<V> valueDecoder, int step) {
    do {
      if (step == 1) {
        while (input.isCont()) {
          final int b = input.head();
          if (shift < 64) {
            input = input.step();
            count |= (long) (b & 0x7f) << shift;
          } else {
            return error(new DecoderException("map count overflow"));
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
                builder = type.mapBuilder();
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
            return error(new DecoderException("map block size overflow"));
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
        while (input.isCont()) {
          final int b = input.head();
          if (shift < 64) {
            input = input.step();
            keyLength |= (long) (b & 0x7f) << shift;
          } else {
            return error(new DecoderException("key length overflow"));
          }
          if ((b & 0x80) == 0) {
            keyLength = (keyLength >>> 1) ^ (keyLength << 63 >> 63);
            shift = 0;
            step = 4;
            break;
          }
          shift += 7;
        }
      }
      if (step == 4) {
        final int inputStart = input.index();
        final int inputLimit = input.limit();
        final int inputRemaining = inputLimit - inputStart;
        final boolean inputPart = input.isPart();
        if (keyLength < inputRemaining) {
          input.limit(inputStart + (int) keyLength);
        }
        if (keyLength <= inputRemaining) {
          input = input.isPart(false);
        }
        final Input keyInput = Utf8.decodedInput(input);
        if (keyParser == null) {
          keyParser = type.parseKey(keyInput);
          count -= 1;
        }
        while (keyParser.isCont() && !keyInput.isEmpty()) {
          keyParser = keyParser.feed(keyInput);
        }
        input = input.limit(inputLimit).isPart(inputPart);
        keyLength -= input.index() - inputStart;
        if (keyParser.isDone()) {
          if (keyLength == 0L) {
            step = 5;
          } else {
            return error(new DecoderException("unconsumed input"));
          }
        } else if (keyParser.isError()) {
          return keyParser.asError();
        }
      }
      if (step == 5) {
        if (valueDecoder == null) {
          valueDecoder = avro.decodeType(type.valueType(), input);
        }
        while (valueDecoder.isCont() && !input.isEmpty()) {
          valueDecoder = valueDecoder.feed(input);
        }
        if (valueDecoder.isDone()) {
          if (builder == null) {
            builder = type.mapBuilder();
          }
          builder.add(keyParser.bind(), valueDecoder.bind());
          keyParser = null;
          valueDecoder = null;
          if (count == 0) {
            blockSize = 0L;
            step = 1;
          } else {
            step = 3;
          }
          continue;
        } else if (valueDecoder.isError()) {
          return valueDecoder.asError();
        }
      }
      break;
    } while (true);
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MapDecoder<K, V, T>(avro, type, builder, count, blockSize, keyLength,
                                   shift, keyParser, valueDecoder, step);
  }

  static <K, V, T> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroMapType<K, V, T> type) {
    return decode(input, avro, type, null, 0L, 0L, 0L, 0, null, null, 1);
  }
}
