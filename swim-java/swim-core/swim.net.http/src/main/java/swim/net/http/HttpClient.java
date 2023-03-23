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
import swim.http.HttpException;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.NetSocket;
import swim.util.Result;

@Public
@Since("5.0")
public interface HttpClient {

  @Nullable HttpClientContext clientContext();

  void setClientContext(@Nullable HttpClientContext clientContext);

  /**
   * Returns the number of idle milliseconds after which this socket should
   * be closed due to inactivity. Returns {@code -1} if a default idle timeout
   * should be used. Returns {@code 0} if the socket should not time out.
   */
  default long idleTimeout() {
    return -1;
  }

  /**
   * Lifecycle callback invoked by the network transport before the network
   * socket attempts to open a connection.
   */
  default void willConnect() {
    // hook
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

  default void willWriteRequest(HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void willWriteRequestMessage(HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void didWriteRequestMessage(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void willWriteRequestPayload(HttpRequest<?> request, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void didWriteRequestPayload(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void didWriteRequest(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void willReadResponse(HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void willReadResponseMessage(HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void didReadResponseMessage(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void willReadResponsePayload(HttpResponse<?> response, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void didReadResponsePayload(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) throws HttpException {
    // hook
  }

  default void didReadResponse(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) throws HttpException {
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
   * due to inactivity. The default implementation closes the socket.
   */
  default void doTimeout(@Nullable HttpRequesterContext handler) {
    final HttpClientContext context = this.clientContext();
    if (context != null) {
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
