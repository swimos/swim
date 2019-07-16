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

package swim.io.ws;

import swim.codec.Output;
import swim.io.IpSettings;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.io.http.HttpSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;
import swim.ws.WsEngineSettings;

/**
 * WebSocket configuration parameters.
 */
public class WsSettings extends WsEngineSettings {
  protected final HttpSettings httpSettings;

  public WsSettings(HttpSettings httpSettings, int maxFrameSize, int maxMessageSize,
                    int serverCompressionLevel, int clientCompressionLevel,
                    boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                    int serverMaxWindowBits, int clientMaxWindowBits) {
    super(maxFrameSize, maxMessageSize, serverCompressionLevel, clientCompressionLevel,
          serverNoContextTakeover, clientNoContextTakeover, serverMaxWindowBits, clientMaxWindowBits);
    this.httpSettings = httpSettings;
  }

  public final HttpSettings httpSettings() {
    return this.httpSettings;
  }

  public WsSettings httpSettings(HttpSettings httpSettings) {
    return copy(httpSettings, this.maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final IpSettings ipSettings() {
    return this.httpSettings.ipSettings();
  }

  public WsSettings ipSettings(IpSettings ipSettings) {
    return httpSettings(this.httpSettings.ipSettings(ipSettings));
  }

  public final TlsSettings tlsSettings() {
    return this.httpSettings.tlsSettings();
  }

  public WsSettings tlsSettings(TlsSettings tlsSettings) {
    return httpSettings(this.httpSettings.tlsSettings(tlsSettings));
  }

  public final TcpSettings tcpSettings() {
    return this.httpSettings.tcpSettings();
  }

  public WsSettings tcpSettings(TcpSettings tcpSettings) {
    return httpSettings(this.httpSettings.tcpSettings(tcpSettings));
  }

  public WsSettings engineSettings(WsEngineSettings engineSettings) {
    return copy(engineSettings.maxFrameSize(), engineSettings.maxMessageSize(),
                engineSettings.serverCompressionLevel(), engineSettings.clientCompressionLevel(),
                engineSettings.serverNoContextTakeover(), engineSettings.clientNoContextTakeover(),
                engineSettings.serverMaxWindowBits(), engineSettings.clientMaxWindowBits());
  }

  @Override
  public WsSettings maxFrameSize(int maxFrameSize) {
    return (WsSettings) super.maxFrameSize(maxFrameSize);
  }

  @Override
  public WsSettings maxMessageSize(int maxMessageSize) {
    return (WsSettings) super.maxMessageSize(maxMessageSize);
  }

  @Override
  public WsSettings serverCompressionLevel(int serverCompressionLevel) {
    return (WsSettings) super.serverCompressionLevel(serverCompressionLevel);
  }

  @Override
  public WsSettings clientCompressionLevel(int clientCompressionLevel) {
    return (WsSettings) super.clientCompressionLevel(clientCompressionLevel);
  }

  @Override
  public WsSettings compressionLevel(int serverCompressionLevel, int clientCompressionLevel) {
    return (WsSettings) super.compressionLevel(serverCompressionLevel, clientCompressionLevel);
  }

  @Override
  public WsSettings serverNoContextTakeover(boolean serverNoContextTakeover) {
    return (WsSettings) super.serverNoContextTakeover(serverNoContextTakeover);
  }

  @Override
  public WsSettings clientNoContextTakeover(boolean clientNoContextTakeover) {
    return (WsSettings) super.clientNoContextTakeover(clientNoContextTakeover);
  }

  @Override
  public WsSettings serverMaxWindowBits(int serverMaxWindowBits) {
    return (WsSettings) super.serverMaxWindowBits(serverMaxWindowBits);
  }

  @Override
  public WsSettings clientMaxWindowBits(int clientMaxWindowBits) {
    return (WsSettings) super.clientMaxWindowBits(clientMaxWindowBits);
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected WsSettings copy(HttpSettings httpSettings, int maxFrameSize, int maxMessageSize,
                            int serverCompressionLevel, int clientCompressionLevel,
                            boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                            int serverMaxWindowBits, int clientMaxWindowBits) {
    return new WsSettings(httpSettings, maxFrameSize, maxMessageSize,
                          serverCompressionLevel, clientCompressionLevel,
                          serverNoContextTakeover, clientNoContextTakeover,
                          serverMaxWindowBits, clientMaxWindowBits);
  }

  @Override
  protected WsSettings copy(int maxFrameSize, int maxMessageSize,
                            int serverCompressionLevel, int clientCompressionLevel,
                            boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                            int serverMaxWindowBits, int clientMaxWindowBits) {
    return copy(this.httpSettings, maxFrameSize, maxMessageSize,
                serverCompressionLevel, clientCompressionLevel,
                serverNoContextTakeover, clientNoContextTakeover,
                serverMaxWindowBits, clientMaxWindowBits);
  }

  public boolean canEqual(Object other) {
    return other instanceof WsSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsSettings) {
      final WsSettings that = (WsSettings) other;
      return that.canEqual(this)
          && this.httpSettings.equals(that.httpSettings)
          && this.maxFrameSize == that.maxFrameSize
          && this.maxMessageSize == that.maxMessageSize
          && this.serverCompressionLevel == that.serverCompressionLevel
          && this.clientCompressionLevel == that.clientCompressionLevel
          && this.serverNoContextTakeover == that.serverNoContextTakeover
          && this.clientNoContextTakeover == that.clientNoContextTakeover
          && this.serverMaxWindowBits == that.serverMaxWindowBits
          && this.clientMaxWindowBits == that.clientMaxWindowBits;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WsSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, this.httpSettings.hashCode()),
        this.maxFrameSize), this.maxMessageSize), this.serverCompressionLevel), this.clientCompressionLevel),
        Murmur3.hash(this.serverNoContextTakeover)), Murmur3.hash(this.clientNoContextTakeover)),
        this.serverMaxWindowBits), this.clientMaxWindowBits));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WsSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("httpSettings").write('(').debug(this.httpSettings).write(')')
        .write('.').write("maxFrameSize").write('(').debug(this.maxFrameSize).write(')')
        .write('.').write("maxMessageSize").write('(').debug(this.maxMessageSize).write(')')
        .write('.').write("serverCompressionLevel").write('(').debug(this.serverCompressionLevel).write(')')
        .write('.').write("clientCompressionLevel").write('(').debug(this.clientCompressionLevel).write(')')
        .write('.').write("serverNoContextTakeover").write('(').debug(this.serverNoContextTakeover).write(')')
        .write('.').write("clientNoContextTakeover").write('(').debug(this.clientNoContextTakeover).write(')')
        .write('.').write("serverMaxWindowBits").write('(').debug(this.serverMaxWindowBits).write(')')
        .write('.').write("clientMaxWindowBits").write('(').debug(this.clientMaxWindowBits).write(')');
  }

  private static int hashSeed;

  private static WsSettings standard;

  private static Form<WsSettings> form;

  public static WsSettings standard() {
    if (standard == null) {
      final WsEngineSettings engineSettings = WsEngineSettings.standard();
      standard = new WsSettings(HttpSettings.standard(),
                                engineSettings.maxFrameSize(), engineSettings.maxMessageSize(),
                                engineSettings.serverCompressionLevel(), engineSettings.clientCompressionLevel(),
                                engineSettings.serverNoContextTakeover(), engineSettings.clientNoContextTakeover(),
                                engineSettings.serverMaxWindowBits(), engineSettings.clientMaxWindowBits());
    }
    return standard;
  }

  public static WsSettings noCompression() {
    return standard().engineSettings(WsEngineSettings.noCompression());
  }

  public static WsSettings defaultCompression() {
    return standard().engineSettings(WsEngineSettings.defaultCompression());
  }

  public static WsSettings fastestCompression() {
    return standard().engineSettings(WsEngineSettings.fastestCompression());
  }

  public static WsSettings bestCompression() {
    return standard().engineSettings(WsEngineSettings.bestCompression());
  }

  public static WsSettings from(HttpSettings httpSettings) {
    return standard().httpSettings(httpSettings);
  }

  public static WsSettings from(IpSettings ipSettings) {
    return standard().ipSettings(ipSettings);
  }

  public static WsSettings from(WsEngineSettings engineSettings) {
    if (engineSettings instanceof WsSettings) {
      return (WsSettings) engineSettings;
    } else {
      return standard().engineSettings(engineSettings);
    }
  }

  @Kind
  public static Form<WsSettings> form() {
    if (form == null) {
      form = new WsSettingsForm();
    }
    return form;
  }
}

