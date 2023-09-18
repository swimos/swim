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

package swim.io.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.io.IpSettings;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * HTTP configuration parameters.
 */
public class HttpSettings implements Debug {

  protected final IpSettings ipSettings;
  protected final int maxMessageSize;

  public HttpSettings(IpSettings ipSettings, int maxMessageSize) {
    this.ipSettings = ipSettings;
    this.maxMessageSize = maxMessageSize;
  }

  /**
   * Returns the socket configuration.
   */
  public final IpSettings ipSettings() {
    return this.ipSettings;
  }

  /**
   * Returns a copy of these {@code HttpSettings} configured with the given
   * {@code ipSettings}.
   */
  public HttpSettings ipSettings(IpSettings ipSettings) {
    return this.copy(ipSettings, this.maxMessageSize);
  }

  /**
   * Returns the TCP socket configuration.
   */
  public final TcpSettings tcpSettings() {
    return this.ipSettings.tcpSettings();
  }

  /**
   * Returns a copy of these {@code HttpSettings} configured with the given
   * {@code tcpSettings}.
   */
  public HttpSettings tcpSettings(TcpSettings tcpSettings) {
    return this.ipSettings(this.ipSettings.tcpSettings(tcpSettings));
  }

  /**
   * Returns the TLS socket configuration.
   */
  public final TlsSettings tlsSettings() {
    return this.ipSettings.tlsSettings();
  }

  /**
   * Returns a copy of these {@code HttpSettings} configured with the given
   * {@code tlsSettings}.
   */
  public HttpSettings tlsSettings(TlsSettings tlsSettings) {
    return this.ipSettings(this.ipSettings.tlsSettings(tlsSettings));
  }

  /**
   * Returns the maximum size in bytes on the wire of an HTTP request or
   * response message + payload.
   */
  public int maxMessageSize() {
    return this.maxMessageSize;
  }

  /**
   * Returns a copy of these {@code HttpSettings} configured with the given
   * {@code maxMessageSize} limit on HTTP message + payload sizes.
   */
  public HttpSettings maxMessageSize(int maxMessageSize) {
    return this.copy(this.ipSettings, maxMessageSize);
  }

  /**
   * Returns a new {@code HttpSettings} instance with the given options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating settings.
   */
  protected HttpSettings copy(IpSettings ipSettings, int maxMessageSize) {
    return new HttpSettings(ipSettings, maxMessageSize);
  }

  /**
   * Returns a structural {@code Value} representing these {@code HttpSettings}.
   */
  public Value toValue() {
    return HttpSettings.form().mold(this).toValue();
  }

  /**
   * Returns {@code true} if these {@code HttpSettings} can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof HttpSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpSettings) {
      final HttpSettings that = (HttpSettings) other;
      return that.canEqual(this) && this.ipSettings.equals(that.ipSettings)
          && this.maxMessageSize == that.maxMessageSize;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpSettings.hashSeed == 0) {
      HttpSettings.hashSeed = Murmur3.seed(HttpSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HttpSettings.hashSeed,
        this.ipSettings.hashCode()), this.maxMessageSize));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpSettings").write('.').write("standard").write('(').write(')')
                   .write('.').write("ipSettings").write('(').debug(this.ipSettings).write(')')
                   .write('.').write("maxMessageSize").write('(').debug(this.maxMessageSize).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static HttpSettings standard;

  /**
   * Returns the default {@code HttpSettings} instance.
   */
  public static HttpSettings standard() {
    if (HttpSettings.standard == null) {
      int maxMessageSize;
      try {
        maxMessageSize = Integer.parseInt(System.getProperty("swim.http.max.message.size"));
      } catch (NumberFormatException error) {
        maxMessageSize = 16 * 1024 * 1024;
      }

      HttpSettings.standard = new HttpSettings(IpSettings.standard(), maxMessageSize);
    }
    return HttpSettings.standard;
  }

  public static HttpSettings create(IpSettings ipSettings) {
    return HttpSettings.standard().ipSettings(ipSettings);
  }

  private static Form<HttpSettings> form;

  /**
   * Returns the structural {@code Form} of {@code HttpSettings}.
   */
  @Kind
  public static Form<HttpSettings> form() {
    if (HttpSettings.form == null) {
      HttpSettings.form = new HttpSettingsForm();
    }
    return HttpSettings.form;
  }

}

final class HttpSettingsForm extends Form<HttpSettings> {

  @Override
  public HttpSettings unit() {
    return HttpSettings.standard();
  }

  @Override
  public Class<?> type() {
    return HttpSettings.class;
  }

  @Override
  public Item mold(HttpSettings settings) {
    if (settings != null) {
      final HttpSettings standard = HttpSettings.standard();
      final Record http = Record.create(2).attr("http");
      if (settings.maxMessageSize != standard.maxMessageSize) {
        http.slot("maxMessageSize", settings.maxMessageSize);
      }
      return Record.of(http).concat(IpSettings.form().mold(settings.ipSettings));
    } else {
      return Item.extant();
    }
  }

  @Override
  public HttpSettings cast(Item item) {
    final Value value = item.toValue();
    final HttpSettings standard = HttpSettings.standard();
    int maxMessageSize = standard.maxMessageSize;
    for (Item member : value) {
      if (member.getAttr("http").isDefined()) {
        maxMessageSize = member.get("maxMessageSize").intValue(maxMessageSize);
      }
    }
    final IpSettings ipSettings = IpSettings.form().cast(item);
    return new HttpSettings(ipSettings, maxMessageSize);
  }

}
