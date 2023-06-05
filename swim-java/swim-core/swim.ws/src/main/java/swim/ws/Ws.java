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

import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class Ws {

  private Ws() {
    // static
  }

  public static WsDecoder clientDecoder() {
    return WsDecoder.CLIENT_DECODER;
  }

  public static WsDecoder serverDecoder() {
    return WsDecoder.SERVER_DECODER;
  }

  public static WsEncoder clientEncoder() {
    return WsEncoder.CLIENT_ENCODER;
  }

  public static WsEncoder serverEncoder() {
    return WsEncoder.SERVER_ENCODER;
  }

  public static WsEngine clientEngine() {
    return WsClientEngine.ENGINE;
  }

  public static WsEngine serverEngine() {
    return WsServerEngine.ENGINE;
  }

  public static WsDeflateDecoder deflateClientDecoder(WsOptions options) {
    return new WsDeflateDecoder(false, options);
  }

  public static WsDeflateDecoder deflateServerDecoder(WsOptions options) {
    return new WsDeflateDecoder(true, options);
  }

  public static WsDeflateEncoder deflateClientEncoder(WsOptions options) {
    return new WsDeflateEncoder(true, options);
  }

  public static WsDeflateEncoder deflateServerEncoder(WsOptions options) {
    return new WsDeflateEncoder(false, options);
  }

  public static WsDeflateEngine deflateClientEngine(WsOptions options) {
    return new WsDeflateClientEngine(options);
  }

  public static WsDeflateEngine deflateServerEngine(WsOptions options) {
    return new WsDeflateServerEngine(options);
  }

  public static WsEngine clientEngine(WsOptions options) {
    if (options.clientCompressionLevel != 0 && options.clientMaxWindowBits == 15) {
      // java.util.zip doesn't support configurable sliding window.sizes.
      return Ws.deflateClientEngine(options);
    }
    return Ws.clientEngine();
  }

  public static WsEngine serverEngine(WsOptions options) {
    if (options.serverCompressionLevel != 0 && options.serverMaxWindowBits == 15) {
      // java.util.zip doesn't support configurable sliding window.sizes.
      return Ws.deflateServerEngine(options);
    }
    return Ws.serverEngine();
  }

}
