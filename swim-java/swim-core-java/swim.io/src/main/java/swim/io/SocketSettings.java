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
 * Socket configuration parameters.
 */
public class SocketSettings implements Debug {
  protected final TcpSettings tcpSettings;
  protected final TlsSettings tlsSettings;

  public SocketSettings(TcpSettings tcpSettings, TlsSettings tlsSettings) {
    this.tcpSettings = tcpSettings;
    this.tlsSettings = tlsSettings;
  }

  /**
   * Returns the TCP socket configuration.
   */
  public TcpSettings tcpSettings() {
    return this.tcpSettings;
  }

  /**
   * Returns a copy of these {@code SocketSettings} configured with the given
   * {@code tcpSettings}.
   */
  public SocketSettings tcpSettings(TcpSettings tcpSettings) {
    return copy(tcpSettings, this.tlsSettings);
  }

  /**
   * Returns the TLS socket configuration.
   */
  public TlsSettings tlsSettings() {
    return this.tlsSettings;
  }

  /**
   * Returns a copy of these {@code SocketSettings} configured with the given
   * {@code tlsSettings}.
   */
  public SocketSettings tlsSettings(TlsSettings tlsSettings) {
    return copy(this.tcpSettings, tlsSettings);
  }

  /**
   * Returns a new {@code SocketSettings} instance with the given options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating settings.
   */
  protected SocketSettings copy(TcpSettings tcpSettings, TlsSettings tlsSettings) {
    return new SocketSettings(tcpSettings, tlsSettings);
  }

  /**
   * Configures the {@code socket} with these {@code SocketSettings}.
   */
  public void configure(Socket socket) throws SocketException {
    this.tcpSettings.configure(socket);
  }

  /**
   * Returns a structural {@code Value} representing these {@code SocketSettings}.
   */
  public Value toValue() {
    return form().mold(this).toValue();
  }

  /**
   * Returns {@code true} if these {@code SocketSettings} can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof SocketSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SocketSettings) {
      final SocketSettings that = (SocketSettings) other;
      return that.canEqual(this) && this.tcpSettings.equals(that.tcpSettings)
          && this.tlsSettings.equals(that.tlsSettings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(SocketSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.tcpSettings.hashCode()), this.tlsSettings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("SocketSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("tcpSettings").write('(').debug(this.tcpSettings).write(')')
        .write('.').write("tlsSettings").write('(').debug(this.tlsSettings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static SocketSettings standard;

  private static Form<SocketSettings> form;

  /**
   * Returns the default {@code SocketSettings} instance.
   */
  public static SocketSettings standard() {
    if (standard == null) {
      standard = new SocketSettings(TcpSettings.standard(), TlsSettings.standard());
    }
    return standard;
  }

  public static SocketSettings from(TcpSettings tcpSettings) {
    return new SocketSettings(tcpSettings, TlsSettings.standard());
  }

  public static SocketSettings from(TlsSettings tlsSettings) {
    return new SocketSettings(TcpSettings.standard(), tlsSettings);
  }

  /**
   * Returns the structural {@code Form} of {@code SocketSettings}.
   */
  @Kind
  public static Form<SocketSettings> form() {
    if (form == null) {
      form = new SocketSettingsForm();
    }
    return form;
  }
}

final class SocketSettingsForm extends Form<SocketSettings> {
  @Override
  public SocketSettings unit() {
    return SocketSettings.standard();
  }

  @Override
  public Class<?> type() {
    return SocketSettings.class;
  }

  @Override
  public Item mold(SocketSettings settings) {
    if (settings != null) {
      final Record record = Record.create(2);
      record.add(TcpSettings.form().mold(settings.tcpSettings));
      record.add(TlsSettings.form().mold(settings.tlsSettings));
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public SocketSettings cast(Item item) {
    final Value value = item.toValue();
    TcpSettings tcpSettings = null;
    TlsSettings tlsSettings = null;
    for (Item member : value) {
      final TcpSettings newTcpSettings = TcpSettings.form().cast(member);
      if (newTcpSettings != null) {
        tcpSettings = newTcpSettings;
      }
      final TlsSettings newTlsSettings = TlsSettings.form().cast(member);
      if (newTlsSettings != null) {
        tlsSettings = newTlsSettings;
      }
    }
    if (tcpSettings == null) {
      tcpSettings = TcpSettings.standard();
    }
    if (tlsSettings == null) {
      tlsSettings = TlsSettings.standard();
    }
    return new SocketSettings(tcpSettings, tlsSettings);
  }
}