final class WsSettingsForm extends Form<WsSettings> {
  @Override
  public WsSettings unit() {
    return WsSettings.standard();
  }

  @Override
  public Class<?> type() {
    return WsSettings.class;
  }

  @Override
  public Item mold(WsSettings settings) {
    if (settings != null) {
      final WsSettings standard = WsSettings.standard();
      final Record ws = Record.create(9).attr("ws");
      if (settings.maxFrameSize() != standard.maxFrameSize()) {
        ws.slot("maxFrameSize", settings.maxFrameSize());
      }
      if (settings.maxMessageSize() != standard.maxMessageSize()) {
        ws.slot("maxMessageSize", settings.maxMessageSize());
      }
      if (settings.serverCompressionLevel() != standard.serverCompressionLevel()) {
        ws.slot("serverCompressionLevel", settings.serverCompressionLevel());
      }
      if (settings.clientCompressionLevel() != standard.clientCompressionLevel()) {
        ws.slot("clientCompressionLevel", settings.clientCompressionLevel());
      }
      if (settings.serverNoContextTakeover() != standard.serverNoContextTakeover()) {
        ws.slot("serverNoContextTakeover", settings.serverNoContextTakeover());
      }
      if (settings.clientNoContextTakeover() != standard.clientNoContextTakeover()) {
        ws.slot("clientNoContextTakeover", settings.clientNoContextTakeover());
      }
      if (settings.serverMaxWindowBits() != standard.serverMaxWindowBits()) {
        ws.slot("serverMaxWindowBits", settings.serverMaxWindowBits());
      }
      if (settings.clientMaxWindowBits() != standard.clientMaxWindowBits()) {
        ws.slot("clientMaxWindowBits", settings.clientMaxWindowBits());
      }
      return Record.of(ws).concat(HttpSettings.form().mold(settings.httpSettings));
    } else {
      return Item.extant();
    }
  }

