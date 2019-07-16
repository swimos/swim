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
import swim.util.Murmur3;

public final class SecWebSocketProtocol extends HttpHeader {
  final FingerTrieSeq<String> protocols;

  SecWebSocketProtocol(FingerTrieSeq<String> protocols) {
    this.protocols = protocols;
  }

  @Override
  public boolean isBlank() {
    return this.protocols.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "sec-websocket-protocol";
  }

  @Override
  public String name() {
    return "Sec-WebSocket-Protocol";
  }

  public FingerTrieSeq<String> protocols() {
    return this.protocols;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(this.protocols.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SecWebSocketProtocol) {
      final SecWebSocketProtocol that = (SecWebSocketProtocol) other;
      return this.protocols.equals(that.protocols);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(SecWebSocketProtocol.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.protocols.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("SecWebSocketProtocol").write('.').write("from").write('(');
    final int n = this.protocols.size();
    if (n > 0) {
      output.debug(this.protocols.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.protocols.head());
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static SecWebSocketProtocol from(FingerTrieSeq<String> protocols) {
    return new SecWebSocketProtocol(protocols);
  }

  public static SecWebSocketProtocol from(String... protocols) {
    return new SecWebSocketProtocol(FingerTrieSeq.of(protocols));
  }

  public static Parser<SecWebSocketProtocol> parseHttpValue(Input input, HttpParser http) {
    return SecWebSocketProtocolParser.parse(input, http);
  }
}
