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
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.protobuf.schema.ProtobufStringType;

final class StringDecoder<T> extends Decoder<T> {

  final ProtobufStringType<T> type;
  final Parser<T> parser;
  final long length;
  final int shift;
  final int step;

  StringDecoder(ProtobufStringType<T> type, Parser<T> parser, long length, int shift, int step) {
    this.type = type;
    this.parser = parser;
    this.length = length;
    this.shift = shift;
    this.step = step;
  }

  StringDecoder(ProtobufStringType<T> type) {
    this(type, null, 0L, 0, 1);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return decode(input, this.type, this.parser, this.length, this.shift, this.step);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufStringType<T> type,
                               Parser<T> parser, long length, int shift, int step) {
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
      final Input stringInput = Utf8.decodedInput(input);
      if (parser == null) {
        parser = type.parseString(input);
      } else {
        parser = parser.feed(input);
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
    return new StringDecoder<T>(type, parser, length, shift, step);
  }

  static <T> Decoder<T> decode(InputBuffer input, ProtobufStringType<T> type) {
    return decode(input, type, null, 0L, 0, 1);
  }

}
