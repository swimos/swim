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

package swim.ws;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class WsOpcodeDecoder<O> extends Decoder<WsFrame<O>> {
  final WsDecoder ws;
  final Decoder<O> content;

  WsOpcodeDecoder(WsDecoder ws, Decoder<O> content) {
    this.ws = ws;
    this.content = content;
  }

  @Override
  public Decoder<WsFrame<O>> feed(InputBuffer input) {
    return decode(input, this.ws, this.content);
  }

  static <O> Decoder<WsFrame<O>> decode(InputBuffer input, WsDecoder ws, Decoder<O> content) {
    if (input.isCont()) {
      final int finRsvOp = input.head();
      return ws.decodeFrame(finRsvOp, content, input);
    } else if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new WsOpcodeDecoder<O>(ws, content);
  }
}
