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
  private static WsEngine standardServerEngine;

  public static WsEngine standardClientEngine() {
    if (standardClientEngine == null) {
      standardClientEngine = new WsStandardClientEngine();
    }
    return standardClientEngine;
  }

  public static WsEngine standardServerEngine() {
    if (standardServerEngine == null) {
      standardServerEngine = new WsStandardServerEngine();
    }
    return standardServerEngine;
  }

  public static WsEngine deflateClientEngine(WebSocketExtension extension, WsEngineSettings settings) {
    return WsDeflateClientEngine.from(extension, settings);
  }

  public static WsEngine deflateServerEngine(WebSocketExtension extension, WsEngineSettings settings) {
    return WsDeflateServerEngine.from(extension, settings);
  }
}
