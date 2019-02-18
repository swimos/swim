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

import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;

/**
 * Network socket context that manages asynchronous I/O operations for a
 * non-blocking NIO network channel.  A {@code SocketContext} is implicitly
 * bound to a {@link Socket}, providing the {@code Socket} with the ability to
 * modify its {@link FlowControl} state, access its read and write buffers, to
 * {@link #become(Socket) become} a different kind of {@code Socket}, and to
 * close the socket.
 */
public interface SocketContext extends SocketRef, FlowContext {
  /**
   * Returns the configuration parameters that govern the underlying network
   * socket.
   */
  SocketSettings socketSettings();

  /**
   * Returns the buffer into which input data is read by the underlying network
   * socket.  The bound {@code Socket} reads from this buffer in response to
   * {@link Socket#doRead() doRead} callbacks.
   */
  InputBuffer inputBuffer();

  /**
   * Returns the buffer from which output data is written by the underlying
   * network socket.  The bound {@code Socket} writes to this buffer in
   * repsonse to {@link Socket#doWrite() doWrite} callbacks.
   */
  OutputBuffer<?> outputBuffer();

  /**
   * Rebinds this {@code SocketContext} to a new {@code socket} implementation,
   * thereby changing the {@code Socket} handler that receives network I/O
   * callbacks.
   */
  void become(Socket socket);
}
