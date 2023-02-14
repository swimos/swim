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

import java.net.InetSocketAddress;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.exec.Scheduler;

/**
 * An external handle to a {@link NetListener}.
 */
@Public
@Since("5.0")
public interface NetListenerRef {

  /**
   * Returns the bound network listener.
   */
  NetListener listener();

  /**
   * Returns the execution context in which to run I/O tasks.
   */
  @Nullable Scheduler scheduler();

  /**
   * Sets the execution context in which to run I/O tasks.
   */
  void setScheduler(@Nullable Scheduler scheduler);

  /**
   * Returns the IP address and port to which the network listener is bound;
   * returns {@code null} if the network listener is not currently bound.
   */
  @Nullable InetSocketAddress localAddress();

  boolean listen(InetSocketAddress localAddress);

  default boolean listen(String address, int port) {
    return this.listen(new InetSocketAddress(address, port));
  }

  /**
   * Unbinds the network listener.
   */
  void close();

}
