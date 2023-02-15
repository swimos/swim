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

package swim.net.http;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.net.ConnectionContext;
import swim.net.NetSocket;

@Public
@Since("5.0")
public interface HttpServerContext extends ConnectionContext {

  /**
   * Returns the bound HTTP server.
   */
  HttpServer server();

  HttpOptions httpOptions();

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

  boolean enqueueRequester(HttpResponder responder);

  /**
   * Rebinds the network connection to use a new {@code socket} handler.
   */
  void become(NetSocket socket);

  boolean isDoneReading();

  boolean doneReading();

  boolean isDoneWriting();

  boolean doneWriting();

  /**
   * Closes the network socket.
   */
  void close();

}
