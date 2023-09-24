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

import java.net.InetSocketAddress;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.exec.Scheduler;

/**
 * An external handle to a {@link NetSocket}.
 */
@Public
@Since("5.0")
public interface NetSocketRef extends ConnectionContext {

  /**
   * Returns the bound network socket.
   */
  NetSocket socket();

  /**
   * Returns the execution context in which to run I/O tasks.
   */
  @Nullable Scheduler scheduler();

  /**
   * Sets the execution context in which to run I/O tasks.
   */
  void setScheduler(@Nullable Scheduler scheduler);

  boolean connect(InetSocketAddress remoteAddress);

  default boolean connect(String address, int port) {
    return this.connect(new InetSocketAddress(address, port));
  }

  /**
   * Closes the network socket.
   */
  void close();

}
