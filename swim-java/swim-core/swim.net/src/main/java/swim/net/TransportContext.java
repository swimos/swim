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
 * An internal handle that binds an I/O {@link Transport} to a {@link
 * TransportDispatcher}. A transport can obtain its context by invoking
 * {@link Transport#transportContext()}.
 *
 * @see Transport
 */
@Public
@Since("5.0")
public interface TransportContext extends TransportRef {

  /**
   * Requests that the bound I/O dispatcher invoke {@link Transport#doAccept()}
   * once the transport channel is ready to perform an accept operation.
   * Returns {@code true} if this call causes the registration of the readiness
   * event; otherwise returns {@code false} if the event is already pending.
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
   * Requests that the bound I/O dispatcher invoke {@link Transport#doAccept()}
   * once the transport channel is ready to complete a connect operation.
   * Returns {@code true} if this call causes the registration of the readiness
   * event; otherwise returns {@code false} if the event is already pending.
   */
  boolean requestConnect();

  /**
   * Attempts to cancel a pending connect event requested via {@link
   * #requestConnect()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  boolean cancelConnect();

  /**
   * Requests that the bound I/O dispatcher invoke {@link Transport#doRead()}
   * once the transport channel is ready to perform a read operation.
   * Returns {@code true} if this call causes the registration of the readiness
   * event; otherwise returns {@code false} if the event is already pending.
   */
  boolean requestRead();

  /**
   * Attempts to cancel a pending read event requested via {@link
   * #requestRead()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  boolean cancelRead();

  /**
   * Requests that the bound I/O dispatcher invoke {@link Transport#doWrite()}
   * once the transport channel is ready to perform a write operation.
   * Returns {@code true} if this call causes the registration of the readiness
   * event; otherwise returns {@code false} if the event is already pending.
   */
  boolean requestWrite();

  /**
   * Attempts to cancel a pending write event requested via {@link
   * #requestWrite()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  boolean cancelWrite();

}
