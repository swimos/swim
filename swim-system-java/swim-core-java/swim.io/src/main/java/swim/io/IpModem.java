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
 * Network socket binding that provides asynchronous I/O decoders and encoders
 * for a non-blocking NIO network channel.
 *
 * An {@code IpModem} interfaces with the underlying asynchronous networking
 * system via an {@link IpModemContext}.  The modem context invokes I/O
 * callbacks on the {@code IpModem} when the underlying network socket is
 * ready to perform I/O operations permitted by the socket context's {@link
 * FlowControl}.
 */
public interface IpModem<I, O> {
  /**
   * Returns the socket modem context to which this {@code IpModem} is bound;
   * returns {@code null} if this {@code IpModem} is unbound.
   */
  IpModemContext<I, O> ipModemContext();

  /**
   * Sets the socket modem context to which this {@code IpModem} is bound.
   */
  void setIpModemContext(IpModemContext<I, O> context);

  /**
   * Returns the number of idle milliseconds after which this {@code IpModem}
   * should be closed due to inactivity.  Returns {@code -1} if a default idle
   * timeout should be used.  Returns {@code 0} if the underlying network
   * socket should not time out.
   */
  long idleTimeout();

  /**
   * I/O callback invoked by the modem context asking this {@code IpModem} to
   * provide an input {@link Decoder} by invoking the modem context's {@link
   * IpModemContext#read(Decoder) read} method.  The modem context will
   * asynchronously feed input data to the provided read {@code Decoder} until
   * it transitions out of the <em>cont</em> state.  The read flow control of
   * the underlying network socket is automatically managed by the modem
   * context using the state of the read {@code Decoder}.  May be invoked
   * concurrently to other I/O callbacks, but never concurrently with other
   * {@code doRead} or {@code didRead} calls.
   */
  void doRead();

  /**
   * I/O callback invoked by the modem context with the completed value of the
   * current read {@code Decoder} after it has transitioned to the
   * <em>done</em> state.  May be invoked concurrently to other I/O callbacks,
   * but never concurrently with other {@code doRead} or {@code didRead} calls.
   */
  void didRead(I input);

  /**
   * I/O callback invoked by the modem context asking this {@code IpModem} to
   * provide an output {@link Encoder} by invoking the modem context's {@link
   * IpModemContext#write(Encoder) write} method.  The modem context will
   * asynchronously pull output data from the provided write {@code Encoder}
   * until it transitions out of the <em>cont</em> state.  The write flow
   * control of the underlying network socket is automatically managed by the
   * modem context using the state of the write {@code Encoder}.  May be
   * invoked concurrently to other I/O callbacks, but never concurrently with
   * other {@code doWrite} or {@code didWrite} calls.
   */
  void doWrite();

  /**
   * I/O callback invoked by the modem context with the completed value of the
   * current write {@code Encoder} after it has transitioned to the
   * <em>done</em> state.  May be invoked concurrently to other I/O callbacks,
   * but never concurrently with other {@code dodWrite} or {@code didWrite}
   * calls.
   */
  void didWrite(O output);

  /**
   * Lifecycle callback invoked by the modem context before the underlying
   * network socket attempts to open a connection.
   */
  void willConnect();

  /**
   * Lifecycle callback invoked by the modem context after the underlying
   * network socket has opened a connection.
   */
  void didConnect();

  /**
   * Lifecycle callback invoked by the modem context before the underlying
   * network socket establishes a secure connection.
   */
  void willSecure();

  /**
   * Lifecycle callback invoked by the modem context after the underlying
   * network socket has established a secure connection.
   */
  void didSecure();

  /**
   * Lifecycle callback invoked by the modem context before it has {@link
   * IpModemContext#become(IpSocket) become} a new {@code socket}
   * implementation.
   */
  void willBecome(IpSocket socket);

  /**
   * Lifecycle callback invoked by the modem context after it has {@link
   * IpModemContext#become(IpSocket) become} a new {@code socket}
   * implementation.
   */
  void didBecome(IpSocket socket);

  /**
   * Lifecycle callback invoked by the modem context after the underlying
   * network connection has timed out.  The modem will automatically be closed.
   */
  void didTimeout();

  /**
   * Lifecycle callback invoked by the socket context after the underlying
   * network connection has disconnected.
   */
  void didDisconnect();

  /**
   * Lifecycle callback invoked by the modem context when the underlying
   * network socket fails by throwing an {@code error}.  The modem will
   * automatically be closed.
   */
  void didFail(Throwable error);
}
