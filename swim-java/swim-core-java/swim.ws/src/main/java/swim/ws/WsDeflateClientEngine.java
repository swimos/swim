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

import swim.deflate.Deflate;
import swim.deflate.Inflate;
import swim.http.WebSocketExtension;
import swim.http.WebSocketParam;

final class WsDeflateClientEngine extends WsEngine {
  protected final int clientCompressionLevel;
  protected final boolean clientNoContextTakeover;
  protected final int serverMaxWindowBits;
  protected final int clientMaxWindowBits;

  WsDeflateClientEngine(int clientCompressionLevel, boolean clientNoContextTakeover,
                        int serverMaxWindowBits, int clientMaxWindowBits) {
    this.clientCompressionLevel = clientCompressionLevel;
    this.clientNoContextTakeover = clientNoContextTakeover;
    this.serverMaxWindowBits = serverMaxWindowBits;
    this.clientMaxWindowBits = clientMaxWindowBits;
  }

  @Override
  public WsDecoder decoder() {
    return Ws.deflateDecoder(new Inflate<Object>(Inflate.Z_NO_WRAP, this.serverMaxWindowBits));
  }

  @Override
  public WsEncoder encoder() {
    final int flush;
    if (this.clientNoContextTakeover) {
      flush = Deflate.Z_FULL_FLUSH;
    } else {
      flush = Deflate.Z_SYNC_FLUSH;
    }
    return Ws.deflateEncoderMasked(new Deflate<Object>(Deflate.Z_NO_WRAP, this.clientCompressionLevel,
                                   this.clientMaxWindowBits), flush);
  }

  @Override
  public WsEngine extension(WebSocketExtension extension, WsEngineSettings settings) {
    return this;
  }

  static WsDeflateClientEngine from(WebSocketExtension extension, WsEngineSettings settings) {
    boolean clientNoContextTakeover = false;
    int serverMaxWindowBits = 15;
    int clientMaxWindowBits = 15;
    for (WebSocketParam param : extension.params()) {
      final String key = param.key();
      final String value = param.value();
      if ("client_no_context_takeover".equals(key)) {
        clientNoContextTakeover = true;
      } else if ("server_max_window_bits".equals(key)) {
        try {
          serverMaxWindowBits = Integer.parseInt(value);
        } catch (NumberFormatException cause) {
          throw new WsException("invalid permessage-deflate; " + param.toHttp());
        }
      } else if ("client_max_window_bits".equals(key)) {
        try {
          clientMaxWindowBits = Integer.parseInt(value);
        } catch (NumberFormatException cause) {
          throw new WsException("invalid permessage-deflate; " + param.toHttp());
        }
      } else {
        throw new WsException("invalid permessage-deflate; " + param.toHttp());
      }
    }
    return new WsDeflateClientEngine(settings.clientCompressionLevel, clientNoContextTakeover,
                                     serverMaxWindowBits, clientMaxWindowBits);
  }
}

