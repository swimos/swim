// Copyright 2015-2023 Swim.inc
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

import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.FingerTrieList;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * WebSocket engine configuration options.
 */
@Public
@Since("5.0")
public class WsEngineOptions implements ToSource {

  protected final int maxFrameSize;
  protected final int maxMessageSize;
  protected final int clientCompressionLevel;
  protected final int serverCompressionLevel;
  protected final boolean clientNoContextTakeover;
  protected final boolean serverNoContextTakeover;
  protected final int clientMaxWindowBits;
  protected final int serverMaxWindowBits;
  protected final int deflateBufferSize;
  protected final int inflateBufferSize;

  public WsEngineOptions(int maxFrameSize, int maxMessageSize,
                         int clientCompressionLevel, int serverCompressionLevel,
                         boolean clientNoContextTakeover, boolean serverNoContextTakeover,
                         int clientMaxWindowBits, int serverMaxWindowBits,
                         int deflateBufferSize, int inflateBufferSize) {
    this.maxFrameSize = maxFrameSize;
    this.maxMessageSize = maxMessageSize;
    this.clientCompressionLevel = clientCompressionLevel;
    this.serverCompressionLevel = serverCompressionLevel;
    this.clientNoContextTakeover = clientNoContextTakeover;
    this.serverNoContextTakeover = serverNoContextTakeover;
    this.clientMaxWindowBits = clientMaxWindowBits;
    this.serverMaxWindowBits = serverMaxWindowBits;
    this.deflateBufferSize = deflateBufferSize;
    this.inflateBufferSize = inflateBufferSize;
  }

  public final int maxFrameSize() {
    return this.maxFrameSize;
  }

