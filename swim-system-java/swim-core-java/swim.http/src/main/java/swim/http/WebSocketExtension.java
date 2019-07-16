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

package swim.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class WebSocketExtension extends HttpPart implements Debug {
  final String name;
  final FingerTrieSeq<WebSocketParam> params;

  WebSocketExtension(String name, FingerTrieSeq<WebSocketParam> params) {
    this.name = name;
    this.params = params;
  }

  public String name() {
    return this.name;
  }

  public FingerTrieSeq<WebSocketParam> params() {
    return this.params;
  }

  public WebSocketExtension param(WebSocketParam param) {
    return new WebSocketExtension(this.name, this.params.appended(param));
  }

  public WebSocketExtension param(String key, String value) {
    return param(WebSocketParam.from(key, value));
  }

  public WebSocketExtension param(String key) {
    return param(WebSocketParam.from(key));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.webSocketExtensionWriter(this.name, this.params.iterator());
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeWebSocketExtension(this.name, this.params.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WebSocketExtension) {
      final WebSocketExtension that = (WebSocketExtension) other;
      return this.name.equals(that.name) && this.params.equals(that.params);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WebSocketExtension.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), this.params.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WebSocketExtension").write('.').write("from").write('(')
        .debug(this.name).write(')');
    for (WebSocketParam param : this.params) {
      output = output.write('.').write("param").write('(').debug(param.key);
      if (!param.value.isEmpty()) {
        output = output.write(", ").debug(param.value);
      }
      output = output.write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static WebSocketExtension permessageDeflate(boolean serverNoContextTakeover,
                                                     boolean clientNoContextTakeover,
                                                     int serverMaxWindowBits,
                                                     int clientMaxWindowBits) {
    FingerTrieSeq<WebSocketParam> params = FingerTrieSeq.empty();
    if (serverNoContextTakeover) {
      params = params.appended(WebSocketParam.serverNoContextTakeover());
    }
    if (clientNoContextTakeover) {
      params = params.appended(WebSocketParam.clientNoContextTakeover());
    }
    if (serverMaxWindowBits != 15) {
      params = params.appended(WebSocketParam.serverMaxWindowBits(serverMaxWindowBits));
    }
    if (clientMaxWindowBits == 0) {
      params = params.appended(WebSocketParam.clientMaxWindowBits());
    } else if (clientMaxWindowBits != 15) {
      params = params.appended(WebSocketParam.clientMaxWindowBits(clientMaxWindowBits));
    }
    return new WebSocketExtension("permessage-deflate", params);
  }

  public static WebSocketExtension from(String name, FingerTrieSeq<WebSocketParam> params) {
    return new WebSocketExtension(name, params);
  }

  public static WebSocketExtension from(String name, WebSocketParam... params) {
    return new WebSocketExtension(name, FingerTrieSeq.of(params));
  }

  public static WebSocketExtension from(String name) {
    return new WebSocketExtension(name, FingerTrieSeq.<WebSocketParam>empty());
  }

  public static WebSocketExtension parse(String string) {
    return Http.standardParser().parseWebSocketExtensionString(string);
  }
}
