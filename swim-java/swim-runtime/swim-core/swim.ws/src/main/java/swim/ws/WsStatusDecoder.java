// Copyright 2015-2023 Swim.inc
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

package swim.ws;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.codec.Utf8;

final class WsStatusDecoder extends Decoder<WsStatus> {

  final int code;
  final Decoder<String> reasonDecoder;
  final int step;

  WsStatusDecoder(int code, Decoder<String> reasonDecoder, int step) {
    this.code = code;
    this.reasonDecoder = reasonDecoder;
    this.step = step;
  }

  WsStatusDecoder() {
    this(0, null, 1);
  }

  @Override
  public Decoder<WsStatus> feed(InputBuffer input) {
    return WsStatusDecoder.decode(input, this.code, this.reasonDecoder, this.step);
  }

  static Decoder<WsStatus> decode(InputBuffer input, int code,
                                  Decoder<String> reasonDecoder, int step) {
    if (step == 1) {
      if (input.isCont()) {
        code = input.head() << 8;
        input = input.step();
        step = 2;
      } else if (input.isDone()) {
        return Decoder.done(null);
      }
    }
    if (step == 2 && input.isCont()) {
      code |= input.head();
      input = input.step();
      step = 3;
    }
    if (step == 3) {
      if (reasonDecoder == null) {
        reasonDecoder = Utf8.parseString(input);
      } else {
        reasonDecoder = reasonDecoder.feed(input);
      }
      if (reasonDecoder.isDone()) {
        return Decoder.done(new WsStatus(code, reasonDecoder.bind()));
      } else if (reasonDecoder.isError()) {
        return reasonDecoder.asError();
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new WsStatusDecoder(code, reasonDecoder, step);
  }

  static Decoder<WsStatus> decode(InputBuffer input) {
    return WsStatusDecoder.decode(input, 0, null, 1);
  }

}
