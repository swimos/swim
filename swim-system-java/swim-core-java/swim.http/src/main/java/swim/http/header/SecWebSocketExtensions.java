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

package swim.http.header;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.http.WebSocketExtension;
import swim.util.Builder;
import swim.util.Murmur3;

public final class SecWebSocketExtensions extends HttpHeader {
  final FingerTrieSeq<WebSocketExtension> extensions;

  SecWebSocketExtensions(FingerTrieSeq<WebSocketExtension> extensions) {
    this.extensions = extensions;
  }

  @Override
  public boolean isBlank() {
    return this.extensions.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "sec-websocket-extensions";
  }

  @Override
  public String name() {
    return "Sec-WebSocket-Extensions";
  }

  public FingerTrieSeq<WebSocketExtension> extensions() {
    return this.extensions;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(this.extensions.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SecWebSocketExtensions) {
      final SecWebSocketExtensions that = (SecWebSocketExtensions) other;
      return this.extensions.equals(that.extensions);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(SecWebSocketExtensions.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.extensions.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("SecWebSocketExtensions").write('.').write("from").write('(');
    final int n = this.extensions.size();
    if (n > 0) {
      output.debug(this.extensions.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.extensions.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static SecWebSocketExtensions from(FingerTrieSeq<WebSocketExtension> extensions) {
    return new SecWebSocketExtensions(extensions);
  }

  public static SecWebSocketExtensions from(WebSocketExtension... extensions) {
    return new SecWebSocketExtensions(FingerTrieSeq.of(extensions));
  }

  public static SecWebSocketExtensions from(String... extensionStrings) {
    final Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions = FingerTrieSeq.builder();
    for (int i = 0, n = extensionStrings.length; i < n; i += 1) {
      extensions.add(WebSocketExtension.parse(extensionStrings[i]));
    }
    return new SecWebSocketExtensions(extensions.bind());
  }

  public static Parser<SecWebSocketExtensions> parseHttpValue(Input input, HttpParser http) {
    return SecWebSocketExtensionsParser.parse(input, http);
  }
}
