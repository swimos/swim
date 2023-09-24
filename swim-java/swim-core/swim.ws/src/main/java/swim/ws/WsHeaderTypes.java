// Copyright 2015-2022 Swim.inc
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

import swim.annotations.Internal;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpHeaderProvider;
import swim.http.HttpHeaderRegistry;
import swim.util.Notation;
import swim.util.WriteSource;
import swim.ws.header.SecWebSocketAcceptHeader;
import swim.ws.header.SecWebSocketExtensionsHeader;
import swim.ws.header.SecWebSocketKeyHeader;
import swim.ws.header.SecWebSocketProtocolHeader;
import swim.ws.header.SecWebSocketVersionHeader;

@Public
@Since("5.0")
public final class WsHeaderTypes implements HttpHeaderProvider, WriteSource {

  @Internal
  public WsHeaderTypes() {
    // nop
  }

  @Override
  public void registerHeaderTypes(HttpHeaderRegistry registry) {
    registry.registerHeaderType(SecWebSocketAcceptHeader.TYPE);
    registry.registerHeaderType(SecWebSocketExtensionsHeader.TYPE);
    registry.registerHeaderType(SecWebSocketKeyHeader.TYPE);
    registry.registerHeaderType(SecWebSocketProtocolHeader.TYPE);
    registry.registerHeaderType(SecWebSocketVersionHeader.TYPE);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsHeaderTypes", "provider").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WsHeaderTypes PROVIDER = new WsHeaderTypes();

  public static WsHeaderTypes provider() {
    return PROVIDER;
  }

}
