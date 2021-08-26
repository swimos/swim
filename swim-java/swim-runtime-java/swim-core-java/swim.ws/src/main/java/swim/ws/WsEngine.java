// Copyright 2015-2021 Swim Inc.
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

import swim.http.WebSocketExtension;

public abstract class WsEngine {

  public abstract WsDecoder decoder();

  public abstract WsEncoder encoder();

  public abstract WsEngine extension(WebSocketExtension extension, WsEngineSettings settings);

  public WsEngine extensions(Iterable<WebSocketExtension> extensions, WsEngineSettings settings) {
    WsEngine engine = this;
    for (WebSocketExtension extension : extensions) {
      engine = engine.extension(extension, settings);
    }
    return engine;
  }

  private static WsEngine standardClientEngine;

  public static WsEngine standardClientEngine() {
    if (WsEngine.standardClientEngine == null) {
      WsEngine.standardClientEngine = new WsStandardClientEngine();
    }
    return WsEngine.standardClientEngine;
  }

  private static WsEngine standardServerEngine;

  public static WsEngine standardServerEngine() {
    if (WsEngine.standardServerEngine == null) {
      WsEngine.standardServerEngine = new WsStandardServerEngine();
    }
    return WsEngine.standardServerEngine;
  }

  public static WsEngine deflateClientEngine(WebSocketExtension extension, WsEngineSettings settings) {
    return WsDeflateClientEngine.create(extension, settings);
  }

  public static WsEngine deflateServerEngine(WebSocketExtension extension, WsEngineSettings settings) {
    return WsDeflateServerEngine.create(extension, settings);
  }

}
