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
                    int serverMaxWindowBits, int clientMaxWindowBits, boolean autoClose) {
    super(maxFrameSize, maxMessageSize, serverCompressionLevel, clientCompressionLevel,
         serverNoContextTakeover, clientNoContextTakeover, serverMaxWindowBits, clientMaxWindowBits, autoClose);
    this.httpSettings = httpSettings;
  }

  public final HttpSettings httpSettings() {
    return this.httpSettings;
  }

  public WsSettings httpSettings(HttpSettings httpSettings) {
    return this.copy(httpSettings, this.maxFrameSize, this.maxMessageSize,
                     this.serverCompressionLevel, this.clientCompressionLevel,
                     this.serverNoContextTakeover, this.clientNoContextTakeover,
                     this.serverMaxWindowBits, this.clientMaxWindowBits, this.autoClose);
  }

  public final IpSettings ipSettings() {
    return this.httpSettings.ipSettings();
  }

  public WsSettings ipSettings(IpSettings ipSettings) {
    return this.httpSettings(this.httpSettings.ipSettings(ipSettings));
  }

  public final TlsSettings tlsSettings() {
    return this.httpSettings.tlsSettings();
  }

  public WsSettings tlsSettings(TlsSettings tlsSettings) {
    return this.httpSettings(this.httpSettings.tlsSettings(tlsSettings));
  }

  public final TcpSettings tcpSettings() {
    return this.httpSettings.tcpSettings();
  }

  public WsSettings tcpSettings(TcpSettings tcpSettings) {
    return this.httpSettings(this.httpSettings.tcpSettings(tcpSettings));
  }

  public WsSettings engineSettings(WsEngineSettings engineSettings) {
    return this.copy(engineSettings.maxFrameSize(), engineSettings.maxMessageSize(),
                     engineSettings.serverCompressionLevel(), engineSettings.clientCompressionLevel(),
                     engineSettings.serverNoContextTakeover(), engineSettings.clientNoContextTakeover(),
                     engineSettings.serverMaxWindowBits(), engineSettings.clientMaxWindowBits(), engineSettings.autoClose());
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
  public WsSettings autoClose(boolean autoClose) {
    return (WsSettings) super.autoClose(autoClose);
  }

  @Override
  public Value toValue() {
    return WsSettings.form().mold(this).toValue();
  }

  protected WsSettings copy(HttpSettings httpSettings, int maxFrameSize, int maxMessageSize,
                            int serverCompressionLevel, int clientCompressionLevel,
                            boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                            int serverMaxWindowBits, int clientMaxWindowBits, boolean autoClose) {
    return new WsSettings(httpSettings, maxFrameSize, maxMessageSize,
                          serverCompressionLevel, clientCompressionLevel,
                          serverNoContextTakeover, clientNoContextTakeover,
                          serverMaxWindowBits, clientMaxWindowBits, autoClose);
  }

  @Override
  protected WsSettings copy(int maxFrameSize, int maxMessageSize,
                            int serverCompressionLevel, int clientCompressionLevel,
                            boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                            int serverMaxWindowBits, int clientMaxWindowBits, boolean autoClose) {
    return this.copy(this.httpSettings, maxFrameSize, maxMessageSize,
                     serverCompressionLevel, clientCompressionLevel,
                     serverNoContextTakeover, clientNoContextTakeover,
                     serverMaxWindowBits, clientMaxWindowBits, autoClose);
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
          && this.clientMaxWindowBits == that.clientMaxWindowBits
          && this.autoClose == that.autoClose;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsSettings.hashSeed == 0) {
      WsSettings.hashSeed = Murmur3.seed(WsSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(WsSettings.hashSeed, this.httpSettings.hashCode()),
        this.maxFrameSize), this.maxMessageSize), this.serverCompressionLevel), this.clientCompressionLevel),
        Murmur3.hash(this.serverNoContextTakeover)), Murmur3.hash(this.clientNoContextTakeover)),
        this.serverMaxWindowBits), this.clientMaxWindowBits), Murmur3.hash(this.autoClose)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsSettings").write('.').write("standard").write('(').write(')')
                   .write('.').write("httpSettings").write('(').debug(this.httpSettings).write(')')
                   .write('.').write("maxFrameSize").write('(').debug(this.maxFrameSize).write(')')
                   .write('.').write("maxMessageSize").write('(').debug(this.maxMessageSize).write(')')
                   .write('.').write("serverCompressionLevel").write('(').debug(this.serverCompressionLevel).write(')')
                   .write('.').write("clientCompressionLevel").write('(').debug(this.clientCompressionLevel).write(')')
                   .write('.').write("serverNoContextTakeover").write('(').debug(this.serverNoContextTakeover).write(')')
                   .write('.').write("clientNoContextTakeover").write('(').debug(this.clientNoContextTakeover).write(')')
                   .write('.').write("serverMaxWindowBits").write('(').debug(this.serverMaxWindowBits).write(')')
                   .write('.').write("clientMaxWindowBits").write('(').debug(this.clientMaxWindowBits).write(')')
                   .write('.').write("autoClose").write('(').debug(this.autoClose).write(')');
    return output;
  }

  private static WsSettings standard;

  public static WsSettings standard() {
    if (WsSettings.standard == null) {
      final WsEngineSettings engineSettings = WsEngineSettings.standard();
      WsSettings.standard = new WsSettings(HttpSettings.standard(), engineSettings.maxFrameSize(), engineSettings.maxMessageSize(),
                                           engineSettings.serverCompressionLevel(), engineSettings.clientCompressionLevel(),
                                           engineSettings.serverNoContextTakeover(), engineSettings.clientNoContextTakeover(),
                                           engineSettings.serverMaxWindowBits(), engineSettings.clientMaxWindowBits(), engineSettings.autoClose());
    }
    return WsSettings.standard;
  }

  public static WsSettings noCompression() {
    return WsSettings.standard().engineSettings(WsEngineSettings.noCompression());
  }

  public static WsSettings defaultCompression() {
    return WsSettings.standard().engineSettings(WsEngineSettings.defaultCompression());
  }

  public static WsSettings fastestCompression() {
    return WsSettings.standard().engineSettings(WsEngineSettings.fastestCompression());
  }

  public static WsSettings bestCompression() {
    return WsSettings.standard().engineSettings(WsEngineSettings.bestCompression());
  }

  public static WsSettings create(HttpSettings httpSettings) {
    return WsSettings.standard().httpSettings(httpSettings);
  }

  public static WsSettings create(IpSettings ipSettings) {
    return WsSettings.standard().ipSettings(ipSettings);
  }

  public static WsSettings from(WsEngineSettings engineSettings) {
    if (engineSettings instanceof WsSettings) {
      return (WsSettings) engineSettings;
    } else {
      return WsSettings.standard().engineSettings(engineSettings);
    }
  }

  private static Form<WsSettings> form;

  @Kind
  public static Form<WsSettings> form() {
    if (WsSettings.form == null) {
      WsSettings.form = new WsSettingsForm();
    }
    return WsSettings.form;
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
      if (settings.autoClose() != standard.autoClose()) {
        ws.slot("autoClose", settings.autoClose());
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
    boolean autoClose = standard.autoClose();
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
        autoClose = member.get("autoClose").booleanValue(autoClose);

      }
    }
    return new WsSettings(httpSettings, maxFrameSize, maxMessageSize,
                          serverCompressionLevel, clientCompressionLevel,
                          serverNoContextTakeover, clientNoContextTakeover,
                          serverMaxWindowBits, clientMaxWindowBits, autoClose);
  }

}
