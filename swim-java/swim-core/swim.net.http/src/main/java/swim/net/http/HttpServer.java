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
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.NetSocket;

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

  default void willReadRequest(HttpResponder responder) {
    // hook
  }

  default void willReadRequestMessage(HttpResponder responder) {
    // hook
  }

  default void didReadRequestMessage(HttpRequest<?> request, HttpResponder responder) {
    // hook
  }

  default void willReadRequestPayload(HttpRequest<?> request, HttpResponder responder) {
    // hook
  }

  default void didReadRequestPayload(HttpRequest<?> request, HttpResponder responder) {
    // hook
  }

  default void didReadRequest(HttpRequest<?> request, HttpResponder responder) {
    // hook
  }

  default void willWriteResponse(HttpRequest<?> request, HttpResponder responder) {
    // hook
  }

  default void willWriteResponseMessage(HttpRequest<?> request, HttpResponder responder) {
    // hook
  }

  default void didWriteResponseMessage(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    // hook
  }

  default void willWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    // hook
  }

  default void didWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    // hook
  }

  default void didWriteResponse(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
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
   * due to inactivity. No default action is taken by the network transport
   * other than to inform the socket of the timeout.
   */
  default void doTimeout() {
    // hook
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
