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
import java.nio.ByteBuffer;
import javax.net.ssl.SSLParameters;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Network socket context that manages asynchronous I/O operations for a
 * non-blocking NIO network channel. A {@code NetSocketContext} is implicitly
 * bound to a {@link NetSocket}, providing the {@code NetSocket} with the
 * ability to modify its flow control state, access its read and write
 * buffers, to {@link #become(NetSocket) become} a different kind of
 * {@code NetSocket}, and to close the socket.
 */
@Public
@Since("5.0")
public interface NetSocketContext extends NetSocketRef, FlowContext {

  /**
   * Returns the SSL parameters used to secure this socket;
   * returns {@code null} if this is not a secure socket.
   */
  @Nullable SSLParameters sslParameters();

  /**
   * Sets the SSL parameters to use to secure this socket.
   *
   * @throws UnsupportedOperationException if this is not a secure transport.
   */
  void setSslParameters(SSLParameters sslParameters);

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
   * Rebinds this {@code NetSocketContext} to a new {@code socket}
   * implementation, thereby changing the {@code NetSocket} handler that
   * receives network I/O callbacks.
   */
  void become(NetSocket socket);

  /**
   * Requests that the I/O dispatcher invoke {@link NetSocket#doRead()}
   * once the network channel is ready to perform a read operation.
   * Returns {@code true} if this call causes the registration of the readiness
   * event; otherwise returns {@code false} if the event is already pending.
   */
  @Override
  boolean requestRead();

  /**
   * Attempts to cancel a pending read event requested via {@link
   * #requestRead()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  @Override
  boolean cancelRead();

  /**
   * Reads a sequence of bytes from the network channel into the given
   * {@code readBuffer}, without blocking. Returns the number of bytes read,
   * possibly zero, or {@code -1} if the channel has reached its end-of-stream.
   */
  int read(ByteBuffer readBuffer) throws IOException;

  /**
   * Requests that the I/O dispatcher invoke {@link NetSocket#doWrite()}
   * once the network channel is ready to perform a write operation.
   * Returns {@code true} if this call causes the registration of the readiness
   * event; otherwise returns {@code false} if the event is already pending.
   */
  @Override
  boolean requestWrite();

  /**
   * Attempts to cancel a pending write event requested via {@link
   * #requestWrite()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  @Override
  boolean cancelWrite();

  /**
   * Writes a sequence of bytes to the network channel from the given
   * {@code writeBuffer}, without blocking. Returns the number of bytes
   * written, possibly zero.
   */
  int write(ByteBuffer writeBuffer) throws IOException;

  /**
   * Returns {@code true} if this socket is done reading application data;
   * otherwise returns {@code false} if the socket is still open for reading.
   */
  @Override
  boolean isDoneReading();

  /**
   * Closes the network connection for reading. No further callbacks to {@link
   * NetSocket#doRead()} will be made. The socket will automatically be
   * disconnected once both {@code doneReading} and {@link #doneWriting()
   * doneWriting} have been called. Returns {@code true} if this call causes
   * the socket to close for reading; otherwise returns {@code false} if the
   * socket has already been closed for reading, or has not yet been connected.
   */
  @Override
  boolean doneReading();

  /**
   * Returns {@code true} if this socket is done writing application data;
   * otherwise returns {@code false} if the socket is still open for writing.
   */
  @Override
  boolean isDoneWriting();

  /**
   * Closes the network connection for writing. No further callbacks to {@link
   * NetSocket#doWrite()} will be made. The socket will automatically be
   * disconnected once both {@link #doneReading() doneReading} and {@code
   * doneWriting} have been called. Returns {@code true} if this call causes
   * the socket to close for writing; otherwise returns {@code false} if the
   * socket has already been closed for writing, or has not yet been connected.
   */
  @Override
  boolean doneWriting();

}
