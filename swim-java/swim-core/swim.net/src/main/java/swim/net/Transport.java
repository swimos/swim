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

import java.nio.channels.SelectableChannel;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A non-blocking I/O handler that is scheduled for execution by a
 * {@link TransportDispatcher} when requested I/O operations are
 * ready to be performed by the underlying operating system.
 *
 * <h2>Scheduling</h2>
 * <p>
 * {@link TransportDispatcher#bindTransport(Transport)} binds a transport to
 * an I/O dispatcher. Once a transport is bound to a scheduler, I/O scheduling
 * can be requested by invoking methods on the {@link TransportContext}
 * assigned to the transport by the scheduler. The I/O dispatcher invokes
 * specific callbacks on {@code Transport} instances when a transport's
 * {@link #channel()} is ready to perform the associated I/O operations.
 *
 * <h2>Read scheduling</h2>
 * <p>
 * When a transport is ready to perform a read operation, it invokes
 * {@link TransportContext#requestRead()}. Once the transport channel
 * is ready to read, the scheduler invokes {@link #dispatchRead()}.
 * If the transport wishes to cancel a pending read request,
 * it can invoke {@link TransportContext#cancelRead()}.
 * <p>
 * The I/O dispatcher will invoke {@link #dispatchRead()} exactly once for
 * each time {@link TransportContext#requestRead} returns {@code true}, minus
 * the number of times {@link TransportContext#cancelRead()} returns {@code
 * true}, until I/O scheduling is {@linkplain TransportRef#cancel() cancelled}.
 *
 * <h2>Write scheduling</h2>
 * <p>
 * When a transport is ready to perform a write operation, it invokes
 * {@link TransportContext#requestWrite()}. Once the transport channel
 * is ready to write, the scheduler invokes {@link #dispatchWrite()}.
 * If the transport wishes to cancel a pending write request,
 * it can invoke {@link TransportContext#cancelWrite()}.
 * <p>
 * The I/O dispatcher will invoke {@link #dispatchWrite()} exactly once for
 * each time {@link TransportContext#requestWrite} returns {@code true}, minus
 * the number of times {@link TransportContext#cancelWrite()} returns {@code
 * true}, until I/O scheduling is {@linkplain TransportRef#cancel() cancelled}.
 *
 * <h2>Connect scheduling</h2>
 * <p>
 * When a transport is ready to finish opening an outgoing connection,
 * it invokes {@link TransportContext#requestConnect()}. Once the transport
 * channel has established a connection, the scheduler invokes
 * {@link #dispatchConnect()}. If the transport wishes to cancel a pending
 * connect request, it can invoke {@link TransportContext#cancelConnect()}.
 * <p>
 * The I/O dispatcher will invoke {@link #dispatchConnect()} exactly once for
 * each time {@link TransportContext#requestRead} returns {@code true}, minus
 * the number of times {@link TransportContext#cancelConnect()} returns {@code
 * true}, until I/O scheduling is {@linkplain TransportRef#cancel() cancelled}.
 *
 * <h2>Accept scheduling</h2>
 * <p>
 * When a transport is ready to accept a new incoming connection, it invokes
 * {@link TransportContext#requestAccept()}. Once the transport channel has
 * accepted a connection, the scheduler invokes {@link #dispatchAccept()}.
 * If the transport wishes to cancel a pending accept request,
 * it can invoke {@link TransportContext#cancelAccept()}.
 * <p>
 * The I/O dispatcher will invoke {@link #dispatchAccept()} exactly once for
 * each time {@link TransportContext#requestAccept} returns {@code true}, minus
 * the number of times {@link TransportContext#cancelAccept()} returns {@code
 * true}, until I/O scheduling is {@linkplain TransportRef#cancel() cancelled}.
 *
 * <h2>Blocking</h2>
 * <p>
 * Transport callbacks must <strong>never</strong> block their calling thread.
 * I/O callbacks may be invoked by performance and latency sensitive polling
 * loops. The actual work of performing I/O operations should be delegated to
 * {@linkplain swim.exec.Task asynchronous tasks}.
 */
@Public
@Since("5.0")
public interface Transport {

  /**
   * Returns the I/O transport context to which this transport is bound;
   * returns {@code null} if this transport is unbound.
   */
  @Nullable TransportContext transportContext();

  /**
   * Returns the I/O transport context to which this transport is bound.
   *
   * @throws IllegalStateException if this transport is unbound.
   */
  TransportContext getTransportContext();

  /**
   * Sets the I/O transport context to which this transport is bound.
   */
  void setTransportContext(@Nullable TransportContext context);

  /**
   * Returns the NIO channel whose I/O events this transport manages.
   */
  SelectableChannel channel();

  /**
   * Returns the number of idle milliseconds after which this transport should
   * be closed due to inactivity. Returns {@code -1} if a default idle timeout
   * should be used. Returns {@code 0} if the I/O transport should not time out.
   */
  long idleTimeout();

  /**
   * Callback invoked by the I/O dispatcher when the transport channel is ready
   * to perform an <em>accept</em> operation.
   */
  void dispatchAccept();

  /**
   * Callback invoked by the I/O dispatcher when the transport channel is ready
   * to complete a <em>connect</em> operation.
   */
  void dispatchConnect();

  /**
   * Callback invoked by the I/O dispatcher when the transport channel is ready
   * to perform a <em>read</em> operation.
   */
  void dispatchRead();

  /**
   * Callback invoked by the I/O dispatcher when the transport channel is ready
   * to perform a <em>write</em> operation.
   */
  void dispatchWrite();

  /**
   * Callback invoked by the I/O dispatcher when the transport has timed out
   * due to inactivity. No automated action is taken by the I/O dispatcher
   * other than to inform the transport of the timeout.
   */
  void dispatchTimeout();

  /**
   * Callback invoked by the I/O dispatcher when the scheduler has initiated
   * cancellation of I/O scheduling for the transport. No further I/O callbacks
   * will be invoked by the scheduler.
   */
  void dispatchClose();

}
