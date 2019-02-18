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

package swim.mqtt;

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.structure.Data;

final class MqttDataDecoder extends Decoder<Data> {
  final Decoder<byte[]> decoder;
  final int remaining;
  final int step;

  MqttDataDecoder(Decoder<byte[]> decoder, int remaining, int step) {
    this.decoder = decoder;
    this.remaining = remaining;
    this.step = step;
  }

  MqttDataDecoder() {
    this(null, 0, 1);
  }

  @Override
  public Decoder<Data> feed(InputBuffer input) {
    return decode(input, this.decoder, this.remaining, this.step);
  }

  static Decoder<Data> decode(InputBuffer input, Decoder<byte[]> decoder, int remaining, int step) {
    if (step == 1 && input.isCont()) {
      remaining = input.head() << 8;
      input = input.step();
      step = 2;
    }
    if (step == 2 && input.isCont()) {
      remaining |= input.head();
      input = input.step();
      step = 3;
    }
    if (step == 3) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (decoder == null) {
        decoder = Binary.parseOutput(Binary.byteArrayOutput(remaining), input);
      } else {
        decoder = decoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (decoder.isDone()) {
        return done(Data.wrap(decoder.bind()));
      } else if (decoder.isError()) {
        return decoder.asError();
      }
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MqttDataDecoder(decoder, remaining, step);
  }

  static Decoder<Data> decode(InputBuffer input) {
    return decode(input, null, 0, 1);
  }
}
