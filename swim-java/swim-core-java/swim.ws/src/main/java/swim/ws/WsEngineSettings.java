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

package swim.ws;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.WebSocketExtension;
import swim.http.WebSocketParam;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Murmur3;

public class WsEngineSettings implements Debug {
  protected final int maxFrameSize;
  protected final int maxMessageSize;
  protected final int serverCompressionLevel;
  protected final int clientCompressionLevel;
  protected final boolean serverNoContextTakeover;
  protected final boolean clientNoContextTakeover;
  protected final int serverMaxWindowBits;
  protected final int clientMaxWindowBits;

  public WsEngineSettings(int maxFrameSize, int maxMessageSize,
                          int serverCompressionLevel, int clientCompressionLevel,
                          boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                          int serverMaxWindowBits, int clientMaxWindowBits) {
    this.maxFrameSize = maxFrameSize;
    this.maxMessageSize = maxMessageSize;
    this.serverCompressionLevel = serverCompressionLevel;
    this.clientCompressionLevel = clientCompressionLevel;
    this.serverNoContextTakeover = serverNoContextTakeover;
    this.clientNoContextTakeover = clientNoContextTakeover;
    this.serverMaxWindowBits = serverMaxWindowBits;
    this.clientMaxWindowBits = clientMaxWindowBits;
  }

  public final int maxFrameSize() {
    return this.maxFrameSize;
  }

