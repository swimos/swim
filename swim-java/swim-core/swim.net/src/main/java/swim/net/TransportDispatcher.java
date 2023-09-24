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

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A scheduler for dispatching requested I/O readiness events to registered I/O
 * {@linkplain Transport transports}. {@code TransportDispatcher} is thread safe.
 *
 * @see TransportService
 * @see TransportDriver
 */
@Public
@Since("5.0")
public interface TransportDispatcher {

  /**
   * Binds a {@code transport} to this I/O dispatcher, and returns a {@code
   * TransportRef} that can be used to {@link TransportRef#cancel() cancel}
   * I/O scheduling for the transport.
   */
  TransportRef bindTransport(Transport transport);

}
