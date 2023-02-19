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

import java.net.Socket;
import java.net.SocketException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * TCP configuration options.
 */
@Public
@Since("5.0")
public class TcpOptions implements ToSource {

  protected final int backlog;
  protected final int recvBufferSize;
  protected final int sendBufferSize;
  protected final boolean keepAlive;
  protected final boolean noDelay;

  public TcpOptions(int backlog, int recvBufferSize, int sendBufferSize,
                    boolean keepAlive, boolean noDelay) {
    this.backlog = backlog;
    this.recvBufferSize = recvBufferSize;
    this.sendBufferSize = sendBufferSize;
    this.keepAlive = keepAlive;
    this.noDelay = noDelay;
  }

  /**
   * Returns the maximum length of the queue of incoming connections.
   */
  public final int backlog() {
    return this.backlog;
  }

  /**
   * Returns a copy of these options configured with the given {@code backlog}
   * for the maximum length of the queue of incoming connections.
   */
  public TcpOptions backlog(int backlog) {
    return this.copy(backlog, this.recvBufferSize, this.sendBufferSize,
                     this.keepAlive, this.noDelay);
  }

  /**
   * Returns the value of the {@code SO_RCVBUF} socket option,
   * specifying the receive buffer size to use for TCP sockets.
   */
  public final int recvBufferSize() {
    return this.recvBufferSize;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code recvBufferSize} value for the {@code SO_RCVBUF} socket option.
   */
  public TcpOptions recvBufferSize(int recvBufferSize) {
    return this.copy(this.backlog, recvBufferSize, this.sendBufferSize,
                     this.keepAlive, this.noDelay);
  }

  /**
   * Returns the value of the {@code SO_SNDBUF} socket option,
   * specifying the send buffer size to use for TCP sockets.
   */
  public final int sendBufferSize() {
    return this.sendBufferSize;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code sendBufferSize} value for the {@code SO_SNDBUF} socket option.
   */
  public TcpOptions sendBufferSize(int sendBufferSize) {
    return this.copy(this.backlog, this.recvBufferSize, sendBufferSize,
                     this.keepAlive, this.noDelay);
  }

  /**
   * Returns {@code true} if TCP sockets should be configured with the
   * {@code SO_KEEPALIVE} socket option to send keepalive probes to prevent
   * idle connections from timing out.
   */
  public final boolean keepAlive() {
    return this.keepAlive;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code keepAlive} value for the {@code SO_KEEPALIVE} socket option.
   */
  public TcpOptions keepAlive(boolean keepAlive) {
    return this.copy(this.backlog, this.recvBufferSize, this.sendBufferSize,
                     keepAlive, this.noDelay);
  }

  /**
   * Returns {@code true} if TCP sockets should be configured with the
   * {@code TCP_NODELAY} socket option to disable Nagle's algorithm.
   */
  public final boolean noDelay() {
    return this.noDelay;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code noDelay} value for the {@code TCP_NODELAY} socket option.
   */
  public TcpOptions noDelay(boolean noDelay) {
    return this.copy(this.backlog, this.recvBufferSize, this.sendBufferSize,
                     this.keepAlive, noDelay);
  }

  /**
   * Returns a copy of these options with the specified TCP options.
   * Subclasses may override this method to ensure the proper class
   * is instantiated when updating options.
   */
  protected TcpOptions copy(int backlog, int recvBufferSize, int sendBufferSize,
                            boolean keepAlive, boolean noDelay) {
    return new TcpOptions(backlog, recvBufferSize, sendBufferSize, keepAlive, noDelay);
  }

  /**
   * Configures the given {@code socket} with these options.
   */
  public void configure(Socket socket) throws SocketException {
    socket.setKeepAlive(this.keepAlive);
    socket.setTcpNoDelay(this.noDelay);
    if (this.recvBufferSize != 0) {
      socket.setReceiveBufferSize(this.recvBufferSize);
    }
    if (this.sendBufferSize != 0) {
      socket.setSendBufferSize(this.sendBufferSize);
    }
  }

  /**
   * Returns {@code true} if these options can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TcpOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TcpOptions) {
      final TcpOptions that = (TcpOptions) other;
      return that.canEqual(this)
          && this.backlog == that.backlog
          && this.recvBufferSize == that.recvBufferSize
          && this.sendBufferSize == that.sendBufferSize
          && this.keepAlive == that.keepAlive
          && this.noDelay == that.noDelay;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(TcpOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
      HASH_SEED, this.backlog), this.recvBufferSize), this.sendBufferSize),
      Murmur3.hash(this.keepAlive)), Murmur3.hash(this.noDelay)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TcpOptions", "standard").endInvoke()
            .beginInvoke("backlog").appendArgument(this.backlog).endInvoke()
            .beginInvoke("recvBufferSize").appendArgument(this.recvBufferSize).endInvoke()
            .beginInvoke("sendBufferSize").appendArgument(this.sendBufferSize).endInvoke()
            .beginInvoke("noDelay").appendArgument(this.noDelay).endInvoke()
            .beginInvoke("keepAlive").appendArgument(this.keepAlive).endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static @Nullable TcpOptions standard;

  /**
   * Returns the default {@code TcpOptions} instance.
   */
  public static TcpOptions standard() {
    if (TcpOptions.standard == null) {
      int backlog;
      try {
        backlog = Integer.parseInt(System.getProperty("swim.net.tcp.backlog"));
      } catch (NumberFormatException error) {
        backlog = 0;
      }

      int recvBufferSize;
      try {
        recvBufferSize = Integer.parseInt(System.getProperty("swim.net.tcp.recv.buffer.size"));
      } catch (NumberFormatException error) {
        recvBufferSize = 0;
      }

      int sendBufferSize;
      try {
        sendBufferSize = Integer.parseInt(System.getProperty("swim.net.tcp.send.buffer.size"));
      } catch (NumberFormatException error) {
        sendBufferSize = 0;
      }

      final boolean keepAlive = Boolean.parseBoolean(System.getProperty("swim.net.tcp.keepalive"));

      final boolean noDelay = Boolean.parseBoolean(System.getProperty("swim.net.tcp.nodelay"));

      TcpOptions.standard = new TcpOptions(backlog, recvBufferSize, sendBufferSize, keepAlive, noDelay);
    }
    return TcpOptions.standard;
  }

}
