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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.header.ConnectionHeader;
import swim.net.NetSocket;
import swim.util.Result;

@Public
@Since("5.0")
public interface HttpServer {

  @Nullable HttpServerContext serverContext();

  void setServerContext(@Nullable HttpServerContext serverContext);

  /**
   * Returns the number of idle milliseconds after which this socket should
   * be closed due to inactivity. Returns {@code -1} if a default idle timeout
   * should be used. Returns {@code 0} if the socket should not time out.
   */
  default long idleTimeout() {
    return -1;
  }

  /**
   * Lifecycle callback invoked by the network transport when the network
   * socket is connected and about to begin an opening handshake.
   */
  default void willOpen() {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after the network
   * socket has successfully connected and performed any opening handshake.
   */
  default void didOpen() {
    // hook
  }

  default void willReadRequest(HttpResponderContext handler) {
    // hook
  }

  default void willReadRequestMessage(HttpResponderContext handler) {
    // hook
  }

  default void didReadRequestMessage(Result<HttpRequest<?>> request, HttpResponderContext handler) {
    // hook
  }

  default void willReadRequestPayload(HttpRequest<?> request, HttpResponderContext handler) {
    // hook
  }

  default void didReadRequestPayload(Result<HttpRequest<?>> request, HttpResponderContext handler) {
    // hook
  }

  default void didReadRequest(Result<HttpRequest<?>> request, HttpResponderContext handler) {
    // hook
  }

  default void willWriteResponse(HttpResponderContext handler) {
    // hook
  }

  default void willWriteResponseMessage(HttpResponderContext handler) {
    // hook
  }

  default void didWriteResponseMessage(Result<HttpResponse<?>> response, HttpResponderContext handler) {
    // hook
  }

  default void willWriteResponsePayload(HttpResponse<?> response, HttpResponderContext handler) {
    // hook
  }

  default void didWriteResponsePayload(Result<HttpResponse<?>> response, HttpResponderContext handler) {
    // hook
  }

  default void didWriteResponse(Result<HttpResponse<?>> response, HttpResponderContext handler) {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport before it
   * {@link NetSocketContext#become(NetSocket) becomes} a new
   * {@code socket} implementation.
   */
  default void willBecome(NetSocket socket) {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after it has
   * {@link NetSocketContext#become(NetSocket) become} a new
   * {@code socket} implementation.
   */
  default void didBecome(NetSocket socket) {
    // hook
  }

  /**
   * Callback invoked by the network transport when the socket has timed out
   * due to inactivity. The default implementation attempts to complete any
   * stalled requests with an error response before closing the connection.
   */
  default void doTimeout(@Nullable HttpResponderContext handler) {
    final HttpServerContext context = this.serverContext();
    if (context == null) {
      return;
    }
    if (handler == null) {
      // No active requests; close the idle connection.
      context.close();
      return;
    }

    final HttpResponse<?> response;
    if (!handler.isDoneReading()) {
      // Stalled request; try to respond with 408 Request Timeout.
      response = HttpResponse.of(HttpStatus.REQUEST_TIMEOUT,
                                 ConnectionHeader.CLOSE);
    } else {
      // Stalled response; try to respond with 503 Service Unavailable.
      response = HttpResponse.of(HttpStatus.SERVICE_UNAVAILABLE,
                                 ConnectionHeader.CLOSE);
    }
    if (handler.writeResponse(response)) {
      // Successfully enqueued the error response; don't close the socket.
      // Another timeout will eventually trigger if the error response is
      // unable to be transmitted.
    } else {
      // A response was already underway; close the apparently dead connection.
      context.close();
    }
  }

  /**
   * Lifecycle callback invoked by the network transport prior to closing
   * the socket.
   */
  default void willClose() {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after the network
   * socket fully closes.
   */
  default void didClose() {
    // hook
  }

}
