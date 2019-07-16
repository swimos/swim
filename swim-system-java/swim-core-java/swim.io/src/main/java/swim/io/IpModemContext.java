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

import swim.codec.Decoder;
import swim.codec.Encoder;

/**
 * Network socket context that manages asynchronous I/O decoders and encoders
 * for a non-blocking NIO network channel.  An {@code IpModemContext} is
 * implicitly bound to a {@link IpModem}, providing the {@code IpModem} with
 * the ability to modify its {@link FlowControl} state, enqueue read decoders
 * and write encoders, to {@link #become(IpSocket) become} a different kind of
 * {@code IpSocket}, and to close the socket.
 */
public interface IpModemContext<I, O> extends IpContext, FlowContext {
  /**
   * Returns the configuration parameters that govern the underlying network
   * socket.
   */
  IpSettings ipSettings();

  /**
   * Enqueues a read {@code decoder} to which input data will be asynchronously
   * fed.  The read flow control of the underlying network socket is
   * automatically managed using the state of the read {@code decoder}.  When
   * the read {@code decoder} transitions into the <em>done</em> state, the
   * {@link IpModem#didRead(Object) didRead} callback of the bound {@code
   * IpModem} will be invoked with the decoded result.  If the read {@code
   * decoder} transitions into the <em>error</em> state, then the {@link
   * IpModem#didFail(Throwable) didFail} callback of the bound {@code IpModem}
   * will be invoked with the decode error.
   */
  <I2 extends I> void read(Decoder<I2> decoder);

  /**
   * Enqueues a write {@code encoder} from which output data will be
   * asynchronously pulled.  The write flow control of the underlying network
   * socket is automatically managed using the state of the write {@code
   * encoder}.  When the write {@code encoder} transitions into the
   * <em>done</em> state, the {@link IpModem#didWrite(Object) didWrite}
   * callback of the bound {@code IpModem} will be invoked with the encoded
   * result.  If the write {@code encoder} transitions into the <em>error</em>
   * state, then the {@link IpModem#didFail(Throwable) didFail} callback of
   * the bound {@code IpModem} will be invoked with the encode error.
   */
  <O2 extends O> void write(Encoder<?, O2> encoder);

  /**
   * Rebinds the underlying {@code IpSocketContext} to a new {@code socket}
   * implementation, thereby changing the {@code IpSocket} handler that
   * receives network I/O callbacks.
   */
  void become(IpSocket socket);

  /**
   * Closes the underlying network socket.
   */
  void close();
}
