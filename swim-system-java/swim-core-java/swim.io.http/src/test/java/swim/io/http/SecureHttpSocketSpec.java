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

package swim.io.http;

import swim.io.IpServiceRef;
import swim.io.IpSocketRef;

public class SecureHttpSocketSpec extends HttpSocketBehaviors {
  final HttpSettings httpSettings = TestTlsSettings.httpSettings();

  @Override
  protected IpServiceRef bind(HttpEndpoint endpoint, HttpService service) {
    return endpoint.bindHttps("127.0.0.1", 33555, service, this.httpSettings);
  }

  @Override
  protected IpSocketRef connect(HttpEndpoint endpoint, HttpClient client) {
    return endpoint.connectHttps("127.0.0.1", 33555, client, this.httpSettings);
  }
}
