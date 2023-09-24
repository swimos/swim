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

@Public
@Since("5.0")
public interface FlowContext {

  /**
   * Requests that the I/O dispatcher schedule the execution of {@link
   * NetSocket#doRead()} once the network channel is ready to perform
   * a read operation. Returns {@code true} if this call causes the
   * registration of the readiness event; otherwise returns {@code false}
   * if the event is already pending.
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
   * Unconditionally schedules the execution of {@link NetSocket#doRead()},
   * without waiting on a readiness event from the I/O dispatcher. Returns
   * {@code true} if this call causes the scheduling of the read operation;
   * otherwise returns {@code false} if the operation is already scheduled.
   */
  boolean triggerRead();

  /**
   * Requests that the I/O dispatcher schedule the execution of {@link
   * NetSocket#doWrite()} once the network channel is ready to perform
   * a write operation. Returns {@code true} if this call causes the
   * registration of the readiness event; otherwise returns {@code false}
   * if the event is already pending.
   */
  boolean requestWrite();

  /**
   * Attempts to cancel a pending write event requested via {@link
   * #requestWrite()}. Returns {@code true} if this call causes the
   * cancellation of the readiness event; otherwise returns {@code false}
   * if the event is not currently pending.
   */
  boolean cancelWrite();

  /**
   * Unconditionally schedules the execution of {@link NetSocket#doWrite()},
   * without waiting on a readiness event from the I/O dispatcher. Returns
   * {@code true} if this call causes the scheduling of the read operation;
   * otherwise returns {@code false} if the operation is already scheduled.
   */
  boolean triggerWrite();

  /**
   * Returns {@code true} if this socket is done reading application data;
   * otherwise returns {@code false} if the socket is still open for reading.
   */
  boolean isDoneReading();

  /**
   * Closes the network connection for reading. No further callbacks to {@link
   * NetSocket#doRead()} will be made. The socket will automatically be
   * disconnected once both {@code doneReading} and {@link #doneWriting()
   * doneWriting} have been called. Returns {@code true} if this call causes
   * the socket to close for reading; otherwise returns {@code false} if the
   * socket has already been closed for reading, or has not yet been connected.
   */
  boolean doneReading();

  /**
   * Returns {@code true} if this socket is done writing application data;
   * otherwise returns {@code false} if the socket is still open for writing.
   */
  boolean isDoneWriting();

  /**
   * Closes the network connection for writing. No further callbacks to {@link
   * NetSocket#doWrite()} will be made. The socket will automatically be
   * disconnected once both {@link #doneReading() doneReading} and {@code
   * doneWriting} have been called. Returns {@code true} if this call causes
   * the socket to close for writing; otherwise returns {@code false} if the
   * socket has already been closed for writing, or has not yet been connected.
   */
  boolean doneWriting();

}
