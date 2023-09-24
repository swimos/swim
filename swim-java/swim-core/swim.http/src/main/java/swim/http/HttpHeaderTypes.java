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

package swim.http;

import swim.annotations.Internal;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.header.AcceptHeader;
import swim.http.header.AllowHeader;
import swim.http.header.ConnectionHeader;
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.http.header.CookieHeader;
import swim.http.header.ExpectHeader;
import swim.http.header.HostHeader;
import swim.http.header.MaxForwardsHeader;
import swim.http.header.OriginHeader;
import swim.http.header.ServerHeader;
import swim.http.header.SetCookieHeader;
import swim.http.header.TransferEncodingHeader;
import swim.http.header.UpgradeHeader;
import swim.http.header.UserAgentHeader;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class HttpHeaderTypes implements HttpHeaderProvider, WriteSource {

  @Internal
  public HttpHeaderTypes() {
    // nop
  }

  @Override
  public void registerHeaderTypes(HttpHeaderRegistry registry) {
    registry.registerHeaderType(AcceptHeader.TYPE);
    registry.registerHeaderType(AllowHeader.TYPE);
    registry.registerHeaderType(ConnectionHeader.TYPE);
    registry.registerHeaderType(ContentLengthHeader.TYPE);
    registry.registerHeaderType(ContentTypeHeader.TYPE);
    registry.registerHeaderType(CookieHeader.TYPE);
    registry.registerHeaderType(ExpectHeader.TYPE);
    registry.registerHeaderType(HostHeader.TYPE);
    registry.registerHeaderType(MaxForwardsHeader.TYPE);
    registry.registerHeaderType(OriginHeader.TYPE);
    registry.registerHeaderType(ServerHeader.TYPE);
    registry.registerHeaderType(SetCookieHeader.TYPE);
    registry.registerHeaderType(TransferEncodingHeader.TYPE);
    registry.registerHeaderType(UpgradeHeader.TYPE);
    registry.registerHeaderType(UserAgentHeader.TYPE);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpHeaderTypes", "provider").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final HttpHeaderTypes PROVIDER = new HttpHeaderTypes();

  public static HttpHeaderTypes provider() {
    return PROVIDER;
  }

}