  public WsEngineSettings maxFrameSize(int maxFrameSize) {
    return copy(maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final int maxMessageSize() {
    return this.maxMessageSize;
  }

  public WsEngineSettings maxMessageSize(int maxMessageSize) {
    return copy(this.maxFrameSize, maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final int serverCompressionLevel() {
    return this.serverCompressionLevel;
  }

  public WsEngineSettings serverCompressionLevel(int serverCompressionLevel) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final int clientCompressionLevel() {
    return this.clientCompressionLevel;
  }

  public WsEngineSettings clientCompressionLevel(int clientCompressionLevel) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public WsEngineSettings compressionLevel(int serverCompressionLevel, int clientCompressionLevel) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                serverCompressionLevel, clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final boolean serverNoContextTakeover() {
    return this.serverNoContextTakeover;
  }

  public WsEngineSettings serverNoContextTakeover(boolean serverNoContextTakeover) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final boolean clientNoContextTakeover() {
    return this.clientNoContextTakeover;
  }

  public WsEngineSettings clientNoContextTakeover(boolean clientNoContextTakeover) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, clientNoContextTakeover,
                this.serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final int serverMaxWindowBits() {
    return this.serverMaxWindowBits;
  }

  public WsEngineSettings serverMaxWindowBits(int serverMaxWindowBits) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                serverMaxWindowBits, this.clientMaxWindowBits);
  }

  public final int clientMaxWindowBits() {
    return this.clientMaxWindowBits;
  }

  public WsEngineSettings clientMaxWindowBits(int clientMaxWindowBits) {
    return copy(this.maxFrameSize, this.maxMessageSize,
                this.serverCompressionLevel, this.clientCompressionLevel,
                this.serverNoContextTakeover, this.clientNoContextTakeover,
                this.serverMaxWindowBits, clientMaxWindowBits);
  }

  public FingerTrieSeq<WebSocketExtension> extensions() {
    if (serverCompressionLevel != 0 && clientCompressionLevel != 0) {
      final WebSocketExtension permessageDeflate = WebSocketExtension.permessageDeflate(
          this.serverNoContextTakeover, this.clientNoContextTakeover,
          this.serverMaxWindowBits, 0);
      return FingerTrieSeq.of(permessageDeflate);
    }
    return FingerTrieSeq.empty();
  }

  public FingerTrieSeq<WebSocketExtension> acceptExtensions(FingerTrieSeq<WebSocketExtension> requestExtensions) {
    WebSocketExtension permessageDeflate = null;
    for (WebSocketExtension extension : requestExtensions) {
      if ("permessage-deflate".equals(extension.name()) && permessageDeflate == null
          && this.serverCompressionLevel != 0 && this.clientCompressionLevel != 0) {
        boolean requestServerNoContextTakeover = false;
        boolean requestClientNoContextTakeover = false;
        int requestServerMaxWindowBits = 15;
        int requestClientMaxWindowBits = 15;
        for (WebSocketParam param : extension.params()) {
          final String key = param.key();
          final String value = param.value();
          if ("server_no_context_takeover".equals(key)) {
            requestServerNoContextTakeover = true;
          } else if ("client_no_context_takeover".equals(key)) {
            requestClientNoContextTakeover = true;
          } else if ("server_max_window_bits".equals(key)) {
            try {
              requestServerMaxWindowBits = Integer.parseInt(value);
            } catch (NumberFormatException error) {
              throw new WsException("invalid permessage-deflate; " + param.toHttp());
            }
          } else if ("client_max_window_bits".equals(key)) {
            if (value.isEmpty()) {
              requestClientMaxWindowBits = 0;
            } else {
              try {
                requestClientMaxWindowBits = Integer.parseInt(value);
              } catch (NumberFormatException error) {
                throw new WsException("invalid permessage-deflate; " + param.toHttp());
              }
            }
          } else {
            throw new WsException("invalid permessage-deflate; " + param.toHttp());
          }
        }
        if (requestClientMaxWindowBits != 0 && clientMaxWindowBits != 15) {
          continue;
        } else if (requestClientMaxWindowBits == 0) {
          requestClientMaxWindowBits = clientMaxWindowBits;
        }
        permessageDeflate = WebSocketExtension.permessageDeflate(
            requestServerNoContextTakeover || this.serverNoContextTakeover,
            requestClientNoContextTakeover || this.clientNoContextTakeover,
            Math.min(requestServerMaxWindowBits, this.serverMaxWindowBits),
            Math.min(requestClientMaxWindowBits, this.clientMaxWindowBits));
      }
    }
    FingerTrieSeq<WebSocketExtension> responseExtensions = FingerTrieSeq.empty();
    if (permessageDeflate != null) {
      responseExtensions = responseExtensions.appended(permessageDeflate);
    }
    return responseExtensions;
  }

  public WsRequest handshakeRequest(Uri uri, FingerTrieSeq<String> protocols, FingerTrieSeq<HttpHeader> headers) {
    return WsRequest.from(uri, protocols, extensions(), headers);
  }

  public WsRequest handshakeRequest(Uri uri, FingerTrieSeq<String> protocols, HttpHeader... headers) {
    return handshakeRequest(uri, protocols, FingerTrieSeq.of(headers));
  }

  public WsRequest handshakeRequest(Uri uri, FingerTrieSeq<String> protocols) {
    return handshakeRequest(uri, protocols, FingerTrieSeq.<HttpHeader>empty());
  }

  public WsRequest handshakeRequest(Uri uri, HttpHeader... headers) {
    return handshakeRequest(uri, FingerTrieSeq.<String>empty(), FingerTrieSeq.of(headers));
  }

  public WsRequest handshakeRequest(Uri uri) {
    return handshakeRequest(uri, FingerTrieSeq.<String>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public Value toValue() {
    return engineForm().mold(this).toValue();
  }

  protected WsEngineSettings copy(int maxFrameSize, int maxMessageSize,
                                  int serverCompressionLevel, int clientCompressionLevel,
                                  boolean serverNoContextTakeover, boolean clientNoContextTakeover,
                                  int serverMaxWindowBits, int clientMaxWindowBits) {
    return new WsEngineSettings(maxFrameSize, maxMessageSize,
                                serverCompressionLevel, clientCompressionLevel,
                                serverNoContextTakeover, clientNoContextTakeover,
                                serverMaxWindowBits, clientMaxWindowBits);
  }

  public boolean canEqual(Object other) {
    return other instanceof WsEngineSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsEngineSettings) {
      final WsEngineSettings that = (WsEngineSettings) other;
      return that.canEqual(this)
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
      hashSeed = Murmur3.seed(WsEngineSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, this.maxFrameSize), this.maxMessageSize),
        this.serverCompressionLevel), this.clientCompressionLevel),
        Murmur3.hash(this.serverNoContextTakeover)), Murmur3.hash(this.clientNoContextTakeover)),
        this.serverMaxWindowBits), this.clientMaxWindowBits));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WsEngineSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("maxFrameSize").write('(').debug(this.maxFrameSize).write(')')
        .write('.').write("maxMessageSize").write('(').debug(this.maxMessageSize).write(')')
        .write('.').write("serverCompressionLevel").write('(').debug(this.serverCompressionLevel).write(')')
        .write('.').write("clientCompressionLevel").write('(').debug(this.clientCompressionLevel).write(')')
        .write('.').write("serverNoContextTakeover").write('(').debug(this.serverNoContextTakeover).write(')')
        .write('.').write("clientNoContextTakeover").write('(').debug(this.clientNoContextTakeover).write(')')
        .write('.').write("serverMaxWindowBits").write('(').debug(this.serverMaxWindowBits).write(')')
        .write('.').write("clientMaxWindowBits").write('(').debug(this.clientMaxWindowBits).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static WsEngineSettings standard;

  private static Form<WsEngineSettings> engineForm;

  public static WsEngineSettings standard() {
    if (standard == null) {
      int maxFrameSize;
      try {
        maxFrameSize = Integer.parseInt(System.getProperty("swim.ws.max.frame.size"));
      } catch (NumberFormatException error) {
        maxFrameSize = 16 * 1024 * 1024;
      }

      int maxMessageSize;
      try {
        maxMessageSize = Integer.parseInt(System.getProperty("swim.ws.max.message.size"));
      } catch (NumberFormatException error) {
        maxMessageSize = 16 * 1024 * 1024;
      }

      int serverCompressionLevel;
      try {
        serverCompressionLevel = Integer.parseInt(System.getProperty("swim.ws.server.compression.level"));
      } catch (NumberFormatException error) {
        serverCompressionLevel = 0;
      }

      int clientCompressionLevel;
      try {
        clientCompressionLevel = Integer.parseInt(System.getProperty("swim.ws.client.compression.level"));
      } catch (NumberFormatException error) {
        clientCompressionLevel = 0;
      }

      final boolean serverNoContextTakeover = Boolean.parseBoolean(System.getProperty("swim.ws.server.no.context.takeover"));

      final boolean clientNoContextTakeover = Boolean.parseBoolean(System.getProperty("swim.ws.client.no.context.takeover"));

      int serverMaxWindowBits;
      try {
        serverMaxWindowBits = Integer.parseInt(System.getProperty("swim.ws.server.max.window.bits"));
      } catch (NumberFormatException error) {
        serverMaxWindowBits = 15;
      }

      int clientMaxWindowBits;
      try {
        clientMaxWindowBits = Integer.parseInt(System.getProperty("swim.ws.client.max.window.bits"));
      } catch (NumberFormatException error) {
        clientMaxWindowBits = 15;
      }

      standard = new WsEngineSettings(maxFrameSize, maxMessageSize,
                                      serverCompressionLevel, clientCompressionLevel,
                                      serverNoContextTakeover, clientNoContextTakeover,
                                      serverMaxWindowBits, clientMaxWindowBits);
    }
    return standard;
  }

  public static WsEngineSettings noCompression() {
    return standard().compressionLevel(0, 0);
  }

  public static WsEngineSettings defaultCompression() {
    return standard().compressionLevel(-1, -1);
  }

  public static WsEngineSettings fastestCompression() {
    return standard().compressionLevel(1, 1);
  }

  public static WsEngineSettings bestCompression() {
    return standard().compressionLevel(9, 9);
  }

  @Kind
  public static Form<WsEngineSettings> engineForm() {
    if (engineForm == null) {
      engineForm = new WsEngineSettingsForm();
    }
    return engineForm;
  }
}

