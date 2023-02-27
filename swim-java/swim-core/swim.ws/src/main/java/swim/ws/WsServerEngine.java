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

import swim.util.Notation;
import swim.util.ToSource;

final class WsServerEngine extends WsEngine implements ToSource {

  WsServerEngine(WsEngineOptions options) {
    super(options);
  }

  @Override
  public WsDecoder decoder() {
    return Ws.serverDecoder();
  }

  @Override
  public WsEncoder encoder() {
    return Ws.serverEncoder();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Ws", "serverEngine").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final WsServerEngine ENGINE = new WsServerEngine(WsEngineOptions.noCompression());

}
