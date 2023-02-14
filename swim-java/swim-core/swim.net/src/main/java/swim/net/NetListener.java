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
 * A network listener that performs asynchronous I/O operations for
 * a non-blocking NIO server socket channel.
 * <p>
 * A {@code NetListener} interfaces with an asynchronous network transport
 * via a {@link NetListenerContext}. The network transport invokes I/O
 * callbacks on the {@code NetListener} when the network channel is ready
 * to perform requested I/O operations.
 */
@Public
@Since("5.0")
public interface NetListener {

  /**
   * Returns the network transport to which this listener is bound;
   * returns {@code null} if this listener is unbound.
   */
  @Nullable NetListenerContext listenerContext();

  /**
   * Sets the network transport to which this listener is bound.
   */
  void setListenerContext(@Nullable NetListenerContext listenerContext);

  /**
   * Lifecycle callback invoked by the network transport before the network
   * listener attempts to bind to a port.
   */
  default void willListen() throws IOException {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after the network
   * listener has bound to a port.
   */
  default void didListen() throws IOException {
    // hook
  }

  /**
   * Callback invoked by the network transport when the network listener
   * is ready to perform an <em>accept</em> operation.
   */
  void doAccept() throws IOException;

  /**
   * Lifecycle callback invoked by the network transport before the network
   * listener becomes unbound.
   */
  default void willClose() throws IOException {
    // hook
  }

  /**
   * Lifecycle callback invoked by the network transport after the network
   * listener has become unbound.
   */
  default void didClose() throws IOException {
    // hook
  }

}
