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
 * I/O transport context that manages asynchronous I/O operations for a
 * non-blocking NIO channel.  A {@code TransportContext} is implicitly bound to
 * a {@link Transport}, providing the {@code Transport} with the ability to
 * modify its {@link FlowControl} state, and to close the transport.
 */
public interface TransportContext extends TransportRef {
  /**
   * Returns the configuration parameters that govern the underlying I/O
   * transport.
   */
  TransportSettings transportSettings();
}
