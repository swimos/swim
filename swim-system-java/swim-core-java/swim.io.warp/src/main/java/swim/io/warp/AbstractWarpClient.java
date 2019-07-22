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

import swim.codec.Decoder;
import swim.io.http.HttpClientContext;
import swim.io.ws.AbstractWsClient;
import swim.io.ws.WebSocketContext;
import swim.io.ws.WsSettings;
import swim.io.ws.WsUpgradeRequester;
import swim.warp.Envelope;
import swim.warp.WarpException;
import swim.ws.WsControl;
import swim.ws.WsData;
import swim.ws.WsRequest;

public abstract class AbstractWarpClient extends AbstractWsClient implements WebSocketContext<Envelope, Envelope> {
  protected WarpSettings warpSettings;

  public AbstractWarpClient(WarpSettings warpSettings) {
    this.wsSettings = warpSettings.wsSettings();
    this.warpSettings = warpSettings;
  }

  public AbstractWarpClient() {
    this.wsSettings = null;
    this.warpSettings = null;
  }

  @Override
  public void setHttpClientContext(HttpClientContext context) {
    this.context = context;
    if (this.wsSettings == null) {
      this.wsSettings = WsSettings.from(context.httpSettings());
      this.warpSettings = WarpSettings.from(this.wsSettings);
    }
  }

  @Override
  public <I2 extends Envelope> void read(Decoder<I2> content) {
    throw new WarpException("unupgraded websocket");
  }

  @Override
  public <O2 extends Envelope> void write(WsData<O2> frame) {
    throw new WarpException("unupgraded websocket");
  }

  @Override
  public <O2 extends Envelope> void write(WsControl<?, O2> frame) {
    throw new WarpException("unupgraded websocket");
  }

  public final WarpSettings warpSettings() {
    return this.warpSettings;
  }

  protected WsUpgradeRequester upgrade(WarpSocket warpSocket, WsRequest wsRequest) {
    final WarpWebSocket webSocket = new WarpWebSocket(warpSocket, this.warpSettings);
    warpSocket.setWarpSocketContext(webSocket); // eagerly set
    return new WsUpgradeRequester(webSocket, wsRequest, this.wsSettings);
  }
}
