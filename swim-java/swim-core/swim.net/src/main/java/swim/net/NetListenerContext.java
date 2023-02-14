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

package swim.net;

import java.io.IOException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A network listener context that manages asynchronous I/O operations for
 * a non-blocking NIO server socket channel. A {@code NetListenerContext}
 * is implicitly bound to a {@link NetListener}, providing the listener
 * with the ability to unbind the network listener.
 */
@Public
@Since("5.0")
public interface NetListenerContext extends NetListenerRef {

  /**
   * Requests that the I/O dispatcher invoke {@link NetListener#doAccept()}
   * once the network channel is ready to perform an accept operation. Returns
   * {@code true} if this call causes the registration of the readiness event;
   * otherwise returns {@code false} if the event is already pending.
   */
  boolean requestAccept();

  /**
   * Attempts to cancel a pending accept event requested via {@link
   * #requestAccept()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  boolean cancelAccept();

  /**
   * Accepts a connection made to the network listener, and binds the given
   * network {@code socket} to a connected I/O transport. Returns a reference
   * to the bound transport, or {@code null} if the network listener was
   * unable to accept a new connection.
   */
  @Nullable NetSocketRef accept(NetSocket socket) throws IOException;

}