  @Override
  public WsSettings cast(Item item) {
    final Value value = item.toValue();
    final WsSettings standard = WsSettings.standard();
    final HttpSettings httpSettings = HttpSettings.form().cast(item);
    int maxFrameSize = standard.maxFrameSize();
    int maxMessageSize = standard.maxMessageSize();
    int serverCompressionLevel = standard.serverCompressionLevel();
    int clientCompressionLevel = standard.clientCompressionLevel();
    boolean serverNoContextTakeover = standard.serverNoContextTakeover();
    boolean clientNoContextTakeover = standard.clientNoContextTakeover();
    int serverMaxWindowBits = standard.serverMaxWindowBits();
    int clientMaxWindowBits = standard.clientMaxWindowBits();
    for (Item member : value) {
      if (member.getAttr("ws").isDefined() || member.getAttr("websocket").isDefined()) {
        maxFrameSize = member.get("maxFrameSize").intValue(maxFrameSize);
        maxMessageSize = member.get("maxMessageSize").intValue(maxMessageSize);
        serverCompressionLevel = member.get("serverCompressionLevel").intValue(serverCompressionLevel);
        clientCompressionLevel = member.get("clientCompressionLevel").intValue(clientCompressionLevel);
        serverNoContextTakeover = member.get("serverNoContextTakeover").booleanValue(serverNoContextTakeover);
        clientNoContextTakeover = member.get("clientNoContextTakeover").booleanValue(clientNoContextTakeover);
        serverMaxWindowBits = member.get("serverMaxWindowBits").intValue(serverMaxWindowBits);
        clientMaxWindowBits = member.get("clientMaxWindowBits").intValue(clientMaxWindowBits);
      }
    }
    return new WsSettings(httpSettings, maxFrameSize, maxMessageSize,
                          serverCompressionLevel, clientCompressionLevel,
                          serverNoContextTakeover, clientNoContextTakeover,
                          serverMaxWindowBits, clientMaxWindowBits);
  }
}
