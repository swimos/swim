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

package swim.net;

import java.io.IOException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A network socket handler that performs asynchronous I/O operations
 * for a non-blocking NIO socket channel.
 * <p>
 * A {@code NetSocket} interfaces with an asynchronous network transport
 * via a {@link NetSocketContext}. The network transport invokes I/O
 * callbacks on the {@code NetSocket} when the network channel is ready
 * to perform requested I/O operations.
 */
@Public
@Since("5.0")
public interface NetSocket {

  /**
   * Returns the network transport to which this socket is bound;
   * returns {@code null} if this socket is unbound.
   */
  @Nullable NetSocketContext socketContext();

  /**
   * Sets the network transport to which this socket is bound.
   */
  void setSocketContext(@Nullable NetSocketContext socketContext);

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
  default void willConnect() throws IOException {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport when the network
   * socket is connected and about to begin an opening handshake.
   */
  default void willOpen() throws IOException {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after the network
   * socket has successfully connected and performed any opening handshake.
   */
  default void didOpen() throws IOException {
    // hook
  }

  /**
   * Callback invoked by the network transport when the socket channel is
   * ready to perform a <em>read</em> operation.
   */
  void doRead() throws IOException;

  /**
   * Callback invoked by the network transport when the socket channel is
   * ready to perform a <em>write</em> operation.
   */
  void doWrite() throws IOException;

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
  default void doTimeout() throws IOException {
    final NetSocketContext context = this.socketContext();
    if (context != null) {
      context.close();
    }
  }

  /**
   * Lifecycle callback invoked by the network transport prior to closing
   * the socket.
   */
  default void willClose() throws IOException {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after the network
   * socket fully closes.
   */
  default void didClose() throws IOException {
    // hook
  }

}
