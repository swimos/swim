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

import swim.collections.FingerTrieSeq;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.WebSocketExtension;

/**
 * WebSocket handshake response.
 */
public class WsResponse {
  protected final HttpRequest<?> httpRequest;
  protected final HttpResponse<?> httpResponse;
  protected final String protocol;
  protected final FingerTrieSeq<WebSocketExtension> extensions;

  public WsResponse(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse,
                    String protocol, FingerTrieSeq<WebSocketExtension> extensions) {
    this.httpRequest = httpRequest;
    this.httpResponse = httpResponse;
    this.protocol = protocol;
    this.extensions = extensions;
  }

  public final HttpRequest<?> httpRequest() {
    return this.httpRequest;
  }

  public final HttpResponse<?> httpResponse() {
    return this.httpResponse;
  }

  public final String protocol() {
    return this.protocol;
  }

  public final FingerTrieSeq<WebSocketExtension> extensions() {
    return this.extensions;
  }

  public WsEngine clientEngine(WsEngineSettings settings) {
    return WsEngine.standardClientEngine().extensions(this.extensions, settings);
  }

  public WsEngine serverEngine(WsEngineSettings settings) {
    return WsEngine.standardServerEngine().extensions(this.extensions, settings);
  }
}
