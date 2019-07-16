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

/**
 * Network socket binding that handles asynchronous I/O operations for a
 * non-blocking NIO network channel.
 *
 * An {@code IpSocket} interfaces with the underlying asynchronous networking
 * system via an {@link IpSocketContext}.  The socket context invokes I/O
 * callbacks on the {@code IpSocket} when the underlying network socket is
 * ready to perform I/O operations permitted by the socket context's {@link
 * FlowControl}.
 */
public interface IpSocket {
  /**
   * Returns the network socket context to which this {@code IpSocket} is
   * bound; returns {@code null} if this {@code IpSocket} is unbound.
   */
  IpSocketContext ipSocketContext();

  /**
   * Sets the network socket context to which this {@code IpSocket} is bound.
   */
  void setIpSocketContext(IpSocketContext context);

  /**
   * Returns the number of idle milliseconds after which this {@code IpSocket}
   * should be closed due to inactivity.  Returns {@code -1} if a default idle
   * timeout should be used.  Returns {@code 0} if the underlying network
   * socket should not time out.
   */
  long idleTimeout();

  /**
   * I/O callback invoked by the socket context asking this {@code IpSocket}
   * to read input data out of the socket context's {@link
   * IpSocketContext#inputBuffer() inputBuffer}.  May be invoked concurrently
   * to other I/O callbacks, but never concurrently with other {@code doRead}
   * calls.
   */
  void doRead();

  /**
   * I/O callback invoked by the socket context asking this {@code IpSocket}
   * to write output data into the socket context's {@link
   * IpSocketContext#outputBuffer() outputBuffer}.  May be invoked concurrently
   * to other I/O callbacks, but never concurrently with other {@code doWrite}
   * or {@code didWrite} calls.
   */
  void doWrite();

  /**
   * I/O callback invoked by the socket context after the underlying network
   * socket has completed writing all data in its {@code outputBuffer}.  May be
   * invoked concurrently to other I/O callbacks, but never concurrently with
   * other {@code doWrite} or {@code didWrite} calls.
   */
  void didWrite();

  /**
   * Lifecycle callback invoked by the socket context before the underlying
   * network socket attempts to open a connection.
   */
  void willConnect();

  /**
   * Lifecycle callback invoked by the socket context after the underlying
   * network socket has opened a connection.
   */
  void didConnect();

  /**
   * Lifecycle callback invoked by the socket context before the underlying
   * network socket establishes a secure connection.
   */
  void willSecure();

  /**
   * Lifecycle callback invoked by the socket context after the underlying
   * network socket has established a secure connection.
   */
  void didSecure();

  /**
   * Lifecycle callback invoked by the socket context before it has {@link
   * IpSocketContext#become(IpSocket) become} a new {@code socket}
   * implementation.
   */
  void willBecome(IpSocket socket);

  /**
   * Lifecycle callback invoked by the socket context after it has {@link
   * IpSocketContext#become(IpSocket) become} a new {@code socket}
   * implementation.
   */
  void didBecome(IpSocket socket);

  /**
   * Lifecycle callback invoked by the socket context after the underlying
   * network connection has timed out.  The socket will automatically be closed.
   */
  void didTimeout();

  /**
   * Lifecycle callback invoked by the socket context after the underlying
   * network connection has disconnected.
   */
  void didDisconnect();

  /**
   * Lifecycle callback invoked by the socket context when the underlying
   * network socket fails by throwing an {@code error}.  The socket will
   * automatically be closed.
   */
  void didFail(Throwable error);
}
