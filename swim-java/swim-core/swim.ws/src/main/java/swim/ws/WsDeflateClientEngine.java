// Copyright 2015-2023 Nstream, inc.
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
import swim.util.WriteSource;

final class WsDeflateClientEngine extends WsDeflateEngine implements WriteSource {

  WsDeflateClientEngine(WsOptions options) {
    super(options);
  }

  @Override
  public WsDeflateDecoder decoder() {
    return Ws.deflateClientDecoder(this.options);
  }

  @Override
  public WsDeflateEncoder encoder() {
    return Ws.deflateClientEncoder(this.options);
  }

  @Override
  public WsEngine acceptOptions(WsOptions options) {
    if (options.clientMaxWindowBits == 0) {
      options = options.clientMaxWindowBits(this.options.clientMaxWindowBits);
    }
    options = options.serverNoContextTakeover(options.serverNoContextTakeover || this.options.serverNoContextTakeover)
                     .clientNoContextTakeover(options.clientNoContextTakeover || this.options.clientNoContextTakeover)
                     .serverMaxWindowBits(Math.min(options.serverMaxWindowBits, this.options.serverMaxWindowBits))
                     .clientMaxWindowBits(Math.min(options.clientMaxWindowBits, this.options.clientMaxWindowBits));
    if (options.clientCompressionLevel == 0 || options.clientMaxWindowBits != 15) {
      // java.util.zip doesn't support configurable sliding window.sizes.
      return Ws.clientEngine();
    } else if (!this.options.equals(options)) {
      return Ws.deflateClientEngine(options);
    }
    return this;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Ws", "deflateClientEngine")
            .appendArgument(this.options)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