  public WsEngineOptions maxFrameSize(int maxFrameSize) {
    return this.copy(maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final int maxMessageSize() {
    return this.maxMessageSize;
  }

  public WsEngineOptions maxMessageSize(int maxMessageSize) {
    return this.copy(this.maxFrameSize, maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final int clientCompressionLevel() {
    return this.clientCompressionLevel;
  }

  public WsEngineOptions clientCompressionLevel(int clientCompressionLevel) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final int serverCompressionLevel() {
    return this.serverCompressionLevel;
  }

  public WsEngineOptions serverCompressionLevel(int serverCompressionLevel) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public WsEngineOptions compressionLevel(int clientCompressionLevel, int serverCompressionLevel) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     clientCompressionLevel, serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final boolean clientNoContextTakeover() {
    return this.clientNoContextTakeover;
  }

  public WsEngineOptions clientNoContextTakeover(boolean clientNoContextTakeover) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final boolean serverNoContextTakeover() {
    return this.serverNoContextTakeover;
  }

  public WsEngineOptions serverNoContextTakeover(boolean serverNoContextTakeover) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final int clientMaxWindowBits() {
    return this.clientMaxWindowBits;
  }

  public WsEngineOptions clientMaxWindowBits(int clientMaxWindowBits) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final int serverMaxWindowBits() {
    return this.serverMaxWindowBits;
  }

  public WsEngineOptions serverMaxWindowBits(int serverMaxWindowBits) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, serverMaxWindowBits,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  public final int deflateBufferSize() {
    return this.deflateBufferSize;
  }

  public WsEngineOptions deflateBufferSize(int deflateBufferSize) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     deflateBufferSize, this.inflateBufferSize);
  }

  public final int inflateBufferSize() {
    return this.inflateBufferSize;
  }

  public WsEngineOptions inflateBufferSize(int inflateBufferSize) {
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     this.clientCompressionLevel, this.serverCompressionLevel,
                     this.clientNoContextTakeover, this.serverNoContextTakeover,
                     this.clientMaxWindowBits, this.serverMaxWindowBits,
                     this.deflateBufferSize, inflateBufferSize);
  }

  public FingerTrieList<WsExtension> extensions() {
    FingerTrieList<WsExtension> extensions = FingerTrieList.empty();
    if (this.serverCompressionLevel != 0 && this.clientCompressionLevel != 0) {
      extensions = extensions.appended(WsExtension.permessageDeflate(this.serverNoContextTakeover,
                                                                     this.clientNoContextTakeover,
                                                                     this.serverMaxWindowBits, 0));
    }
    return extensions;
  }

  public WsEngineOptions extensions(FingerTrieList<WsExtension> extensions) {
    for (WsExtension extension : extensions) {
      final String name = extension.name();
      if (("permessage-deflate".equals(name) || "x-webkit-deflate-frame".equals(name))
          && this.serverCompressionLevel != 0 && this.clientCompressionLevel != 0) {
        boolean serverNoContextTakeover = false;
        boolean clientNoContextTakeover = false;
        int serverMaxWindowBits = 15;
        int clientMaxWindowBits = 15;
        for (Map.Entry<String, String> param : extension.params()) {
          final String key = param.getKey();
          final String value = param.getValue();
          if ("server_no_context_takeover".equals(key)) {
            serverNoContextTakeover = true;
          } else if ("client_no_context_takeover".equals(key)) {
            clientNoContextTakeover = true;
          } else if ("server_max_window_bits".equals(key)) {
            try {
              serverMaxWindowBits = Integer.parseInt(value);
            } catch (NumberFormatException cause) {
              throw new IllegalArgumentException("Invalid permessage-deflate " + name + " parameter: " + key + "=" + value, cause);
            }
            if (serverMaxWindowBits < 8 || serverMaxWindowBits > 15) {
              throw new IllegalArgumentException("Invalid permessage-deflate " + name + " parameter: " + key + "=" + value);
            }
          } else if ("client_max_window_bits".equals(key)) {
            if (value == null) {
              clientMaxWindowBits = 0;
            } else {
              try {
                clientMaxWindowBits = Integer.parseInt(value);
              } catch (NumberFormatException error) {
                throw new IllegalArgumentException("Invalid permessage-deflate " + name + " parameter: " + key + "=" + value);
              }
              if (clientMaxWindowBits < 8 || clientMaxWindowBits > 15) {
                throw new IllegalArgumentException("Invalid permessage-deflate " + name + " parameter: " + key + "=" + value);
              }
            }
          } else {
            throw new IllegalArgumentException("Unknown permessage-deflate " + name + " parameter: " + key + "=" + value);
          }
        }
        return this.copy(this.maxFrameSize, this.maxMessageSize,
                         this.serverCompressionLevel, this.clientCompressionLevel,
                         serverNoContextTakeover, clientNoContextTakeover,
                         serverMaxWindowBits, clientMaxWindowBits,
                         this.deflateBufferSize, this.inflateBufferSize);
      }
    }
    return this.copy(this.maxFrameSize, this.maxMessageSize,
                     0, 0, false, false, 15, 15,
                     this.deflateBufferSize, this.inflateBufferSize);
  }

  protected WsEngineOptions copy(int maxFrameSize, int maxMessageSize,
                                 int clientCompressionLevel, int serverCompressionLevel,
                                 boolean clientNoContextTakeover, boolean serverNoContextTakeover,
                                 int clientMaxWindowBits, int serverMaxWindowBits,
                                 int deflateBufferSize, int inflateBufferSize) {
    return new WsEngineOptions(maxFrameSize, maxMessageSize,
                               clientCompressionLevel, serverCompressionLevel,
                               clientNoContextTakeover, serverNoContextTakeover,
                               clientMaxWindowBits, serverMaxWindowBits,
                               deflateBufferSize, inflateBufferSize);
  }

  public boolean canEqual(Object other) {
    return other instanceof WsEngineOptions;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsEngineOptions) {
      final WsEngineOptions that = (WsEngineOptions) other;
      return that.canEqual(this)
          && this.maxFrameSize == that.maxFrameSize
          && this.maxMessageSize == that.maxMessageSize
          && this.clientCompressionLevel == that.clientCompressionLevel
          && this.serverCompressionLevel == that.serverCompressionLevel
          && this.clientNoContextTakeover == that.clientNoContextTakeover
          && this.serverNoContextTakeover == that.serverNoContextTakeover
          && this.clientMaxWindowBits == that.clientMaxWindowBits
          && this.serverMaxWindowBits == that.serverMaxWindowBits
          && this.deflateBufferSize == that.deflateBufferSize
          && this.inflateBufferSize == that.inflateBufferSize;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsEngineOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, this.maxFrameSize), this.maxMessageSize),
        this.clientCompressionLevel), this.serverCompressionLevel),
        Murmur3.hash(this.clientNoContextTakeover)),
        Murmur3.hash(this.serverNoContextTakeover)),
        this.clientMaxWindowBits), this.serverMaxWindowBits),
        this.deflateBufferSize), this.inflateBufferSize));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsEngineOptions", "standard").endInvoke()
            .beginInvoke("maxFrameSize").appendArgument(this.maxFrameSize).endInvoke()
            .beginInvoke("maxMessageSize").appendArgument(this.maxMessageSize).endInvoke()
            .beginInvoke("clientCompressionLevel").appendArgument(this.clientCompressionLevel).endInvoke()
            .beginInvoke("serverCompressionLevel").appendArgument(this.serverCompressionLevel).endInvoke()
            .beginInvoke("clientNoContextTakeover").appendArgument(this.clientNoContextTakeover).endInvoke()
            .beginInvoke("serverNoContextTakeover").appendArgument(this.serverNoContextTakeover).endInvoke()
            .beginInvoke("clientMaxWindowBits").appendArgument(this.clientMaxWindowBits).endInvoke()
            .beginInvoke("serverMaxWindowBits").appendArgument(this.serverMaxWindowBits).endInvoke()
            .beginInvoke("deflateBufferSize").appendArgument(this.deflateBufferSize).endInvoke()
            .beginInvoke("inflateBufferSize").appendArgument(this.inflateBufferSize).endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static @Nullable WsEngineOptions standard;

  public static WsEngineOptions standard() {
    if (WsEngineOptions.standard == null) {
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

      int clientCompressionLevel;
      try {
        clientCompressionLevel = Integer.parseInt(System.getProperty("swim.ws.client.compression.level"));
      } catch (NumberFormatException error) {
        clientCompressionLevel = 0;
      }

      int serverCompressionLevel;
      try {
        serverCompressionLevel = Integer.parseInt(System.getProperty("swim.ws.server.compression.level"));
      } catch (NumberFormatException error) {
        serverCompressionLevel = 0;
      }

      final boolean clientNoContextTakeover = Boolean.parseBoolean(System.getProperty("swim.ws.client.no.context.takeover"));

      final boolean serverNoContextTakeover = Boolean.parseBoolean(System.getProperty("swim.ws.server.no.context.takeover"));

      int clientMaxWindowBits;
      try {
        clientMaxWindowBits = Integer.parseInt(System.getProperty("swim.ws.client.max.window.bits"));
      } catch (NumberFormatException error) {
        clientMaxWindowBits = 15;
      }

      int serverMaxWindowBits;
      try {
        serverMaxWindowBits = Integer.parseInt(System.getProperty("swim.ws.server.max.window.bits"));
      } catch (NumberFormatException error) {
        serverMaxWindowBits = 15;
      }

      int deflateBufferSize;
      try {
        deflateBufferSize = Integer.parseInt(System.getProperty("swim.ws.deflate.buffer.size"));
      } catch (NumberFormatException error) {
        deflateBufferSize = 4 * 1024;
      }

      int inflateBufferSize;
      try {
        inflateBufferSize = Integer.parseInt(System.getProperty("swim.ws.inflate.buffer.size"));
      } catch (NumberFormatException error) {
        inflateBufferSize = 4 * 1024;
      }

      WsEngineOptions.standard = new WsEngineOptions(maxFrameSize, maxMessageSize,
                                                     clientCompressionLevel, serverCompressionLevel,
                                                     clientNoContextTakeover, serverNoContextTakeover,
                                                     clientMaxWindowBits, serverMaxWindowBits,
                                                     deflateBufferSize, inflateBufferSize);
    }
    return WsEngineOptions.standard;
  }

  public static WsEngineOptions noCompression() {
    return WsEngineOptions.standard().compressionLevel(0, 0);
  }

  public static WsEngineOptions defaultCompression() {
    return WsEngineOptions.standard().compressionLevel(-1, -1);
  }

  public static WsEngineOptions fastestCompression() {
    return WsEngineOptions.standard().compressionLevel(1, 1);
  }

  public static WsEngineOptions bestCompression() {
    return WsEngineOptions.standard().compressionLevel(9, 9);
  }

}
