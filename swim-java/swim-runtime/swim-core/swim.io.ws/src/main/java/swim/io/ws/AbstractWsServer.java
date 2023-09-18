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

package swim.io.ws;

import swim.io.http.AbstractHttpServer;
import swim.io.http.HttpServerContext;
import swim.ws.WsResponse;

public abstract class AbstractWsServer extends AbstractHttpServer {

  protected WsSettings wsSettings;

  public AbstractWsServer(WsSettings wsSettings) {
    this.wsSettings = wsSettings;
  }

  public AbstractWsServer() {
    this(null);
  }

  @Override
  public void setHttpServerContext(HttpServerContext context) {
    this.context = context;
    if (this.wsSettings == null) {
      this.wsSettings = WsSettings.create(context.httpSettings());
    }
  }

  public final WsSettings wsSettings() {
    return this.wsSettings;
  }

  protected WsUpgradeResponder upgrade(WebSocket<?, ?> webSocket, WsResponse wsResponse) {
    return new WsUpgradeResponder(webSocket, wsResponse, this.wsSettings);
  }

}
