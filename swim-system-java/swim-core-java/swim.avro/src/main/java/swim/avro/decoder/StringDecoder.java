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

import swim.avro.schema.AvroStringType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Parser;
import swim.codec.Utf8;

final class StringDecoder<T> extends Decoder<T> {
  final AvroStringType<T> type;
  final long length;
  final int shift;
  final Parser<T> parser;
  final int step;

  StringDecoder(AvroStringType<T> type, long length, int shift,
                Parser<T> parser, int step) {
    this.type = type;
    this.length = length;
    this.shift = shift;
    this.parser = parser;
    this.step = step;
  }

  StringDecoder(AvroStringType<T> type) {
    this(type, 0L, 0, null, 1);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.length, this.shift, this.parser, this.step);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroStringType<T> type, long length,
                               int shift, Parser<T> parser, int step) {
    if (step == 1) {
      while (input.isCont()) {
        final int b = input.head();
        if (shift < 64) {
          input = input.step();
          length |= (long) (b & 0x7f) << shift;
        } else {
          return error(new DecoderException("string length overflow"));
        }
        if ((b & 0x80) == 0) {
          length = (length >>> 1) ^ (length << 63 >> 63);
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
      if (length < inputRemaining) {
        input.limit(inputStart + (int) length);
      }
      if (length <= inputRemaining) {
        input = input.isPart(false);
      }
      final Input stringInput = Utf8.decodedInput(input);
      if (parser == null) {
        parser = type.parseString(stringInput);
      }
      while (parser.isCont() && !stringInput.isEmpty()) {
        parser = parser.feed(stringInput);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      length -= input.index() - inputStart;
      if (parser.isDone()) {
        if (length == 0L) {
          return parser;
        } else {
          return error(new DecoderException("unconsumed input"));
        }
      } else if (parser.isError()) {
        return parser.asError();
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new StringDecoder<T>(type, length, shift, parser, step);
  }

  static <T> Decoder<T> decode(InputBuffer input, AvroStringType<T> type) {
    return decode(input, type, 0L, 0, null, 1);
  }
}
