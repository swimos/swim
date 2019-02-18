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
 * Network service listener that handles asynchronous I/O operations for a
 * non-blocking NIO server socket channel.
 *
 * A {@code Service} interfaces with the underlying asynchronous networking
 * system via a {@link ServiceContext}.  The service context invokes I/O
 * callbacks on the {@code Service} when the underlying server socket is ready
 * to perform I/O operations permitted by the service context's {@link
 * FlowControl}.
 */
public interface Service {
  /**
   * Returns the network listener context to which this {@code Service} is bound;
   * returns {@code null} if this {@code Service} is unbound.
   */
  ServiceContext serviceContext();

  /**
   * Sets the network listener context to which this {@code Service} is bound.
   */
  void setServiceContext(ServiceContext context);

  /**
   * Returns a new {@code Socket} binding to handle an incoming network
   * connection.
   */
  Socket createSocket();

  /**
   * Lifecycle callback invoked by the service context after the underlying
   * network listener has bound to a port.
   */
  void didBind();

  /**
   * Lifecycle callback invoked by the service context after the underlying
   * network listener has accepted a new {@code socket} connection.
   */
  void didAccept(Socket socket);

  /**
   * Lifecycle callback invoked by the service context after the underlying
   * network listener has been unbound.
   */
  void didUnbind();

  /**
   * Lifecycle callback invoked by the service context when the underlying
   * network listener fails by throwing an {@code error}.  The listener will
   * automatically be closed.
   */
  void didFail(Throwable error);
}
