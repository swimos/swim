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

package swim.io;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SelectableChannel;

/**
 * I/O transport binding that handles asynchronous I/O operations for a
 * non-blocking NIO channel.  A {@code Transport} provides a selectable {@link
 * #channel()} on which to perform asynchronous I/O operations, along with an
 * {@link #readBuffer()} into which input data will be read, and an {@link
 * #writeBuffer()} from which data will be written.
 *
 * A {@code Transport} interfaces with the underlying asynchronous I/O system
 * via a {@link TransportContext}.  The transport context invokes I/O callbacks
 * on the {@code Transport} when the underlying NIO channel is ready to perform
 * I/O operations permitted by the transport context's {@link FlowControl}.
 */
public interface Transport {
  /**
   * Returns the I/O transport context to which this {@code Transport} is bound;
   * returns {@code null} if this {@code Transport} is unbound.
   */
  TransportContext transportContext();

  /**
   * Sets the I/O transport context to which this {@code Transport} is bound.
   */
  void setTransportContext(TransportContext context);

  /**
   * Returns the NIO channel that this {@code Transport} manages.
   */
  SelectableChannel channel();

  /**
   * Returns the buffer into which input data should be read by the underlying
   * I/O transport.
   */
  ByteBuffer readBuffer();

  /**
   * Returns the buffer from which output data should be written by the
   * underlying I/O transport.
   */
  ByteBuffer writeBuffer();

  /**
   * Returns the number of idle milliseconds after which this {@code Transport}
   * should be closed due to inactivity.  Returns {@code -1} if a default idle
   * timeout should be used.  Returns {@code 0} if the underlying I/O transport
   * should not time out.
   */
  long idleTimeout();

  /**
   * I/O callback invoked by the transport context when the underlying
   * transport is ready to complete an <em>accept</em> operation.
   */
  void doAccept() throws IOException;

  /**
   * I/O callback invoked by the transport context when the underlying
   * transport is ready to complete a <em>connect</em> operation.
   */
  void doConnect() throws IOException;

  /**
   * I/O callback invoked by the transport context asking this {@code Transport}
   * to read input data out of the {@code readBuffer}, thereby completing a
   * <em>read</em> operation from the underlying I/O transport.  May be invoked
   * concurrently to other I/O callbacks, but never concurrently with other
   * {@code doRead} calls.
   */
  void doRead();

  /**
   * I/O callback invoked by the transport context asking this {@code Transport}
   * to write output data into the {@code writeBuffer}, thereby initiating a
   * <em>write</em> operation to the underlying I/O transport.  May be invoked
   * concurrently to other I/O callbacks, but never concurrently with other
   * {@code doWrite} or {@code didWrite} calls.
   */
  void doWrite();

  /**
   * I/O callback invoked by the transport context after the underlying
   * transport has completed writing all data in its {@code writeBuffer},
   * thereby completing the current <em>write</em> operation.  May be invoked
   * concurrently to other I/O callbacks, but never concurrently with other
   * {@code doWrite} or {@code didWrite} calls.
   */
  void didWrite();

  /**
   * Lifecycle callback invoked by the transport context after the underlying
   * transport has timed out.  The transport will automatically be closed.
   */
  void didTimeout();

  /**
   * Lifecycle callback invoked by the transport context after the underlying
   * transport has closed.
   */
  void didClose();

  /**
   * Lifecycle callback invoked by the transport context when the underlying
   * transport fails by throwing an {@code error}.  The transport will
   * automatically be closed.
   */
  void didFail(Throwable error);
}
