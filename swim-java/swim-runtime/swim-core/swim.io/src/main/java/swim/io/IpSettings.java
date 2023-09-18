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
 * IP Socket configuration parameters.
 */
public class IpSettings implements Debug {

  protected final TcpSettings tcpSettings;
  protected final TlsSettings tlsSettings;

  public IpSettings(TcpSettings tcpSettings, TlsSettings tlsSettings) {
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
   * Returns a copy of these {@code IpSettings} configured with the given
   * {@code tcpSettings}.
   */
  public IpSettings tcpSettings(TcpSettings tcpSettings) {
    return this.copy(tcpSettings, this.tlsSettings);
  }

  /**
   * Returns the TLS socket configuration.
   */
  public TlsSettings tlsSettings() {
    return this.tlsSettings;
  }

  /**
   * Returns a copy of these {@code IpSettings} configured with the given
   * {@code tlsSettings}.
   */
  public IpSettings tlsSettings(TlsSettings tlsSettings) {
    return this.copy(this.tcpSettings, tlsSettings);
  }

  /**
   * Returns a new {@code IpSettings} instance with the given options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating settings.
   */
  protected IpSettings copy(TcpSettings tcpSettings, TlsSettings tlsSettings) {
    return new IpSettings(tcpSettings, tlsSettings);
  }

  /**
   * Configures the {@code socket} with these {@code IpSettings}.
   */
  public void configure(Socket socket) throws SocketException {
    this.tcpSettings.configure(socket);
  }

  /**
   * Returns a structural {@code Value} representing these {@code IpSettings}.
   */
  public Value toValue() {
    return IpSettings.form().mold(this).toValue();
  }

  /**
   * Returns {@code true} if these {@code IpSettings} can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof IpSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof IpSettings) {
      final IpSettings that = (IpSettings) other;
      return that.canEqual(this) && this.tcpSettings.equals(that.tcpSettings)
          && this.tlsSettings.equals(that.tlsSettings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (IpSettings.hashSeed == 0) {
      IpSettings.hashSeed = Murmur3.seed(IpSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(IpSettings.hashSeed,
        this.tcpSettings.hashCode()), this.tlsSettings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("IpSettings").write('.').write("standard").write('(').write(')')
                   .write('.').write("tcpSettings").write('(').debug(this.tcpSettings).write(')')
                   .write('.').write("tlsSettings").write('(').debug(this.tlsSettings).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static IpSettings standard;

  /**
   * Returns the default {@code IpSettings} instance.
   */
  public static IpSettings standard() {
    if (IpSettings.standard == null) {
      IpSettings.standard = new IpSettings(TcpSettings.standard(), TlsSettings.standard());
    }
    return IpSettings.standard;
  }

  public static IpSettings create(TcpSettings tcpSettings) {
    return new IpSettings(tcpSettings, TlsSettings.standard());
  }

  public static IpSettings create(TlsSettings tlsSettings) {
    return new IpSettings(TcpSettings.standard(), tlsSettings);
  }

  private static Form<IpSettings> form;

  /**
   * Returns the structural {@code Form} of {@code IpSettings}.
   */
  @Kind
  public static Form<IpSettings> form() {
    if (IpSettings.form == null) {
      IpSettings.form = new IpSettingsForm();
    }
    return IpSettings.form;
  }

}

final class IpSettingsForm extends Form<IpSettings> {

  @Override
  public IpSettings unit() {
    return IpSettings.standard();
  }

  @Override
  public Class<?> type() {
    return IpSettings.class;
  }

  @Override
  public Item mold(IpSettings settings) {
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
  public IpSettings cast(Item item) {
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
    return new IpSettings(tcpSettings, tlsSettings);
  }

}