final class WsEngineSettingsForm extends Form<WsEngineSettings> {
  @Override
  public WsEngineSettings unit() {
    return WsEngineSettings.standard();
  }

  @Override
  public Class<?> type() {
    return WsEngineSettings.class;
  }

  @Override
  public Item mold(WsEngineSettings settings) {
    if (settings != null) {
      final WsEngineSettings standard = WsEngineSettings.standard();
      final Record record = Record.create(8);
      if (settings.maxFrameSize != standard.maxFrameSize) {
        record.slot("maxFrameSize", settings.maxFrameSize);
      }
      if (settings.maxMessageSize != standard.maxMessageSize) {
        record.slot("maxMessageSize", settings.maxMessageSize);
      }
      if (settings.serverCompressionLevel != standard.serverCompressionLevel) {
        record.slot("serverCompressionLevel", settings.serverCompressionLevel);
      }
      if (settings.clientCompressionLevel != standard.clientCompressionLevel) {
        record.slot("clientCompressionLevel", settings.clientCompressionLevel);
      }
      if (settings.serverNoContextTakeover != standard.serverNoContextTakeover) {
        record.slot("serverNoContextTakeover", settings.serverNoContextTakeover);
      }
      if (settings.clientNoContextTakeover != standard.clientNoContextTakeover) {
        record.slot("clientNoContextTakeover", settings.clientNoContextTakeover);
      }
      if (settings.serverMaxWindowBits != standard.serverMaxWindowBits) {
        record.slot("serverMaxWindowBits", settings.serverMaxWindowBits);
      }
      if (settings.clientMaxWindowBits != standard.clientMaxWindowBits) {
        record.slot("clientMaxWindowBits", settings.clientMaxWindowBits);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public WsEngineSettings cast(Item item) {
    final Value value = item.toValue();
    final WsEngineSettings standard = WsEngineSettings.standard();
    final int maxFrameSize = value.get("maxFrameSize").intValue(standard.maxFrameSize);
    final int maxMessageSize = value.get("maxMessageSize").intValue(standard.maxMessageSize);
    final int serverCompressionLevel = value.get("serverCompressionLevel").intValue(standard.serverCompressionLevel);
    final int clientCompressionLevel = value.get("clientCompressionLevel").intValue(standard.clientCompressionLevel);
    final boolean serverNoContextTakeover = value.get("serverNoContextTakeover").booleanValue(standard.serverNoContextTakeover);
    final boolean clientNoContextTakeover = value.get("clientNoContextTakeover").booleanValue(standard.clientNoContextTakeover);
    final int serverMaxWindowBits = value.get("serverMaxWindowBits").intValue(standard.serverMaxWindowBits);
    final int clientMaxWindowBits = value.get("clientMaxWindowBits").intValue(standard.clientMaxWindowBits);
    return new WsEngineSettings(maxFrameSize, maxMessageSize,
                                serverCompressionLevel, clientCompressionLevel,
                                serverNoContextTakeover, clientNoContextTakeover,
                                serverMaxWindowBits, clientMaxWindowBits);
  }
}
