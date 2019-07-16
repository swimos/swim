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

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.codec.Utf8;
import swim.structure.Data;

final class StringOrDataDecoder extends Decoder<Object> {
  @SuppressWarnings("unchecked")
  @Override
  public Decoder<Object> fork(Object condition) {
    if (condition instanceof WsOpcode) {
      final WsOpcode opcode = (WsOpcode) condition;
      switch (opcode) {
        case TEXT: return (Decoder<Object>) (Decoder<?>) Utf8.stringParser();
        case BINARY: return (Decoder<Object>) (Decoder<?>) Binary.outputParser(Data.output());
        default:
      }
    }
    return this;
  }

  @Override
  public Decoder<Object> feed(InputBuffer input) {
    return Decoder.done();
  }
}
