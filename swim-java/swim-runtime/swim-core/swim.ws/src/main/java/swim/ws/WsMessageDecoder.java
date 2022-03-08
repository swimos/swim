// Copyright 2015-2022 Swim.inc
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

final class WsMessageDecoder<O> extends Decoder<WsFrame<O>> {

  final WsDecoder ws;
  final WsOpcode frameType;
  final Decoder<O> payloadDecoder;

  WsMessageDecoder(WsDecoder ws, WsOpcode frameType, Decoder<O> payloadDecoder) {
    this.ws = ws;
    this.frameType = frameType;
    this.payloadDecoder = payloadDecoder;
  }

  @Override
  public Decoder<WsFrame<O>> feed(InputBuffer input) {
    return WsMessageDecoder.decode(input, this.ws, this.frameType, this.payloadDecoder);
  }

  static <O> Decoder<WsFrame<O>> decode(InputBuffer input, WsDecoder ws,
                                        WsOpcode frameType, Decoder<O> payloadDecoder) {
    if (input.isCont()) {
      final int finRsvOp = input.head();
      return ws.decodeFinRsvOp(input, finRsvOp, frameType, payloadDecoder);
    } else if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new WsMessageDecoder<O>(ws, frameType, payloadDecoder);
  }

}
