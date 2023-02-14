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

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A {@link TransportDispatcher} with management methods for configuring,
 * starting, and stopping the service. {@code TransportService} is thread safe.
 *
 * @see TransportDriver
 */
@Public
@Since("5.0")
public interface TransportService extends TransportDispatcher {

  /**
   * Returns the configuration options that govern the behavior
   * of the transport service.
   */
  TransportOptions transportOptions();

  /**
   * Assigns new {@code transportOptions} with which to govern the behavior
   * of the transport service. Options can only be assigned prior to starting
   * the service.
   *
   * @throws IllegalStateException if the service has already been started.
   */
  void setTransportOptions(TransportOptions transportOptions);

  /**
   * Attempts to assign new {@code transportOptions} with which to govern
   * the behavior of the transport service. Options can only be assigned
   * prior to starting the service. Returns {@code true} if the options
   * were successfully assigned; otherwise returns {@code false} if the
   * service has already been started and is therefore no longer configurable.
   */
  boolean tryTransportOptions(TransportOptions transportOptions);

  /**
   * Ensures that this transport service has entered the started state.
   * Returns {@code true} if this call causes the transport service to start;
   * otherwise returns {@code false} if the transport service was already
   * started. Waits until the service has been started before returning.
   */
  boolean start();

  /**
   * Ensures that this transport service has permanently entered the stopped
   * state. Returns {@code true} if this call causes the transport service to
   * stop; otherwise returns {@code false} if the transport service was already
   * stopped. Waits until the service has been stopped before returning.
   */
  boolean stop();

}
