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

package swim.io.http;

import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpSocket;

public interface HttpClient {

  HttpClientContext httpClientContext();

  void setHttpClientContext(HttpClientContext context);

  long idleTimeout();

  void willRequest(HttpRequest<?> request);

  void didRequest(HttpRequest<?> request);

  void willRespond(HttpResponse<?> response);

  void didRespond(HttpResponse<?> response);

  void willConnect();

  void didConnect();

  void willSecure();

  void didSecure();

  void willBecome(IpSocket socket);

  void didBecome(IpSocket socket);

  void didTimeout();

  void didDisconnect();

  void didFail(Throwable error);

}
