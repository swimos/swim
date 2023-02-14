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

package swim.http;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.header.HttpAcceptHeader;
import swim.http.header.HttpAllowHeader;
import swim.http.header.HttpConnectionHeader;
import swim.http.header.HttpContentLengthHeader;
import swim.http.header.HttpContentTypeHeader;
import swim.http.header.HttpCookieHeader;
import swim.http.header.HttpExpectHeader;
import swim.http.header.HttpHostHeader;
import swim.http.header.HttpMaxForwardsHeader;
import swim.http.header.HttpOriginHeader;
import swim.http.header.HttpServerHeader;
import swim.http.header.HttpSetCookieHeader;
import swim.http.header.HttpTransferEncodingHeader;
import swim.http.header.HttpUpgradeHeader;
import swim.http.header.HttpUserAgentHeader;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpHeaderTypes implements HttpHeaderProvider, ToSource {

  private HttpHeaderTypes() {
    // nop
  }

  @Override
  public void registerHeaderTypes(HttpHeaderRegistry registry) {
    registry.registerHeaderType(HttpAcceptHeader.TYPE);
    registry.registerHeaderType(HttpAllowHeader.TYPE);
    registry.registerHeaderType(HttpConnectionHeader.TYPE);
    registry.registerHeaderType(HttpContentLengthHeader.TYPE);
    registry.registerHeaderType(HttpContentTypeHeader.TYPE);
    registry.registerHeaderType(HttpCookieHeader.TYPE);
    registry.registerHeaderType(HttpExpectHeader.TYPE);
    registry.registerHeaderType(HttpHostHeader.TYPE);
    registry.registerHeaderType(HttpMaxForwardsHeader.TYPE);
    registry.registerHeaderType(HttpOriginHeader.TYPE);
    registry.registerHeaderType(HttpServerHeader.TYPE);
    registry.registerHeaderType(HttpSetCookieHeader.TYPE);
    registry.registerHeaderType(HttpTransferEncodingHeader.TYPE);
    registry.registerHeaderType(HttpUpgradeHeader.TYPE);
    registry.registerHeaderType(HttpUserAgentHeader.TYPE);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpHeaderTypes", "provider").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static HttpHeaderTypes PROVIDER = new HttpHeaderTypes();

  public static HttpHeaderTypes provider() {
    return PROVIDER;
  }

}
