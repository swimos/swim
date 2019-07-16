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

package swim.io.warp;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.io.IpSettings;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.io.http.HttpSettings;
import swim.io.ws.WsSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public class WarpSettings implements Debug {
  protected final WsSettings wsSettings;

  public WarpSettings(WsSettings wsSettings) {
    this.wsSettings = wsSettings;
  }

  public final WsSettings wsSettings() {
    return this.wsSettings;
  }

  public WarpSettings wsSettings(WsSettings wsSettings) {
    return new WarpSettings(wsSettings);
  }

  public final HttpSettings httpSettings() {
    return this.wsSettings.httpSettings();
  }

  public WarpSettings httpSettings(HttpSettings httpSettings) {
    return wsSettings(this.wsSettings.httpSettings(httpSettings));
  }

  public final IpSettings ipSettings() {
    return this.wsSettings.ipSettings();
  }

  public WarpSettings ipSettings(IpSettings ipSettings) {
    return wsSettings(this.wsSettings.ipSettings(ipSettings));
  }

  public final TlsSettings tlsSettings() {
    return this.wsSettings.tlsSettings();
  }

  public WarpSettings tlsSettings(TlsSettings tlsSettings) {
    return wsSettings(this.wsSettings.tlsSettings(tlsSettings));
  }

  public final TcpSettings tcpSettings() {
    return this.wsSettings.tcpSettings();
  }

  public WarpSettings tcpSettings(TcpSettings tcpSettings) {
    return wsSettings(this.wsSettings.tcpSettings(tcpSettings));
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WarpSettings) {
      final WarpSettings that = (WarpSettings) other;
      return this.wsSettings.equals(that.wsSettings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WarpSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.wsSettings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("WarpSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("wsSettings").write('(').debug(this.wsSettings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static WarpSettings standard;

  private static Form<WarpSettings> form;

  public static WarpSettings standard() {
    if (standard == null) {
      standard = new WarpSettings(WsSettings.standard());
    }
    return standard;
  }

  public static WarpSettings from(WsSettings wsSettings) {
    return new WarpSettings(wsSettings);
  }

  @Kind
  public static Form<WarpSettings> form() {
    if (form == null) {
      form = new WarpSettingsForm();
    }
    return form;
  }
}

final class WarpSettingsForm extends Form<WarpSettings> {
  @Override
  public WarpSettings unit() {
    return WarpSettings.standard();
  }

  @Override
  public Class<?> type() {
    return WarpSettings.class;
  }

  @Override
  public Item mold(WarpSettings settings) {
    if (settings != null) {
      return WsSettings.form().mold(settings.wsSettings);
    } else {
      return Item.extant();
    }
  }

  @Override
  public WarpSettings cast(Item item) {
    final WsSettings wsSettings = WsSettings.form().cast(item);
    return new WarpSettings(wsSettings);
  }
}
