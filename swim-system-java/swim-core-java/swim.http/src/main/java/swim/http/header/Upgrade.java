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
import swim.http.UpgradeProtocol;
import swim.util.Builder;
import swim.util.Murmur3;

public final class Upgrade extends HttpHeader {
  final FingerTrieSeq<UpgradeProtocol> protocols;

  Upgrade(FingerTrieSeq<UpgradeProtocol> protocols) {
    this.protocols = protocols;
  }

  @Override
  public String lowerCaseName() {
    return "upgrade";
  }

  @Override
  public String name() {
    return "Upgrade";
  }

  public FingerTrieSeq<UpgradeProtocol> protocols() {
    return this.protocols;
  }

  public boolean supports(UpgradeProtocol protocol) {
    final FingerTrieSeq<UpgradeProtocol> protocols = this.protocols;
    for (int i = 0, n = protocols.size(); i < n; i += 1) {
      if (protocol.matches(protocols.get(i))) {
        return true;
      }
    }
    return false;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(this.protocols.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Upgrade) {
      final Upgrade that = (Upgrade) other;
      return this.protocols.equals(that.protocols);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Upgrade.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.protocols.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Upgrade").write('.').write("from").write('(');
    final int n = this.protocols.size();
    if (n > 0) {
      output.debug(this.protocols.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.protocols.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  private static Upgrade websocket;

  public static Upgrade websocket() {
    if (websocket == null) {
      websocket = new Upgrade(FingerTrieSeq.of(UpgradeProtocol.websocket()));
    }
    return websocket;
  }

  public static Upgrade from(FingerTrieSeq<UpgradeProtocol> protocols) {
    if (protocols.size() == 1) {
      final UpgradeProtocol protocol = protocols.head();
      if (protocol == UpgradeProtocol.websocket()) {
        return websocket();
      }
    }
    return new Upgrade(protocols);
  }

  public static Upgrade from(UpgradeProtocol... protocols) {
    return from(FingerTrieSeq.of(protocols));
  }

  public static Upgrade from(String... protocolStrings) {
    final Builder<UpgradeProtocol, FingerTrieSeq<UpgradeProtocol>> protocols = FingerTrieSeq.builder();
    for (int i = 0, n = protocolStrings.length; i < n; i += 1) {
      protocols.add(UpgradeProtocol.parse(protocolStrings[i]));
    }
    return from(protocols.bind());
  }

  public static Parser<Upgrade> parseHttpValue(Input input, HttpParser http) {
    return UpgradeParser.parse(input, http);
  }
}
