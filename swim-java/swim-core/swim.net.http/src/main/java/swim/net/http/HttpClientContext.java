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

package swim.net.http;

import java.net.InetSocketAddress;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public interface HttpClientContext extends HttpSocketContext {

  /**
   * Returns the bound HTTP client.
   */
  HttpClient client();

  boolean connect(InetSocketAddress remoteAddress);

  default boolean connect(String address, int port) {
    return this.connect(new InetSocketAddress(address, port));
  }

  /**
   * Returns {@code true} if the network channel is currently in the process
   * of establishing a connection, otherwise returns {@code false}.
   */
  boolean isConnecting();

  /**
   * Returns {@code true} if the network channel is currently performing
   * an opening handshake.
   */
  boolean isOpening();

  /**
   * Returns {@code true} if the request queue is non-empty.
   */
  boolean isRequesting();

  /**
   * Returns {@code true} if the response queue is non-empty.
   */
  boolean isResponding();

  boolean enqueueRequester(HttpRequester requester);

}
