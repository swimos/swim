// Copyright 2015-2022 Swim.inc
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

public final class UpgradeHeader extends HttpHeader {

  final FingerTrieSeq<UpgradeProtocol> protocols;

  UpgradeHeader(FingerTrieSeq<UpgradeProtocol> protocols) {
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
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.protocols.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UpgradeHeader) {
      final UpgradeHeader that = (UpgradeHeader) other;
      return this.protocols.equals(that.protocols);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (UpgradeHeader.hashSeed == 0) {
      UpgradeHeader.hashSeed = Murmur3.seed(UpgradeHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(UpgradeHeader.hashSeed, this.protocols.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("UpgradeHeader").write('.').write("create").write('(');
    final int n = this.protocols.size();
    if (n > 0) {
      output = output.debug(this.protocols.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.protocols.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  private static UpgradeHeader websocket;

  public static UpgradeHeader websocket() {
    if (UpgradeHeader.websocket == null) {
      UpgradeHeader.websocket = new UpgradeHeader(FingerTrieSeq.of(UpgradeProtocol.websocket()));
    }
    return UpgradeHeader.websocket;
  }

  public static UpgradeHeader empty() {
    return new UpgradeHeader(FingerTrieSeq.empty());
  }

  public static UpgradeHeader create(FingerTrieSeq<UpgradeProtocol> protocols) {
    if (protocols.size() == 1) {
      final UpgradeProtocol protocol = protocols.head();
      if (protocol == UpgradeProtocol.websocket()) {
        return UpgradeHeader.websocket();
      }
    }
    return new UpgradeHeader(protocols);
  }

  public static UpgradeHeader create(UpgradeProtocol... protocols) {
    return UpgradeHeader.create(FingerTrieSeq.of(protocols));
  }

  public static UpgradeHeader create(String... protocolStrings) {
    final Builder<UpgradeProtocol, FingerTrieSeq<UpgradeProtocol>> protocols = FingerTrieSeq.builder();
    for (int i = 0, n = protocolStrings.length; i < n; i += 1) {
      protocols.add(UpgradeProtocol.parse(protocolStrings[i]));
    }
    return UpgradeHeader.create(protocols.bind());
  }

  public static Parser<UpgradeHeader> parseHeaderValue(Input input, HttpParser http) {
    return UpgradeHeaderParser.parse(input, http);
  }

}
