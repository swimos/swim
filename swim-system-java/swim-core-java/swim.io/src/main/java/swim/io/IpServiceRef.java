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

import java.net.InetSocketAddress;

/**
 * External handle to a network {@link IpService} listener.
 */
public interface IpServiceRef {
  /**
   * Returns the IP address and port to which the underlying network listener
   * is bound.  Returns {@code null} if the underlying network listener is not
   * currently bound.
   */
  InetSocketAddress localAddress();

  /**
   * Unbinds the underlying network listener.
   */
  void unbind();
}
