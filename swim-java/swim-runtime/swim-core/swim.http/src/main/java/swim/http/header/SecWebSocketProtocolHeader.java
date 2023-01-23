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

public final class SecWebSocketProtocolHeader extends HttpHeader {

  final FingerTrieSeq<String> protocols;

  SecWebSocketProtocolHeader(FingerTrieSeq<String> protocols) {
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
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(output, this.protocols.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SecWebSocketProtocolHeader) {
      final SecWebSocketProtocolHeader that = (SecWebSocketProtocolHeader) other;
      return this.protocols.equals(that.protocols);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (SecWebSocketProtocolHeader.hashSeed == 0) {
      SecWebSocketProtocolHeader.hashSeed = Murmur3.seed(SecWebSocketProtocolHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(SecWebSocketProtocolHeader.hashSeed, this.protocols.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("SecWebSocketProtocolHeader").write('.').write("create").write('(');
    final int n = this.protocols.size();
    if (n > 0) {
      output = output.debug(this.protocols.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.protocols.head());
      }
    }
    output = output.write(')');
    return output;
  }

  public static SecWebSocketProtocolHeader empty() {
    return new SecWebSocketProtocolHeader(FingerTrieSeq.empty());
  }

  public static SecWebSocketProtocolHeader create(FingerTrieSeq<String> protocols) {
    return new SecWebSocketProtocolHeader(protocols);
  }

  public static SecWebSocketProtocolHeader create(String... protocols) {
    return new SecWebSocketProtocolHeader(FingerTrieSeq.of(protocols));
  }

  public static Parser<SecWebSocketProtocolHeader> parseHeaderValue(Input input, HttpParser http) {
    return SecWebSocketProtocolHeaderParser.parse(input, http);
  }

}
