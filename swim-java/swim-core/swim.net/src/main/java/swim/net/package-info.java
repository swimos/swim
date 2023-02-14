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

/**
 * Explicitly flow-controlled, non-blocking, parallel I/O engine, with
 * <strong>swim-codec</strong>-modulated socket modems, and TCP and TLS
 * transports.
 *
 * <h2>Transports</h2>
 * <p>
 * Asynchronous I/O {@linkplain Transport transport} APIs. A <em>transport</em>
 * is a non-blocking I/O handler that is scheduled for execution by a {@link
 * TransportDispatcher} when requested I/O operations are ready to be performed
 * by the underlying operating system.
 * <p>
 * The {@link Transport} interface provides callback methods that a {@code
 * TransportDispatcher} invokes when requested I/O operations are ready to be
 * performed. A {@code Transport} requests I/O scheduling by invoking methods
 * on its bound {@link TransportContext}.
 * <p>
 * A {@link TransportDispatcher} is used to dispatch requested I/O readiness
 * events to bound transports. {@code TransportDispatcher} returns a {@link
 * TransportRef} when a transport is first bound to a scheduler. A {@code
 * TransportRef} can be used to {@link TransportRef#cancel() cancel} I/O
 * scheduling of a transport.
 * <p>
 * {@link TransportService} extends {@code TransportDispatcher} with management
 * methods to configure, start, and stop the service. {@link TransportDriver}
 * implements a {@code TransportService} backed by a {@link
 * java.nio.channels.Selector Selector} thread.
 */
@Public
@Since("5.0")
package swim.net;

import swim.annotations.Public;
import swim.annotations.Since;
