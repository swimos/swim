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

import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.ConnectionContext;
import swim.net.NetSocket;
import swim.util.Result;

@Public
@Since("5.0")
public interface HttpResponderContext extends ConnectionContext {

  HttpResponder responder();

  HttpServerContext serverContext();

  HttpOptions options();

  boolean isOpening();

  boolean isReading();

  boolean isDoneReading();

  boolean readRequest();

  Result<HttpRequest<?>> requestResult();

  boolean isWriting();

  boolean isDoneWriting();

  boolean writeResponse(HttpResponse<?> response);

  Result<HttpResponse<?>> responseResult();

  void become(HttpResponder responder);

  /**
   * Rebinds the network connection to use a new {@code socket} handler.
   */
  void become(NetSocket socket);

  /**
   * Closes the network socket.
   */
  void close();

}
