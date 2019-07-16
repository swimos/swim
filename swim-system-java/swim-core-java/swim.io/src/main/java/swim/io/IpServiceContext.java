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
 * Network listener context that manages asynchronous I/O operations for a
 * non-blocking NIO server socket channel.  An {@code IpServiceContext} is
 * implicitly bound to an {@link IpService}, providing the {@code IpService}
 * with the ability to modify its {@link FlowControl} state, and to unbind
 * the network listener.
 */
public interface IpServiceContext extends IpServiceRef, FlowContext {
  /**
   * Returns the configuration parameters that govern the underlying network
   * listener.
   */
  IpSettings ipSettings();
}
