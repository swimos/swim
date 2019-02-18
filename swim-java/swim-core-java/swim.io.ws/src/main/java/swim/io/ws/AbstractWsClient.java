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

package swim.io.ws;

import swim.io.http.AbstractHttpClient;
import swim.io.http.HttpClientContext;
import swim.ws.WsRequest;

public abstract class AbstractWsClient extends AbstractHttpClient {
  protected WsSettings wsSettings;

  public AbstractWsClient(WsSettings wsSettings) {
    this.wsSettings = wsSettings;
  }

  public AbstractWsClient() {
    this(null);
  }

  @Override
  public void setHttpClientContext(HttpClientContext context) {
    this.context = context;
    if (this.wsSettings == null) {
      this.wsSettings = WsSettings.from(context.httpSettings());
    }
  }

  public final WsSettings wsSettings() {
    return this.wsSettings;
  }

  protected WsUpgradeRequester upgrade(WebSocket<?, ?> webSocket, WsRequest wsRequest) {
    return new WsUpgradeRequester(webSocket, wsRequest, this.wsSettings);
  }
}
