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

package swim.io.warp;

import swim.io.http.HttpServerContext;
import swim.io.ws.AbstractWsServer;
import swim.io.ws.WsSettings;
import swim.io.ws.WsUpgradeResponder;
import swim.ws.WsResponse;

public abstract class AbstractWarpServer extends AbstractWsServer {
  protected WarpSettings warpSettings;

  public AbstractWarpServer(WarpSettings warpSettings) {
    this.wsSettings = warpSettings.wsSettings();
    this.warpSettings = warpSettings;
  }

  public AbstractWarpServer() {
    this.wsSettings = null;
    this.warpSettings = null;
  }

  @Override
  public void setHttpServerContext(HttpServerContext context) {
    this.context = context;
    if (this.wsSettings == null) {
      this.wsSettings = WsSettings.from(context.httpSettings());
      this.warpSettings = WarpSettings.from(this.wsSettings);
    }
  }

  public final WarpSettings warpSettings() {
    return this.warpSettings;
  }

  protected WsUpgradeResponder upgrade(WarpSocket warpSocket, WsResponse wsResponse) {
    final WarpWebSocket webSocket = new WarpWebSocket(warpSocket, this.warpSettings);
    warpSocket.setWarpSocketContext(webSocket); // eagerly set
    return new WsUpgradeResponder(webSocket, wsResponse, this.wsSettings);
  }
}
