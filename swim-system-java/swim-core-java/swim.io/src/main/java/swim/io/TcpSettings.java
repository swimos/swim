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

import java.net.Socket;
import java.net.SocketException;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * TCP configuration parameters.
 */
public class TcpSettings implements Debug {
  protected final boolean keepAlive;
  protected final boolean noDelay;
  protected final int receiveBufferSize;
  protected final int sendBufferSize;
  protected final int readBufferSize;
  protected final int writeBufferSize;

  public TcpSettings(boolean keepAlive, boolean noDelay, int receiveBufferSize,
                     int sendBufferSize, int readBufferSize, int writeBufferSize) {
    this.keepAlive = keepAlive;
    this.noDelay = noDelay;
    this.receiveBufferSize = receiveBufferSize;
    this.sendBufferSize = sendBufferSize;
    this.readBufferSize = readBufferSize;
    this.writeBufferSize = writeBufferSize;
  }

  /**
   * Returns {@code true} if TCP should be configured with the {@code
   * SO_KEEPALIVE} socket option to send keepalive probes to prevent idle
   * connections from timing out.
   */
  public final boolean keepAlive() {
    return this.keepAlive;
  }

  /**
   * Returns a copy of these {@code TcpSettings} configured with the given
   * {@code keepAlive} value for the {@code SO_KEEPALIVE} socket option.
   */
  public TcpSettings keepAlive(boolean keepAlive) {
    return copy(keepAlive, this.noDelay, this.receiveBufferSize,
                this.sendBufferSize, this.readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns {@code true} if TCP should be configured with the {@code
   * TCP_NODELAY} socket option to disable Nagle's algorithm.
   */
  public final boolean noDelay() {
    return this.noDelay;
  }

  /**
   * Returns a copy of these {@code TcpSettings} configured with the given
   * {@code noDelay} value for the {@code TCP_NODELAY} socket option.
   */
  public TcpSettings noDelay(boolean noDelay) {
    return copy(this.keepAlive, noDelay, this.receiveBufferSize,
                this.sendBufferSize, this.readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns the value of the {@code SO_RCVBUF} socket option with which TCP
   * should be configured to control the size of receive buffers.
   */
  public final int receiveBufferSize() {
    return this.receiveBufferSize;
  }

  /**
   * Returns a copy of these {@code TcpSettings} configured with the given
   * {@code receiveBufferSize} value for the {@code SO_RCVBUF} socket option.
   */
  public TcpSettings receiveBufferSize(int receiveBufferSize) {
    return copy(this.keepAlive, this.noDelay, receiveBufferSize,
                this.sendBufferSize, this.readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns the value of the {@code SO_SNDBUF} socket option with which TCP
   * should be configured to control the size of send buffers.
   */
  public final int sendBufferSize() {
    return this.sendBufferSize;
  }

  /**
   * Returns a copy of these {@code TcpSettings} configured with the given
   * {@code sendBufferSize} value for the {@code SO_SNDBUF} socket option.
   */
  public TcpSettings sendBufferSize(int sendBufferSize) {
    return copy(this.keepAlive, this.noDelay, this.receiveBufferSize,
                sendBufferSize, this.readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns the size in bytes of the per-socket userspace buffers into which
   * data is received.
   */
  public final int readBufferSize() {
    return this.readBufferSize;
  }

  /**
   * Returns a copy of these {@code TcpSettings} configured with the given
   * {@code readBufferSize} for per-socket userspace read buffers.
   */
  public TcpSettings readBufferSize(int readBufferSize) {
    return copy(this.keepAlive, this.noDelay, this.receiveBufferSize,
                this.sendBufferSize, readBufferSize, this.writeBufferSize);
  }

  /**
   * Returns the size in bytes of the per-socket userspace buffers from which
   * data is sent.
   */
  public final int writeBufferSize() {
    return this.writeBufferSize;
  }

  /**
   * Returns a copy of these {@code TcpSettings} configured with the given
   * {@code writeBufferSize} for per-socket userspace write buffers.
   */
  public TcpSettings writeBufferSize(int writeBufferSize) {
    return copy(this.keepAlive, this.noDelay, this.receiveBufferSize,
                this.sendBufferSize, this.readBufferSize, writeBufferSize);
  }

  /**
   * Returns a new {@code TcpSettings} instance with the given options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating settings.
   */
  protected TcpSettings copy(boolean keepAlive, boolean noDelay, int receiveBufferSize,
                             int sendBufferSize, int readBufferSize, int writeBufferSize) {
    return new TcpSettings(keepAlive, noDelay, receiveBufferSize,
                           sendBufferSize, readBufferSize, writeBufferSize);
  }

  /**
   * Configures the {@code socket} with these {@code TcpSettings}.
   */
  public void configure(Socket socket) throws SocketException {
    socket.setKeepAlive(this.keepAlive);
    socket.setTcpNoDelay(this.noDelay);
    if (this.receiveBufferSize != 0) {
      socket.setReceiveBufferSize(this.receiveBufferSize);
    }
    if (this.sendBufferSize != 0) {
      socket.setSendBufferSize(this.sendBufferSize);
    }
  }

  /**
   * Returns a structural {@code Value} representing these {@code TcpSettings}.
   */
  public Value toValue() {
    return form().mold(this).toValue();
  }

  /**
   * Returns {@code true} if these {@code TcpSettings} can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TcpSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TcpSettings) {
      final TcpSettings that = (TcpSettings) other;
      return that.canEqual(this) && this.keepAlive == that.keepAlive && this.noDelay == that.noDelay
          && this.receiveBufferSize == that.receiveBufferSize && this.sendBufferSize == that.sendBufferSize
          && this.readBufferSize == that.readBufferSize && this.writeBufferSize == that.writeBufferSize;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TcpSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, Murmur3.hash(this.keepAlive)), Murmur3.hash(this.noDelay)), this.receiveBufferSize),
        this.sendBufferSize), this.readBufferSize), this.writeBufferSize));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("TcpSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("noDelay").write('(').debug(this.noDelay).write(')')
        .write('.').write("keepAlive").write('(').debug(this.keepAlive).write(')')
        .write('.').write("receiveBufferSize").write('(').debug(this.receiveBufferSize).write(')')
        .write('.').write("sendBufferSize").write('(').debug(this.sendBufferSize).write(')')
        .write('.').write("readBufferSize").write('(').debug(this.readBufferSize).write(')')
        .write('.').write("writeBufferSize").write('(').debug(this.writeBufferSize).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static TcpSettings standard;

  private static Form<TcpSettings> form;

  /**
   * Returns the default {@code TcpSettings} instance.
   */
  public static TcpSettings standard() {
    if (standard == null) {
      final boolean keepAlive = Boolean.parseBoolean(System.getProperty("swim.tcp.keepalive"));

      final boolean noDelay = Boolean.parseBoolean(System.getProperty("swim.tcp.nodelay"));

      int receiveBufferSize;
      try {
        receiveBufferSize = Integer.parseInt(System.getProperty("swim.tcp.receive.buffer.size"));
      } catch (NumberFormatException error) {
        receiveBufferSize = 0;
      }

      int sendBufferSize;
      try {
        sendBufferSize = Integer.parseInt(System.getProperty("swim.tcp.send.buffer.size"));
      } catch (NumberFormatException error) {
        sendBufferSize = 0;
      }

      int readBufferSize;
      try {
        readBufferSize = Integer.parseInt(System.getProperty("swim.tcp.read.buffer.size"));
      } catch (NumberFormatException error) {
        readBufferSize = 4096;
      }

      int writeBufferSize;
      try {
        writeBufferSize = Integer.parseInt(System.getProperty("swim.tcp.write.buffer.size"));
      } catch (NumberFormatException error) {
        writeBufferSize = 4096;
      }

      standard = new TcpSettings(keepAlive, noDelay, receiveBufferSize,
                                 sendBufferSize, readBufferSize, writeBufferSize);
    }
    return standard;
  }

  /**
   * Returns the structural {@code Form} of {@code TcpSettings}.
   */
  @Kind
  public static Form<TcpSettings> form() {
    if (form == null) {
      form = new TcpSettingsForm();
    }
    return form;
  }
}

final class TcpSettingsForm extends Form<TcpSettings> {
  @Override
  public String tag() {
    return "tcp";
  }

  @Override
  public TcpSettings unit() {
    return TcpSettings.standard();
  }

  @Override
  public Class<?> type() {
    return TcpSettings.class;
  }

  @Override
  public Item mold(TcpSettings settings) {
    if (settings != null) {
      final TcpSettings standard = TcpSettings.standard();
      final Record record = Record.create(7).attr(tag());
      if (settings.keepAlive != standard.keepAlive) {
        record.slot("keepAlive", true);
      }
      if (settings.noDelay != standard.noDelay) {
        record.slot("noDelay", true);
      }
      if (settings.receiveBufferSize != standard.receiveBufferSize) {
        record.slot("receiveBufferSize", settings.receiveBufferSize);
      }
      if (settings.sendBufferSize != standard.sendBufferSize) {
        record.slot("sendBufferSize", settings.sendBufferSize);
      }
      if (settings.readBufferSize != standard.readBufferSize) {
        record.slot("readBufferSize", settings.readBufferSize);
      }
      if (settings.writeBufferSize != standard.writeBufferSize) {
        record.slot("writeBufferSize", settings.writeBufferSize);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public TcpSettings cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final TcpSettings standard = TcpSettings.standard();
      final boolean keepAlive = value.get("keepAlive").booleanValue(standard.keepAlive);
      final boolean noDelay = value.get("noDelay").booleanValue(standard.noDelay);
      final int receiveBufferSize = value.get("receiveBufferSize").intValue(standard.receiveBufferSize);
      final int sendBufferSize = value.get("sendBufferSize").intValue(standard.sendBufferSize);
      final int readBufferSize = value.get("readBufferSize").intValue(standard.readBufferSize);
      final int writeBufferSize = value.get("writeBufferSize").intValue(standard.writeBufferSize);
      return new TcpSettings(keepAlive, noDelay, receiveBufferSize,
                             sendBufferSize, readBufferSize, writeBufferSize);
    }
    return null;
  }
}
